// Teste de integração das leituras compartilhadas do InviteRepository. Só roda com
// TEST_DATABASE_URL definida, como o schema.spec.ts.
import { Test } from '@nestjs/testing';
import type { Kysely } from 'kysely';
import { DATABASE, createDatabase } from './database.module.js';
import { InviteRepository } from './invite.repository.js';
import type { Database } from './schema.js';

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)('InviteRepository, leituras compartilhadas', () => {
  let db: Kysely<Database>;
  let repo: InviteRepository;
  let hostId: string;
  const ids = { draft: '', published: '', unpublished: '', customized: '' };

  // Tokens e email próprios desta execução, para não colidir com outros dados do banco.
  const suffix = Date.now().toString(32).toUpperCase().padStart(10, '0').slice(-10);
  const token = (prefix: string) => prefix + '0'.repeat(15) + suffix;

  beforeAll(async () => {
    db = createDatabase(url as string);
    const ref = await Test.createTestingModule({
      providers: [InviteRepository, { provide: DATABASE, useValue: db }],
    }).compile();
    repo = ref.get(InviteRepository);

    const host = await db
      .insertInto('host')
      .values({ name: 'Ana', email: `ana-${suffix}@exemplo.com`, password_hash: 'hash' })
      .returning('id')
      .executeTakeFirstOrThrow();
    hostId = host.id;

    const insert = async (
      status: 'DRAFT' | 'PUBLISHED' | 'UNPUBLISHED',
      publicToken: string | null,
    ) => {
      const row = await db
        .insertInto('invite')
        .values({
          host_id: hostId,
          event_name: 'Aniversário',
          event_starts_at: '2026-12-01T20:00:00-03:00',
          location: 'Salão',
          status,
          public_token: publicToken,
          capacity_limit: 50,
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      return row.id;
    };
    ids.draft = await insert('DRAFT', null);
    ids.published = await insert('PUBLISHED', token('P'));
    ids.unpublished = await insert('UNPUBLISHED', token('U'));
    ids.customized = await insert('PUBLISHED', token('C'));
    await db
      .insertInto('invite_customization')
      .values({
        invite_id: ids.customized,
        template_code: 'classic',
        color_overrides: JSON.stringify({ primary: '#123456' }),
      })
      .execute();
  });

  afterAll(async () => {
    // Os convites saem antes, porque a chave de invite para host não apaga em cascata.
    // A personalização sai junto com o convite, pela cascata do esquema.
    await db.deleteFrom('invite').where('host_id', '=', hostId).execute();
    await db.deleteFrom('host').where('id', '=', hostId).execute();
    await db.destroy();
  });

  it('findById devolve o convite com os nomes do modelo', async () => {
    const invite = await repo.findById(ids.draft);
    expect(invite).toMatchObject({
      id: ids.draft,
      hostId,
      eventName: 'Aniversário',
      status: 'DRAFT',
      publicToken: null,
      capacityLimit: 50,
      maxCompanionsPerGuest: null,
    });
    expect(invite?.eventStartsAt.toISOString()).toBe('2026-12-01T23:00:00.000Z');
  });

  it('findById devolve vazio para identificador que não existe ou não é número', async () => {
    expect(await repo.findById('999999999')).toBeNull();
    expect(await repo.findById('abc')).toBeNull();
  });

  it('findPublishedByPublicToken só encontra convite publicado', async () => {
    expect((await repo.findPublishedByPublicToken(token('P')))?.invite.id).toBe(ids.published);
    expect(await repo.findPublishedByPublicToken(token('U'))).toBeNull();
    expect(await repo.findPublishedByPublicToken('TOKENQUENUNCAEXISTIU000000')).toBeNull();
  });

  it('sem personalização salva, devolve o template padrão sem sobrescritas', async () => {
    const found = await repo.findPublishedByPublicToken(token('P'));
    expect(found?.customization).toEqual({ templateCode: 'classic', colorOverrides: [] });
  });

  it('com personalização salva, devolve as cores como lista de papel e valor', async () => {
    const found = await repo.findPublishedByPublicToken(token('C'));
    expect(found?.customization.colorOverrides).toEqual([{ role: 'primary', value: '#123456' }]);
  });
});
