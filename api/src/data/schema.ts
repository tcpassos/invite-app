// Descrição do esquema do banco para o Kysely (ADR-0014).
//
// Espelha migrations/001-esquema-inicial.sql. Toda migração nova muda este arquivo
// no mesmo PR, senão as consultas passam a ser verificadas contra um esquema que
// não existe mais. Estes tipos não saem do pacote data: os repositórios convertem
// cada linha numa classe de model antes de devolver.
import type { ColumnType, Generated, JSONColumnType } from 'kysely';
import type { DietaryCategoryCode, InviteStatus, RsvpStatus } from '@invite-app/contract';

// O driver pg devolve bigint como texto, para não perder precisão.
type Id = Generated<string>;
type ForeignId = string;

// timestamptz chega como Date e pode ser gravado como Date ou texto ISO.
type Timestamp = ColumnType<Date, Date | string, Date | string>;

export interface HostTable {
  id: Id;
  name: string;
  email: string;
  password_hash: string;
}

export interface InviteTable {
  id: Id;
  host_id: ForeignId;
  event_name: string;
  event_starts_at: Timestamp;
  location: string;
  status: InviteStatus;
  public_token: string | null;
  capacity_limit: number | null;
  max_companions_per_guest: number | null;
}

/** Sobrescritas de cor do convite, no formato { papel: valor }. */
export type ColorOverrides = Record<string, string>;

export interface InviteCustomizationTable {
  id: Id;
  invite_id: ForeignId;
  template_code: string;
  // Grava como JSON em texto, porque o driver transformaria array em array do Postgres.
  // Opcional na inserção, porque o banco tem o documento vazio como padrão.
  color_overrides: JSONColumnType<ColorOverrides, string | undefined, string>;
}

export interface GuestTable {
  id: Id;
  invite_id: ForeignId;
  name: string;
  status: RsvpStatus;
  companion_count: ColumnType<number, number | undefined, number>;
  personal_token: string;
  responded_at: Timestamp;
}

export interface DietaryNoteTable {
  id: Id;
  guest_id: ForeignId;
  free_text: string | null;
}

export interface DietaryCategoryTable {
  code: DietaryCategoryCode;
  display_name: string;
  requires_description: boolean;
}

export interface DietaryNoteCategoryTable {
  dietary_note_id: ForeignId;
  category_code: DietaryCategoryCode;
}

export interface Database {
  host: HostTable;
  invite: InviteTable;
  invite_customization: InviteCustomizationTable;
  guest: GuestTable;
  dietary_note: DietaryNoteTable;
  dietary_category: DietaryCategoryTable;
  dietary_note_category: DietaryNoteCategoryTable;
}
