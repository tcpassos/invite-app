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

// Os três templates vieram do protótipo do front. Cada um tem dois papéis de cor: `primary`,
// a cor da saudação e do selo, e `accent`, o fundo dos ícones. O fundo e o texto ficam no
// CSS do template, para o convite continuar legível com qualquer escolha do anfitrião.
export const TEMPLATES: readonly TemplateDefinition[] = [
  {
    code: 'classic',
    displayName: 'Clássico',
    defaultColors: { primary: '#e8593c', accent: '#f4a231' },
    textLimits: { eventName: 80, location: 120 },
  },
  {
    code: 'garden',
    displayName: 'Jardim',
    defaultColors: { primary: '#7c9b6b', accent: '#a9c48f' },
    textLimits: { eventName: 80, location: 120 },
  },
  {
    code: 'night',
    displayName: 'Noite',
    defaultColors: { primary: '#5b93b8', accent: '#e8593c' },
    textLimits: { eventName: 80, location: 120 },
  },
];
