// Mock da API para desenvolver e testar as telas antes do back-end ficar pronto (parte 2,
// Instruções de Implementação). Responde as rotas da tabela 4.1 do Guia com os tipos de
// contract/ e com o formato de erro da seção 9.3, inclusive os casos de recusa.
//
// Não faz parte do tier Front: não entra na imagem, não é importado pelo src/ e não tem
// valor de referência para as regras. Quem decide de verdade é a API. Para subir:
//   npm run mock --workspace front
// e o front com NEXT_PUBLIC_API_URL e API_URL_INTERNAL apontando para http://127.0.0.1:3001.
import { randomBytes, randomUUID } from 'node:crypto';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import {
  DEFAULT_TEMPLATE_CODE,
  ERROR_HTTP_STATUS,
  TEMPLATES,
  TEXT_LIMITS,
  type ApiError,
  type AttendanceList,
  type CreateInviteRequest,
  type CustomizeInviteRequest,
  type DietaryCategory,
  type DietaryCategoryCode,
  type DietarySummary,
  type ErrorCode,
  type ErrorDetail,
  type GuestResponsePage,
  type HexColor,
  type HostProfile,
  type InviteDetails,
  type InviteStatus,
  type InviteSummary,
  type PublishedInvite,
  type RsvpRequest,
  type RsvpStatus,
  type SignInRequest,
  type SignUpRequest,
} from '@invite-app/contract';

const PORT = Number(process.env.MOCK_PORT ?? 3001);
// No container o mock precisa ouvir em todas as interfaces, para o compose alcançá-lo.
const HOST = process.env.MOCK_HOST ?? '127.0.0.1';
const FRONT_ORIGIN = process.env.FRONT_ORIGIN ?? 'http://127.0.0.1:3000';
const SESSION_COOKIE = 'mock_session';
// ADR-0013: o projeto inteiro em America/Sao_Paulo, que hoje não tem horário de verão.
const PROJECT_OFFSET = '-03:00';

const CATEGORIES: DietaryCategory[] = [
  { code: 'VEGETARIAN', displayName: 'Vegetariano', requiresDescription: false },
  { code: 'VEGAN', displayName: 'Vegano', requiresDescription: false },
  { code: 'GLUTEN_FREE', displayName: 'Sem glúten', requiresDescription: false },
  { code: 'LACTOSE_FREE', displayName: 'Sem lactose', requiresDescription: false },
  { code: 'ALLERGY', displayName: 'Alergia', requiresDescription: true },
];

interface Host extends HostProfile {
  password: string;
}

interface Invite {
  id: string;
  hostEmail: string;
  eventName: string;
  eventStartsAt: string;
  location: string;
  status: InviteStatus;
  publicToken: string | null;
  peopleLimit: number | null;
  companionLimit: number | null;
  templateCode: string;
  colorOverrides: Record<string, HexColor>;
  createdAt: number;
}

interface Guest {
  inviteId: string;
  personalToken: string;
  name: string;
  status: RsvpStatus;
  companionCount: number;
  categories: DietaryCategoryCode[];
  freeText: string | null;
  respondedAt: string;
}

const hosts = new Map<string, Host>();
const sessions = new Map<string, string>();
const invites = new Map<string, Invite>();
const guests: Guest[] = [];

// Sem propriedade no construtor: o Node roda este arquivo só apagando os tipos.
class Refusal extends Error {
  readonly code: ErrorCode;
  readonly details: ErrorDetail[] | undefined;

  constructor(code: ErrorCode, details?: ErrorDetail[]) {
    super(code);
    this.code = code;
    this.details = details;
  }
}

const refuse = (code: ErrorCode, details?: ErrorDetail[]) => new Refusal(code, details);
const invalid = (details: ErrorDetail[]) => refuse('VALIDATION_FAILED', details);

/** Token de 128 bits em base32 Crockford, como o do ADR-0005. */
function newToken(): string {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  return [...randomBytes(26)].map((byte) => alphabet[byte % 32]).join('');
}

