// InviteRepository do DAS, seção 5.2: guarda o agregado do convite.
//
// Este arquivo é compartilhado pelas partes 3 e 4. As duas leituras abaixo são usadas
// pelas duas. Cada parte acrescenta as operações dela no bloco próprio, no fim da
// classe, para os PRs não disputarem as mesmas linhas.
import { Inject, Injectable } from '@nestjs/common';
import type { Kysely, Selectable, Transaction } from 'kysely';
import { DEFAULT_TEMPLATE_CODE } from '@invite-app/contract';
import type { Invite, InviteCustomization } from '../model/index.js';
import { DATABASE } from './database.module.js';
import type { Database, InviteCustomizationTable, InviteTable } from './schema.js';
import type { DietaryCategoryCode, DietaryExportRow, RsvpStatus } from '@invite-app/contract';

export interface AttendanceRow {
  name: string;
  status: RsvpStatus;
  companionCount: number;
  respondedAt: Date;
}

export interface DietaryCountRow {
  code: DietaryCategoryCode;
  displayName: string;
  count: number;
}

export interface DietaryDescriptionRow {
  guestName: string;
  description: string;
}

export interface GuestResponseRecord {
  id: string;
  inviteId: string;
  name: string;
  status: RsvpStatus;
  companionCount: number;
  personalToken: string;
  respondedAt: Date;
  freeText: string | null;
  categories: DietaryCategoryCode[];
}

