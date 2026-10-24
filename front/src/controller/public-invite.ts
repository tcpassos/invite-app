// Operações da superfície pública (UC005 e UC006), tipadas pelo contract.
// As leituras rodam no servidor do tier Front com serverApi(), e quem chama passa o
// cliente. As escritas saem do navegador direto para a API (Guia, 10.2).
import type {
  GuestResponsePage,
  PublishedInvite,
  RsvpRequest,
  RsvpResult,
} from '@invite-app/contract';
import type { ApiClient } from './api-client';
import { browserApi } from './browser-api';

const invitePath = (publicToken: string) => `/public/invites/${encodeURIComponent(publicToken)}`;
const responsePath = (personalToken: string) =>
  `/public/responses/${encodeURIComponent(personalToken)}`;

/** Salto 2 do Guia, 9.4: a leitura do convite repete uma vez em falha de transporte. */
export function getPublishedInvite(api: ApiClient, publicToken: string): Promise<PublishedInvite> {
  return api.request<PublishedInvite>('GET', invitePath(publicToken), { retry: 'once' });
}

export function getGuestResponsePage(
  api: ApiClient,
  personalToken: string,
): Promise<GuestResponsePage> {
  return api.request<GuestResponsePage>('GET', responsePath(personalToken));
}

/**
 * Nunca repete. Uma segunda tentativa grava o convidado duas vezes e ocupa a vaga duas
 * vezes, e nenhuma checagem no servidor recusa a segunda (Guia, 9.4).
 */
export function submitRsvp(publicToken: string, body: RsvpRequest): Promise<RsvpResult> {
  return browserApi.request<RsvpResult>('POST', `${invitePath(publicToken)}/rsvp`, { body });
}

/** Também não repete, pela mesma regra (Guia, 4.1). */
export function updateGuestResponse(
  personalToken: string,
  body: RsvpRequest,
): Promise<GuestResponsePage> {
  return browserApi.request<GuestResponsePage>('PUT', responsePath(personalToken), { body });
}
