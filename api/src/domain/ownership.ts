// A conferência de dono do convite, usada por todo serviço do painel (Guia da
// Arquitetura, 3.1 e 9.5). A Apresentação autentica e entrega o hostId, e é aqui que
// se decide se aquele anfitrião pode agir sobre aquele convite.
import type { Invite } from '../model/index.js';
import { NotInviteOwner } from './errors.js';

/**
 * Devolve o convite quando ele existe e é do anfitrião. Convite inexistente e convite
 * de outro anfitrião saem pelo mesmo erro, porque os dois viram o mesmo 404 (Guia, 9.5).
 */
export function validateOwnership(invite: Invite | null, hostId: string): Invite {
  if (!invite || invite.hostId !== hostId) throw new NotInviteOwner();
  return invite;
}
