// Corpos das rotas do painel que tratam do convite (UC002, UC003 e UC004).
//
// Datas: a entrada leva `eventDate` (AAAA-MM-DD) e `eventTime` (HH:mm) separados, e a
// saída leva `eventStartsAt`, um instante em ISO 8601. Quem junta os dois no fuso
// America/Sao_Paulo é a Apresentação da API (ADR-0013).
//
// Os dois limites do convite se chamam aqui `peopleLimit` e `companionLimit`, e não
// pelos nomes do modelo. A terceira busca da seção 6.4 do Guia procura os nomes do
// modelo dentro do front, e quem cede é o nome do contrato, como na seção 9.3.
import type { InviteStatus } from './statuses.js';
import type { HexColor } from './templates.js';

export interface CreateInviteRequest {
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  /** Teto de pessoas do evento, inteiro maior que zero (UC002 RN2). Ausente ou nulo é sem teto. */
  peopleLimit?: number | null;
  /** Acompanhantes por convidado, inteiro maior ou igual a zero (UC002 RN2). Ausente ou nulo é sem limite. */
  companionLimit?: number | null;
}

/**
 * Correção do rascunho (UC002 A2), com os mesmos campos e regras da criação. Fora do
 * rascunho a API responde 409 INVITE_NOT_OPEN (UC002 RN3).
 */
export type UpdateInviteRequest = CreateInviteRequest;

/** O que o anfitrião salva no editor do UC003: template, cores e os dois textos do convite. */
export interface CustomizeInviteRequest {
  templateCode: string;
  /** Só as cores que mudam em relação ao padrão do template. */
  colorOverrides: Record<string, HexColor>;
  eventName: string;
  location: string;
}

export interface InviteCustomizationView {
  templateCode: string;
  colorOverrides: Record<string, HexColor>;
}

/** Uma linha da lista de convites, que é a entrada do painel. */
export interface InviteSummary {
  id: string;
  eventName: string;
  eventStartsAt: string;
  status: InviteStatus;
}

export interface InviteDetails extends InviteSummary {
  location: string;
  /** Existe a partir da primeira publicação e é reaproveitado ao republicar. */
  publicToken: string | null;
  peopleLimit: number | null;
  companionLimit: number | null;
  /** Sem personalização salva, vem o template padrão sem sobrescritas. */
  customization: InviteCustomizationView;
}

export interface PublishInviteResponse {
  publicToken: string;
  status: typeof InviteStatus.Published;
}

export interface UnpublishInviteResponse {
  status: typeof InviteStatus.Unpublished;
}
