// Catálogo de templates do ADR-0009, na parte que as duas pontas precisam conhecer.
// A API usa este catálogo para validar a escolha, as cores e o tamanho dos textos
// (UC003 RN2), e o front usa para montar o editor e renderizar os templates estáticos.
// Acrescentar um template muda os dois lugares no mesmo PR.

/** Cor no formato #rrggbb. */
export type HexColor = string;

export interface TemplateDefinition {
  code: string;
  displayName: string;
  /** Papéis de cor do template e o valor padrão de cada um. */
  defaultColors: Readonly<Record<string, HexColor>>;
  /** Tamanho máximo dos dois textos do convite neste template (UC003 RN2). */
  textLimits: Readonly<{ eventName: number; location: number }>;
}

/** Template usado enquanto o anfitrião não personalizou o convite (UC003 passo 1). */
export const DEFAULT_TEMPLATE_CODE = 'classic';

// O catálogo é compartilhado pela validação da API e pelo editor do front.
export const TEMPLATES: readonly TemplateDefinition[] = [
  {
    code: 'classic',
    displayName: 'Clássico',
    defaultColors: { primary: '#7a2e3a', background: '#fdf8f3', text: '#2b2b2b' },
    textLimits: { eventName: 60, location: 120 },
  },
  {
    code: 'botanical',
    displayName: 'Botânico',
    defaultColors: { primary: '#426b50', background: '#f2f6ed', text: '#26362a' },
    textLimits: { eventName: 60, location: 120 },
  },
  {
    code: 'modern',
    displayName: 'Moderno',
    defaultColors: { primary: '#3556a8', background: '#f1f4fb', text: '#20273a' },
    textLimits: { eventName: 60, location: 120 },
  },
];
