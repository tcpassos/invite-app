// O cookie de sessão do anfitrião (ADR-0010 e Guia da Arquitetura, 10.4).
// Quem emite e valida a assinatura é o pacote auth e o SessionGuard. Este arquivo só
// fixa o nome e os atributos, para os dois lados usarem os mesmos.
import type { CookieOptions } from 'express';

export const SESSION_COOKIE_NAME = 'invite_session';

/** 30 minutos de inatividade, renovados a cada requisição autenticada (ADR-0010). */
export const SESSION_IDLE_MS = 30 * 60 * 1000;

export const SESSION_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  maxAge: SESSION_IDLE_MS,
  // Sem secure enquanto o ambiente rodar sem TLS. Entra no dia em que houver
  // publicação, conforme o ADR-0010.
  secure: false,
};
