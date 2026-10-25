// AttendanceService do Diagrama de Componentes: a lista de presença do UC007, consultada
// periodicamente pelo painel (ADR-0007). Dono e assinatura na linha 5 da seção 11.1 do Guia.
import { Injectable } from '@nestjs/common';
import { RsvpStatus } from '@invite-app/contract';
import { InviteRepository } from '../data/invite.repository.js';
import type { AttendanceEntry } from '../model/index.js';
import { validateOwnership } from './ownership.js';
import { seatsRequested } from './rsvp-rules.js';

export interface AttendanceList {
  guests: AttendanceEntry[];
  totalPeople: number;
}

/** UC007 passo 2: confirmados, talvez e recusados aparecem na lista. */
const LISTED_STATUSES = [RsvpStatus.Accepted, RsvpStatus.Maybe, RsvpStatus.Declined] as const;

@Injectable()
export class AttendanceService {
  constructor(private readonly invites: InviteRepository) {}

  async listAttendance(inviteId: string, hostId: string): Promise<AttendanceList> {
    validateOwnership(await this.invites.findById(inviteId), hostId);
    const guests = await this.invites.findAttendanceByStatus(inviteId, LISTED_STATUSES);
    // UC007 RN1: o total é a soma das vagas de cada resposta, a mesma regra do teto. Soma
    // as linhas que a tela já recebe, em vez de pedir ao banco uma conta com a regra dentro.
    const totalPeople = guests.reduce(
      (total, guest) => total + seatsRequested(guest.status, guest.companionCount),
      0,
    );
    return { guests, totalPeople };
  }
}
