// AuthController: entrada, cadastro, saída e sessão do anfitrião (UC001 e ADR-0010). É o
// pacote auth, e só ele chama o HostService (Guia, 5.3). A sessão é emitida aqui, com o
// anfitrião que o Domínio devolve, porque o Domínio não conhece cookie.
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
import type { HostProfile } from '@invite-app/contract';
import { HostService } from '../../domain/host.service.js';
import type { Host } from '../../model/index.js';
import { asObject, optionalString } from '../common/parse-request.js';
import { RateLimitGuard, clientIp } from '../common/rate-limit.js';
import { HostId, SessionCookie, SessionGuard } from '../common/session.js';

const toProfile = (host: Host): HostProfile => ({ name: host.name, email: host.email });

@Controller('auth')
export class AuthController {
  constructor(
    private readonly hosts: HostService,
    private readonly session: SessionCookie,
    private readonly rateLimit: RateLimitGuard,
  ) {}

  @Post('sign-up')
  async signUp(
    @Body() raw: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<HostProfile> {
    this.rateLimit.enforceSignUpLimit(clientIp(req));
    const body = asObject(raw);
    const host = await this.hosts.signUp(
      optionalString(body, 'name'),
      optionalString(body, 'email'),
      optionalString(body, 'password'),
    );
    this.session.issue(res, host.id);
    return toProfile(host);
  }

  /** Email inexistente e senha errada são o mesmo 401, sem campo apontado (UC001 A2). */
  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body() raw: unknown,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<HostProfile> {
    const body = asObject(raw);
    const email = optionalString(body, 'email') ?? '';
    this.rateLimit.enforceSignInLimit(email, clientIp(req));
    const host = await this.hosts.signIn(email, optionalString(body, 'password'));
    if (!host) {
      this.rateLimit.recordSignInFailure(email, clientIp(req));
      throw new UnauthorizedException();
    }
    this.session.issue(res, host.id);
    return toProfile(host);
  }

  /** Apaga o cookie com ou sem sessão válida (ADR-0010). */
  @Post('sign-out')
  @HttpCode(HttpStatus.NO_CONTENT)
  signOut(@Res({ passthrough: true }) res: Response): void {
    this.session.clear(res);
  }

  @Get('session')
  @UseGuards(SessionGuard)
  async currentSession(@HostId() hostId: string): Promise<HostProfile> {
    const host = await this.hosts.getHostProfile(hostId);
    // Sessão assinada de uma conta que não existe mais vale o mesmo que sessão nenhuma.
    if (!host) throw new UnauthorizedException();
    return toProfile(host);
  }
}
