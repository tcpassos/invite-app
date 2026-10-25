import { Injectable } from '@nestjs/common';
import {
  DEFAULT_TEMPLATE_CODE,
  TEXT_LIMITS,
  type CustomizeInviteRequest,
  type CreateInviteRequest,
  type InviteDetails,
  type InviteSummary,
} from '@invite-app/contract';
import { InviteRepository } from '../data/invite.repository.js';
import type { Invite, InviteCustomization } from '../model/index.js';
import { generatePublicToken } from './tokens.js';
import {
  InvalidInviteForPublication,
  InviteNotOpenError,
  NotInviteOwner,
  ValidationError,
} from './errors.js';
import { validateOwnership } from './ownership.js';
import { findTemplateDefinition } from './template-catalog.js';

const MAX_EVENT_NAME = TEXT_LIMITS.hostName;
const MAX_LOCATION = 120;

@Injectable()
export class InviteService {
  constructor(private readonly invites: InviteRepository) {}

  async listInvites(hostId: string): Promise<InviteSummary[]> {
    return (await this.invites.listByHost(hostId)).map((invite) => ({
      id: invite.id,
      eventName: invite.eventName,
      eventStartsAt: invite.eventStartsAt.toISOString(),
      status: invite.status,
    }));
  }

  async createInvite(hostId: string, command: CreateInviteRequest): Promise<InviteDetails> {
    const values = this.validateInvite(command);
    const invite = await this.invites.create(
      hostId,
      values.eventName,
      values.eventStartsAt,
      values.location,
      values.peopleLimit,
      values.companionLimit,
    );
    return this.details(invite, { templateCode: DEFAULT_TEMPLATE_CODE, colorOverrides: [] });
  }

  async getInvite(inviteId: string, hostId: string): Promise<InviteDetails | null> {
    const found = await this.invites.findDetails(inviteId);
    if (!found) return null;
    validateOwnership(found.invite, hostId);
    return this.details(found.invite, found.customization);
  }

  async updateInvite(
    inviteId: string,
    hostId: string,
    command: CreateInviteRequest,
  ): Promise<InviteDetails> {
    const existing = await this.invites.findById(inviteId);
    const owned = validateOwnership(existing, hostId);
    if (owned.status !== 'DRAFT') throw new InviteNotOpenError();
    const values = this.validateInvite(command);
    const updated = await this.invites.updateDraft(
      inviteId,
      values.eventName,
      values.eventStartsAt,
      values.location,
      values.peopleLimit,
      values.companionLimit,
    );
    if (!updated) throw new InviteNotOpenError();
    const details = await this.getInvite(updated.id, hostId);
    if (!details) throw new NotInviteOwner();
    return details;
  }

  async customizeInvite(
    inviteId: string,
    hostId: string,
    command: CustomizeInviteRequest,
  ): Promise<InviteDetails> {
    const invite = await this.invites.findById(inviteId);
    validateOwnership(invite, hostId);
    const template = findTemplateDefinition(command.templateCode);
    if (!template) throw new ValidationError('templateCode', 'allowedValue');
    if (!command.eventName.trim()) throw new ValidationError('eventName', 'required');
    if (command.eventName.length > template.textLimits.eventName) {
      throw new ValidationError('eventName', 'maxLength');
    }
    if (!command.location.trim()) throw new ValidationError('location', 'required');
    if (command.location.length > template.textLimits.location) {
      throw new ValidationError('location', 'maxLength');
    }
    for (const [role, value] of Object.entries(command.colorOverrides)) {
      if (!Object.hasOwn(template.defaultColors, role) || !/^#[0-9a-fA-F]{6}$/.test(value)) {
        throw new ValidationError(`colorOverrides.${role}`, 'allowedValue');
      }
    }
    await this.invites.customize(
      inviteId,
      command.templateCode,
      command.colorOverrides,
      command.eventName.trim(),
      command.location.trim(),
    );
    const details = await this.getInvite(inviteId, hostId);
    if (!details) throw new NotInviteOwner();
    return details;
  }

