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
import { RsvpService, type RsvpCommand } from '../../domain/rsvp.service.js';
import { RateLimitGuard, clientIp } from '../common/rate-limit.js';
import {
  asObject,
  optionalInteger,
  optionalObject,
  optionalString,
  optionalStringArray,
} from '../common/parse-request.js';

@Controller('public')
export class PublicRsvpController {
  constructor(
    private readonly rsvps: RsvpService,
    private readonly rateLimit: RateLimitGuard,
  ) {}

  @Get('invites/:publicToken')
  async getInvite(
    @Param('publicToken') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const invite = await this.rsvps.getPublishedInvite(token);
    if (!invite) throw new NotFoundException();
    this.rateLimit.enforceReadLimit(token);
    response.setHeader('Cache-Control', 'private, no-cache, no-store');
    return invite;
  }

  @Post('invites/:publicToken/rsvp')
  @HttpCode(HttpStatus.CREATED)
  async register(@Param('publicToken') token: string, @Body() raw: unknown, @Req() req: Request) {
    this.rateLimit.enforceOriginLimit(clientIp(req));
    if (!(await this.rsvps.getPublishedInvite(token))) throw new NotFoundException();
    this.rateLimit.enforceWriteLimit(token);
    const result = await this.rsvps.registerRsvp(token, this.parseRsvp(raw));
    if (!result) throw new NotFoundException();
    return result;
  }

  @Get('responses/:personalToken')
  async getResponse(
    @Param('personalToken') token: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const guest = await this.rsvps.resolveGuestResponse(token);
    if (!guest) throw new NotFoundException();
    this.rateLimit.enforceReadLimit(token);
    response.setHeader('Cache-Control', 'private, no-cache, no-store');
    return guest;
  }

  @Put('responses/:personalToken')
  @HttpCode(HttpStatus.OK)
  async update(@Param('personalToken') token: string, @Body() raw: unknown, @Req() req: Request) {
    this.rateLimit.enforceOriginLimit(clientIp(req));
    if (!(await this.rsvps.resolveGuestResponse(token))) throw new NotFoundException();
    this.rateLimit.enforceWriteLimit(token);
    const response = await this.rsvps.updateRsvp(token, this.parseRsvp(raw));
    if (!response) throw new NotFoundException();
    return response;
  }

  private parseRsvp(raw: unknown): RsvpCommand {
    const body = asObject(raw);
    const dietary = optionalObject(body, 'dietaryNote');
    const dietaryNote = dietary
      ? {
          categories: optionalStringArray(dietary, 'categories') ?? [],
          freeText: optionalString(dietary, 'freeText'),
        }
      : undefined;
    return {
      name: optionalString(body, 'name') ?? '',
      status: optionalString(body, 'status') ?? '',
      companionCount: optionalInteger(body, 'companionCount'),
      dietaryNote,
    };
  }
}
