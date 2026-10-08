// InviteRepository do DAS, seção 5.2: guarda o agregado do convite.
//
// Este arquivo é compartilhado pelas partes 3 e 4. As duas leituras abaixo são usadas
// pelas duas. Cada parte acrescenta as operações dela no bloco próprio, no fim da
// classe, para os PRs não disputarem as mesmas linhas.
import { Inject, Injectable } from '@nestjs/common';
import type { Kysely, Selectable } from 'kysely';
import { DEFAULT_TEMPLATE_CODE } from '@invite-app/contract';
import type { Invite, InviteCustomization } from '../model/index.js';
import { DATABASE } from './database.module.js';
import type { Database, InviteCustomizationTable, InviteTable } from './schema.js';

export interface InviteWithCustomization {
  invite: Invite;
  customization: InviteCustomization;
}

export function toInvite(row: Selectable<InviteTable>): Invite {
  return {
    id: row.id,
    hostId: row.host_id,
    eventName: row.event_name,
    eventStartsAt: row.event_starts_at,
    location: row.location,
    status: row.status,
    publicToken: row.public_token,
    capacityLimit: row.capacity_limit,
    maxCompanionsPerGuest: row.max_companions_per_guest,
  };
}

type CustomizationRow = Pick<
  Selectable<InviteCustomizationTable>,
  'template_code' | 'color_overrides'
>;

/** Sem linha de personalização, vale o template padrão sem sobrescritas (UC003 passo 1). */
export function toCustomization(row: CustomizationRow | null): InviteCustomization {
  if (!row) return { templateCode: DEFAULT_TEMPLATE_CODE, colorOverrides: [] };
  return {
    templateCode: row.template_code,
    colorOverrides: Object.entries(row.color_overrides).map(([role, value]) => ({ role, value })),
  };
}

@Injectable()
export class InviteRepository {
  constructor(@Inject(DATABASE) private readonly db: Kysely<Database>) {}

  // ------------------------------------------------------------ Compartilhado

  /** O convite pelo identificador interno, de qualquer anfitrião e em qualquer situação. */
  async findById(inviteId: string): Promise<Invite | null> {
    // Identificador que não é número não existe. Sai como ausência, sem erro do banco.
    if (!/^\d{1,18}$/.test(inviteId)) return null;
    const row = await this.db
      .selectFrom('invite')
      .selectAll()
      .where('id', '=', inviteId)
      .executeTakeFirst();
    return row ? toInvite(row) : null;
  }

  /**
   * O convite publicado e a personalização dele, pelo token do link. Rascunho,
   * despublicado e token que não existe saem todos como vazio, pela mesma consulta,
   * para os casos não se distinguirem nem pelo tempo (Guia, 9.5). Por isso o token
   * não é conferido por formato antes.
   */
  async findPublishedByPublicToken(publicToken: string): Promise<InviteWithCustomization | null> {
    const row = await this.db
      .selectFrom('invite')
      .leftJoin('invite_customization', 'invite_customization.invite_id', 'invite.id')
      .selectAll('invite')
      .select(['invite_customization.template_code', 'invite_customization.color_overrides'])
      .where('invite.public_token', '=', publicToken)
      .where('invite.status', '=', 'PUBLISHED')
      .executeTakeFirst();
    if (!row) return null;
    const { template_code, color_overrides, ...invite } = row;
    const customization =
      template_code === null || color_overrides === null
        ? null
        : { template_code, color_overrides };
    return { invite: toInvite(invite), customization: toCustomization(customization) };
  }

  // ------------------------------------------------------------ Parte 3, convite do anfitrião

  // ------------------------------------------------------------ Parte 4, respostas e painel
}