function todayInProject(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

function dateOf(instant: string): string {
  return new Date(instant).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
}

// ---------------------------------------------------------------- Validações do mock

function validateInviteData(body: CreateInviteRequest, templateCode: string): Invite {
  const details: ErrorDetail[] = [];
  const limits = TEMPLATES.find((t) => t.code === templateCode)!.textLimits;
  const text = (field: 'eventName' | 'location') => {
    const value = typeof body[field] === 'string' ? body[field].trim() : '';
    if (!value) details.push({ field, rule: 'required' });
    else if (value.length > limits[field]) details.push({ field, rule: 'maxLength' });
    return value;
  };
  const eventName = text('eventName');
  const location = text('location');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.eventDate ?? ''))
    details.push({ field: 'eventDate', rule: 'required' });
  else if (body.eventDate < todayInProject())
    details.push({ field: 'eventDate', rule: 'dateNotInPast' });
  if (!/^\d{2}:\d{2}$/.test(body.eventTime ?? ''))
    details.push({ field: 'eventTime', rule: 'required' });
  const limit = (field: 'peopleLimit' | 'companionLimit', min: number) => {
    const value = body[field] ?? null;
    if (value !== null && (!Number.isInteger(value) || value < min))
      details.push({ field, rule: 'minValue' });
    return value;
  };
  const peopleLimit = limit('peopleLimit', 1);
  const companionLimit = limit('companionLimit', 0);
  if (details.length) throw invalid(details);
  return {
    eventName,
    location,
    eventStartsAt: new Date(
      `${body.eventDate}T${body.eventTime}:00${PROJECT_OFFSET}`,
    ).toISOString(),
    peopleLimit,
    companionLimit,
  } as Invite;
}

function validateRsvp(
  invite: Invite,
  body: RsvpRequest,
): Omit<Guest, 'inviteId' | 'personalToken'> {
  const details: ErrorDetail[] = [];
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) details.push({ field: 'name', rule: 'required' });
  else if (name.length > TEXT_LIMITS.guestName) details.push({ field: 'name', rule: 'maxLength' });
  if (!['ACCEPTED', 'DECLINED', 'MAYBE'].includes(body.status))
    details.push({ field: 'status', rule: body.status ? 'allowedValue' : 'required' });
  // UC005 A1: quem não vai grava zero acompanhantes e nenhuma observação.
  if (body.status === 'DECLINED') {
    if (details.length) throw invalid(details);
    return {
      name,
      status: body.status,
      companionCount: 0,
      categories: [],
      freeText: null,
      respondedAt: new Date().toISOString(),
    };
  }
  const companionCount = body.companionCount ?? 0;
  if (!Number.isInteger(companionCount) || companionCount < 0)
    details.push({ field: 'companionCount', rule: 'minValue' });
  else if (invite.companionLimit !== null && companionCount > invite.companionLimit)
    details.push({ field: 'companionCount', rule: 'companionLimit' });
  const categories = body.dietaryNote?.categories ?? [];
  if (categories.some((code) => !CATEGORIES.some((c) => c.code === code)))
    details.push({ field: 'dietaryNote.categories', rule: 'allowedValue' });
  const freeText = body.dietaryNote?.freeText?.trim() ?? '';
  if (categories.includes('ALLERGY') && !freeText)
    details.push({ field: 'dietaryNote.freeText', rule: 'descriptionRequired' });
  if (freeText.length > TEXT_LIMITS.dietaryFreeText)
    details.push({ field: 'dietaryNote.freeText', rule: 'maxLength' });
  if (details.length) throw invalid(details);
  return {
    name,
    status: body.status,
    companionCount,
    categories,
    freeText: freeText || null,
    respondedAt: new Date().toISOString(),
  };
}

const seats = (guest: Pick<Guest, 'status' | 'companionCount'>) =>
  guest.status === 'ACCEPTED' ? 1 + guest.companionCount : 0;

function checkCapacity(
  invite: Invite,
  candidate: Pick<Guest, 'status' | 'companionCount'>,
  except?: Guest,
) {
  if (invite.peopleLimit === null) return;
  const booked = guests
    .filter((guest) => guest.inviteId === invite.id && guest !== except)
    .reduce((sum, guest) => sum + seats(guest), 0);
  if (booked + seats(candidate) > invite.peopleLimit) throw refuse('CAPACITY_EXCEEDED');
}

