import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import type { CreateInviteRequest, CustomizeInviteRequest } from '@invite-app/contract';
import { AttendanceService } from '../../domain/panel.service.js';
import { InviteService } from '../../domain/invite.service.js';
import {
  asObject,
  optionalInteger,
  optionalString,
  optionalStringRecord,
} from '../common/parse-request.js';
import { HostId, SessionGuard } from '../common/session.js';

@Controller('invites')
@UseGuards(SessionGuard)
export class InviteController {
  constructor(
    private readonly invites: InviteService,
    private readonly attendance: AttendanceService,
  ) {}

  @Get()
  list(@HostId() hostId: string) {
    return this.invites.listInvites(hostId);
  }

  @Post()
  async create(@Body() raw: unknown, @HostId() hostId: string) {
    return this.invites.createInvite(hostId, this.parseInvite(raw));
  }

  @Get(':inviteId')
  async get(@Param('inviteId') inviteId: string, @HostId() hostId: string) {
    const invite = await this.invites.getInvite(inviteId, hostId);
    if (!invite) throw new NotFoundException();
    return invite;
  }

  @Put(':inviteId')
  @HttpCode(HttpStatus.OK)
  update(@Param('inviteId') inviteId: string, @Body() raw: unknown, @HostId() hostId: string) {
    return this.invites.updateInvite(inviteId, hostId, this.parseInvite(raw));
  }

  @Put(':inviteId/customization')
  @HttpCode(HttpStatus.OK)
  customize(@Param('inviteId') inviteId: string, @Body() raw: unknown, @HostId() hostId: string) {
    const body = asObject(raw);
    const request: CustomizeInviteRequest = {
      templateCode: optionalString(body, 'templateCode') ?? '',
      colorOverrides: optionalStringRecord(body, 'colorOverrides') ?? {},
      eventName: optionalString(body, 'eventName') ?? '',
      location: optionalString(body, 'location') ?? '',
    };
    return this.invites.customizeInvite(inviteId, hostId, request);
  }

  @Post(':inviteId/publish')
  @HttpCode(HttpStatus.OK)
  publish(@Param('inviteId') inviteId: string, @HostId() hostId: string) {
    return this.invites.publishInvite(inviteId, hostId);
  }

  @Post(':inviteId/unpublish')
  @HttpCode(HttpStatus.OK)
  unpublish(@Param('inviteId') inviteId: string, @HostId() hostId: string) {
    return this.invites.unpublishInvite(inviteId, hostId);
  }

  @Get(':inviteId/attendance')
  listAttendance(@Param('inviteId') inviteId: string, @HostId() hostId: string) {
    return this.attendance.listAttendance(inviteId, hostId);
  }

  private parseInvite(raw: unknown): CreateInviteRequest {
    const body = asObject(raw);
    return {
      eventName: optionalString(body, 'eventName') ?? '',
      eventDate: optionalString(body, 'eventDate') ?? '',
      eventTime: optionalString(body, 'eventTime') ?? '',
      location: optionalString(body, 'location') ?? '',
      peopleLimit: optionalInteger(body, 'peopleLimit', { nullable: true }),
      companionLimit: optionalInteger(body, 'companionLimit', { nullable: true }),
    };
  }
}
