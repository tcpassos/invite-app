import { Injectable } from '@nestjs/common';
import {
  DietaryCategoryCode,
  RsvpStatus,
  TEXT_LIMITS,
  type DietaryNoteInput,
  type DietaryCategoryCode as DietaryCategoryCodeType,
  type GuestResponsePage,
  type PublishedInvite,
} from '@invite-app/contract';
import type { Invite, InviteCustomization } from '../model/index.js';
import { InviteRepository, type GuestResponseRecord } from '../data/invite.repository.js';
import { DietaryCategoryRepository } from '../data/dietary-category.repository.js';
import { ValidationError, InviteNotOpenError, CapacityExceededError } from './errors.js';
import { generatePersonalToken } from './tokens.js';

const CATEGORY_CODES = new Set<string>(Object.values(DietaryCategoryCode));
const PROJECT_TIME_ZONE = 'America/Sao_Paulo';

export interface RsvpCommand {
  name: string;
  status: string;
  companionCount?: number;
  dietaryNote?: { categories: string[]; freeText?: string };
}

export function validateRsvpRequest(command: RsvpCommand, companionLimit: number | null) {
  if (!command.name?.trim()) throw new ValidationError('name', 'required');
  if (command.name.trim().length > TEXT_LIMITS.guestName) {
    throw new ValidationError('name', 'maxLength');
  }
  const status = Object.values(RsvpStatus).find((value) => value === command.status);
  if (!status) {
    throw new ValidationError('status', 'allowedValue');
  }
  const companionCount = status === RsvpStatus.Declined ? 0 : command.companionCount;
  if (status !== RsvpStatus.Declined && companionCount === undefined) {
    throw new ValidationError('companionCount', 'required');
  }
  if (companionCount !== undefined && companionCount < 0) {
    throw new ValidationError('companionCount', 'minValue');
  }
  if (companionCount !== undefined && companionCount > 2_147_483_647) {
    throw new ValidationError('companionCount', 'maxValue');
  }
  if (
    status !== RsvpStatus.Declined &&
    companionLimit !== null &&
    companionCount !== undefined &&
    companionCount > companionLimit
  ) {
    throw new ValidationError('companionCount', 'companionLimit');
  }
  const dietaryNote = status === RsvpStatus.Declined ? undefined : command.dietaryNote;
  const categories: DietaryCategoryCodeType[] = [];
  for (const category of dietaryNote?.categories ?? []) {
    const validCategory = Object.values(DietaryCategoryCode).find((code) => code === category);
    if (!CATEGORY_CODES.has(category) || !validCategory || categories.includes(validCategory)) {
      throw new ValidationError('dietaryNote.categories', 'allowedValue');
    }
    categories.push(validCategory);
  }
  const freeText = dietaryNote?.freeText?.trim() ?? '';
  if (freeText.length > TEXT_LIMITS.dietaryFreeText) {
    throw new ValidationError('dietaryNote.freeText', 'maxLength');
  }
  if (categories.includes(DietaryCategoryCode.Allergy) && !freeText) {
    throw new ValidationError('dietaryNote.freeText', 'descriptionRequired');
  }
  return {
    name: command.name.trim(),
    status,
    companionCount: companionCount ?? 0,
    categories,
    freeText: categories.length > 0 ? freeText || null : null,
  };
}

export function isWithinResponseDeadline(eventStartsAt: Date, now = new Date()): boolean {
  const dateInProjectTimeZone = (value: Date) => {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone: PROJECT_TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(value);
    const part = (type: Intl.DateTimeFormatPartTypes) =>
      parts.find((item) => item.type === type)?.value ?? '';
    return `${part('year')}-${part('month')}-${part('day')}`;
  };
  return dateInProjectTimeZone(now) <= dateInProjectTimeZone(eventStartsAt);
}

@Injectable()
export class RsvpService {
  constructor(
    private readonly invites: InviteRepository,
    private readonly dietaryCategories: DietaryCategoryRepository,
  ) {}

  async getPublishedInvite(token: string): Promise<PublishedInvite | null> {
    const found = await this.invites.findPublishedByPublicToken(token);
    if (!found) return null;
    return this.publishedView(found.invite, found.customization);
  }

  async registerRsvp(token: string, command: RsvpCommand) {
    const found = await this.invites.findPublishedByPublicToken(token);
    if (!found) return null;
    const input = validateRsvpRequest(command, found.invite.maxCompanionsPerGuest);
    const personalToken = generatePersonalToken();
    const result = await this.invites.saveRsvpWithinCapacity(found.invite.id, {
      ...input,
      personalToken,
      respondedAt: new Date(),
    });
    if (result === 'capacity') throw new CapacityExceededError();
    if (result === 'closed') throw new InviteNotOpenError();
    return { personalToken };
  }

  async resolveGuestResponse(token: string): Promise<GuestResponsePage | null> {
    const guest = await this.invites.findGuestByPersonalToken(token);
    if (!guest) return null;
    const found = await this.invites.findDetails(guest.inviteId);
    if (!found) return null;
    return this.guestPage(guest, found.invite, found.customization);
  }

  async updateRsvp(token: string, command: RsvpCommand): Promise<GuestResponsePage | null> {
    const guest = await this.invites.findGuestByPersonalToken(token);
    if (!guest) return null;
    const found = await this.invites.findDetails(guest.inviteId);
    if (!found) return null;
    if (!isWithinResponseDeadline(found.invite.eventStartsAt)) throw new InviteNotOpenError();
    const input = validateRsvpRequest(command, found.invite.maxCompanionsPerGuest);
    const result = await this.invites.updateRsvpWithinCapacity(guest, {
      ...input,
      personalToken: guest.personalToken,
      respondedAt: new Date(),
    });
    if (result === 'capacity') throw new CapacityExceededError();
    if (result === 'closed') throw new InviteNotOpenError();
    const updated = await this.invites.findGuestByPersonalToken(token);
    return updated ? this.guestPage(updated, found.invite, found.customization) : null;
  }

  private async publishedView(
    invite: Invite,
    customization: InviteCustomization,
  ): Promise<PublishedInvite> {
    const categories = await this.dietaryCategories.list();
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

  private async guestPage(
    guest: GuestResponseRecord,
    invite: NonNullable<Awaited<ReturnType<InviteRepository['findById']>>>,
    customization: InviteCustomization,
  ): Promise<GuestResponsePage> {
    const publishedInvite = await this.publishedView(invite, customization);
    const note: DietaryNoteInput | null =
      guest.categories.length === 0
        ? null
        : { categories: guest.categories, ...(guest.freeText ? { freeText: guest.freeText } : {}) };
    return {
      invite: publishedInvite,
      response: {
        name: guest.name,
        status: guest.status,
        companionCount: guest.companionCount,
        dietaryNote: note,
        respondedAt: guest.respondedAt.toISOString(),
      },
      editable: isWithinResponseDeadline(invite.eventStartsAt),
    };
  }
}
