import { Inject, Injectable } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { DietaryCategory } from '../model/guest.js';
import { DATABASE } from './database.module.js';
import type { Database } from './schema.js';

@Injectable()
export class DietaryCategoryRepository {
  constructor(@Inject(DATABASE) private readonly db: Kysely<Database>) {}

  async list(): Promise<DietaryCategory[]> {
    return this.db
      .selectFrom('dietary_category')
      .select([
        'code',
        'display_name as displayName',
        'requires_description as requiresDescription',
      ])
      .orderBy('code')
      .execute();
  }
}
