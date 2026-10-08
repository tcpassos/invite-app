// Conexão com o PostgreSQL pelo Kysely (ADR-0014).
// Os repositórios recebem a instância com @Inject(DATABASE).
import {
  Global,
  Module,
  type DynamicModule,
  type OnApplicationShutdown,
  Inject,
} from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import pg from 'pg';
import type { Database } from './schema.js';

export const DATABASE = Symbol('DATABASE');

export function createDatabase(connectionString: string): Kysely<Database> {
  return new Kysely<Database>({
    dialect: new PostgresDialect({ pool: new pg.Pool({ connectionString, max: 10 }) }),
  });
}

class DatabaseLifecycle implements OnApplicationShutdown {
  constructor(@Inject(DATABASE) private readonly db: Kysely<Database>) {}

  // Fecha o pool ao derrubar a API, para o container não esperar conexão pendente.
  async onApplicationShutdown(): Promise<void> {
    await this.db.destroy();
  }
}

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(connectionString: string): DynamicModule {
    return {
      module: DatabaseModule,
      providers: [
        { provide: DATABASE, useFactory: () => createDatabase(connectionString) },
        DatabaseLifecycle,
      ],
      exports: [DATABASE],
    };
  }
}
