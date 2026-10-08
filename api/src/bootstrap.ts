// Configuração da aplicação que vale igual na execução e nos testes.
// O main.ts e os testes de ponta a ponta chamam esta mesma função.
import type { INestApplication } from '@nestjs/common';
import {
  HttpExceptionFilter,
  type ErrorLogger,
} from './presentation/common/http-exception.filter.js';
import { JsonContentTypeGuard } from './presentation/common/json-content-type.guard.js';
import { requestContext, type LogWriter } from './presentation/common/request-context.js';

export interface AppOptions {
  /** Única origem de onde o navegador pode chamar a API (Guia, 10.4). */
  frontOrigin?: string;
  requestLog?: LogWriter;
  errorLog?: ErrorLogger;
}

export function configureApp(app: INestApplication, options: AppOptions = {}): void {
  app.use(requestContext(options.requestLog));
  if (options.frontOrigin) {
    app.enableCors({
      // Em lista, a origem é comparada e só a do front recebe resposta de CORS.
      origin: [options.frontOrigin],
      credentials: true,
      methods: ['GET', 'POST', 'PUT'],
      // Sem X-Request-Id: o navegador não pode escolher o identificador de correlação.
      // Só o tier Front envia esse cabeçalho, e ele chama de dentro da rede (ADR-0012).
      allowedHeaders: ['Content-Type'],
    });
  }
  app.useGlobalGuards(new JsonContentTypeGuard());
  app.useGlobalFilters(new HttpExceptionFilter(options.errorLog));
}
