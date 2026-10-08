// Ponto único de tradução de erro em resposta HTTP (HttpExceptionFilter do
// Diagrama de Componentes). Pega qualquer exceção, inclusive as do próprio framework.
import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';
import { toErrorResponse } from './error-response.js';
import { RateLimitedException } from './rate-limit.js';
import { newRequestId } from './request-context.js';

export type ErrorLogger = (line: string) => void;

const stderr: ErrorLogger = (line) => process.stderr.write(line + '\n');

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logError: ErrorLogger = stderr) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const traceId = req.requestId ?? newRequestId();
    const { status, body } = toErrorResponse(exception, traceId);

    // O 500 é o único caso em que alguém vai precisar da pilha. A primeira linha da
    // pilha repete a mensagem, que pode trazer dado de usuário, então ela fica de fora.
    if (status >= 500) {
      const stack = exception instanceof Error ? exception.stack?.split('\n').slice(1) : undefined;
      const name = exception instanceof Error ? exception.name : typeof exception;
      this.logError(
        JSON.stringify({ level: 'error', tier: 'api', requestId: traceId, error: name, stack }),
      );
    }

    // Todo 404 e todo 429 saem sem cache, para um 404 guardado não sobreviver à
    // republicação do convite e para os 404 não se distinguirem por cabeçalho (Guia, 9.5).
    if (status === 404 || status === 429) res.setHeader('Cache-Control', 'no-store');
    if (exception instanceof RateLimitedException) {
      res.setHeader('Retry-After', String(exception.retryAfterSeconds));
    }

    res.status(status).json(body);
  }
}
