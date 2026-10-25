// InviteRepository do DAS, seção 5.2: guarda o agregado do convite, com a personalização,
// os convidados e as observações alimentares. As operações seguem a tabela 4.3 do Guia da
// Arquitetura. Nenhuma decide regra de negócio: quem responde sim ou talvez, quais
// categorias exigem descrição e quantas vagas uma resposta ocupa chegam por parâmetro.
import { Inject, Injectable } from '@nestjs/common';
import { sql, type Kysely, type Selectable, type Transaction } from 'kysely';
import {
  DEFAULT_TEMPLATE_CODE,
  type DietaryCategoryCode,
  type RsvpStatus,
} from '@invite-app/contract';
import type {
  AttendanceEntry,
  CategoryCount,
  DietaryDescription,
  Guest,
  GuestExportRow,
  GuestWithNote,
  Invite,
  InviteCustomization,
  InviteWithCustomization,
} from '../model/index.js';
import { DATABASE } from './database.module.js';
import type {
  ColorOverrides,
  Database,
  GuestTable,
  InviteCustomizationTable,
  InviteTable,
} from './schema.js';

/** Os campos do convite que o anfitrião informa na criação e na correção (UC002). */
export interface InviteFields {
  eventName: string;
  eventStartsAt: Date;
  location: string;
  capacityLimit: number | null;
  maxCompanionsPerGuest: number | null;
}

/** A personalização do UC003, com os dois textos que ela também altera. */
export interface CustomizationFields {
  templateCode: string;
  colorOverrides: Record<string, string>;
  eventName: string;
  location: string;
}

/** O convidado como o Domínio decidiu gravar, já com o A1 do UC005 aplicado. */
export interface GuestFields {
  name: string;
  status: RsvpStatus;
  companionCount: number;
  respondedAt: Date;
}

/** Sem categoria marcada, não há observação a gravar (UC006 A1). */
export interface DietaryNoteFields {
  freeText: string | null;
  categoryCodes: DietaryCategoryCode[];
}

/**
 * O que a escrita dentro do teto devolve. A recusa é valor, não exceção: quem dá nome de
 * negócio a ela é o Domínio (Guia, 9.2).
 */
export type RsvpWriteResult =
  | { kind: 'saved'; guest: Guest }
  | { kind: 'refused'; reason: 'CapacityExceeded' | 'InviteNotOpen' };

type Db = Kysely<Database> | Transaction<Database>;

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

function toInviteWithCustomization(
  row: Selectable<InviteTable> & {
    template_code: string | null;
    color_overrides: ColorOverrides | null;
  },
): InviteWithCustomization {
  const { template_code, color_overrides, ...invite } = row;
  const customization =
    template_code === null || color_overrides === null ? null : { template_code, color_overrides };
  return { invite: toInvite(invite), customization: toCustomization(customization) };
}

function toGuest(row: Selectable<GuestTable>): Guest {
  return {
    id: row.id,
    inviteId: row.invite_id,
    name: row.name,
    status: row.status,
    companionCount: row.companion_count,
    personalToken: row.personal_token,
    respondedAt: row.responded_at,
  };
}

// Identificador que não é número não existe. Sai como ausência, sem erro do banco.
const isId = (value: string) => /^\d{1,18}$/.test(value);

@Injectable()
export class InviteRepository {
  constructor(@Inject(DATABASE) private readonly db: Kysely<Database>) {}

  // ------------------------------------------------------------ Compartilhado

  /** O convite pelo identificador interno, de qualquer anfitrião e em qualquer situação. */
  async findById(inviteId: string): Promise<Invite | null> {
    if (!isId(inviteId)) return null;
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
    const row = await this.selectWithCustomization()
      .where('invite.public_token', '=', publicToken)
      .where('invite.status', '=', 'PUBLISHED')
      .executeTakeFirst();
    return row ? toInviteWithCustomization(row) : null;
  }

  /** O convite e a personalização dele, de qualquer anfitrião e em qualquer situação. */
  async findWithCustomization(inviteId: string): Promise<InviteWithCustomization | null> {
    if (!isId(inviteId)) return null;
    const row = await this.selectWithCustomization()
      .where('invite.id', '=', inviteId)
      .executeTakeFirst();
    return row ? toInviteWithCustomization(row) : null;
  }

  private selectWithCustomization() {
    return this.db
      .selectFrom('invite')
      .leftJoin('invite_customization', 'invite_customization.invite_id', 'invite.id')
      .selectAll('invite')
      .select(['invite_customization.template_code', 'invite_customization.color_overrides']);
  }

  // ------------------------------------------------------------ Parte 3, convite do anfitrião

