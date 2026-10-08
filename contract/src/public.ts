// Corpos da superfície pública: a página do convite, a resposta do convidado e o
// link pessoal (UC005 e UC006). O que não está aqui não sai pela fronteira pública,
// e em particular nenhuma contagem e nenhuma resposta de outro convidado (Guia, 9.5).
import type { DietaryCategoryCode } from './dietary.js';
import type { InviteCustomizationView } from './invites.js';
import type { RsvpStatus } from './statuses.js';

export interface DietaryCategory {
  code: DietaryCategoryCode;
  displayName: string;
  requiresDescription: boolean;
}

/** O retorno de getPublishedInvite, desenhado no diagrama de sequência do UC005. */
export interface PublishedInvite {
  eventName: string;
  eventStartsAt: string;
  location: string;
  /**
   * Só para a tela dizer quantos acompanhantes cabem. Quem recusa acima do limite é
   * a API, com a regra `companionLimit`. Nulo é sem limite.
   */
  companionLimit: number | null;
  customization: InviteCustomizationView;
  dietaryCategories: DietaryCategory[];
}

export interface DietaryNoteInput {
  /** Vazio quer dizer sem restrição (UC006 A1). */
  categories: DietaryCategoryCode[];
  freeText?: string;
}

/**
 * A resposta do convidado. Com `DECLINED`, a API grava zero acompanhantes e nenhuma
 * observação alimentar, mesmo que venham no corpo (UC005 A1).
 */
export interface RsvpRequest {
  name: string;
  status: RsvpStatus;
  companionCount?: number;
  dietaryNote?: DietaryNoteInput;
}

/** O que o convidado recebe ao responder. O front monta /r/{personalToken} com ele. */
export interface RsvpResult {
  personalToken: string;
}

export interface GuestResponseView {
  name: string;
  status: RsvpStatus;
  companionCount: number;
  dietaryNote: DietaryNoteInput | null;
  respondedAt: string;
}

/** O que a página do link pessoal mostra (UC005 ED2 e RN3). */
export interface GuestResponsePage {
  invite: PublishedInvite;
  response: GuestResponseView;
  /** Falso depois das 23:59:59 do dia do evento, no fuso do projeto (ADR-0013). */
  editable: boolean;
}
