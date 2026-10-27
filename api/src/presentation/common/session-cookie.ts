// O cookie de sessão do anfitrião (ADR-0010 e Guia da Arquitetura, 10.4).
// Quem emite e valida a assinatura é o pacote auth e o SessionGuard. Este arquivo só
// fixa o nome e os atributos, para os dois lados usarem os mesmos.
import type { CookieOptions } from 'express';

export const SESSION_COOKIE_NAME = 'invite_session';

/** 30 minutos de inatividade, renovados a cada requisição autenticada (ADR-0010). */
export const SESSION_IDLE_MS = 30 * 60 * 1000;

/**
 * Os atributos do cookie. No ambiente local, front e API são o mesmo site, e o cookie vai
 * com SameSite=Lax e sem Secure, porque não há TLS. Na publicação da demonstração (ADR-0015),
 * front e API ficam em domínios diferentes: o navegador só manda o cookie com SameSite=None,
 * e SameSite=None exige Secure, que o ADR-0010 já pedia para quando houvesse publicação.
 */
export function sessionCookieOptions(crossSite = false): CookieOptions {
  return {
    httpOnly: true,
    sameSite: crossSite ? 'none' : 'lax',
    path: '/',
    maxAge: SESSION_IDLE_MS,
    secure: crossSite,
  };
}
