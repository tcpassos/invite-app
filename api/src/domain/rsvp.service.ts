// RsvpService do Diagrama de Componentes: a superfície pública (UC005 e UC006). São os
// quatro serviços que o pacote público pode chamar, e nenhum devolve dado de outro
// convidado (Guia, 5.3).
import { Injectable } from '@nestjs/common';
import { DietaryCategoryRepository } from '../data/dietary-category.repository.js';
import { InviteRepository, type RsvpWriteResult } from '../data/invite.repository.js';
import type {
  DietaryCategory,
  Guest,
  GuestWithNote,
  InviteWithCustomization,
} from '../model/index.js';
import { CapacityExceededError, InviteNotOpenError } from './errors.js';
import { projectDate } from './project-time.js';
import { validateRsvp, type RsvpCommand } from './rsvp-rules.js';
import { generatePersonalToken } from './tokens.js';

/** O retorno de getPublishedInvite no diagrama do UC005: convite, personalização e categorias. */
export interface PublishedInviteView extends InviteWithCustomization {
  categories: DietaryCategory[];
}

/** O que o link pessoal mostra (UC005 ED2 e RN3). */
export interface GuestResponseView extends PublishedInviteView {
  response: GuestWithNote;
  editable: boolean;
}

@Injectable()
export class RsvpService {
  constructor(
    private readonly invites: InviteRepository,
    private readonly categories: DietaryCategoryRepository,
  ) {}

  /** O convite publicado, ou vazio para token inexistente, rascunho e despublicado (Guia, 9.5). */
  async getPublishedInvite(publicToken: string): Promise<PublishedInviteView | null> {
    const found = await this.invites.findPublishedByPublicToken(publicToken);
    if (!found) return null;
    return { ...found, categories: await this.categories.listDietaryCategories() };
  }

  /** UC005 passo 7: valida, deriva as vagas e grava dentro do teto. Vazio se o token não resolve. */
  async registerRsvp(publicToken: string, rsvpCommand: RsvpCommand): Promise<Guest | null> {
    const found = await this.invites.findPublishedByPublicToken(publicToken);
    if (!found) return null;
    const valid = validateRsvp(
      rsvpCommand,
      found.invite,
      await this.categories.listDietaryCategories(),
    );
    const result = await this.invites.saveRsvpWithinCapacity(
      found.invite.id,
      { ...valid.guest, respondedAt: new Date(), personalToken: generatePersonalToken() },
      valid.dietaryNote,
      valid.seatsRequested,
    );
    return savedGuest(result);
  }

  /**
   * A resposta de quem apresentou o token pessoal. Abre também com o convite despublicado,
   * porque quem tem o token já respondeu àquele convite (Guia, 9.5).
   */
  async getGuestResponse(personalToken: string): Promise<GuestResponseView | null> {
    const response = await this.invites.findGuestByPersonalToken(personalToken);
    if (!response) return null;
    const found = await this.invites.findWithCustomization(response.guest.inviteId);
    if (!found) return null;
    return {
      ...found,
      categories: await this.categories.listDietaryCategories(),
      response,
      editable: isEditable(found.invite.eventStartsAt),
    };
  }

  /** UC005 RN3: regrava a resposta até o fim do dia do evento, respeitando o teto (RN4). */
  async updateRsvp(
    personalToken: string,
    rsvpCommand: RsvpCommand,
  ): Promise<GuestResponseView | null> {
    const current = await this.getGuestResponse(personalToken);
    if (!current) return null;
    if (!current.editable) throw new InviteNotOpenError();
    const valid = validateRsvp(rsvpCommand, current.invite, current.categories);
    const result = await this.invites.updateRsvpWithinCapacity(
      current.response.guest.id,
      current.invite.id,
      { ...valid.guest, respondedAt: new Date() },
      valid.dietaryNote,
      valid.seatsRequested,
    );
    savedGuest(result);
    return this.getGuestResponse(personalToken);
  }
}

/** ADR-0013: a alteração vale até 23:59:59 do dia do evento, no fuso do projeto. */
export function isEditable(eventStartsAt: Date, now = new Date()): boolean {
  return projectDate(now) <= projectDate(eventStartsAt);
}

/** Dá nome de negócio à recusa que a camada de Dados devolveu (Guia, 9.2). */
function savedGuest(result: RsvpWriteResult): Guest {
  if (result.kind === 'saved') return result.guest;
  if (result.reason === 'CapacityExceeded') throw new CapacityExceededError();
  throw new InviteNotOpenError();
}
