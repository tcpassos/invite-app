// TemplateCatalog do DAS, seção 5.2: o catálogo do ADR-0009 lido por dentro do Domínio, para
// sustentar a RN2 do UC003. Os dados moram em contract/src/templates.ts, compartilhados com
// o front, e não existe catálogo paralelo aqui.
import { DEFAULT_TEMPLATE_CODE, TEMPLATES, type TemplateDefinition } from '@invite-app/contract';

export function findTemplate(templateCode: string): TemplateDefinition | undefined {
  return TEMPLATES.find((template) => template.code === templateCode);
}

/** O tamanho máximo do nome do evento e do local no template (UC003 RN2). */
export function textFieldLimits(templateCode: string): TemplateDefinition['textLimits'] {
  return (findTemplate(templateCode) ?? defaultTemplate()).textLimits;
}

export function defaultTemplate(): TemplateDefinition {
  return findTemplate(DEFAULT_TEMPLATE_CODE)!;
}
