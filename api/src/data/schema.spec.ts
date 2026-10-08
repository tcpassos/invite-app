// Teste de integração do esquema contra um PostgreSQL de verdade, com as migrações
// aplicadas. Confere que o banco faz valer as restrições da seção 8.3 do DAS.
//
// Só roda com TEST_DATABASE_URL definida. Para rodar na sua máquina, veja o README da api.
import type { Kysely, Transaction } from 'kysely';
import { createDatabase } from './database.module.js';
import type { Database } from './schema.js';

const url = process.env.TEST_DATABASE_URL;

// Cada teste roda numa transação desfeita no fim, para não deixar dado no banco.
class Rollback extends Error {}

async function inTransaction(
  db: Kysely<Database>,
  body: (trx: Transaction<Database>) => Promise<void>,
) {
  await db
    .transaction()
    .execute(async (trx) => {
      await body(trx);
      throw new Rollback();
    })
    .catch((error: unknown) => {
      if (!(error instanceof Rollback)) throw error;
    });
}

function pgCode(error: unknown): string | undefined {
  return (error as { code?: string }).code;
}

async function seedInvite(trx: Transaction<Database>, email = 'ana@exemplo.com') {
  const host = await trx
    .insertInto('host')
    .values({ name: 'Ana', email, password_hash: 'hash' })
    .returning('id')
    .executeTakeFirstOrThrow();
  return trx
    .insertInto('invite')
    .values({
      host_id: host.id,
      event_name: 'Aniversário',
      event_starts_at: '2026-12-01T20:00:00-03:00',
      location: 'Salão',
      status: 'DRAFT',
    })
    .returning('id')
    .executeTakeFirstOrThrow();
}

describe.skipIf(!url)('esquema do banco', () => {
  let db: Kysely<Database>;

  beforeAll(() => {
    db = createDatabase(url as string);
  });

  afterAll(() => db.destroy());

  it('tem as cinco categorias, e só a alergia exige descrição', async () => {
    const rows = await db.selectFrom('dietary_category').selectAll().orderBy('code').execute();
    expect(rows.map((r) => r.code)).toEqual([
      'ALLERGY',
      'GLUTEN_FREE',
      'LACTOSE_FREE',
      'VEGAN',
      'VEGETARIAN',
    ]);
    expect(rows.filter((r) => r.requires_description).map((r) => r.code)).toEqual(['ALLERGY']);
  });

  it('recusa email repetido sem diferenciar maiúscula', async () => {
    await inTransaction(db, async (trx) => {
      await seedInvite(trx, 'ana@exemplo.com');
      const erro = await trx
        .insertInto('host')
        .values({ name: 'Outra', email: 'ANA@Exemplo.com', password_hash: 'x' })
        .execute()
        .catch((e: unknown) => e);
      expect(pgCode(erro)).toBe('23505');
    });
  });

  it('recusa teto de pessoas zero e situação fora do conjunto', async () => {
    await inTransaction(db, async (trx) => {
      const { id } = await seedInvite(trx);
      const teto = await trx
        .updateTable('invite')
        .set({ capacity_limit: 0 })
        .where('id', '=', id)
        .execute()
        .catch((e: unknown) => e);
      expect(pgCode(teto)).toBe('23514');
    });
    await inTransaction(db, async (trx) => {
      const { id } = await seedInvite(trx);
      const situacao = await trx
        .updateTable('invite')
        .set({ status: 'ARCHIVED' as never })
        .where('id', '=', id)
        .execute()
        .catch((e: unknown) => e);
      expect(pgCode(situacao)).toBe('23514');
    });
  });

  it('guarda as cores como objeto, com o documento vazio como padrão', async () => {
    await inTransaction(db, async (trx) => {
      const { id } = await seedInvite(trx);
      const vazio = await trx
        .insertInto('invite_customization')
        .values({ invite_id: id, template_code: 'classico' })
        .returning('color_overrides')
        .executeTakeFirstOrThrow();
      expect(vazio.color_overrides).toEqual({});
      const cores = await trx
        .updateTable('invite_customization')
        .set({ color_overrides: JSON.stringify({ primary: '#123456' }) })
        .where('invite_id', '=', id)
        .returning('color_overrides')
        .executeTakeFirstOrThrow();
      expect(cores.color_overrides).toEqual({ primary: '#123456' });
    });
  });

  it('apaga convidado e nota junto com o convite, e recusa categoria repetida na nota', async () => {
    await inTransaction(db, async (trx) => {
      const { id } = await seedInvite(trx);
      const guest = await trx
        .insertInto('guest')
        .values({
          invite_id: id,
          name: 'Bruno',
          status: 'ACCEPTED',
          personal_token: 'TOKENPESSOAL0000000000000A',
          responded_at: new Date(),
        })
        .returning('id')
        .executeTakeFirstOrThrow();
      const note = await trx
        .insertInto('dietary_note')
        .values({ guest_id: guest.id, free_text: 'amendoim' })
        .returning('id')
        .executeTakeFirstOrThrow();
      await trx
        .insertInto('dietary_note_category')
        .values({ dietary_note_id: note.id, category_code: 'ALLERGY' })
        .execute();

      const repetida = await trx
        .insertInto('dietary_note_category')
        .values({ dietary_note_id: note.id, category_code: 'ALLERGY' })
        .execute()
        .catch((e: unknown) => e);
      expect(pgCode(repetida)).toBe('23505');
    });

    await inTransaction(db, async (trx) => {
      const { id } = await seedInvite(trx);
      await trx
        .insertInto('guest')
        .values({
          invite_id: id,
          name: 'Bruno',
          status: 'MAYBE',
          personal_token: 'TOKENPESSOAL0000000000000B',
          responded_at: new Date(),
        })
        .execute();
      await trx.deleteFrom('invite').where('id', '=', id).execute();
      const restantes = await trx
        .selectFrom('guest')
        .where('invite_id', '=', id)
        .selectAll()
        .execute();
      expect(restantes).toEqual([]);
    });
  });
});
