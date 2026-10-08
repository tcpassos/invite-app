// RateLimitGuard do DAS, seção 5.2. Conta na memória do processo, em janela deslizante
// por chave, como o ADR-0010 decidiu. O contador zera quando a API reinicia.
//
// A ordem das chamadas importa, pela seção 9.5 do Guia da Arquitetura. O limite por
// endereço de origem pode recusar antes de resolver o token. O limite por token só pode
// recusar depois que o token resolveu, senão o 429 revela que o token existe.
//
// Nas rotas públicas de escrita:
//   enforceOriginLimit(clientIp(req))   antes de tudo
//   ... o Domínio resolve o token, e token que não resolve responde 404 ...
//   enforceWriteLimit(token)            depois da resolução
// Nas rotas públicas de leitura, só enforceReadLimit(token), depois da resolução.
// O token pode ser o do convite ou o pessoal (Guia, 4.1).
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import type { Request } from 'express';

const MINUTE = 60_000;

// Os números da entrada e do cadastro são os da RN4 do UC001. Os da fronteira pública
// estão na seção 4.1 do Guia da Arquitetura, linha 34 da seção 11.1.
export const RATE_LIMITS = {
  publicRead: { limit: 120, windowMs: MINUTE },
  publicWrite: { limit: 100, windowMs: 10 * MINUTE },
  publicWriteOrigin: { limit: 20, windowMs: 10 * MINUTE },
  signInEmail: { limit: 5, windowMs: 15 * MINUTE },
  signInOrigin: { limit: 20, windowMs: 15 * MINUTE },
  signUpOrigin: { limit: 10, windowMs: 15 * MINUTE },
} as const;

type LimitName = keyof typeof RATE_LIMITS;

/** Vira 429 RATE_LIMITED no filtro, com o cabeçalho Retry-After. */
export class RateLimitedException extends HttpException {
  constructor(readonly retryAfterSeconds: number) {
    super('Too Many Requests', HttpStatus.TOO_MANY_REQUESTS);
  }
}

/** O endereço que o socket enxerga. O tier Front não repassa o do convidado (Guia, 11.1, linha 32). */
export function clientIp(req: Request): string {
  return req.ip ?? req.socket.remoteAddress ?? 'desconhecido';
}

export class SlidingWindow {
  private readonly hits = new Map<string, number[]>();

  constructor(
    readonly limit: number,
    readonly windowMs: number,
  ) {}

  /** Quanto falta, em milissegundos, para a chave voltar a ter vaga. Zero quando cabe. */
  wait(key: string, now: number): number {
    const recent = this.recent(key, now);
    if (recent.length < this.limit) return 0;
    return (recent[0] ?? now) + this.windowMs - now;
  }

  record(key: string, now: number): void {
    this.hits.set(key, [...this.recent(key, now), now]);
    // Chave que ninguém mais consulta ficaria para sempre. De tempos em tempos, limpa.
    if (this.hits.size > 10_000) this.prune(now);
  }

  private recent(key: string, now: number): number[] {
    return (this.hits.get(key) ?? []).filter((time) => time > now - this.windowMs);
  }

  private prune(now: number): void {
    for (const key of [...this.hits.keys()]) {
      if (this.recent(key, now).length === 0) this.hits.delete(key);
    }
  }
}

@Injectable()
export class RateLimitGuard {
  private readonly windows = Object.fromEntries(
    Object.entries(RATE_LIMITS).map(([name, { limit, windowMs }]) => [
      name,
      new SlidingWindow(limit, windowMs),
    ]),
  ) as Record<LimitName, SlidingWindow>;

  /** Rotas públicas de escrita, antes de resolver o token. */
  enforceOriginLimit(clientIp: string): void {
    this.consume('publicWriteOrigin', clientIp);
  }

  /** Rotas públicas de leitura, depois que o token resolveu. */
  enforceReadLimit(token: string): void {
    this.consume('publicRead', token);
  }

  /** Rotas públicas de escrita, depois que o token resolveu. */
  enforceWriteLimit(token: string): void {
    this.consume('publicWrite', token);
  }

  /** Antes de conferir a senha. Conta só as entradas recusadas, por email e por endereço. */
  enforceSignInLimit(email: string, clientIp: string): void {
    this.check('signInEmail', email.trim().toLowerCase());
    this.check('signInOrigin', clientIp);
  }

  /**
   * Depois de uma entrada recusada. Vale para qualquer email digitado, tenha conta ou
   * não, para o 429 não revelar quais emails estão cadastrados (UC001 RN4).
   */
  recordSignInFailure(email: string, clientIp: string): void {
    const now = Date.now();
    this.windows.signInEmail.record(email.trim().toLowerCase(), now);
    this.windows.signInOrigin.record(clientIp, now);
  }

  /** Antes de criar a conta. Conta toda tentativa de cadastro. */
  enforceSignUpLimit(clientIp: string): void {
    this.consume('signUpOrigin', clientIp);
  }

  private check(name: LimitName, key: string): void {
    const wait = this.windows[name].wait(key, Date.now());
    if (wait > 0) throw new RateLimitedException(Math.ceil(wait / 1000));
  }

  private consume(name: LimitName, key: string): void {
    this.check(name, key);
    this.windows[name].record(key, Date.now());
  }
}
