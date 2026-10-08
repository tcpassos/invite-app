import { Module, type DynamicModule } from '@nestjs/common';
import type { AppConfig } from './config.js';
import { DatabaseModule } from './data/database.module.js';

// Módulo raiz. Cada parte acrescenta em `imports` o módulo das rotas que implementa.
@Module({})
export class AppModule {
  static forRoot(config: AppConfig): DynamicModule {
    return {
      module: AppModule,
      imports: [DatabaseModule.forRoot(config.databaseUrl)],
    };
  }
}
