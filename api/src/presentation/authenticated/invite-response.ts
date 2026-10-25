// Tradução do modelo do convite para os tipos de contract/, no pacote autenticado. A data
// sai como um instante ISO, e quem formata para a tela é o front (ADR-0013).
import type { InviteDetails, InviteSummary } from '@invite-app/contract';
import type { Invite, InviteWithCustomization } from '../../model/index.js';

export function toInviteSummary(invite: Invite): InviteSummary {
  return {
    id: invite.id,
    eventName: invite.eventName,
    eventStartsAt: invite.eventStartsAt.toISOString(),
    status: invite.status,
  };
}

/** Os limites saem com o nome do contrato, e não com o do modelo (Guia, 4.1). */
export function toInviteDetails({ invite, customization }: InviteWithCustomization): InviteDetails {
  return {
    ...toInviteSummary(invite),
    location: invite.location,
    publicToken: invite.publicToken,
    peopleLimit: invite.capacityLimit,
    companionLimit: invite.maxCompanionsPerGuest,
    customization: {
      templateCode: customization.templateCode,
      colorOverrides: Object.fromEntries(
        customization.colorOverrides.map(({ role, value }) => [role, value]),
      ),
    },
  };
}
