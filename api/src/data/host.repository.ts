// HostRepository do DAS, seção 5.2: guarda a conta do anfitrião (UC001).
import { Inject, Injectable } from '@nestjs/common';
import type { Kysely, Selectable } from 'kysely';
import type { Host } from '../model/index.js';
import { DATABASE } from './database.module.js';
import type { Database, HostTable } from './schema.js';

// Violação de índice único no PostgreSQL.
const UNIQUE_VIOLATION = '23505';

function toHost(row: Selectable<HostTable>): Host {
  return { id: row.id, name: row.name, email: row.email, passwordHash: row.password_hash };
}

function isUniqueViolation(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error
    ? error.code === UNIQUE_VIOLATION
    : false;
}

@Injectable()
export class HostRepository {
  constructor(@Inject(DATABASE) private readonly db: Kysely<Database>) {}

  /** A comparação ignora maiúsculas, como o índice único host_email_unique. */
  async findByEmail(email: string): Promise<Host | null> {
    const row = await this.db
      .selectFrom('host')
      .selectAll()
      .where((eb) => eb(eb.fn('lower', ['email']), '=', email.toLowerCase()))
      .executeTakeFirst();
    return row ? toHost(row) : null;
  }

  async findById(hostId: string): Promise<Host | null> {
    if (!/^\d{1,18}$/.test(hostId)) return null;
    const row = await this.db
      .selectFrom('host')
      .selectAll()
      .where('id', '=', hostId)
      .executeTakeFirst();
    return row ? toHost(row) : null;
  }

  /**
   * Cria a conta, ou devolve vazio quando o email já tem conta. Quem garante a unicidade
   * é o índice do banco, porque dois cadastros simultâneos passariam por uma consulta
   * prévia. Quem dá nome de negócio à recusa é o Domínio (Guia, 9.2).
   */
  async createIfEmailFree(name: string, email: string, passwordHash: string): Promise<Host | null> {
    try {
      const row = await this.db
        .insertInto('host')
        .values({ name, email, password_hash: passwordHash })
        .returningAll()
        .executeTakeFirstOrThrow();
      return toHost(row);
    } catch (error) {
      if (isUniqueViolation(error)) return null;
      throw error;
    }
  }
}