// ---------------------------------------------------------------- Projeções do contrato

function details(invite: Invite): InviteDetails {
  return {
    id: invite.id,
    eventName: invite.eventName,
    eventStartsAt: invite.eventStartsAt,
    status: invite.status,
    location: invite.location,
    publicToken: invite.publicToken,
    peopleLimit: invite.peopleLimit,
    companionLimit: invite.companionLimit,
    customization: { templateCode: invite.templateCode, colorOverrides: invite.colorOverrides },
  };
}

function published(invite: Invite): PublishedInvite {
  return {
    eventName: invite.eventName,
    eventStartsAt: invite.eventStartsAt,
    location: invite.location,
    companionLimit: invite.companionLimit,
    customization: { templateCode: invite.templateCode, colorOverrides: invite.colorOverrides },
    dietaryCategories: CATEGORIES,
  };
}

function responsePage(guest: Guest): GuestResponsePage {
  const invite = invites.get(guest.inviteId)!;
  return {
    invite: published(invite),
    response: {
      name: guest.name,
      status: guest.status,
      companionCount: guest.companionCount,
      dietaryNote:
        guest.status === 'DECLINED'
          ? null
          : {
              categories: guest.categories,
              ...(guest.freeText ? { freeText: guest.freeText } : {}),
            },
      respondedAt: guest.respondedAt,
    },
    // ADR-0013: editável até 23:59:59 do dia do evento, no fuso do projeto.
    editable: todayInProject() <= dateOf(invite.eventStartsAt),
  };
}

function attendance(invite: Invite): AttendanceList {
  const list = guests
    .filter((guest) => guest.inviteId === invite.id)
    .sort((a, b) => b.respondedAt.localeCompare(a.respondedAt));
  return {
    guests: list.map(({ name, status, companionCount, respondedAt }) => ({
      name,
      status,
      companionCount,
      respondedAt,
    })),
    totalPeople: list.reduce((sum, guest) => sum + seats(guest), 0),
  };
}

function dietarySummary(invite: Invite): DietarySummary {
  const attending = guests.filter((g) => g.inviteId === invite.id && g.status !== 'DECLINED');
  return {
    counts: CATEGORIES.map((category) => ({
      code: category.code,
      displayName: category.displayName,
      count: attending.filter((guest) => guest.categories.includes(category.code)).length,
    })).filter((count) => count.count > 0),
    descriptions: attending
      .filter((guest) => guest.freeText)
      .map((guest) => ({ guestName: guest.name, description: guest.freeText! })),
  };
}

function csv(invite: Invite): string {
  // ADR-0008, medida 5: campo começado por =, +, - ou @ ganha aspa simples.
  const cell = (value: string | number) => {
    let text = String(value);
    if (/^[=+\-@]/.test(text)) text = `'${text}`;
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  const label = (code: DietaryCategoryCode) => CATEGORIES.find((c) => c.code === code)!.displayName;
  const rows = guests
    .filter((guest) => guest.inviteId === invite.id && guest.status !== 'DECLINED')
    .map((g) => [
      g.name,
      g.status === 'ACCEPTED' ? 'Sim' : 'Talvez',
      g.companionCount,
      g.categories.map(label).join(' / '),
      g.freeText ?? '',
    ]);
  return [['Nome', 'Situação', 'Acompanhantes', 'Categorias', 'Observação'], ...rows]
    .map((row) => row.map(cell).join(';'))
    .join('\r\n');
}

// ---------------------------------------------------------------- HTTP

function cookies(req: IncomingMessage): Record<string, string> {
  return Object.fromEntries(
    (req.headers.cookie ?? '').split(';').flatMap((part) => {
      const [key, ...value] = part.trim().split('=');
      return key ? [[key, value.join('=')]] : [];
    }),
  );
}

function hostOf(req: IncomingMessage): Host {
  const email = sessions.get(cookies(req)[SESSION_COOKIE] ?? '');
  const host = email && hosts.get(email);
  if (!host) throw refuse('UNAUTHENTICATED');
  return host;
}

function ownInvite(req: IncomingMessage, id: string): Invite {
  const host = hostOf(req);
  const invite = invites.get(id);
  // Guia, 9.5: convite de outro anfitrião é o mesmo 404 de convite inexistente.
  if (!invite || invite.hostEmail !== host.email) throw refuse('NOT_FOUND');
  return invite;
}

function openSession(res: ServerResponse, email: string) {
  const sid = randomUUID();
  sessions.set(sid, email);
  res.setHeader('set-cookie', `${SESSION_COOKIE}=${sid}; HttpOnly; SameSite=Lax; Path=/`);
}

async function readBody<T>(req: IncomingMessage): Promise<T> {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  if (!raw) return {} as T;
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw refuse('MALFORMED_REQUEST');
  }
}

