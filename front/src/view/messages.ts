// Textos que a tela mostra para cada recusa da API. A decisão vem do `code` e da regra
// de cada campo (Guia, 9.3), e o texto é escrito aqui, nunca copiado da `message` da API.
import { ErrorCode, type ValidationRule } from '@invite-app/contract';

const RULE_MESSAGE: Record<ValidationRule, string> = {
  required: 'Preencha este campo.',
  allowedValue: 'Escolha uma das opções.',
  companionLimit: 'Passou do limite de acompanhantes deste convite.',
  minValue: 'O valor está abaixo do mínimo.',
  dateNotInPast: 'A data não pode estar no passado.',
  descriptionRequired: 'Descreva a restrição para continuar.',
  maxLength: 'O texto passou do tamanho máximo.',
  minLength: 'Use pelo menos 8 caracteres.',
  alreadyRegistered: 'Este email já tem conta. Entre com ele.',
};

export function ruleMessage(rule: ValidationRule | undefined): string | undefined {
  return rule && RULE_MESSAGE[rule];
}

export const UNAVAILABLE_MESSAGE =
  'Não conseguimos falar com o servidor agora. Tente de novo em alguns minutos.';
export const RATE_LIMITED_MESSAGE = 'Muitas tentativas em pouco tempo. Aguarde alguns minutos.';

/** Recusas das telas do painel que não apontam campo. */
export function panelFailureText(code: ErrorCode | undefined): string {
  switch (code) {
    case undefined:
    case ErrorCode.InternalError:
      return UNAVAILABLE_MESSAGE;
    case ErrorCode.ValidationFailed:
      return 'Confira os campos destacados.';
    case ErrorCode.NotFound:
      return 'Convite não encontrado.';
    // UC002 RN3: data, hora e limites só mudam no rascunho.
    case ErrorCode.InviteNotOpen:
      return 'Este convite não está mais em rascunho. Data, hora e limites não mudam depois de publicado.';
    default:
      return 'Não foi possível salvar. Tente de novo.';
  }
}