  async publishInvite(inviteId: string, hostId: string) {
    const invite = await this.invites.findById(inviteId);
    const owned = validateOwnership(invite, hostId);
    const missing = [
      !owned.eventName.trim() && 'eventName',
      !owned.location.trim() && 'location',
      !owned.eventStartsAt && 'eventStartsAt',
    ].filter((field): field is string => Boolean(field));
    if (missing.length > 0) throw new InvalidInviteForPublication(missing);
    const publicToken = await this.invites.publish(
      inviteId,
      owned.publicToken ?? generatePublicToken(),
    );
    if (publicToken) return { publicToken, status: 'PUBLISHED' as const };
    const current = await this.invites.findById(inviteId);
    const latest = validateOwnership(current, hostId);
    if (latest.status === 'PUBLISHED' && latest.publicToken) {
      return { publicToken: latest.publicToken, status: 'PUBLISHED' as const };
    }
    throw new InvalidInviteForPublication([]);
  }

  async unpublishInvite(inviteId: string, hostId: string) {
    const invite = await this.invites.findById(inviteId);
    validateOwnership(invite, hostId);
    if (!(await this.invites.unpublish(inviteId))) throw new InviteNotOpenError();
    return { status: 'UNPUBLISHED' as const };
  }

  private validateInvite(command: CreateInviteRequest) {
    if (!command.eventName?.trim()) throw new ValidationError('eventName', 'required');
    if (
      command.eventName.length > MAX_EVENT_NAME ||
      command.eventName.length > TEXT_LIMITS.hostName
    ) {
      throw new ValidationError('eventName', 'maxLength');
    }
    if (!command.location?.trim()) throw new ValidationError('location', 'required');
    if (command.location.length > MAX_LOCATION) throw new ValidationError('location', 'maxLength');
    if (!command.eventDate) throw new ValidationError('eventDate', 'required');
    if (!command.eventTime) throw new ValidationError('eventTime', 'required');
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(command.eventDate);
    const timeMatch = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(command.eventTime);
    if (!dateMatch || !timeMatch) throw new ValidationError('eventDate', 'allowedValue');
    const [, year, month, day] = dateMatch;
    const [, hour, minute] = timeMatch;
    const eventStartsAt = new Date(`${year}-${month}-${day}T${hour}:${minute}:00-03:00`);
    const verifiedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
    if (
      Number.isNaN(eventStartsAt.getTime()) ||
      verifiedDate.getUTCFullYear() !== Number(year) ||
      verifiedDate.getUTCMonth() + 1 !== Number(month) ||
      verifiedDate.getUTCDate() !== Number(day)
    ) {
      throw new ValidationError('eventDate', 'allowedValue');
    }
    if (eventStartsAt.getTime() < Date.now()) {
      throw new ValidationError('eventDate', 'dateNotInPast');
    }
    const peopleLimit = command.peopleLimit ?? null;
    const companionLimit = command.companionLimit ?? null;
    if (peopleLimit !== null && peopleLimit < 1)
      throw new ValidationError('peopleLimit', 'minValue');
    if (peopleLimit !== null && peopleLimit > 2_147_483_647) {
      throw new ValidationError('peopleLimit', 'maxValue');
    }
    if (companionLimit !== null && companionLimit < 0) {
      throw new ValidationError('companionLimit', 'minValue');
    }
    if (companionLimit !== null && companionLimit > 2_147_483_647) {
      throw new ValidationError('companionLimit', 'maxValue');
    }
    return {
      eventName: command.eventName.trim(),
      eventStartsAt,
      location: command.location.trim(),
      peopleLimit,
      companionLimit,
    };
  }

  private details(invite: Invite, customization: InviteCustomization): InviteDetails {
    return {
      id: invite.id,
      eventName: invite.eventName,
      eventStartsAt: invite.eventStartsAt.toISOString(),
      location: invite.location,
      status: invite.status,
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
}
