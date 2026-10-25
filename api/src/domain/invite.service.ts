// InviteService do Diagrama de Componentes: criação, correção, personalização e publicação
// do convite (UC002 a UC004). Toda operação confere o dono primeiro, e convite que não
// existe sai pelo mesmo NotInviteOwner que o convite de outro anfitrião (Guia, 9.5).
import { Injectable } from '@nestjs/common';
import { InviteStatus } from '@invite-app/contract';
import { InviteRepository, type InviteFields } from '../data/invite.repository.js';
import type { Invite, InviteWithCustomization } from '../model/index.js';
import { InvalidInviteForPublication, InviteNotOpenError, ValidationError } from './errors.js';
import { validateOwnership } from './ownership.js';
import { projectDate } from './project-time.js';
import { defaultTemplate, findTemplate, textFieldLimits } from './template-catalog.js';
import { generatePublicToken } from './tokens.js';

/**
 * O convite como o anfitrião informou (UC002). A data e a hora chegam já juntas num
 * instante pela Apresentação, no fuso do projeto (ADR-0013). Quando faltou uma das duas,
 * vem qual faltou, para a recusa apontar o campo certo.
 */
export interface InviteCommand {
  eventName?: string;
  location?: string;
  schedule: { eventStartsAt: Date } | { missing: 'eventDate' | 'eventTime' };
  peopleLimit?: number | null;
  companionLimit?: number | null;
}

/** A personalização do UC003: template, cores que mudam e os dois textos. */
export interface CustomizationCommand {
  templateCode?: string;
  colorOverrides?: Record<string, string>;
  eventName?: string;
  location?: string;
}

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

@Injectable()
export class InviteService {
  constructor(private readonly invites: InviteRepository) {}

  listInvites(hostId: string): Promise<Invite[]> {
    return this.invites.findByHost(hostId);
  }

  /** UC002: valida e salva como rascunho, com o template padrão (UC003 passo 1). */
  async createInvite(hostId: string, command: InviteCommand): Promise<InviteWithCustomization> {
    const fields = validateInvite(command, defaultTemplate().textLimits);
    const invite = await this.invites.createDraft(hostId, fields);
    return { invite, customization: { templateCode: defaultTemplate().code, colorOverrides: [] } };
  }

  async getInvite(inviteId: string, hostId: string): Promise<InviteWithCustomization> {
    const found = await this.invites.findWithCustomization(inviteId);
    validateOwnership(found?.invite ?? null, hostId);
    return found!;
  }

  /** UC002 A2: corrige o rascunho com as mesmas regras da criação. Fora do rascunho, recusa (RN3). */
  async updateInvite(
    inviteId: string,
    hostId: string,
    command: InviteCommand,
  ): Promise<InviteWithCustomization> {
    const { invite, customization } = await this.getInvite(inviteId, hostId);
    if (invite.status !== InviteStatus.Draft) throw new InviteNotOpenError();
    const fields = validateInvite(command, textFieldLimits(customization.templateCode));
    const updated = await this.invites.updateIfDraft(inviteId, fields);
    // Zero linhas: uma publicação chegou entre a leitura e a gravação.
    if (!updated) throw new InviteNotOpenError();
    return { invite: updated, customization };
  }

  /** UC003: template do catálogo, só os papéis de cor dele, e os textos no limite do template. */
  async customizeInvite(
    inviteId: string,
    hostId: string,
    command: CustomizationCommand,
  ): Promise<InviteWithCustomization> {
    await this.getInvite(inviteId, hostId);
    const template = findTemplate(command.templateCode ?? '');
    if (!template) throw new ValidationError('templateCode', 'allowedValue');
    const colorOverrides = command.colorOverrides ?? {};
    for (const [role, color] of Object.entries(colorOverrides)) {
      if (!Object.hasOwn(template.defaultColors, role) || !HEX_COLOR.test(color)) {
        throw new ValidationError(`colorOverrides.${role}`, 'allowedValue');
      }
    }
    const eventName = requiredText(command.eventName, 'eventName', template.textLimits.eventName);
    const location = requiredText(command.location, 'location', template.textLimits.location);

    await this.invites.saveCustomization(inviteId, {
      templateCode: template.code,
      colorOverrides,
      eventName,
      location,
    });
    return this.getInvite(inviteId, hostId);
  }

  /**
   * UC004: confere os dados obrigatórios (RN1) e publica, gerando o token só na primeira
   * vez. Idempotente: a segunda chamada relê o convite e devolve o mesmo token (Guia, 9.1).
   */
  async publishInvite(inviteId: string, hostId: string): Promise<string> {
    const invite = validateOwnership(await this.invites.findById(inviteId), hostId);
    const missing = (['eventName', 'location'] as const).filter((field) => !invite[field].trim());
    if (missing.length > 0) throw new InvalidInviteForPublication(missing);

    if (invite.status !== InviteStatus.Published) {
      await this.invites.publishIfPublishable(
        inviteId,
        invite.publicToken ?? generatePublicToken(),
      );
    }
    const current = await this.invites.findById(inviteId);
    if (current?.status !== InviteStatus.Published || !current.publicToken) {
      throw new InviteNotOpenError();
    }
    return current.publicToken;
  }

  /** UC004 A2: desativa o link sem apagar nada. Só um convite publicado se despublica. */
  async unpublishInvite(inviteId: string, hostId: string): Promise<void> {
    validateOwnership(await this.invites.findById(inviteId), hostId);
    if (!(await this.invites.unpublishIfPublished(inviteId))) throw new InviteNotOpenError();
  }
}

/** UC002 RN1 e RN2, com o tamanho dos textos do template (UC003 RN2). */
function validateInvite(
  command: InviteCommand,
  textLimits: { eventName: number; location: number },
): InviteFields {
  const eventName = requiredText(command.eventName, 'eventName', textLimits.eventName);
  const location = requiredText(command.location, 'location', textLimits.location);
  if ('missing' in command.schedule)
    throw new ValidationError(command.schedule.missing, 'required');
  const { eventStartsAt } = command.schedule;
  // RN1 compara por dia no fuso do projeto: convite para hoje passa mesmo com a hora vencida.
  if (projectDate(eventStartsAt) < projectDate(new Date())) {
    throw new ValidationError('eventDate', 'dateNotInPast');
  }
  const capacityLimit = command.peopleLimit ?? null;
  if (capacityLimit !== null && capacityLimit < 1) {
    throw new ValidationError('peopleLimit', 'minValue');
  }
  const maxCompanionsPerGuest = command.companionLimit ?? null;
  if (maxCompanionsPerGuest !== null && maxCompanionsPerGuest < 0) {
    throw new ValidationError('companionLimit', 'minValue');
  }
  return { eventName, eventStartsAt, location, capacityLimit, maxCompanionsPerGuest };
}

function requiredText(value: string | undefined, field: string, maxLength: number): string {
  const text = value?.trim() ?? '';
  if (!text) throw new ValidationError(field, 'required');
  if (text.length > maxLength) throw new ValidationError(field, 'maxLength');
  return text;
}
