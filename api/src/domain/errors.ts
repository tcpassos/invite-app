// Erros que o Domínio levanta. Nenhum deles conhece status HTTP: quem traduz
// cada um em resposta é o filtro da Apresentação (Guia da Arquitetura, 9.1 e 9.2).
import type { ValidationRule } from '@invite-app/contract';

export abstract class DomainError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
  }
}

/** Uma regra de validação recusou um campo do pedido. Vira 422 VALIDATION_FAILED. */
export class ValidationError extends DomainError {
  constructor(
    readonly field: string,
    readonly rule: ValidationRule,
  ) {
    super();
  }
}

/** Faltam campos obrigatórios para publicar o convite (UC004 RN1). Vira 422 INVITE_NOT_PUBLISHABLE. */
export class InvalidInviteForPublication extends DomainError {
  constructor(readonly missingFields: readonly string[]) {
    super();
  }
}

/** O convite existe mas é de outro anfitrião. Vira o mesmo 404 da ausência (Guia, 9.5). */
export class NotInviteOwner extends DomainError {}

/** O teto de pessoas do evento foi atingido (UC005 RN4). Vira 409 CAPACITY_EXCEEDED. */
export class CapacityExceededError extends DomainError {}

/** O convite não está publicado para a operação pedida (UC004 RN3 e A2). Vira 409 INVITE_NOT_OPEN. */
export class InviteNotOpenError extends DomainError {}
