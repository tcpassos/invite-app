// Template é ativo estático e não tabela (ADR-0009). O catálogo com os dados mora em
// contract/src/templates.ts, compartilhado com o front.
import type { ColorSetting } from './invite.js';

/** Objeto de valor: o tamanho máximo de um texto do convite (UC003 RN2). */
export interface TextFieldLimit {
  field: string;
  maxLength: number;
}

export interface Template {
  code: string;
  displayName: string;
  defaultColors: ColorSetting[];
  textFieldLimits: TextFieldLimit[];
}