  /** Os convites de um anfitrião, o mais novo primeiro. É filtro da lista, não autorização. */
  async findByHost(hostId: string): Promise<Invite[]> {
    if (!isId(hostId)) return [];
    const rows = await this.db
      .selectFrom('invite')
      .selectAll()
      .where('host_id', '=', hostId)
      .orderBy('id', 'desc')
      .execute();
    return rows.map(toInvite);
  }

  /** Grava o convite como rascunho (UC002 passo 5). */
  async createDraft(hostId: string, fields: InviteFields): Promise<Invite> {
    const row = await this.db
      .insertInto('invite')
      .values({ host_id: hostId, status: 'DRAFT', ...inviteColumns(fields) })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toInvite(row);
  }

  /**
   * Correção do rascunho (UC002 A2). O Domínio já conferiu que o convite é rascunho, e o
   * predicado do WHERE só impede que uma publicação simultânea seja sobrescrita, que é o
   * caso 2 da seção 3.5 do Guia. Zero linhas devolve vazio.
   */
  async updateIfDraft(inviteId: string, fields: InviteFields): Promise<Invite | null> {
    const row = await this.db
      .updateTable('invite')
      .set(inviteColumns(fields))
      .where('id', '=', inviteId)
      .where('status', '=', 'DRAFT')
      .returningAll()
      .executeTakeFirst();
    return row ? toInvite(row) : null;
  }

  /** Grava a personalização do UC003 e os dois textos do convite na mesma transação. */
  async saveCustomization(inviteId: string, fields: CustomizationFields): Promise<void> {
    const overrides = JSON.stringify(fields.colorOverrides);
    await this.db.transaction().execute(async (trx) => {
      await trx
        .updateTable('invite')
        .set({ event_name: fields.eventName, location: fields.location })
        .where('id', '=', inviteId)
        .execute();
      await trx
        .insertInto('invite_customization')
        .values({
          invite_id: inviteId,
          template_code: fields.templateCode,
          color_overrides: overrides,
        })
        .onConflict((conflict) =>
          conflict
            .column('invite_id')
            .doUpdateSet({ template_code: fields.templateCode, color_overrides: overrides }),
        )
        .execute();
    });
  }

  /**
   * Publica pelo predicado do WHERE, caso 2 da seção 3.5. O token só é gravado se o
   * convite ainda não tiver um, para republicar reaproveitar o link (UC004). Devolve
   * falso quando outra requisição chegou primeiro.
   */
  async publishIfPublishable(inviteId: string, publicToken: string): Promise<boolean> {
    const result = await this.db
      .updateTable('invite')
      .set((eb) => ({
        status: 'PUBLISHED',
        public_token: eb.fn.coalesce('public_token', eb.val(publicToken)),
      }))
      .where('id', '=', inviteId)
      .where('status', 'in', ['DRAFT', 'UNPUBLISHED'])
      .executeTakeFirst();
    return result.numUpdatedRows > 0n;
  }

  /** Despublica pelo predicado do WHERE, sem apagar nada (UC004 A2). */
  async unpublishIfPublished(inviteId: string): Promise<boolean> {
    const result = await this.db
      .updateTable('invite')
      .set({ status: 'UNPUBLISHED' })
      .where('id', '=', inviteId)
      .where('status', '=', 'PUBLISHED')
      .executeTakeFirst();
    return result.numUpdatedRows > 0n;
  }

  // ------------------------------------------------------------ Parte 4, respostas e painel

  /**
   * Grava a resposta dentro do teto, na mesma transação do bloqueio do convite (UC005
   * RN4, Guia 3.4). O convidado, a observação e as categorias entram juntos, porque a
   * observação não existe sem o convidado.
   */
  async saveRsvpWithinCapacity(
    inviteId: string,
    guest: GuestFields & { personalToken: string },
    dietaryNote: DietaryNoteFields | null,
    seatsRequested: number,
  ): Promise<RsvpWriteResult> {
    return this.db.transaction().execute(async (trx) => {
      const invite = await lockInvite(trx, inviteId);
      if (!invite || invite.status !== 'PUBLISHED') return refused('InviteNotOpen');
      if (await exceedsCapacity(trx, inviteId, invite.capacity_limit, seatsRequested)) {
        return refused('CapacityExceeded');
      }
      const row = await trx
        .insertInto('guest')
        .values({
          invite_id: inviteId,
          name: guest.name,
          status: guest.status,
          companion_count: guest.companionCount,
          personal_token: guest.personalToken,
          responded_at: guest.respondedAt,
        })
        .returningAll()
        .executeTakeFirstOrThrow();
      await insertDietaryNote(trx, row.id, dietaryNote);
      return { kind: 'saved', guest: toGuest(row) };
    });
  }

