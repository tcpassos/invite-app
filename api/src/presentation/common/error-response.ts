// Tradução de qualquer erro no formato único ApiError (Guia da Arquitetura, 9.3).
// É a operação toErrorResponse da interface ErrorTranslation do Diagrama de Componentes.
//
// Regra que não pode ser quebrada: nada que veio de dentro de uma exceção vai para o
// corpo. O 404 padrão do framework, por exemplo, traz o caminho da rota na mensagem, e
// o caminho pode conter o token do convite (Guia, 9.3 e 9.5).
import { HttpException } from '@nestjs/common';
import {
  ERROR_HTTP_STATUS,
  ErrorCode,
  ValidationRule,
  type ApiError,
  type ErrorDetail,
} from '@invite-app/contract';
import {
  CapacityExceededError,
  InvalidInviteForPublication,
  InviteNotOpenError,
  NotInviteOwner,
  ValidationError,
} from '../../domain/errors.js';

const MESSAGES: Record<ErrorCode, string> = {
  MALFORMED_REQUEST: 'Não foi possível ler o pedido.',
  UNAUTHENTICATED: 'Sua sessão não é válida. Entre de novo.',
  RATE_LIMITED: 'Muitas tentativas em pouco tempo. Aguarde um instante e tente de novo.',
  VALIDATION_FAILED: 'Há um campo com problema.',
  INVITE_NOT_PUBLISHABLE: 'O convite ainda não pode ser publicado.',
  NOT_FOUND: 'Não encontramos o que você procurou.',
  CAPACITY_EXCEEDED: 'O evento está lotado.',
  INVITE_NOT_OPEN: 'Este convite não está aberto para essa operação.',
  INTERNAL_ERROR: 'Não foi possível concluir o pedido. Tente de novo em instantes.',
};

// Em VALIDATION_FAILED a mensagem sai da regra da primeira entrada de `details`.
const RULE_MESSAGES: Record<ValidationRule, string> = {
  required: 'Preencha os campos obrigatórios.',
  allowedValue: 'Escolha uma das opções disponíveis.',
  companionLimit: 'O número de acompanhantes está acima do limite deste convite.',
  minValue: 'O valor informado está abaixo do permitido.',
  dateNotInPast: 'A data do evento não pode estar no passado.',
  descriptionRequired: 'Descreva a restrição alimentar marcada.',
  maxLength: 'O texto passou do tamanho permitido.',
  minLength: 'O texto é mais curto que o mínimo permitido.',
  alreadyRegistered: 'Já existe uma conta com este email.',
};

export interface ErrorResponse {
  status: number;
  body: ApiError;
}

function build(code: ErrorCode, traceId: string, details?: ErrorDetail[]): ErrorResponse {
  const first = details?.[0];
  const message =
    code === ErrorCode.ValidationFailed && first ? RULE_MESSAGES[first.rule] : MESSAGES[code];
  const body: ApiError = { code, message, traceId };
  if (details && details.length > 0) body.details = details;
  return { status: ERROR_HTTP_STATUS[code], body };
}

function fromHttpStatus(status: number): ErrorCode {
  if (status === 401) return ErrorCode.Unauthenticated;
  if (status === 404) return ErrorCode.NotFound;
  if (status === 429) return ErrorCode.RateLimited;
  if (status >= 400 && status < 500) return ErrorCode.MalformedRequest;
  return ErrorCode.InternalError;
}

export function toErrorResponse(error: unknown, traceId: string): ErrorResponse {
  if (error instanceof ValidationError) {
    return build(ErrorCode.ValidationFailed, traceId, [{ field: error.field, rule: error.rule }]);
  }
  if (error instanceof InvalidInviteForPublication) {
    const details = error.missingFields.map((field) => ({ field, rule: ValidationRule.Required }));
    return build(ErrorCode.InviteNotPublishable, traceId, details);
  }
  if (error instanceof NotInviteOwner) return build(ErrorCode.NotFound, traceId);
  if (error instanceof CapacityExceededError) return build(ErrorCode.CapacityExceeded, traceId);
  if (error instanceof InviteNotOpenError) return build(ErrorCode.InviteNotOpen, traceId);
  if (error instanceof HttpException) return build(fromHttpStatus(error.getStatus()), traceId);
  // Erro do corpo JSON malformado, levantado pelo body parser antes do roteamento.
  if (isBodyParserError(error)) return build(fromHttpStatus(error.status), traceId);
  return build(ErrorCode.InternalError, traceId);
}

function isBodyParserError(error: unknown): error is { status: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    typeof (error as { type: unknown }).type === 'string' &&
    'status' in error &&
    typeof (error as { status: unknown }).status === 'number'
  );
}
