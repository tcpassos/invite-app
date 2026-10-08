// Formato único de erro da API, seção 9.3 do Guia da Arquitetura.
// O front decide comportamento por `code` e pelo status HTTP, nunca por `message`.

export const ErrorCode = {
  MalformedRequest: 'MALFORMED_REQUEST',
  Unauthenticated: 'UNAUTHENTICATED',
  RateLimited: 'RATE_LIMITED',
  ValidationFailed: 'VALIDATION_FAILED',
  InviteNotPublishable: 'INVITE_NOT_PUBLISHABLE',
  NotFound: 'NOT_FOUND',
  CapacityExceeded: 'CAPACITY_EXCEEDED',
  InviteNotOpen: 'INVITE_NOT_OPEN',
  InternalError: 'INTERNAL_ERROR',
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

// Status HTTP de cada código, conforme a tabela 9.1 do Guia.
export const ERROR_HTTP_STATUS: Record<ErrorCode, number> = {
  MALFORMED_REQUEST: 400,
  UNAUTHENTICATED: 401,
  RATE_LIMITED: 429,
  VALIDATION_FAILED: 422,
  INVITE_NOT_PUBLISHABLE: 422,
  NOT_FOUND: 404,
  CAPACITY_EXCEEDED: 409,
  INVITE_NOT_OPEN: 409,
  INTERNAL_ERROR: 500,
};

// Regras que podem aparecer em `details`. Conjunto fechado, seção 9.3 do Guia.
export const ValidationRule = {
  Required: 'required',
  AllowedValue: 'allowedValue',
  CompanionLimit: 'companionLimit',
  MinValue: 'minValue',
  DateNotInPast: 'dateNotInPast',
  DescriptionRequired: 'descriptionRequired',
  MaxLength: 'maxLength',
  // UC001 RN1: a senha tem no mínimo oito caracteres.
  MinLength: 'minLength',
  // UC001 RN3: o email já tem conta.
  AlreadyRegistered: 'alreadyRegistered',
} as const;
export type ValidationRule = (typeof ValidationRule)[keyof typeof ValidationRule];

// `field` é o nome do campo no contrato, nunca o nome da coluna no banco. Campo
// dentro de objeto usa ponto, como `dietaryNote.freeText` e `colorOverrides.primary`.
export interface ErrorDetail {
  field: string;
  rule: ValidationRule;
}

// `code`, `message` e `traceId` vêm sempre. `details` só existe em VALIDATION_FAILED
// e INVITE_NOT_PUBLISHABLE, e quando não se aplica fica ausente, nunca nulo nem vazio.
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: ErrorDetail[];
  traceId: string;
}
