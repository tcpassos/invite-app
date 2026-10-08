// Ponto único de tradução de erro em resposta HTTP (HttpExceptionFilter do
// Diagrama de Componentes). Pega qualquer exceção, inclusive as do próprio framework.
import { Catch, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { Request, Response } from 'express';
import { toErrorResponse } from './error-response.js';
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

    res.status(status).json(body);
  }
}
