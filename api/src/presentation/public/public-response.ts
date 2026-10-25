// Tradução do modelo para os tipos públicos de contract/. Só sai o que a superfície pública
// pode mostrar: o convite, as categorias e a resposta de quem apresentou o token, e nenhuma
// contagem nem resposta de outro convidado (Guia, 9.5).
import type { GuestResponsePage, PublishedInvite } from '@invite-app/contract';
import type { GuestResponseView, PublishedInviteView } from '../../domain/rsvp.service.js';

export function toPublishedInvite({
  invite,
  customization,
  categories,
}: PublishedInviteView): PublishedInvite {
  return {
    eventName: invite.eventName,
    eventStartsAt: invite.eventStartsAt.toISOString(),
    location: invite.location,
    companionLimit: invite.maxCompanionsPerGuest,
    customization: {
      templateCode: customization.templateCode,
      colorOverrides: Object.fromEntries(
        customization.colorOverrides.map(({ role, value }) => [role, value]),
      ),
    },
    dietaryCategories: categories,
  };
}

export function toGuestResponsePage(view: GuestResponseView): GuestResponsePage {
  const { guest, dietaryNote } = view.response;
  return {
    invite: toPublishedInvite(view),
    response: {
      name: guest.name,
      status: guest.status,
      companionCount: guest.companionCount,
      dietaryNote: dietaryNote && {
        categories: dietaryNote.categoryCodes,
        ...(dietaryNote.freeText ? { freeText: dietaryNote.freeText } : {}),
      },
      respondedAt: guest.respondedAt.toISOString(),
    },
    editable: view.editable,
  };
}
