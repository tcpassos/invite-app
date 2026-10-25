// As regras da resposta do convidado que se decidem com o que já está em memória, e por
// isso são do Domínio (Guia da Arquitetura, 3.4). O teto de pessoas não está aqui: ele
// depende do estado do banco no instante da escrita e é conferido na camada de Dados.
import { RsvpStatus, TEXT_LIMITS, type DietaryCategoryCode } from '@invite-app/contract';
import type { DietaryNoteFields, GuestFields } from '../data/invite.repository.js';
import type { DietaryCategory, Invite } from '../model/index.js';
import { ValidationError } from './errors.js';

/**
 * A resposta como chegou, depois de a Apresentação conferir só a forma. Campo ausente
 * chega como undefined, e é aqui que ele vira recusa.
 */
export interface RsvpCommand {
  name?: string;
  status?: string;
  companionCount?: number;
  dietaryNote?: { categories?: string[]; freeText?: string };
}

export interface ValidRsvp {
  guest: Omit<GuestFields, 'respondedAt'>;
  dietaryNote: DietaryNoteFields | null;
  seatsRequested: number;
}

const STATUSES: readonly string[] = Object.values(RsvpStatus);

/** Quantas vagas a resposta ocupa: o confirmado e os acompanhantes dele (ADR-0008, medida 1). */
export function seatsRequested(status: RsvpStatus, companionCount: number): number {
  return status === RsvpStatus.Accepted ? 1 + companionCount : 0;
}

/** UC005 RN2: o limite de acompanhantes por convidado, quando o convite tem um. */
export function checkCompanionLimit(invite: Invite, companionCount: number): void {
  if (companionCount < 0) throw new ValidationError('companionCount', 'minValue');
  if (invite.maxCompanionsPerGuest !== null && companionCount > invite.maxCompanionsPerGuest) {
    throw new ValidationError('companionCount', 'companionLimit');
  }
}

/**
 * UC006: as categorias precisam ser do catálogo, e a que exige descrição pede o texto livre
 * (RN2). O texto tem tamanho máximo (ADR-0008, medida 3). Sem categoria e sem texto, não há
 * observação (A1).
 */
export function validateDietaryNote(
  note: RsvpCommand['dietaryNote'],
  categories: readonly DietaryCategory[],
): DietaryNoteFields | null {
  const codes = [...new Set(note?.categories ?? [])];
  const known = codes.map((code) => categories.find((category) => category.code === code));
  if (known.some((category) => category === undefined)) {
    throw new ValidationError('dietaryNote.categories', 'allowedValue');
  }
  const freeText = note?.freeText?.trim() ?? '';
  if (freeText.length > TEXT_LIMITS.dietaryFreeText) {
    throw new ValidationError('dietaryNote.freeText', 'maxLength');
  }
  if (!freeText && known.some((category) => category?.requiresDescription)) {
    throw new ValidationError('dietaryNote.freeText', 'descriptionRequired');
  }
  if (codes.length === 0 && !freeText) return null;
  return { categoryCodes: codes as DietaryCategoryCode[], freeText: freeText || null };
}

/** Valida a resposta inteira e deriva as vagas, na ordem dos campos do formulário. */
export function validateRsvp(
  command: RsvpCommand,
  invite: Invite,
  categories: readonly DietaryCategory[],
): ValidRsvp {
  const name = command.name?.trim() ?? '';
  if (!name) throw new ValidationError('name', 'required');
  if (name.length > TEXT_LIMITS.guestName) throw new ValidationError('name', 'maxLength');

  if (command.status === undefined) throw new ValidationError('status', 'required');
  if (!STATUSES.includes(command.status)) throw new ValidationError('status', 'allowedValue');
  const status = command.status as RsvpStatus;

  // UC005 A1: quem não vai grava zero acompanhantes e nenhuma observação, mesmo que venham.
  if (status === RsvpStatus.Declined) {
    return { guest: { name, status, companionCount: 0 }, dietaryNote: null, seatsRequested: 0 };
  }

  const companionCount = command.companionCount ?? 0;
  checkCompanionLimit(invite, companionCount);
  return {
    guest: { name, status, companionCount },
    dietaryNote: validateDietaryNote(command.dietaryNote, categories),
    seatsRequested: seatsRequested(status, companionCount),
  };
}
