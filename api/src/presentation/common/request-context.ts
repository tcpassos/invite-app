// Identificador de correlação e linha de log por requisição (ADR-0012).
//
// O identificador nasce no tier Front e chega no cabeçalho x-request-id. A API
// reaproveita o valor quando ele tem o formato esperado e gera um novo quando não
// tem. Aceitar qualquer texto deixaria quem chama escrever o que quiser no log.
import { randomBytes } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { REQUEST_ID_HEADER } from '@invite-app/contract';

// 64 bits em hexadecimal, 16 caracteres (Guia da Arquitetura, 9.3).
const REQUEST_ID_FORMAT = /^[0-9a-f]{16}$/;

declare module 'express-serve-static-core' {
  interface Request {
    requestId: string;
  }
}

export function newRequestId(): string {
  return randomBytes(8).toString('hex');
}

export function resolveRequestId(received: string | string[] | undefined): string {
  const value = Array.isArray(received) ? received[0] : received;
  return value && REQUEST_ID_FORMAT.test(value) ? value : newRequestId();
}

// O que vai para o log é o molde da rota, nunca o caminho concreto, porque o token
// do convite mora dentro do caminho (ADR-0012). Sem rota casada, não há molde.
function routeTemplate(req: Request): string {
  const route = (req as Request & { route?: { path?: unknown } }).route;
  return typeof route?.path === 'string' ? route.path : '(sem rota)';
}

export interface RequestLogLine {
  time: string;
  tier: 'api';
  level: 'info' | 'error';
  method: string;
  route: string;
  status: number;
  durationMs: number;
  requestId: string;
}

export type LogWriter = (line: string) => void;

const stdout: LogWriter = (line) => process.stdout.write(line + '\n');

export function requestContext(write: LogWriter = stdout) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const started = process.hrtime.bigint();
    req.requestId = resolveRequestId(req.headers[REQUEST_ID_HEADER]);
    res.setHeader(REQUEST_ID_HEADER, req.requestId);

    res.on('finish', () => {
      const entry: RequestLogLine = {
        time: new Date().toISOString(),
        tier: 'api',
        level: res.statusCode >= 500 ? 'error' : 'info',
        method: req.method,
        route: routeTemplate(req),
        status: res.statusCode,
        durationMs: Number((process.hrtime.bigint() - started) / 1_000_000n),
        requestId: req.requestId,
      };
      write(JSON.stringify(entry));
    });

    next();
  };
}
