// Teste de ponta a ponta da base da API: sobe a aplicação de verdade, com o mesmo
// configureApp do main.ts, e uma rota de sondagem que só existe aqui.
import 'reflect-metadata';
import { Body, Controller, Get, Module, Param, Post, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { configureApp } from './bootstrap.js';
import { ValidationError } from './domain/errors.js';
import { RateLimitedException } from './presentation/common/rate-limit.js';

@Controller('probe')
class ProbeController {
  @Get('ok')
  ok(): { ok: true } {
    return { ok: true };
  }

  @Get(':secret/fail')
  fail(@Param('secret') _secret: string): never {
    throw new ValidationError('companionCount', 'companionLimit');
  }

  @Post('echo')
  echo(@Body() body: unknown): unknown {
    return body;
  }

  @Get('busy')
  busy(): never {
    throw new RateLimitedException(30);
  }

  @Get('crash')
  crash(): never {
    throw new Error('segredo do usuario 1234');
  }
}

@Module({ controllers: [ProbeController] })
class ProbeModule {}

const FRONT = 'http://127.0.0.1:3000';

describe('base da API', () => {
  let app: INestApplication;
  const requestLog: string[] = [];
  const errorLog: string[] = [];

  beforeAll(async () => {
    const ref = await Test.createTestingModule({ imports: [ProbeModule] }).compile();
    app = ref.createNestApplication({ logger: false });
    configureApp(app, {
      frontOrigin: FRONT,
      requestLog: (line) => requestLog.push(line),
      errorLog: (line) => errorLog.push(line),
    });
    await app.init();
  });

  afterAll(() => app.close());

  const lastLog = () => JSON.parse(requestLog[requestLog.length - 1] ?? '{}');

  it('gera um identificador de 16 caracteres hexadecimais e devolve no cabeçalho', async () => {
    const res = await request(app.getHttpServer()).get('/probe/ok').expect(200);
    expect(res.headers['x-request-id']).toMatch(/^[0-9a-f]{16}$/);
  });

  it('reaproveita o identificador recebido quando o formato é válido', async () => {
    const res = await request(app.getHttpServer())
      .get('/probe/ok')
      .set('x-request-id', 'aaaabbbbccccdddd');
    expect(res.headers['x-request-id']).toBe('aaaabbbbccccdddd');
    expect(lastLog().requestId).toBe('aaaabbbbccccdddd');
  });

  it('troca o identificador recebido quando o formato é inválido', async () => {
    const res = await request(app.getHttpServer())
      .get('/probe/ok')
      .set('x-request-id', 'linha falsa no log');
    expect(res.headers['x-request-id']).toMatch(/^[0-9a-f]{16}$/);
  });

  it('responde erro de domínio no formato único, com o mesmo traceId do cabeçalho', async () => {
    const res = await request(app.getHttpServer()).get('/probe/TOKEN-SECRETO/fail').expect(422);
    expect(res.body).toEqual({
      code: 'VALIDATION_FAILED',
      message: 'O número de acompanhantes está acima do limite deste convite.',
      details: [{ field: 'companionCount', rule: 'companionLimit' }],
      traceId: res.headers['x-request-id'],
    });
  });

  it('registra o molde da rota e nunca o caminho concreto', async () => {
    await request(app.getHttpServer()).get('/probe/TOKEN-SECRETO/fail');
    const linha = requestLog[requestLog.length - 1] ?? '';
    expect(JSON.parse(linha)).toMatchObject({
      tier: 'api',
      route: '/probe/:secret/fail',
      status: 422,
    });
    expect(linha).not.toContain('TOKEN-SECRETO');
  });

  it('responde rota inexistente com 404 NOT_FOUND sem ecoar o caminho', async () => {
    const res = await request(app.getHttpServer())
      .post('/public/invites/0123456789ABCDEFGHJKMNPQRS/rsvp')
      .expect(404);
    expect(res.body.code).toBe('NOT_FOUND');
    expect(JSON.stringify(res.body)).not.toContain('0123456789ABCDEFGHJKMNPQRS');
    expect(requestLog[requestLog.length - 1]).not.toContain('0123456789ABCDEFGHJKMNPQRS');
  });

  it('responde corpo JSON ilegível com 400 MALFORMED_REQUEST', async () => {
    const res = await request(app.getHttpServer())
      .post('/probe/echo')
      .set('content-type', 'application/json')
      .send('{"nome": ');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('MALFORMED_REQUEST');
  });

  it('responde erro inesperado com 500 sem vazar a mensagem, nem no corpo nem no log', async () => {
    const res = await request(app.getHttpServer()).get('/probe/crash').expect(500);
    expect(res.body.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('segredo');
    expect(errorLog.join('\n')).not.toContain('segredo');
    expect(lastLog().level).toBe('error');
  });

  it('responde todo 404 sem cache', async () => {
    const res = await request(app.getHttpServer()).get('/nada/aqui').expect(404);
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('responde 429 RATE_LIMITED sem cache e com Retry-After', async () => {
    const res = await request(app.getHttpServer()).get('/probe/busy').expect(429);
    expect(res.body.code).toBe('RATE_LIMITED');
    expect(res.headers['cache-control']).toBe('no-store');
    expect(res.headers['retry-after']).toBe('30');
  });

  it('aceita chamada do navegador vinda do front, com credenciais', async () => {
    const res = await request(app.getHttpServer())
      .options('/probe/echo')
      .set('origin', FRONT)
      .set('access-control-request-method', 'POST')
      .set('access-control-request-headers', 'content-type');
    expect(res.headers['access-control-allow-origin']).toBe(FRONT);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
    expect(res.headers['access-control-allow-headers']).not.toMatch(/x-request-id/i);
  });

  it('não libera origem cruzada para outro site', async () => {
    const res = await request(app.getHttpServer())
      .get('/probe/ok')
      .set('origin', 'http://outro-site.example');
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('recusa corpo que não é JSON com 400 MALFORMED_REQUEST', async () => {
    const res = await request(app.getHttpServer())
      .post('/probe/echo')
      .set('content-type', 'text/plain')
      .send('{"name":"forjado"}');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('MALFORMED_REQUEST');
  });

  it('aceita POST sem corpo, como o de publicar', async () => {
    await request(app.getHttpServer()).post('/probe/echo').expect(201);
  });
});