export interface GuestResponseInput {
  name: string;
  status: RsvpStatus;
  companionCount: number;
  personalToken: string;
  respondedAt: Date;
  categories: DietaryCategoryCode[];
  freeText: string | null;
}

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

  async listByHost(hostId: string): Promise<Invite[]> {
    const rows = await this.db
      .selectFrom('invite')
      .selectAll()
      .where('host_id', '=', hostId)
      .orderBy('id', 'desc')
      .execute();
    return rows.map(toInvite);
  }

  async create(
    hostId: string,
    eventName: string,
    eventStartsAt: Date,
    location: string,
    capacityLimit: number | null,
    maxCompanionsPerGuest: number | null,
  ): Promise<Invite> {
    const row = await this.db
      .insertInto('invite')
      .values({
        host_id: hostId,
        event_name: eventName,
        event_starts_at: eventStartsAt,
        location,
        status: 'DRAFT',
        public_token: null,
        capacity_limit: capacityLimit,
        max_companions_per_guest: maxCompanionsPerGuest,
      })
      .returningAll()
      .executeTakeFirstOrThrow();
    return toInvite(row);
  }

  async updateDraft(
    inviteId: string,
    eventName: string,
    eventStartsAt: Date,
    location: string,
    capacityLimit: number | null,
    maxCompanionsPerGuest: number | null,
  ): Promise<Invite | null> {
    if (!/^\d{1,18}$/.test(inviteId)) return null;
    const row = await this.db
      .updateTable('invite')
      .set({
        event_name: eventName,
        event_starts_at: eventStartsAt,
        location,
        capacity_limit: capacityLimit,
        max_companions_per_guest: maxCompanionsPerGuest,
      })
      .where('id', '=', inviteId)
      .where('status', '=', 'DRAFT')
      .returningAll()
      .executeTakeFirst();
    return row ? toInvite(row) : null;
  }

  async customize(
    inviteId: string,
    templateCode: string,
    colorOverrides: Record<string, string>,
    eventName: string,
    location: string,
  ): Promise<void> {
    await this.db.transaction().execute(async (trx) => {
      await trx
        .updateTable('invite')
        .set({ event_name: eventName, location })
        .where('id', '=', inviteId)
        .execute();
      await trx
        .insertInto('invite_customization')
        .values({
          invite_id: inviteId,
          template_code: templateCode,
          color_overrides: JSON.stringify(colorOverrides),
        })
        .onConflict((oc) =>
          oc.column('invite_id').doUpdateSet({
            template_code: templateCode,
            color_overrides: JSON.stringify(colorOverrides),
          }),
        )
        .execute();
    });
  }

  async findDetails(inviteId: string): Promise<InviteWithCustomization | null> {
    if (!/^\d{1,18}$/.test(inviteId)) return null;
    const row = await this.db
      .selectFrom('invite')
      .leftJoin('invite_customization', 'invite_customization.invite_id', 'invite.id')
      .selectAll('invite')
      .select(['invite_customization.template_code', 'invite_customization.color_overrides'])
      .where('invite.id', '=', inviteId)
      .executeTakeFirst();
    if (!row) return null;
    const { template_code, color_overrides, ...invite } = row;
    return {
      invite: toInvite(invite),
      customization:
        template_code === null || color_overrides === null
          ? toCustomization(null)
          : toCustomization({ template_code, color_overrides }),
    };
  }

  async publish(inviteId: string, token: string): Promise<string | null> {
    if (!/^\d{1,18}$/.test(inviteId)) return null;
    const row = await this.db
      .updateTable('invite')
      .set((eb) => ({
        status: 'PUBLISHED',
        public_token: eb.fn.coalesce('public_token', eb.val(token)),
      }))
      .where('id', '=', inviteId)
      .where('status', 'in', ['DRAFT', 'UNPUBLISHED'])
      .returning('public_token')
      .executeTakeFirst();
    return row?.public_token ?? null;
  }

  async unpublish(inviteId: string): Promise<boolean> {
    if (!/^\d{1,18}$/.test(inviteId)) return false;
    const row = await this.db
      .updateTable('invite')
      .set({ status: 'UNPUBLISHED' })
      .where('id', '=', inviteId)
      .where('status', '=', 'PUBLISHED')
      .returning('id')
      .executeTakeFirst();
    return row !== undefined;
  }

  async findGuestByPersonalToken(token: string): Promise<GuestResponseRecord | null> {
    const guest = await this.db
      .selectFrom('guest')
      .leftJoin('dietary_note', 'dietary_note.guest_id', 'guest.id')
      .select([
        'guest.id',
        'guest.invite_id',
        'guest.name',
        'guest.status',
        'guest.companion_count',
        'guest.personal_token',
        'guest.responded_at',
        'dietary_note.id as note_id',
        'dietary_note.free_text',
      ])
      .where('guest.personal_token', '=', token)
      .executeTakeFirst();
    if (!guest) return null;
    const categories = guest.note_id
      ? await this.db
          .selectFrom('dietary_note_category')
          .select('category_code')
          .where('dietary_note_id', '=', guest.note_id)
          .execute()
      : [];
    return {
      id: guest.id,
      inviteId: guest.invite_id,
      name: guest.name,
      status: guest.status,
      companionCount: guest.companion_count,
      personalToken: guest.personal_token,
      respondedAt: guest.responded_at,
      freeText: guest.free_text,
      categories: categories.map(({ category_code }) => category_code),
    };
  }

  async saveRsvpWithinCapacity(
    inviteId: string,
    input: GuestResponseInput,
  ): Promise<'saved' | 'capacity' | 'closed'> {
    return this.db.transaction().execute(async (trx) => {
      const invite = await trx
        .selectFrom('invite')
        .select(['status', 'capacity_limit'])
        .where('id', '=', inviteId)
        .forUpdate()
        .executeTakeFirst();
      if (!invite || invite.status !== 'PUBLISHED') return 'closed';
      if (input.status === 'ACCEPTED' && invite.capacity_limit !== null) {
        const total = await trx
          .selectFrom('guest')
          .select((eb) => eb.fn.sum<number>('companion_count').as('companions'))
          .where('invite_id', '=', inviteId)
          .where('status', '=', 'ACCEPTED')
          .executeTakeFirstOrThrow();
        const acceptedCount = await trx
          .selectFrom('guest')
          .select((eb) => eb.fn.count<number>('id').as('count'))
          .where('invite_id', '=', inviteId)
          .where('status', '=', 'ACCEPTED')
          .executeTakeFirstOrThrow();
        if (
          Number(total.companions ?? 0) + Number(acceptedCount.count) + 1 + input.companionCount >
          invite.capacity_limit
        ) {
          return 'capacity';
        }
      }
      const guest = await trx
        .insertInto('guest')
        .values({
          invite_id: inviteId,
          name: input.name,
          status: input.status,
          companion_count: input.status === 'DECLINED' ? 0 : input.companionCount,
          personal_token: input.personalToken,
          responded_at: input.respondedAt,
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      await this.saveDietaryNote(trx, guest.id, input);
      return 'saved';
    });
  }

  async updateRsvpWithinCapacity(
    guest: GuestResponseRecord,
    input: GuestResponseInput,
  ): Promise<'saved' | 'capacity' | 'closed'> {
    return this.db.transaction().execute(async (trx) => {
      const invite = await trx
        .selectFrom('invite')
        .select(['capacity_limit'])
        .where('id', '=', guest.inviteId)
        .forUpdate()
        .executeTakeFirst();
      if (!invite) return 'closed';
      const current = await trx
        .selectFrom('guest')
        .select(['status', 'companion_count'])
        .where('id', '=', guest.id)
        .executeTakeFirst();
      if (!current) return 'closed';
      if (input.status === 'ACCEPTED' && invite.capacity_limit !== null) {
        const others = await trx
          .selectFrom('guest')
          .select((eb) => [
            eb.fn.count<number>('id').as('count'),
            eb.fn.sum<number>('companion_count').as('companions'),
          ])
          .where('invite_id', '=', guest.inviteId)
          .where('status', '=', 'ACCEPTED')
          .where('id', '!=', guest.id)
          .executeTakeFirstOrThrow();
        if (
          Number(others.count) + Number(others.companions ?? 0) + 1 + input.companionCount >
          invite.capacity_limit
        ) {
          return 'capacity';
        }
      }
      await trx
        .updateTable('guest')
        .set({
          name: input.name,
          status: input.status,
          companion_count: input.status === 'DECLINED' ? 0 : input.companionCount,
          responded_at: input.respondedAt,
        })
        .where('id', '=', guest.id)
        .execute();
      await this.saveDietaryNote(trx, guest.id, input);
      return 'saved';
    });
  }

  private async saveDietaryNote(
    trx: Kysely<Database> | Transaction<Database>,
    guestId: string,
    input: GuestResponseInput,
  ): Promise<void> {
    if (input.status === 'DECLINED' || input.categories.length === 0) {
      await trx.deleteFrom('dietary_note').where('guest_id', '=', guestId).execute();
      return;
    }
    const note = await trx
      .insertInto('dietary_note')
      .values({ guest_id: guestId, free_text: input.freeText })
      .onConflict((oc) => oc.column('guest_id').doUpdateSet({ free_text: input.freeText }))
      .returning('id')
      .executeTakeFirstOrThrow();
    await trx.deleteFrom('dietary_note_category').where('dietary_note_id', '=', note.id).execute();
    await trx
      .insertInto('dietary_note_category')
      .values(
        input.categories.map((category_code) => ({ dietary_note_id: note.id, category_code })),
      )
      .execute();
  }

  async attendance(inviteId: string): Promise<AttendanceRow[]> {
    return this.db
      .selectFrom('guest')
      .select([
        'name',
        'status',
        'companion_count as companionCount',
        'responded_at as respondedAt',
      ])
      .where('invite_id', '=', inviteId)
      .orderBy('responded_at', 'desc')
      .execute();
  }

  async dietaryCounts(inviteId: string): Promise<DietaryCountRow[]> {
    const rows = await this.db
      .selectFrom('dietary_note_category')
      .innerJoin('dietary_note', 'dietary_note.id', 'dietary_note_category.dietary_note_id')
      .innerJoin('guest', 'guest.id', 'dietary_note.guest_id')
      .innerJoin('dietary_category', 'dietary_category.code', 'dietary_note_category.category_code')
      .select([
        'dietary_category.code as code',
        'dietary_category.display_name as displayName',
        (eb) => eb.fn.count<number>('guest.id').as('count'),
      ])
      .where('guest.invite_id', '=', inviteId)
      .where('guest.status', 'in', ['ACCEPTED', 'MAYBE'])
      .groupBy(['dietary_category.code', 'dietary_category.display_name'])
      .orderBy('dietary_category.code')
      .execute();
    return rows.map((row) => ({ ...row, count: Number(row.count) }));
  }

  async allergyDescriptions(inviteId: string): Promise<DietaryDescriptionRow[]> {
    const rows = await this.db
      .selectFrom('dietary_note_category')
      .innerJoin('dietary_note', 'dietary_note.id', 'dietary_note_category.dietary_note_id')
      .innerJoin('guest', 'guest.id', 'dietary_note.guest_id')
      .select(['guest.name as guestName', 'dietary_note.free_text as description'])
      .where('guest.invite_id', '=', inviteId)
      .where('guest.status', 'in', ['ACCEPTED', 'MAYBE'])
      .where('dietary_note_category.category_code', '=', 'ALLERGY')
      .where('dietary_note.free_text', 'is not', null)
      .orderBy('guest.name')
      .execute();
    return rows.flatMap((row) =>
      row.description === null ? [] : [{ guestName: row.guestName, description: row.description }],
    );
  }

  async guestExport(inviteId: string): Promise<DietaryExportRow[]> {
    const rows = await this.db
      .selectFrom('guest')
      .leftJoin('dietary_note', 'dietary_note.guest_id', 'guest.id')
      .select([
        'guest.id',
        'guest.name',
        'guest.status',
        'guest.companion_count as companionCount',
        'dietary_note.free_text as freeText',
        'dietary_note.id as noteId',
      ])
      .where('guest.invite_id', '=', inviteId)
      .where('guest.status', 'in', ['ACCEPTED', 'MAYBE'])
      .orderBy('guest.responded_at', 'desc')
      .execute();
    const result: DietaryExportRow[] = [];
    for (const row of rows) {
      const categories = row.noteId
        ? await this.db
            .selectFrom('dietary_note_category')
            .innerJoin(
              'dietary_category',
              'dietary_category.code',
              'dietary_note_category.category_code',
            )
            .select('dietary_category.display_name')
            .where('dietary_note_id', '=', row.noteId)
            .orderBy('category_code')
            .execute()
        : [];
      result.push({
        name: row.name,
        status: row.status,
        companionCount: row.companionCount,
        categories: categories.map((category) => category.display_name),
        freeText: row.freeText ?? '',
      });
    }
    return result;
  }

  // ------------------------------------------------------------ Parte 4, respostas e painel
}
