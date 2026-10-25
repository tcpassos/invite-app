// Teste de integração das escritas e das leituras do painel no InviteRepository, contra um
// PostgreSQL de verdade. Só roda com TEST_DATABASE_URL definida, como o schema.spec.ts.
import { Test } from '@nestjs/testing';
import type { Kysely } from 'kysely';
import { DATABASE, createDatabase } from './database.module.js';
import { InviteRepository, type GuestFields } from './invite.repository.js';
import type { Database } from './schema.js';

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('InviteRepository, escritas e painel', () => {
  let db: Kysely<Database>;
  let repo: InviteRepository;
  let hostId: string;
  const suffix = Date.now().toString(32).toUpperCase().padStart(10, '0').slice(-10);
  let sequence = 0;
  const personalToken = () => `G${String(sequence++).padStart(15, '0')}${suffix}`;

  const fields = {
    eventName: 'Aniversário',
    eventStartsAt: new Date('2026-12-01T23:00:00Z'),
    location: 'Salão',
    capacityLimit: 5,
    maxCompanionsPerGuest: null,
  };

  const guest = (name: string, status: GuestFields['status'], companionCount = 0) => ({
    name,
    status,
    companionCount,
    respondedAt: new Date(Date.now() + sequence * 1000),
    personalToken: personalToken(),
  });

  async function publishedInvite(capacityLimit: number | null = 5) {
    const invite = await repo.createDraft(hostId, { ...fields, capacityLimit });
    expect(await repo.publishIfPublishable(invite.id, `P${personalToken()}`.slice(0, 26))).toBe(
      true,
    );
    return invite.id;
  }

  beforeAll(async () => {
    db = createDatabase(url as string);
    const ref = await Test.createTestingModule({
      providers: [InviteRepository, { provide: DATABASE, useValue: db }],
    }).compile();
    repo = ref.get(InviteRepository);
    const host = await db
      .insertInto('host')
      .values({ name: 'Ana', email: `escritas-${suffix}@exemplo.com`, password_hash: 'hash' })
      .returning('id')
      .executeTakeFirstOrThrow();
    hostId = host.id;
  });

  afterAll(async () => {
    await db.deleteFrom('invite').where('host_id', '=', hostId).execute();
    await db.deleteFrom('host').where('id', '=', hostId).execute();
    await db.destroy();
  });

  it('publica pelo predicado e reaproveita o token ao republicar (UC004)', async () => {
    const invite = await repo.createDraft(hostId, fields);
    expect(await repo.publishIfPublishable(invite.id, 'A'.repeat(26))).toBe(true);
    // Duplo clique: a segunda requisição encontra zero linhas.
    expect(await repo.publishIfPublishable(invite.id, 'B'.repeat(26))).toBe(false);
    expect(await repo.unpublishIfPublished(invite.id)).toBe(true);
    expect(await repo.unpublishIfPublished(invite.id)).toBe(false);
    expect(await repo.publishIfPublishable(invite.id, 'C'.repeat(26))).toBe(true);
    expect((await repo.findById(invite.id))?.publicToken).toBe('A'.repeat(26));
    expect(await repo.updateIfDraft(invite.id, fields)).toBeNull();
    await db.deleteFrom('invite').where('id', '=', invite.id).execute();
  });

  it('confere o teto dentro da transação com as vagas que o Domínio calculou (UC005 RN4)', async () => {
    const inviteId = await publishedInvite(5);
    const ana = await repo.saveRsvpWithinCapacity(inviteId, guest('Ana', 'ACCEPTED', 2), null, 3);
    expect(ana.kind).toBe('saved');
    // 3 ocupadas + 3 pedidas passa do teto de 5.
    expect(
      await repo.saveRsvpWithinCapacity(inviteId, guest('Bia', 'ACCEPTED', 2), null, 3),
    ).toEqual({ kind: 'refused', reason: 'CapacityExceeded' });
    // Zero vagas pedidas não confere o teto: é o talvez da medida 1 do ADR-0008.
    expect(
      (await repo.saveRsvpWithinCapacity(inviteId, guest('Caio', 'MAYBE', 4), null, 0)).kind,
    ).toBe('saved');
    expect(
      (await repo.saveRsvpWithinCapacity(inviteId, guest('Duda', 'ACCEPTED', 1), null, 2)).kind,
    ).toBe('saved');
  });

  it('duas respostas simultâneas não passam do teto (Guia, 3.4)', async () => {
    const inviteId = await publishedInvite(5);
    const results = await Promise.all(
      [1, 2, 3, 4].map((n) =>
        repo.saveRsvpWithinCapacity(inviteId, guest(`G${n}`, 'ACCEPTED', 1), null, 2),
      ),
    );
    expect(results.filter((result) => result.kind === 'saved')).toHaveLength(2);
    const attendance = await repo.findAttendanceByStatus(inviteId, ['ACCEPTED']);
    expect(attendance).toHaveLength(2);
  });

  it('recusa a resposta quando o convite foi despublicado antes da gravação', async () => {
    const inviteId = await publishedInvite(null);
    await repo.unpublishIfPublished(inviteId);
    expect(await repo.saveRsvpWithinCapacity(inviteId, guest('Ana', 'MAYBE'), null, 0)).toEqual({
      kind: 'refused',
      reason: 'InviteNotOpen',
    });
  });

  it('grava, lê e regrava a resposta com a observação pelo link pessoal', async () => {
    const inviteId = await publishedInvite(3);
    const first = guest('Ana', 'ACCEPTED', 1);
    const saved = await repo.saveRsvpWithinCapacity(
      inviteId,
      first,
      { freeText: 'Amendoim', categoryCodes: ['VEGAN', 'ALLERGY'] },
      2,
    );
    if (saved.kind !== 'saved') throw new Error('não gravou');
    const read = await repo.findGuestByPersonalToken(first.personalToken);
    expect(read?.dietaryNote).toMatchObject({
      freeText: 'Amendoim',
      categoryCodes: ['ALLERGY', 'VEGAN'],
    });

    // As vagas do próprio convidado não contam contra ele: 3 cabem no teto de 3.
    const updated = await repo.updateRsvpWithinCapacity(
      saved.guest.id,
      inviteId,
      { ...first, companionCount: 2 },
      null,
      3,
    );
    expect(updated.kind).toBe('saved');
    const reread = await repo.findGuestByPersonalToken(first.personalToken);
    expect(reread?.guest.companionCount).toBe(2);
    expect(reread?.dietaryNote).toBeNull();
    expect(await repo.findGuestByPersonalToken('NAOEXISTE')).toBeNull();
  });

  it('agrega o painel no banco, com os status e as categorias vindos de fora (UC008)', async () => {
    const inviteId = await publishedInvite(null);
    const note = (categoryCodes: ('VEGAN' | 'ALLERGY')[], freeText: string | null = null) => ({
      categoryCodes,
      freeText,
    });
    await repo.saveRsvpWithinCapacity(
      inviteId,
      guest('Ana', 'ACCEPTED'),
      note(['VEGAN', 'ALLERGY'], 'Camarão'),
      1,
    );
    await repo.saveRsvpWithinCapacity(inviteId, guest('Bia', 'MAYBE'), note(['VEGAN']), 0);
    await repo.saveRsvpWithinCapacity(inviteId, guest('Caio', 'ACCEPTED'), null, 1);
    await repo.saveRsvpWithinCapacity(inviteId, guest('Duda', 'DECLINED'), null, 0);
    // Uma observação de quem recusou não pode contar, mesmo que exista no banco.
    const declined = guest('Eva', 'DECLINED');
    await repo.saveRsvpWithinCapacity(inviteId, declined, note(['ALLERGY'], 'Leite'), 0);

    const counting = ['ACCEPTED', 'MAYBE'] as const;
    const counts = await repo.countGuestsByCategory(inviteId, counting);
    expect(counts.sort((a, b) => a.code.localeCompare(b.code))).toEqual([
      { code: 'ALLERGY', count: 1 },
      { code: 'VEGAN', count: 2 },
    ]);
    expect(await repo.findDescriptionsByCategories(inviteId, counting, ['ALLERGY'])).toEqual([
      { guestName: 'Ana', description: 'Camarão' },
    ]);
    expect(await repo.findDescriptionsByCategories(inviteId, counting, [])).toEqual([]);

    const rows = await repo.findGuestsForExport(inviteId, counting);
    expect(rows).toEqual([
      {
        name: 'Ana',
        status: 'ACCEPTED',
        companionCount: 0,
        freeText: 'Camarão',
        categoryNames: ['Alergia', 'Vegano'],
      },
      {
        name: 'Bia',
        status: 'MAYBE',
        companionCount: 0,
        freeText: null,
        categoryNames: ['Vegano'],
      },
      { name: 'Caio', status: 'ACCEPTED', companionCount: 0, freeText: null, categoryNames: [] },
    ]);

    const all = await repo.findAttendanceByStatus(inviteId, ['ACCEPTED', 'MAYBE', 'DECLINED']);
    expect(all.map((entry) => entry.name)).toEqual(['Eva', 'Duda', 'Caio', 'Bia', 'Ana']);
  });
});
