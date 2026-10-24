// Leitura dos erros da API para a tela. A tela decide pelo `code` e pela regra de cada
// campo, nunca pela mensagem (Guia, 9.3). O texto que o usuário lê é da view.
import { ErrorCode, type ValidationRule } from '@invite-app/contract';
import { ApiRequestError, ApiUnavailableError } from './api-client';

export function errorCode(error: unknown): ErrorCode | undefined {
  return error instanceof ApiRequestError ? error.code : undefined;
}

/**
 * A regra recusada em cada campo, pelo nome do campo no contrato. Vem do `details` de
 * VALIDATION_FAILED e de INVITE_NOT_PUBLISHABLE. Campo com duas regras fica com a primeira.
 */
export function fieldErrors(error: unknown): Partial<Record<string, ValidationRule>> {
  if (!(error instanceof ApiRequestError)) return {};
  const fields: Partial<Record<string, ValidationRule>> = {};
  for (const detail of error.body.details ?? []) fields[detail.field] ??= detail.rule;
  return fields;
}

export function isUnauthenticated(error: unknown): boolean {
  return errorCode(error) === ErrorCode.Unauthenticated;
}

/**
 * Falha em que a API não chegou a dizer o que aconteceu: a rede caiu, a resposta se perdeu
 * ou a API respondeu 500. Numa escrita não idempotente, a resposta pode ter sido gravada
 * mesmo assim (Guia, 9.4).
 */
export function isUncertainFailure(error: unknown): boolean {
  return error instanceof ApiUnavailableError || errorCode(error) === ErrorCode.InternalError;
}

/** O que a página do convite ou do link pessoal faz com a leitura feita no servidor. */
export type PublicReadOutcome<T> =
  | { kind: 'ok'; data: T }
  /** O mesmo 404 para as cinco situações, que vira redirecionamento temporário (Guia, 9.5). */
  | { kind: 'notFound' }
  /** 429 vira "tente de novo em instantes", e não a rota de não encontrado (Guia, 9.5). */
  | { kind: 'busy' }
  /** API fora do ar ou 500 viram a página de convite indisponível (Guia, 9.4). */
  | { kind: 'unavailable' };

export async function readPublic<T>(read: Promise<T>): Promise<PublicReadOutcome<T>> {
  try {
    return { kind: 'ok', data: await read };
  } catch (error) {
    const code = errorCode(error);
    if (code === ErrorCode.NotFound) return { kind: 'notFound' };
    if (code === ErrorCode.RateLimited) return { kind: 'busy' };
    if (error instanceof ApiRequestError || error instanceof ApiUnavailableError) {
      return { kind: 'unavailable' };
    }
    throw error;
  }
}
