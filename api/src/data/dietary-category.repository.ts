// DietaryCategoryRepository do DAS, seção 5.2: o dado de referência das categorias
// alimentares (UC006 RN3). Fica fora do InviteRepository pela seção 5.2 do Guia.
import { Inject, Injectable } from '@nestjs/common';
import type { Kysely } from 'kysely';
import type { DietaryCategory } from '../model/index.js';
import { DATABASE } from './database.module.js';
import type { Database } from './schema.js';

@Injectable()
export class DietaryCategoryRepository {
  constructor(@Inject(DATABASE) private readonly db: Kysely<Database>) {}

  async listDietaryCategories(): Promise<DietaryCategory[]> {
    return this.db
      .selectFrom('dietary_category')
      .select([
        'code',
        'display_name as displayName',
        'requires_description as requiresDescription',
      ])
      .orderBy('display_name')
      .execute();
  }
}
