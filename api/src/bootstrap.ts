// Configuração da aplicação que vale igual na execução e nos testes.
// O main.ts e os testes de ponta a ponta chamam esta mesma função.
import type { INestApplication } from '@nestjs/common';
import {
  HttpExceptionFilter,
  type ErrorLogger,
} from './presentation/common/http-exception.filter.js';
import { requestContext, type LogWriter } from './presentation/common/request-context.js';

export interface Writers {
  requestLog?: LogWriter;
  errorLog?: ErrorLogger;
}

export function configureApp(app: INestApplication, writers: Writers = {}): void {
  app.use(requestContext(writers.requestLog));
  app.useGlobalFilters(new HttpExceptionFilter(writers.errorLog));
}
