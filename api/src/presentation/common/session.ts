// A sessão do anfitrião: cookie assinado com o hostId e o instante de expiração, sem
// tabela de sessão (ADR-0010). O nome e os atributos do cookie estão em session-cookie.ts.
//
// Quem abre a sessão é o AuthController, depois que o Domínio devolve o anfitrião.
// Quem confere é o SessionGuard, em toda rota do painel.
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  Inject,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { SESSION_COOKIE_NAME, SESSION_COOKIE_OPTIONS, SESSION_IDLE_MS } from './session-cookie.js';

declare module 'express-serve-static-core' {
  interface Request {
    /** Preenchido pelo SessionGuard. Só existe nas rotas protegidas por ele. */
    hostId?: string;
  }
}

/** O segredo que assina o cookie, lido de SESSION_SECRET na subida da API. */
export const SESSION_SECRET = Symbol('SESSION_SECRET');

export function readCookie(header: string | undefined, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator > 0 && part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim();
    }
  }
  return undefined;
}

@Injectable()
export class SessionCookie {
  constructor(@Inject(SESSION_SECRET) private readonly secret: string) {}

  /** Abre a sessão, ou renova a janela de 30 minutos de uma sessão válida. */
  issue(res: Response, hostId: string, now = Date.now()): void {
    const payload = `${hostId}.${now + SESSION_IDLE_MS}`;
    res.cookie(SESSION_COOKIE_NAME, `${payload}.${this.sign(payload)}`, SESSION_COOKIE_OPTIONS);
  }

  /** Apaga o cookie no navegador. O ADR-0010 registra que a sessão não é revogável no servidor. */
  clear(res: Response): void {
    const { maxAge: _maxAge, ...options } = SESSION_COOKIE_OPTIONS;
    res.clearCookie(SESSION_COOKIE_NAME, options);
  }

  /** O hostId de uma sessão válida, ou null para cookie ausente, adulterado ou vencido. */
  verify(req: Request, now = Date.now()): string | null {
    const parts = readCookie(req.headers.cookie, SESSION_COOKIE_NAME)?.split('.');
    if (!parts || parts.length !== 3) return null;
    const [hostId = '', expiresAt = '', signature = ''] = parts;
    if (!/^\d{1,18}$/.test(hostId) || !/^\d{1,15}$/.test(expiresAt)) return null;
    const expected = Buffer.from(this.sign(`${hostId}.${expiresAt}`));
    const received = Buffer.from(signature);
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
    if (Number(expiresAt) <= now) return null;
    return hostId;
  }

  private sign(payload: string): string {
    return createHmac('sha256', this.secret).update(payload).digest('base64url');
  }
}

/**
 * SessionGuard do DAS, seção 5.2. Toda rota do painel usa @UseGuards(SessionGuard) e
 * recebe o anfitrião com @HostId(). Sem sessão válida, responde 401 UNAUTHENTICATED.
 */
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly session: SessionCookie) {}

  canActivate(context: ExecutionContext): boolean {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    req.hostId = this.authenticateSession(req, http.getResponse<Response>());
    return true;
  }

  /** Devolve o hostId e renova a janela, porque a expiração é por inatividade (ADR-0010). */
  authenticateSession(req: Request, res: Response): string {
    const hostId = this.session.verify(req);
    if (!hostId) throw new UnauthorizedException();
    this.session.issue(res, hostId);
    return hostId;
  }
}

/** O hostId da sessão, para o controller passar ao Domínio. Só funciona atrás do SessionGuard. */
export const HostId = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const hostId = context.switchToHttp().getRequest<Request>().hostId;
  if (!hostId) throw new UnauthorizedException();
  return hostId;
});