type Handler = (req: IncomingMessage, res: ServerResponse, params: string[]) => Promise<unknown>;
type Route = [method: string, pattern: RegExp, handler: Handler, status?: number];

const routes: Route[] = [
  [
    'POST',
    /^\/auth\/sign-up$/,
    async (req, res) => {
      const body = await readBody<SignUpRequest>(req);
      const errors: ErrorDetail[] = [];
      if (!body.name?.trim()) errors.push({ field: 'name', rule: 'required' });
      if (!body.email?.trim()) errors.push({ field: 'email', rule: 'required' });
      else if (hosts.has(body.email.trim().toLowerCase()))
        errors.push({ field: 'email', rule: 'alreadyRegistered' });
      if (!body.password) errors.push({ field: 'password', rule: 'required' });
      else if (body.password.length < TEXT_LIMITS.passwordMin)
        errors.push({ field: 'password', rule: 'minLength' });
      if (errors.length) throw invalid(errors);
      const email = body.email.trim().toLowerCase();
      hosts.set(email, { name: body.name.trim(), email, password: body.password });
      openSession(res, email);
      return { name: body.name.trim(), email };
    },
    201,
  ],
  [
    'POST',
    /^\/auth\/sign-in$/,
    async (req, res) => {
      const body = await readBody<SignInRequest>(req);
      const host = hosts.get(body.email?.trim().toLowerCase() ?? '');
      // UC001 A2: email inexistente e senha errada são o mesmo 401.
      if (!host || host.password !== body.password) throw refuse('UNAUTHENTICATED');
      openSession(res, host.email);
      return { name: host.name, email: host.email };
    },
  ],
  [
    'POST',
    /^\/auth\/sign-out$/,
    async (req, res) => {
      sessions.delete(cookies(req)[SESSION_COOKIE] ?? '');
      res.setHeader('set-cookie', `${SESSION_COOKIE}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`);
      return undefined;
    },
    204,
  ],
  [
    'GET',
    /^\/auth\/session$/,
    async (req) => {
      const { name, email } = hostOf(req);
      return { name, email };
    },
  ],
  [
    'GET',
    /^\/invites$/,
    async (req) => {
      const host = hostOf(req);
      return [...invites.values()]
        .filter((invite) => invite.hostEmail === host.email)
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(({ id, eventName, eventStartsAt, status }): InviteSummary => ({
          id,
          eventName,
          eventStartsAt,
          status,
        }));
    },
  ],
  [
    'POST',
    /^\/invites$/,
    async (req) => {
      const host = hostOf(req);
      const data = validateInviteData(
        await readBody<CreateInviteRequest>(req),
        DEFAULT_TEMPLATE_CODE,
      );
      const invite: Invite = {
        ...data,
        id: randomUUID(),
        hostEmail: host.email,
        status: 'DRAFT',
        publicToken: null,
        templateCode: DEFAULT_TEMPLATE_CODE,
        colorOverrides: {},
        createdAt: Date.now(),
      };
      invites.set(invite.id, invite);
      return details(invite);
    },
    201,
  ],
  ['GET', /^\/invites\/([^/]+)$/, async (req, _res, [id]) => details(ownInvite(req, id!))],
  [
    'PUT',
    /^\/invites\/([^/]+)$/,
    async (req, _res, [id]) => {
      const invite = ownInvite(req, id!);
      const data = validateInviteData(
        await readBody<CreateInviteRequest>(req),
        invite.templateCode,
      );
      if (invite.status !== 'DRAFT') throw refuse('INVITE_NOT_OPEN');
      Object.assign(invite, data);
      return details(invite);
    },
  ],
  [
    'PUT',
    /^\/invites\/([^/]+)\/customization$/,
    async (req, _res, [id]) => {
      const invite = ownInvite(req, id!);
      const body = await readBody<CustomizeInviteRequest>(req);
      const template = TEMPLATES.find((t) => t.code === body.templateCode);
      if (!template) throw invalid([{ field: 'templateCode', rule: 'allowedValue' }]);
      const errors: ErrorDetail[] = [];
      for (const [role, color] of Object.entries(body.colorOverrides ?? {}))
        if (!(role in template.defaultColors) || !/^#[0-9a-f]{6}$/i.test(color))
          errors.push({ field: `colorOverrides.${role}`, rule: 'allowedValue' });
      for (const field of ['eventName', 'location'] as const) {
        const value = body[field]?.trim() ?? '';
        if (!value) errors.push({ field, rule: 'required' });
        else if (value.length > template.textLimits[field])
          errors.push({ field, rule: 'maxLength' });
      }
      if (errors.length) throw invalid(errors);
      Object.assign(invite, {
        templateCode: template.code,
        colorOverrides: body.colorOverrides ?? {},
        eventName: body.eventName.trim(),
        location: body.location.trim(),
      });
      return details(invite);
    },
  ],
  [
    'POST',
    /^\/invites\/([^/]+)\/publish$/,
    async (req, _res, [id]) => {
      const invite = ownInvite(req, id!);
      const missing = (['eventName', 'location'] as const).filter((field) => !invite[field]);
      if (missing.length)
        throw refuse(
          'INVITE_NOT_PUBLISHABLE',
          missing.map((field) => ({ field, rule: 'required' })),
        );
      // UC004: republicar reaproveita o link que já circulou.
      invite.publicToken ??= newToken();
      invite.status = 'PUBLISHED';
      return { publicToken: invite.publicToken, status: 'PUBLISHED' };
    },
  ],
  [
    'POST',
    /^\/invites\/([^/]+)\/unpublish$/,
    async (req, _res, [id]) => {
      const invite = ownInvite(req, id!);
      if (invite.status !== 'PUBLISHED') throw refuse('INVITE_NOT_OPEN');
      invite.status = 'UNPUBLISHED';
      return { status: 'UNPUBLISHED' };
    },
  ],
  [
    'GET',
    /^\/invites\/([^/]+)\/attendance$/,
    async (req, _res, [id]) => attendance(ownInvite(req, id!)),
  ],
  [
    'GET',
    /^\/invites\/([^/]+)\/dietary-summary$/,
    async (req, _res, [id]) => dietarySummary(ownInvite(req, id!)),
  ],
  [
    'GET',
    /^\/invites\/([^/]+)\/dietary-notes\.csv$/,
    async (req, res, [id]) => {
      const invite = ownInvite(req, id!);
      res.setHeader('content-type', 'text/csv; charset=utf-8');
      res.setHeader('content-disposition', 'attachment; filename="lista.csv"');
      return csv(invite);
    },
  ],
  [
    'GET',
    /^\/public\/invites\/([^/]+)$/,
    async (_req, _res, [token]) => published(publishedByToken(token!)),
  ],
  [
    'POST',
    /^\/public\/invites\/([^/]+)\/rsvp$/,
    async (req, _res, [token]) => {
      const invite = publishedByToken(token!);
      const data = validateRsvp(invite, await readBody<RsvpRequest>(req));
      checkCapacity(invite, data);
      const guest: Guest = { ...data, inviteId: invite.id, personalToken: newToken() };
      guests.push(guest);
      return { personalToken: guest.personalToken };
    },
    201,
  ],
  [
    'GET',
    /^\/public\/responses\/([^/]+)$/,
    async (_req, _res, [token]) => responsePage(guestByToken(token!)),
  ],
  [
    'PUT',
    /^\/public\/responses\/([^/]+)$/,
    async (req, _res, [token]) => {
      const guest = guestByToken(token!);
      const invite = invites.get(guest.inviteId)!;
      const data = validateRsvp(invite, await readBody<RsvpRequest>(req));
      if (!responsePage(guest).editable) throw refuse('INVITE_NOT_OPEN');
      checkCapacity(invite, data, guest);
      Object.assign(guest, data);
      return responsePage(guest);
    },
  ],
];

function publishedByToken(token: string): Invite {
  const invite = [...invites.values()].find(
    (i) => i.publicToken === token && i.status === 'PUBLISHED',
  );
  // Guia, 9.5: inexistente, rascunho e despublicado são o mesmo 404.
  if (!invite) throw refuse('NOT_FOUND');
  return invite;
}

function guestByToken(token: string): Guest {
  const guest = guests.find((g) => g.personalToken === token);
  if (!guest) throw refuse('NOT_FOUND');
  return guest;
}

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('cache-control', 'no-store');
  if (body === undefined) return res.end();
  if (typeof body === 'string') return res.end(body);
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

const server = createServer((req, res) => {
  res.setHeader('access-control-allow-origin', FRONT_ORIGIN);
  res.setHeader('access-control-allow-credentials', 'true');
  res.setHeader('vary', 'origin');
  if (req.method === 'OPTIONS') {
    res.setHeader('access-control-allow-methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('access-control-allow-headers', 'content-type, x-request-id');
    return send(res, 204, undefined);
  }
  const traceId = randomBytes(8).toString('hex');
  const path = new URL(req.url ?? '/', 'http://mock').pathname;
  const match = routes
    .map(([method, pattern, handler, status]) => ({
      method,
      found: pattern.exec(path),
      handler,
      status,
    }))
    .find(({ method, found }) => method === req.method && found);

  const run = match
    ? match.handler(req, res, match.found!.slice(1).map(decodeURIComponent))
    : Promise.reject(refuse('NOT_FOUND'));

  run
    .then((body) => send(res, match?.status ?? 200, body))
    .catch((error: unknown) => {
      const code: ErrorCode = error instanceof Refusal ? error.code : 'INTERNAL_ERROR';
      if (!(error instanceof Refusal)) console.error(error);
      const body: ApiError = {
        code,
        message: code,
        traceId,
        ...(error instanceof Refusal && error.details ? { details: error.details } : {}),
      };
      send(res, ERROR_HTTP_STATUS[code], body);
    });
});

// Um anfitrião e um convite publicado de exemplo, para abrir as telas sem cadastro.
function seed() {
  const email = 'demo@convite.dev';
  hosts.set(email, { name: 'Marina', email, password: 'senha1234' });
  const nextMonth = new Date(Date.now() + 30 * 86_400_000).toLocaleDateString('en-CA', {
    timeZone: 'America/Sao_Paulo',
  });
  const invite: Invite = {
    ...validateInviteData(
      {
        eventName: 'Aniversário da vovó Marina',
        eventDate: nextMonth,
        eventTime: '19:30',
        location: 'Chácara da família, Cotia',
        peopleLimit: 30,
        companionLimit: 3,
      },
      DEFAULT_TEMPLATE_CODE,
    ),
    id: randomUUID(),
    hostEmail: email,
    status: 'PUBLISHED',
    publicToken: 'DEMO0000000000000000000000',
    templateCode: 'garden',
    colorOverrides: {},
    createdAt: Date.now(),
  };
  invites.set(invite.id, invite);
  return invite;
}

const demo = seed();
server.listen(PORT, HOST, () => {
  console.log(`Mock da API em http://${HOST}:${PORT}`);
  console.log(`Painel: entre com demo@convite.dev e senha1234`);
  console.log(`Convite publicado: ${FRONT_ORIGIN}/i/${demo.publicToken}`);
});
