import 'reflect-metadata';
import {
  Controller,
  Get,
  Module,
  Post,
  Res,
  UseGuards,
  type INestApplication,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import type { Request, Response } from 'express';
import request from 'supertest';
import { configureApp } from '../../bootstrap.js';
import { CommonModule } from './common.module.js';
import { HostId, SessionCookie, SessionGuard, readCookie } from './session.js';
import { SESSION_COOKIE_NAME, SESSION_IDLE_MS } from './session-cookie.js';

const SECRET = 'segredo-de-teste';

function fakeResponse() {
  const cookies: Record<string, string> = {};
  const res = {
    cookie: (name: string, value: string) => {
      cookies[name] = value;
    },
  } as unknown as Response;
  return { res, cookies };
}

const withCookie = (value: string) =>
  ({ headers: { cookie: `outro=1; ${SESSION_COOKIE_NAME}=${value}` } }) as Request;

describe('SessionCookie', () => {
  const session = new SessionCookie(SECRET);
  const now = Date.UTC(2026, 9, 7, 12);

  function issued(hostId = '42') {
    const { res, cookies } = fakeResponse();
    session.issue(res, hostId, now);
    return cookies[SESSION_COOKIE_NAME] as string;
  }

  it('devolve o hostId de um cookie que ela mesma emitiu', () => {
    expect(session.verify(withCookie(issued()), now + 1000)).toBe('42');
  });

  it('recusa cookie vencido depois de 30 minutos sem uso', () => {
    expect(session.verify(withCookie(issued()), now + SESSION_IDLE_MS)).toBeNull();
  });

  it('recusa cookie com o hostId trocado', () => {
    const [, expiresAt, signature] = issued('42').split('.');
    expect(session.verify(withCookie(`43.${expiresAt}.${signature}`), now)).toBeNull();
  });

  it('recusa cookie assinado com outro segredo', () => {
    const outra = new SessionCookie('outro-segredo');
    expect(outra.verify(withCookie(issued()), now)).toBeNull();
  });

  it('recusa cookie ausente ou mal formado', () => {
    expect(session.verify({ headers: {} } as Request, now)).toBeNull();
    expect(session.verify(withCookie('lixo'), now)).toBeNull();
  });

  it('lê o cookie certo no meio dos outros', () => {
    expect(readCookie('a=1; invite_session=x.y.z; b=2', 'invite_session')).toBe('x.y.z');
    expect(readCookie('a=1', 'invite_session')).toBeUndefined();
  });
});

@Controller('painel')
class PanelProbe {
  constructor(private readonly session: SessionCookie) {}

  @Post('entrar')
  signIn(@Res({ passthrough: true }) res: Response): void {
    this.session.issue(res, '7');
  }

  @Get('eu')
  @UseGuards(SessionGuard)
  me(@HostId() hostId: string): { hostId: string } {
    return { hostId };
  }
}

@Module({ imports: [CommonModule.forRoot(SECRET)], controllers: [PanelProbe] })
class PanelProbeModule {}

describe('SessionGuard', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [PanelProbeModule] }).compile();
    app = ref.createNestApplication({ logger: false });
    configureApp(app, { requestLog: () => {}, errorLog: () => {} });
    await app.init();
  });

  afterAll(() => app.close());

  it('sem cookie responde 401 UNAUTHENTICATED', async () => {
    const res = await request(app.getHttpServer()).get('/painel/eu').expect(401);
    expect(res.body.code).toBe('UNAUTHENTICATED');
  });

  it('com a sessão aberta, entrega o hostId e renova o cookie com os atributos do ADR-0010', async () => {
    const entrada = await request(app.getHttpServer()).post('/painel/entrar').expect(201);
    const setCookie = String(entrada.headers['set-cookie']);
    expect(setCookie).toMatch(/HttpOnly/);
    expect(setCookie).toMatch(/SameSite=Lax/);
    expect(setCookie).not.toMatch(/Secure/);

    const cookie = setCookie.split(';')[0] as string;
    const res = await request(app.getHttpServer()).get('/painel/eu').set('cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ hostId: '7' });
    expect(String(res.headers['set-cookie'])).toContain(`${SESSION_COOKIE_NAME}=7.`);
  });
});
