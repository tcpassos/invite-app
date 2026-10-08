// parseRequest do DAS, seção 5.2: confere a forma do corpo, e só (Guia da Arquitetura, 3.1).
//
// A fronteira entre 400 e 422 passa por aqui. Campo presente no tipo errado é forma, e
// vira 400 MALFORMED_REQUEST sem detalhe. Campo ausente, valor fora do conjunto, número
// abaixo do piso e texto comprido demais são regras, e quem recusa é o Domínio, com 422.
// Por isso nenhuma função abaixo exige que o campo exista: ausente sai como undefined.
import { BadRequestException } from '@nestjs/common';

export type Body = Record<string, unknown>;

/** O corpo precisa ser um objeto JSON. Lista, texto e número são forma errada. */
export function asObject(body: unknown): Body {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new BadRequestException();
  }
  return body as Body;
}

export function optionalString(body: Body, field: string): string | undefined {
  const value = body[field];
  if (value === undefined) return undefined;
  if (typeof value !== 'string') throw new BadRequestException();
  return value;
}

/** Inteiro, ou ausente. Nulo também é aceito quando o contrato declara `| null`. */
export function optionalInteger(body: Body, field: string): number | undefined;
export function optionalInteger(
  body: Body,
  field: string,
  options: { nullable: true },
): number | null | undefined;
export function optionalInteger(
  body: Body,
  field: string,
  options?: { nullable: true },
): number | null | undefined {
  const value = body[field];
  if (value === undefined) return undefined;
  if (value === null && options?.nullable) return null;
  if (typeof value !== 'number' || !Number.isInteger(value)) throw new BadRequestException();
  return value;
}

export function optionalStringArray(body: Body, field: string): string[] | undefined {
  const value = body[field];
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new BadRequestException();
  }
  return value;
}

/** Objeto aninhado, como `dietaryNote`. Devolve o objeto para ler os campos dele. */
export function optionalObject(body: Body, field: string): Body | undefined {
  const value = body[field];
  if (value === undefined) return undefined;
  return asObject(value);
}

/** Objeto de texto para texto, como `colorOverrides`. */
export function optionalStringRecord(
  body: Body,
  field: string,
): Record<string, string> | undefined {
  const value = optionalObject(body, field);
  if (value === undefined) return undefined;
  if (!Object.values(value).every((item) => typeof item === 'string')) {
    throw new BadRequestException();
  }
  return value as Record<string, string>;
}