  /**
   * Regrava a resposta pelo link pessoal (UC005 RN3), dentro do teto. As vagas do próprio
   * convidado não contam contra ele. Não confere a situação do convite: o link pessoal
   * continua valendo depois de despublicar (Guia, 9.5).
   */
  async updateRsvpWithinCapacity(
    guestId: string,
    inviteId: string,
    guest: GuestFields,
    dietaryNote: DietaryNoteFields | null,
    seatsRequested: number,
  ): Promise<RsvpWriteResult> {
    return this.db.transaction().execute(async (trx) => {
      const invite = await lockInvite(trx, inviteId);
      if (!invite) return refused('InviteNotOpen');
      if (await exceedsCapacity(trx, inviteId, invite.capacity_limit, seatsRequested, guestId)) {
        return refused('CapacityExceeded');
      }
      const row = await trx
        .updateTable('guest')
        .set({
          name: guest.name,
          status: guest.status,
          companion_count: guest.companionCount,
          responded_at: guest.respondedAt,
        })
        .where('id', '=', guestId)
        .returningAll()
        .executeTakeFirstOrThrow();
      // A observação anterior sai inteira, com as categorias, pelo ON DELETE CASCADE.
      await trx.deleteFrom('dietary_note').where('guest_id', '=', guestId).execute();
      await insertDietaryNote(trx, guestId, dietaryNote);
      return { kind: 'saved', guest: toGuest(row) };
    });
  }

  /** A resposta e a observação de quem apresentou o token pessoal (UC005 ED2). */
  async findGuestByPersonalToken(personalToken: string): Promise<GuestWithNote | null> {
    const row = await this.db
      .selectFrom('guest')
      .leftJoin('dietary_note', 'dietary_note.guest_id', 'guest.id')
      .leftJoin('dietary_note_category', 'dietary_note_category.dietary_note_id', 'dietary_note.id')
      .selectAll('guest')
      .select([
        'dietary_note.id as note_id',
        'dietary_note.free_text',
        sql<DietaryCategoryCode[]>`coalesce(
          array_agg(dietary_note_category.category_code
            ORDER BY dietary_note_category.category_code)
            FILTER (WHERE dietary_note_category.category_code IS NOT NULL),
          '{}')`.as('category_codes'),
      ])
      .where('guest.personal_token', '=', personalToken)
      .groupBy(['guest.id', 'dietary_note.id'])
      .executeTakeFirst();
    if (!row) return null;
    const { note_id, free_text, category_codes, ...guest } = row;
    return {
      guest: toGuest(guest),
      dietaryNote:
        note_id === null
          ? null
          : { id: note_id, guestId: guest.id, freeText: free_text, categoryCodes: category_codes },
    };
  }

  /** Uma linha por convidado nos status pedidos, a resposta mais recente primeiro (UC007 ED1). */
  async findAttendanceByStatus(
    inviteId: string,
    statuses: readonly RsvpStatus[],
  ): Promise<AttendanceEntry[]> {
    if (statuses.length === 0) return [];
    return this.db
      .selectFrom('guest')
      .select([
        'name',
        'status',
        'companion_count as companionCount',
        'responded_at as respondedAt',
      ])
      .where('invite_id', '=', inviteId)
      .where('status', 'in', statuses)
      .orderBy('responded_at', 'desc')
      .orderBy('id', 'desc')
      .execute();
  }

  /**
   * Contagem por categoria, agrupada no banco. Um convidado com duas categorias conta nas
   * duas (UC008 RN1). Só entram categorias com alguém.
   */
  async countGuestsByCategory(
    inviteId: string,
    statuses: readonly RsvpStatus[],
  ): Promise<CategoryCount[]> {
    if (statuses.length === 0) return [];
    const rows = await this.db
      .selectFrom('dietary_note_category')
      .innerJoin('dietary_note', 'dietary_note.id', 'dietary_note_category.dietary_note_id')
      .innerJoin('guest', 'guest.id', 'dietary_note.guest_id')
      .select([
        'dietary_note_category.category_code as code',
        (eb) => eb.fn.count<string>('guest.id').distinct().as('count'),
      ])
      .where('guest.invite_id', '=', inviteId)
      .where('guest.status', 'in', statuses)
      .groupBy('dietary_note_category.category_code')
      .execute();
    return rows.map((row) => ({ code: row.code, count: Number(row.count) }));
  }

