import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { SignInRequest, SignUpRequest } from '@invite-app/contract';
import { HostService } from '../../domain/host.service.js';
import { RateLimitGuard, clientIp } from '../common/rate-limit.js';
import { asObject, optionalString } from '../common/parse-request.js';
import { HostId, SessionCookie, SessionGuard } from '../common/session.js';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly hosts: HostService,
    private readonly sessionCookie: SessionCookie,
    private readonly rateLimit: RateLimitGuard,
  ) {}

  @Post('sign-up')
  async signUp(
    @Body() raw: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.rateLimit.enforceSignUpLimit(clientIp(req));
    const body = asObject(raw);
    const request: SignUpRequest = {
      name: optionalString(body, 'name') ?? '',
      email: optionalString(body, 'email') ?? '',
      password: optionalString(body, 'password') ?? '',
    };
    const host = await this.hosts.signUp(request.name, request.email, request.password);
    this.sessionCookie.issue(res, host.id);
    return this.hosts.profile(host);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() raw: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const body = asObject(raw);
    const request: SignInRequest = {
      email: optionalString(body, 'email') ?? '',
      password: optionalString(body, 'password') ?? '',
    };
    this.rateLimit.enforceSignInLimit(request.email, clientIp(req));
    const host = await this.hosts.signIn(request.email, request.password);
    if (!host) {
      this.rateLimit.recordSignInFailure(request.email, clientIp(req));
      throw new UnauthorizedException();
    }
    this.sessionCookie.issue(res, host.id);
    return this.hosts.profile(host);
  }

  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@Res({ passthrough: true }) res: Response): void {
    this.sessionCookie.clear(res);
  }

  @Get('session')
  @UseGuards(SessionGuard)
  async session(@HostId() hostId: string) {
    const profile = await this.hosts.getHostProfile(hostId);
    if (!profile) throw new UnauthorizedException();
    return profile;
  }
}
