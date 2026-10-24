// Operações do painel do anfitrião (UC001 a UC004, UC007 e UC008), tipadas pelo contract.
// Todas saem do navegador direto para a API, com o cookie de sessão (ADR-0010). O tier
// Front entrega o bundle do painel e não participa de nenhuma chamada de dado dele.
import type {
  AttendanceList,
  CreateInviteRequest,
  CustomizeInviteRequest,
  DietarySummary,
  HostProfile,
  InviteDetails,
  InviteSummary,
  PublishInviteResponse,
  SignInRequest,
  SignUpRequest,
  UnpublishInviteResponse,
  UpdateInviteRequest,
} from '@invite-app/contract';
import { browserApi } from './browser-api';

const invitePath = (inviteId: string) => `/invites/${encodeURIComponent(inviteId)}`;

export function signUp(body: SignUpRequest): Promise<HostProfile> {
  return browserApi.request<HostProfile>('POST', '/auth/sign-up', { body });
}

export function signIn(body: SignInRequest): Promise<HostProfile> {
  return browserApi.request<HostProfile>('POST', '/auth/sign-in', { body });
}

export function signOut(): Promise<void> {
  return browserApi.request<void>('POST', '/auth/sign-out');
}

export function getSession(): Promise<HostProfile> {
  return browserApi.request<HostProfile>('GET', '/auth/session');
}

export function listInvites(): Promise<InviteSummary[]> {
  return browserApi.request<InviteSummary[]>('GET', '/invites');
}

export function createInvite(body: CreateInviteRequest): Promise<InviteDetails> {
  return browserApi.request<InviteDetails>('POST', '/invites', { body });
}

export function getInvite(inviteId: string): Promise<InviteDetails> {
  return browserApi.request<InviteDetails>('GET', invitePath(inviteId));
}

export function updateInvite(inviteId: string, body: UpdateInviteRequest): Promise<InviteDetails> {
  return browserApi.request<InviteDetails>('PUT', invitePath(inviteId), { body });
}

export function customizeInvite(
  inviteId: string,
  body: CustomizeInviteRequest,
): Promise<InviteDetails> {
  return browserApi.request<InviteDetails>('PUT', `${invitePath(inviteId)}/customization`, {
    body,
  });
}

/** Idempotente pela releitura do UC004, então pode repetir uma vez (Guia, 9.4). */
export function publishInvite(inviteId: string): Promise<PublishInviteResponse> {
  return browserApi.request<PublishInviteResponse>('POST', `${invitePath(inviteId)}/publish`, {
    retry: 'once',
  });
}

/** Não repete: a segunda execução devolveria 409 numa operação que deu certo (Guia, 9.4). */
export function unpublishInvite(inviteId: string): Promise<UnpublishInviteResponse> {
  return browserApi.request<UnpublishInviteResponse>('POST', `${invitePath(inviteId)}/unpublish`);
}

export function getAttendance(inviteId: string): Promise<AttendanceList> {
  return browserApi.request<AttendanceList>('GET', `${invitePath(inviteId)}/attendance`, {
    retry: 'once',
  });
}

export function getDietarySummary(inviteId: string): Promise<DietarySummary> {
  return browserApi.request<DietarySummary>('GET', `${invitePath(inviteId)}/dietary-summary`, {
    retry: 'once',
  });
}

/** O CSV é montado pela API, com a neutralização de fórmula do ADR-0008, medida 5. */
export function downloadDietaryNotes(inviteId: string): Promise<Blob> {
  return browserApi.download(`${invitePath(inviteId)}/dietary-notes.csv`, { retry: 'once' });
}