  /** O texto livre de quem marcou alguma das categorias pedidas (UC008 passo 3). */
  async findDescriptionsByCategories(
    inviteId: string,
    statuses: readonly RsvpStatus[],
    categoryCodes: readonly DietaryCategoryCode[],
  ): Promise<DietaryDescription[]> {
    if (statuses.length === 0 || categoryCodes.length === 0) return [];
    return this.db
      .selectFrom('guest')
      .innerJoin('dietary_note', 'dietary_note.guest_id', 'guest.id')
      .select(['guest.name as guestName', 'dietary_note.free_text as description'])
      .where('guest.invite_id', '=', inviteId)
      .where('guest.status', 'in', statuses)
      .where('dietary_note.free_text', 'is not', null)
      .where((eb) =>
        eb.exists(
          eb
            .selectFrom('dietary_note_category')
            .select('dietary_note_category.dietary_note_id')
            .whereRef('dietary_note_category.dietary_note_id', '=', 'dietary_note.id')
            .where('dietary_note_category.category_code', 'in', categoryCodes),
        ),
      )
      .orderBy('guest.name')
      .$narrowType<{ description: string }>()
      .execute();
  }

  /**
   * Uma linha por convidado nos status pedidos, mesmo sem observação, com as categorias
   * agregadas no banco (UC008 ED2). A ordem das categorias é a do nome de exibição.
   */
  async findGuestsForExport(
    inviteId: string,
    statuses: readonly RsvpStatus[],
  ): Promise<GuestExportRow[]> {
    if (statuses.length === 0) return [];
    return this.db
      .selectFrom('guest')
      .leftJoin('dietary_note', 'dietary_note.guest_id', 'guest.id')
      .leftJoin('dietary_note_category', 'dietary_note_category.dietary_note_id', 'dietary_note.id')
      .leftJoin('dietary_category', 'dietary_category.code', 'dietary_note_category.category_code')
      .select([
        'guest.name',
        'guest.status',
        'guest.companion_count as companionCount',
        'dietary_note.free_text as freeText',
        sql<string[]>`coalesce(
          array_agg(dietary_category.display_name ORDER BY dietary_category.display_name)
            FILTER (WHERE dietary_category.display_name IS NOT NULL),
          '{}')`.as('categoryNames'),
      ])
      .where('guest.invite_id', '=', inviteId)
      .where('guest.status', 'in', statuses)
      .groupBy(['guest.id', 'dietary_note.id'])
      .orderBy('guest.name')
      .execute();
  }
}

function inviteColumns(fields: InviteFields) {
  return {
    event_name: fields.eventName,
    event_starts_at: fields.eventStartsAt,
    location: fields.location,
    capacity_limit: fields.capacityLimit,
    max_companions_per_guest: fields.maxCompanionsPerGuest,
  };
}

const refused = (reason: 'CapacityExceeded' | 'InviteNotOpen'): RsvpWriteResult => ({
  kind: 'refused',
  reason,
});

/** O bloqueio que serializa as escritas do mesmo convite (ADR-0008, medida 1). */
function lockInvite(trx: Db, inviteId: string) {
  return trx
    .selectFrom('invite')
    .select(['status', 'capacity_limit'])
    .where('id', '=', inviteId)
    .forUpdate()
    .executeTakeFirst();
}

/**
 * Compara as vagas já ocupadas mais as pedidas com o teto, como no diagrama do UC005. As
 * vagas pedidas chegam calculadas pelo Domínio, e zero quer dizer que a resposta não ocupa
 * vaga. A soma das ocupadas é a mesma do diagrama: cada confirmado e seus acompanhantes.
 */
async function exceedsCapacity(
  trx: Db,
  inviteId: string,
  capacityLimit: number | null,
  seatsRequested: number,
  exceptGuestId?: string,
): Promise<boolean> {
  if (capacityLimit === null || seatsRequested === 0) return false;
  let query = trx
    .selectFrom('guest')
    .select(sql<string>`coalesce(sum(1 + companion_count), 0)`.as('booked'))
    .where('invite_id', '=', inviteId)
    .where('status', '=', 'ACCEPTED');
  if (exceptGuestId) query = query.where('id', '!=', exceptGuestId);
  const { booked } = await query.executeTakeFirstOrThrow();
  return Number(booked) + seatsRequested > capacityLimit;
}

async function insertDietaryNote(
  trx: Db,
  guestId: string,
  dietaryNote: DietaryNoteFields | null,
): Promise<void> {
  if (!dietaryNote) return;
  const note = await trx
    .insertInto('dietary_note')
    .values({ guest_id: guestId, free_text: dietaryNote.freeText })
    .returning('id')
    .executeTakeFirstOrThrow();
  if (dietaryNote.categoryCodes.length === 0) return;
  await trx
    .insertInto('dietary_note_category')
    .values(
      dietaryNote.categoryCodes.map((code) => ({ dietary_note_id: note.id, category_code: code })),
    )
    .execute();
}
