// Teste de ponta a ponta das rotas da tabela 4.1 do Guia, com a API inteira e o mesmo
// configureApp do main.ts, contra um PostgreSQL de verdade. Só roda com TEST_DATABASE_URL.
import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../app.module.js';
import { configureApp } from '../bootstrap.js';

const url = process.env.TEST_DATABASE_URL;
const FRONT = 'http://127.0.0.1:3000';

describe.skipIf(!url)('rotas da API de ponta a ponta', () => {
  let app: INestApplication;
  const suffix = Date.now().toString(36);
  const nextYear = `${new Date().getFullYear() + 1}-06-15`;

  beforeAll(async () => {
    const ref = await Test.createTestingModule({
      imports: [
        AppModule.forRoot({
          port: 0,
          databaseUrl: url as string,
          frontOrigin: FRONT,
          sessionSecret: 'segredo-de-teste',
          crossSiteCookie: false,
          trustProxy: 0,
        }),
      ],
    }).compile();
    app = ref.createNestApplication({ logger: false });
    configureApp(app, { frontOrigin: FRONT, requestLog: () => {}, errorLog: () => {} });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const host = (name: string) => {
    const agent = request.agent(app.getHttpServer());
    const email = `${name}-${suffix}@exemplo.com`;
    return { agent, email };
  };

  async function signedUp(name: string) {
    const { agent, email } = host(name);
    await agent.post('/auth/sign-up').send({ name, email, password: 'senha-forte' }).expect(201);
    return agent;
  }

  const newInvite = {
    eventName: 'Aniversário da vovó',
    eventDate: nextYear,
    eventTime: '19:30',
    location: 'Chácara',
    peopleLimit: 4,
    companionLimit: 2,
  };

  it('entrada do anfitrião: cadastro, sessão, recusa sem apontar campo e saída (UC001)', async () => {
    const { agent, email } = host('ana');
    await agent.get('/auth/session').expect(401);
    const signUp = await agent
      .post('/auth/sign-up')
      .send({ name: 'Ana', email: email.toUpperCase(), password: 'senha-forte' })
      .expect(201);
    expect(signUp.body).toEqual({ name: 'Ana', email });
    expect(signUp.headers['set-cookie']?.[0]).toMatch(/^invite_session=.*HttpOnly/);

    const again = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send({ name: 'Outra', email, password: 'senha-forte' })
      .expect(422);
    expect(again.body.details).toEqual([{ field: 'email', rule: 'alreadyRegistered' }]);

    const wrong = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email, password: 'senha-errada' })
      .expect(401);
    expect(wrong.body.code).toBe('UNAUTHENTICATED');
    expect(wrong.body.details).toBeUndefined();

    await agent.get('/auth/session').expect(200, { name: 'Ana', email });
    await agent.post('/auth/sign-out').expect(204);
    await agent.get('/auth/session').expect(401);
    await agent.post('/auth/sign-in').send({ email, password: 'senha-forte' }).expect(200);
  });

  it('o fluxo do convite, da criação à exportação (UC002 a UC008)', async () => {
    const ana = await signedUp('fluxo');

    const past = await ana
      .post('/invites')
      .send({ ...newInvite, eventDate: '2020-01-01' })
      .expect(422);
    expect(past.body.details).toEqual([{ field: 'eventDate', rule: 'dateNotInPast' }]);
    await ana
      .post('/invites')
      .send({ ...newInvite, eventDate: '15/06/2027' })
      .expect(400);

    const created = await ana.post('/invites').send(newInvite).expect(201);
    expect(created.body).toMatchObject({
      eventName: newInvite.eventName,
      eventStartsAt: `${nextYear}T22:30:00.000Z`,
      status: 'DRAFT',
      publicToken: null,
      peopleLimit: 4,
      companionLimit: 2,
      customization: { templateCode: 'classic', colorOverrides: {} },
    });
    const id = created.body.id as string;

    await ana
      .put(`/invites/${id}/customization`)
      .send({
        templateCode: 'night',
        colorOverrides: { accent: '#123456' },
        eventName: 'Festa',
        location: 'Chácara',
      })
      .expect(200);

    const published = await ana.post(`/invites/${id}/publish`).expect(200);
    expect(published.headers['cache-control']).toBe('private, no-store');
    const token = published.body.publicToken as string;
    expect(token).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    await ana
      .post(`/invites/${id}/publish`)
      .expect(200, { publicToken: token, status: 'PUBLISHED' });
    await ana.put(`/invites/${id}`).send(newInvite).expect(409);

    const page = await request(app.getHttpServer()).get(`/public/invites/${token}`).expect(200);
    expect(page.headers['cache-control']).toBe('private, no-cache, no-store');
    expect(page.headers['x-robots-tag']).toBe('noindex');
    expect(page.body).toMatchObject({
      eventName: 'Festa',
      companionLimit: 2,
      customization: { templateCode: 'night', colorOverrides: { accent: '#123456' } },
    });
    expect(page.body.dietaryCategories).toHaveLength(5);
    // A página pública não conta nada sobre os outros convidados (Guia, 9.5).
    expect(Object.keys(page.body).sort()).toEqual([
      'companionLimit',
      'customization',
      'dietaryCategories',
      'eventName',
      'eventStartsAt',
      'location',
    ]);

    const rsvp = (body: object) =>
      request(app.getHttpServer()).post(`/public/invites/${token}/rsvp`).send(body);
    const tooMany = await rsvp({ name: 'Bia', status: 'ACCEPTED', companionCount: 3 }).expect(422);
    expect(tooMany.body.details).toEqual([{ field: 'companionCount', rule: 'companionLimit' }]);
    await rsvp({ name: 'Bia', status: 'ACCEPTED', companionCount: '2' }).expect(400);

    const bia = await rsvp({
      name: 'Bia',
      status: 'ACCEPTED',
      companionCount: 2,
      dietaryNote: { categories: ['ALLERGY'], freeText: '=amendoim' },
    }).expect(201);
    expect(bia.headers['cache-control']).toBe('no-store');
    const personal = bia.body.personalToken as string;
    // 3 ocupadas, e 2 pedidas passam do teto de 4. O talvez não ocupa vaga.
    const full = await rsvp({ name: 'Caio', status: 'ACCEPTED', companionCount: 1 }).expect(409);
    expect(full.body.code).toBe('CAPACITY_EXCEEDED');
    await rsvp({ name: 'Caio', status: 'MAYBE', companionCount: 1 }).expect(201);
    await rsvp({ name: 'Duda', status: 'DECLINED', companionCount: 2 }).expect(201);

    const mine = await request(app.getHttpServer())
      .get(`/public/responses/${personal}`)
      .expect(200);
    expect(mine.headers['x-robots-tag']).toBe('noindex');
    expect(mine.body).toMatchObject({
      editable: true,
      response: {
        name: 'Bia',
        status: 'ACCEPTED',
        companionCount: 2,
        dietaryNote: { categories: ['ALLERGY'], freeText: '=amendoim' },
      },
    });
    const changed = await request(app.getHttpServer())
      .put(`/public/responses/${personal}`)
      .send({ name: 'Bia', status: 'ACCEPTED', companionCount: 0 })
      .expect(200);
    expect(changed.body.response).toMatchObject({ companionCount: 0, dietaryNote: null });

    const attendance = await ana.get(`/invites/${id}/attendance`).expect(200);
    expect(attendance.headers['cache-control']).toBe('private, no-store');
    expect(attendance.body.totalPeople).toBe(1);
    expect(attendance.body.guests.map((guest: { name: string }) => guest.name)).toEqual([
      'Bia',
      'Duda',
      'Caio',
    ]);

    await request(app.getHttpServer())
      .put(`/public/responses/${personal}`)
      .send({
        name: 'Bia',
        status: 'MAYBE',
        dietaryNote: { categories: ['VEGAN', 'ALLERGY'], freeText: 'Camarão' },
      })
      .expect(200);
    const summary = await ana.get(`/invites/${id}/dietary-summary`).expect(200);
    expect(summary.body).toEqual({
      counts: [
        { code: 'ALLERGY', displayName: 'Alergia', count: 1 },
        { code: 'VEGAN', displayName: 'Vegano', count: 1 },
      ],
      descriptions: [{ guestName: 'Bia', description: 'Camarão' }],
    });

    const csv = await ana.get(`/invites/${id}/dietary-notes.csv`).expect(200);
    expect(csv.headers['content-type']).toBe('text/csv; charset=utf-8');
    expect(csv.headers['content-disposition']).toMatch(/^attachment/);
    expect(csv.text.split('\r\n')).toHaveLength(3);

    await ana.post(`/invites/${id}/unpublish`).expect(200, { status: 'UNPUBLISHED' });
    await ana.post(`/invites/${id}/unpublish`).expect(409);
    // O link pessoal continua abrindo com o convite despublicado (Guia, 9.5).
    await request(app.getHttpServer()).get(`/public/responses/${personal}`).expect(200);
  });

  it('as situações de ausência saem com o mesmo 404, idêntico (Guia, 9.5)', async () => {
    const ana = await signedUp('dona');
    const bia = await signedUp('outra');
    const { body: invite } = await ana.post('/invites').send(newInvite).expect(201);
    const { body: published } = await ana.post(`/invites/${invite.id}/publish`).expect(200);
    await ana.post(`/invites/${invite.id}/unpublish`).expect(200);

    const responses = await Promise.all([
      request(app.getHttpServer()).get('/public/invites/NUNCAEXISTIU0000000000000Z'),
      request(app.getHttpServer()).get('/public/invites/token-mal-formado'),
      request(app.getHttpServer()).get(`/public/invites/${published.publicToken}`),
      request(app.getHttpServer()).post(`/public/invites/${published.publicToken}/rsvp`).send({}),
      request(app.getHttpServer()).get('/public/responses/NUNCAEXISTIU0000000000000Z'),
      bia.get(`/invites/${invite.id}`),
      bia.get('/invites/999999999'),
      bia.get(`/invites/${invite.id}/dietary-summary`),
    ]);
    for (const response of responses) {
      expect(response.status).toBe(404);
      expect(response.headers['cache-control']).toBe('no-store');
      const { traceId: _traceId, ...body } = response.body;
      expect(body).toEqual({
        code: 'NOT_FOUND',
        message: 'Não encontramos o que você procurou.',
      });
    }
  });
});
