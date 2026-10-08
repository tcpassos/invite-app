// Catálogo de templates do ADR-0009, na parte que as duas pontas precisam conhecer.
// O HTML e o CSS de cada template moram em front/src/templates. A API usa este
// catálogo para validar a escolha, as cores e o tamanho dos textos (UC003 RN2), e o
// front usa para montar o editor. Acrescentar um template muda os dois lugares no
// mesmo PR, porque nada no build confere que eles continuem coerentes (Guia, 10.3).

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

// Template inicial, para a API e o front terem com o que trabalhar. Quem fizer os
// templates de verdade ajusta os papéis, as cores e os limites.
export const TEMPLATES: readonly TemplateDefinition[] = [
  {
    code: 'classic',
    displayName: 'Clássico',
    defaultColors: { primary: '#7a2e3a', background: '#fdf8f3', text: '#2b2b2b' },
    textLimits: { eventName: 60, location: 120 },
  },
];
