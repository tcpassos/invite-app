import { Inject, Injectable } from '@nestjs/common';
import type { Kysely, Selectable } from 'kysely';
import type { Host } from '../model/host.js';
import { DATABASE } from './database.module.js';
import type { Database, HostTable } from './schema.js';

function toHost(row: Selectable<HostTable>): Host {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
  };
}

@Injectable()
export class HostRepository {
  constructor(@Inject(DATABASE) private readonly db: Kysely<Database>) {}

  async findByEmail(email: string): Promise<Host | null> {
    const row = await this.db
      .selectFrom('host')
      .selectAll()
      .where((eb) => eb.fn('lower', ['email']), '=', email.toLowerCase())
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

  async create(name: string, email: string, passwordHash: string): Promise<Host> {
    try {
      const row = await this.db
        .insertInto('host')
        .values({ name, email, password_hash: passwordHash })
        .returningAll()
        .executeTakeFirstOrThrow();
      return toHost(row);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505'
      ) {
        throw new HostEmailAlreadyRegisteredError();
      }
      throw error;
    }
  }
}

export class HostEmailAlreadyRegisteredError extends Error {}
