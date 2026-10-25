// InviteController do pacote autenticado: lista, criação, correção, personalização,
// publicação e lista de presença (UC002 a UC004 e UC007). Toda rota exige sessão, e o
// hostId da sessão vai para o Domínio, que decide se o anfitrião pode agir (Guia, 3.1).
import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import type {
  AttendanceList,
  InviteDetails,
  InviteSummary,
  PublishInviteResponse,
  UnpublishInviteResponse,
} from '@invite-app/contract';
import { AttendanceService } from '../../domain/attendance.service.js';
import { InviteService } from '../../domain/invite.service.js';
import { asObject, optionalString, optionalStringRecord } from '../common/parse-request.js';
import { HostId, SessionGuard } from '../common/session.js';
import { parseInviteCommand } from './invite-command.js';
import { toInviteDetails, toInviteSummary } from './invite-response.js';

// As respostas do painel são do anfitrião e não ficam guardadas em lugar nenhum (Guia, 9.5).
const PRIVATE_NO_STORE = 'private, no-store';

@Controller('invites')
@UseGuards(SessionGuard)
export class InviteController {
  constructor(
    private readonly invites: InviteService,
    private readonly attendance: AttendanceService,
  ) {}

  @Get()
  @Header('Cache-Control', PRIVATE_NO_STORE)
  async list(@HostId() hostId: string): Promise<InviteSummary[]> {
    return (await this.invites.listInvites(hostId)).map(toInviteSummary);
  }

  @Post()
  @Header('Cache-Control', PRIVATE_NO_STORE)
  async create(@Body() raw: unknown, @HostId() hostId: string): Promise<InviteDetails> {
    return toInviteDetails(await this.invites.createInvite(hostId, parseInviteCommand(raw)));
  }

  @Get(':inviteId')
  @Header('Cache-Control', PRIVATE_NO_STORE)
  async get(@Param('inviteId') inviteId: string, @HostId() hostId: string): Promise<InviteDetails> {
    return toInviteDetails(await this.invites.getInvite(inviteId, hostId));
  }

  @Put(':inviteId')
  @Header('Cache-Control', PRIVATE_NO_STORE)
  async update(
    @Param('inviteId') inviteId: string,
    @Body() raw: unknown,
    @HostId() hostId: string,
  ): Promise<InviteDetails> {
    const command = parseInviteCommand(raw);
    return toInviteDetails(await this.invites.updateInvite(inviteId, hostId, command));
  }

  @Put(':inviteId/customization')
  @Header('Cache-Control', PRIVATE_NO_STORE)
  async customize(
    @Param('inviteId') inviteId: string,
    @Body() raw: unknown,
    @HostId() hostId: string,
  ): Promise<InviteDetails> {
    const body = asObject(raw);
    const customized = await this.invites.customizeInvite(inviteId, hostId, {
      templateCode: optionalString(body, 'templateCode'),
      colorOverrides: optionalStringRecord(body, 'colorOverrides'),
      eventName: optionalString(body, 'eventName'),
      location: optionalString(body, 'location'),
    });
    return toInviteDetails(customized);
  }

  /** A resposta carrega o publicToken recém-gerado (Guia, 9.5). */
  @Post(':inviteId/publish')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', PRIVATE_NO_STORE)
  async publish(
    @Param('inviteId') inviteId: string,
    @HostId() hostId: string,
  ): Promise<PublishInviteResponse> {
    const publicToken = await this.invites.publishInvite(inviteId, hostId);
    return { publicToken, status: 'PUBLISHED' };
  }

  @Post(':inviteId/unpublish')
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', PRIVATE_NO_STORE)
  async unpublish(
    @Param('inviteId') inviteId: string,
    @HostId() hostId: string,
  ): Promise<UnpublishInviteResponse> {
    await this.invites.unpublishInvite(inviteId, hostId);
    return { status: 'UNPUBLISHED' };
  }

  /** Consultada a cada 20 segundos pelo painel (ADR-0007). Resposta guardada seria lista velha. */
  @Get(':inviteId/attendance')
  @Header('Cache-Control', PRIVATE_NO_STORE)
  async listAttendance(
    @Param('inviteId') inviteId: string,
    @HostId() hostId: string,
  ): Promise<AttendanceList> {
    const { guests, totalPeople } = await this.attendance.listAttendance(inviteId, hostId);
    return {
      guests: guests.map((guest) => ({ ...guest, respondedAt: guest.respondedAt.toISOString() })),
      totalPeople,
    };
  }
}
