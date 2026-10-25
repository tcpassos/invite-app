import type { InviteRepository } from '../data/invite.repository.js';
import type { Invite } from '../model/index.js';
import {
  InvalidInviteForPublication,
  InviteNotOpenError,
  NotInviteOwner,
  ValidationError,
} from './errors.js';
import { InviteService, type InviteCommand } from './invite.service.js';
import { projectInstant } from './project-time.js';

const HOST = '1';
const draft: Invite = {
  id: '10',
  hostId: HOST,
  eventName: 'Festa',
  eventStartsAt: new Date('2099-01-01T21:00:00Z'),
  location: 'Salão',
  status: 'DRAFT',
  publicToken: null,
  capacityLimit: null,
  maxCompanionsPerGuest: null,
};
const noCustomization = { templateCode: 'classic', colorOverrides: [] };

function service(repo: Partial<Record<keyof InviteRepository, unknown>>) {
  return new InviteService(repo as unknown as InviteRepository);
}

const command = (overrides: Partial<InviteCommand> = {}): InviteCommand => ({
  eventName: 'Festa',
  location: 'Salão',
  schedule: { eventStartsAt: new Date('2099-01-01T21:00:00Z') },
  ...overrides,
});

const today = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

describe('InviteService.createInvite (UC002)', () => {
  const createDraft = vi.fn(async (_host: string, fields: object) => ({ ...draft, ...fields }));

  it('compara a data por dia no fuso do projeto: hoje passa mesmo com a hora vencida', async () => {
    const earlyToday = projectInstant(today(), '00:00')!;
    await expect(
      service({ createDraft }).createInvite(
        HOST,
        command({ schedule: { eventStartsAt: earlyToday } }),
      ),
    ).resolves.toMatchObject({ invite: { eventStartsAt: earlyToday } });
  });

  it('recusa data no passado e aponta o campo que faltou', async () => {
    const yesterday = new Date(Date.now() - 2 * 86_400_000);
    await expect(
      service({ createDraft }).createInvite(
        HOST,
        command({ schedule: { eventStartsAt: yesterday } }),
      ),
    ).rejects.toEqual(new ValidationError('eventDate', 'dateNotInPast'));
    await expect(
      service({ createDraft }).createInvite(HOST, command({ schedule: { missing: 'eventTime' } })),
    ).rejects.toEqual(new ValidationError('eventTime', 'required'));
  });

  it('usa o limite de texto do template padrão e os pisos dos limites (RN2)', async () => {
    await expect(
      service({ createDraft }).createInvite(HOST, command({ eventName: 'F'.repeat(81) })),
    ).rejects.toEqual(new ValidationError('eventName', 'maxLength'));
    await expect(
      service({ createDraft }).createInvite(HOST, command({ peopleLimit: 0 })),
    ).rejects.toEqual(new ValidationError('peopleLimit', 'minValue'));
    await expect(
      service({ createDraft }).createInvite(HOST, command({ companionLimit: -1 })),
    ).rejects.toEqual(new ValidationError('companionLimit', 'minValue'));
  });
});

describe('InviteService, dono e situação', () => {
  const found = (invite: Invite) => vi.fn(async () => ({ invite, customization: noCustomization }));

  it('convite de outro anfitrião e convite inexistente saem pelo mesmo erro', async () => {
    await expect(
      service({ findWithCustomization: found({ ...draft, hostId: '2' }) }).getInvite('10', HOST),
    ).rejects.toBeInstanceOf(NotInviteOwner);
    await expect(
      service({ findWithCustomization: vi.fn(async () => null) }).getInvite('10', HOST),
    ).rejects.toBeInstanceOf(NotInviteOwner);
  });

  it('não corrige data nem limites fora do rascunho (UC002 RN3)', async () => {
    const published = { ...draft, status: 'PUBLISHED' as const };
    await expect(
      service({ findWithCustomization: found(published) }).updateInvite('10', HOST, command()),
    ).rejects.toBeInstanceOf(InviteNotOpenError);
  });

  it('recusa papel de cor que o template não tem (UC003 RN2)', async () => {
    await expect(
      service({ findWithCustomization: found(draft) }).customizeInvite('10', HOST, {
        templateCode: 'garden',
        colorOverrides: { background: '#ffffff' },
        eventName: 'Festa',
        location: 'Salão',
      }),
    ).rejects.toEqual(new ValidationError('colorOverrides.background', 'allowedValue'));
  });
});

describe('InviteService.publishInvite (UC004)', () => {
  it('gera o token na primeira publicação e devolve o mesmo na segunda', async () => {
    let current: Invite = draft;
    const repo = {
      findById: vi.fn(async () => current),
      publishIfPublishable: vi.fn(async (_id: string, token: string) => {
        current = { ...current, status: 'PUBLISHED', publicToken: current.publicToken ?? token };
        return true;
      }),
    };
    const first = await service(repo).publishInvite('10', HOST);
    expect(first).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    expect(await service(repo).publishInvite('10', HOST)).toBe(first);
    expect(repo.publishIfPublishable).toHaveBeenCalledTimes(1);
  });

  it('não publica sem nome ou local (RN1)', async () => {
    const repo = { findById: vi.fn(async () => ({ ...draft, location: ' ' })) };
    await expect(service(repo).publishInvite('10', HOST)).rejects.toEqual(
      new InvalidInviteForPublication(['location']),
    );
  });

  it('despublicar o que não está publicado é conflito de situação (A2)', async () => {
    const repo = {
      findById: vi.fn(async () => draft),
      unpublishIfPublished: vi.fn(async () => false),
    };
    await expect(service(repo).unpublishInvite('10', HOST)).rejects.toBeInstanceOf(
      InviteNotOpenError,
    );
  });
});
