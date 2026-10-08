import type { DietaryCategoryCode, RsvpStatus } from '@invite-app/contract';

export interface Guest {
  id: string;
  inviteId: string;
  name: string;
  status: RsvpStatus;
  companionCount: number;
  /** Credencial de edição da resposta (ADR-0011). Nunca vai para log. */
  personalToken: string;
  respondedAt: Date;
}

/** Sem categoria marcada quer dizer sem restrição (UC006 A1). */
export interface DietaryNote {
  id: string;
  guestId: string;
  freeText: string | null;
  categoryCodes: DietaryCategoryCode[];
}

export interface DietaryCategory {
  code: DietaryCategoryCode;
  displayName: string;
  requiresDescription: boolean;
}
