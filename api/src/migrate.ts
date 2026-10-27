// Aplica os scripts de migrations/ num banco vazio, como o container db do compose faz com o
// volume vazio (migrations/README.md). Existe para a publicação, em que o banco gerenciado não
// roda esses scripts sozinho: é o comando de pré-deploy da API no Railway (ADR-0015).
//
// Banco com alguma tabela fica como está, então rodar de novo não muda nada. A limitação do
// compose continua: migração acrescentada depois da primeira subida exige banco novo.
import { readFile, readdir } from 'node:fs/promises';
import pg from 'pg';

// De api/dist/migrate.js, ou de api/src/migrate.ts, a pasta fica dois níveis acima.
const MIGRATIONS = new URL('../../migrations/', import.meta.url);

const log = (message: string, extra: Record<string, unknown> = {}): void =>
  console.log(JSON.stringify({ level: 'info', message, ...extra }));

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL não está definida');

  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const { rows } = await client.query<{ tables: number }>(
      "SELECT count(*)::int AS tables FROM information_schema.tables WHERE table_schema = 'public'",
    );
    if ((rows[0]?.tables ?? 0) > 0) {
      log('banco já tem tabelas, nenhuma migração aplicada');
      return;
    }

    const files = (await readdir(MIGRATIONS)).filter((name) => /^\d{3}-.+\.sql$/.test(name)).sort();
    // Tudo numa transação: se um arquivo falhar, o banco continua vazio e o próximo deploy tenta de novo.
    await client.query('BEGIN');
    for (const file of files) {
      await client.query(await readFile(new URL(file, MIGRATIONS), 'utf8'));
      log('migração aplicada', { file });
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    await client.end();
  }
}

await main();
