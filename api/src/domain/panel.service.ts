import { Injectable } from '@nestjs/common';
import type { DietarySummary, AttendanceList } from '@invite-app/contract';
import { InviteRepository } from '../data/invite.repository.js';
import { validateOwnership } from './ownership.js';

@Injectable()
export class AttendanceService {
  constructor(private readonly invites: InviteRepository) {}

  async listAttendance(inviteId: string, hostId: string): Promise<AttendanceList> {
    const invite = await this.invites.findById(inviteId);
    validateOwnership(invite, hostId);
    const guests = await this.invites.attendance(inviteId);
    return {
      guests: guests.map((guest) => ({
        name: guest.name,
        status: guest.status,
        companionCount: guest.companionCount,
        respondedAt: guest.respondedAt.toISOString(),
      })),
      totalPeople: guests
        .filter((guest) => guest.status === 'ACCEPTED')
        .reduce((total, guest) => total + 1 + guest.companionCount, 0),
    };
  }
}

@Injectable()
export class DietaryService {
  constructor(private readonly invites: InviteRepository) {}

  async consolidateDietaryNotes(inviteId: string, hostId: string): Promise<DietarySummary> {
    const invite = await this.invites.findById(inviteId);
    validateOwnership(invite, hostId);
    const [counts, descriptions] = await Promise.all([
      this.invites.dietaryCounts(inviteId),
      this.invites.allergyDescriptions(inviteId),
    ]);
    return {
      counts: counts.map(({ code, displayName, count }) => ({ code, displayName, count })),
      descriptions,
    };
  }

  async exportDietaryNotes(inviteId: string, hostId: string) {
    const invite = await this.invites.findById(inviteId);
    validateOwnership(invite, hostId);
    return this.invites.guestExport(inviteId);
  }
}
