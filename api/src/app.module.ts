import { Module, type DynamicModule } from '@nestjs/common';
import type { AppConfig } from './config.js';
import { DataModule } from './data/data.module.js';
import { DatabaseModule } from './data/database.module.js';
import { AuthModule } from './presentation/auth/auth.module.js';
import { InviteModule } from './presentation/authenticated/invite.module.js';
import { CommonModule } from './presentation/common/common.module.js';
import { PublicModule } from './presentation/public/public.module.js';

// Módulo raiz. Cada parte acrescenta em `imports` o módulo das rotas que implementa.
@Module({})
export class AppModule {
  static forRoot(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [
        DatabaseModule.forRoot(config.databaseUrl),
        DataModule,
        CommonModule.forRoot(config.sessionSecret),
        AuthModule,
        InviteModule,
        PublicModule,
      ],
    };
  }
}
