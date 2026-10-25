// PublicRsvpController do pacote público: a página do convite, a resposta do convidado e o
// link pessoal (UC005 e UC006). Chama só os quatro serviços da seção 5.3 do Guia.
//
// A ordem do limite de taxa segue a seção 9.5. Nas escritas, o limite por endereço de origem
// vem antes de tudo e o limite por token só depois que o token resolveu, para o 429 não
// contar que um token existe. Token que não resolve responde o 404 do filtro, sem cabeçalho
// próprio, igual para todas as situações.
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
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { GuestResponsePage, PublishedInvite, RsvpResult } from '@invite-app/contract';
import type { RsvpCommand } from '../../domain/rsvp-rules.js';
import { RsvpService } from '../../domain/rsvp.service.js';
import {
  asObject,
  optionalInteger,
  optionalObject,
  optionalString,
  optionalStringArray,
} from '../common/parse-request.js';
import { RateLimitGuard, clientIp } from '../common/rate-limit.js';
import { toGuestResponsePage, toPublishedInvite } from './public-response.js';

/** Leitura de token: sem cache em lugar nenhum e sem indexação (ADR-0008, Guia 9.5). */
function readHeaders(res: Response): void {
  res.setHeader('Cache-Control', 'private, no-cache, no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
}

@Controller('public')
export class PublicRsvpController {
  constructor(
    private readonly rsvps: RsvpService,
    private readonly rateLimit: RateLimitGuard,
  ) {}

  @Get('invites/:publicToken')
  async getInvite(
    @Param('publicToken') publicToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<PublishedInvite> {
    const view = await this.rsvps.getPublishedInvite(publicToken);
    if (!view) throw new NotFoundException();
    this.rateLimit.enforceReadLimit(publicToken);
    readHeaders(res);
    return toPublishedInvite(view);
  }

  /** A resposta carrega o personalToken, que é credencial de edição: no-store (Guia, 9.5). */
  @Post('invites/:publicToken/rsvp')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Param('publicToken') publicToken: string,
    @Body() raw: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<RsvpResult> {
    this.rateLimit.enforceOriginLimit(clientIp(req));
    const command = parseRsvpCommand(raw);
    if (!(await this.rsvps.getPublishedInvite(publicToken))) throw new NotFoundException();
    this.rateLimit.enforceWriteLimit(publicToken);
    const guest = await this.rsvps.registerRsvp(publicToken, command);
    // O convite foi despublicado entre a resolução e a gravação: o mesmo 404 (Guia, 9.5).
    if (!guest) throw new NotFoundException();
    res.setHeader('Cache-Control', 'no-store');
    return { personalToken: guest.personalToken };
  }

  @Get('responses/:personalToken')
  async getResponse(
    @Param('personalToken') personalToken: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GuestResponsePage> {
    const view = await this.rsvps.getGuestResponse(personalToken);
    if (!view) throw new NotFoundException();
    this.rateLimit.enforceReadLimit(personalToken);
    readHeaders(res);
    return toGuestResponsePage(view);
  }

  @Put('responses/:personalToken')
  async update(
    @Param('personalToken') personalToken: string,
    @Body() raw: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<GuestResponsePage> {
    this.rateLimit.enforceOriginLimit(clientIp(req));
    const command = parseRsvpCommand(raw);
    if (!(await this.rsvps.getGuestResponse(personalToken))) throw new NotFoundException();
    this.rateLimit.enforceWriteLimit(personalToken);
    const view = await this.rsvps.updateRsvp(personalToken, command);
    if (!view) throw new NotFoundException();
    res.setHeader('Cache-Control', 'no-store');
    return toGuestResponsePage(view);
  }
}

/** Confere a forma do RsvpRequest, e só. Valor fora do conjunto é regra do Domínio (Guia, 3.1). */
function parseRsvpCommand(raw: unknown): RsvpCommand {
  const body = asObject(raw);
  const note = optionalObject(body, 'dietaryNote');
  return {
    name: optionalString(body, 'name'),
    status: optionalString(body, 'status'),
    companionCount: optionalInteger(body, 'companionCount'),
    dietaryNote: note && {
      categories: optionalStringArray(note, 'categories'),
      freeText: optionalString(note, 'freeText'),
    },
  };
}
