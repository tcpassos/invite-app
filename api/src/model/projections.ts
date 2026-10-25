// Leituras que atravessam as três camadas e não são classes do Diagrama de Classes: o
// convite junto com a personalização e as projeções do painel. Moram em model, e não na
// camada de Dados, porque a Apresentação também as lê e não pode importar dos Dados
// (Guia da Arquitetura, 6.2).
import type { DietaryCategoryCode, RsvpStatus } from '@invite-app/contract';
import type { DietaryNote, Guest } from './guest.js';
import type { Invite, InviteCustomization } from './invite.js';

export interface InviteWithCustomization {
  invite: Invite;
  customization: InviteCustomization;
}

/** A resposta de um convidado com a observação alimentar dela, se houver. */
export interface GuestWithNote {
  guest: Guest;
  dietaryNote: DietaryNote | null;
}

/** Uma linha da lista de presença (UC007 ED1). */
export interface AttendanceEntry {
  name: string;
  status: RsvpStatus;
  companionCount: number;
  respondedAt: Date;
}

/** Quantos convidados marcaram a categoria, já agrupado no banco (UC008 RN1). */
export interface CategoryCount {
  code: DietaryCategoryCode;
  count: number;
}

/** O texto livre de quem marcou uma categoria que exige descrição (UC008 passo 3). */
export interface DietaryDescription {
  guestName: string;
  description: string;
}

/** Uma linha da exportação do UC008, ainda sem formato de arquivo (ED2). */
export interface GuestExportRow {
  name: string;
  status: RsvpStatus;
  companionCount: number;
  categoryNames: string[];
  freeText: string | null;
}
