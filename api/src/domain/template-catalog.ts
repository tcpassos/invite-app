import { TEMPLATES, type TemplateDefinition } from '@invite-app/contract';

const LEGACY_TEMPLATES: readonly TemplateDefinition[] = [
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

/**
 * Aceita também o catálogo que o front da versão anterior de main ainda consome.
 * `classic` existe nos dois catálogos, então seus papéis de cor são a união dos dois.
 */
export function findTemplateDefinition(code: string): TemplateDefinition | undefined {
  const current = TEMPLATES.find((template) => template.code === code);
  if (code === 'classic' && current) {
    return {
      ...current,
      defaultColors: { ...current.defaultColors, accent: '#f4a231' },
      textLimits: { ...current.textLimits, eventName: 80 },
    };
  }
  return current ?? LEGACY_TEMPLATES.find((template) => template.code === code);
}
