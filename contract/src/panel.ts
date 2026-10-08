// Corpos das consultas do painel (UC007 e UC008). Nenhum deles carrega o token
// pessoal do convidado: o anfitrião vê a resposta, mas não pode alterá-la.
import type { DietaryCategoryCode } from './dietary.js';
import type { RsvpStatus } from './statuses.js';

/** Uma linha da lista de presença, ED1 do UC007. */
export interface AttendanceEntry {
  name: string;
  status: RsvpStatus;
  companionCount: number;
  respondedAt: string;
}

export interface AttendanceList {
  /** Em ordem de resposta, a mais recente primeiro. A tela agrupa por situação. */
  guests: AttendanceEntry[];
  /** Confirmados mais os acompanhantes deles (UC007 RN1). */
  totalPeople: number;
}

export interface CategoryCount {
  code: DietaryCategoryCode;
  displayName: string;
  count: number;
}

/** Texto de quem marcou uma categoria que exige descrição, como a alergia. */
export interface AllergyDescription {
  guestName: string;
  description: string;
}

/**
 * Consolidação do UC008. Só entram categorias com contagem maior que zero, então
 * `counts` vazio é o A1, nenhuma restrição registrada, e a tela não oferece o CSV.
 */
export interface DietarySummary {
  counts: CategoryCount[];
  descriptions: AllergyDescription[];
}
