import type { DietaryCategoryRepository } from '../data/dietary-category.repository.js';
import type { InviteRepository } from '../data/invite.repository.js';
import type { Invite } from '../model/index.js';
import { CapacityExceededError, InviteNotOpenError } from './errors.js';
import { RsvpService, isEditable } from './rsvp.service.js';

const invite: Invite = {
  id: '10',
  hostId: '1',
  eventName: 'Festa',
  eventStartsAt: new Date('2099-01-01T21:00:00Z'),
  location: 'Salão',
  status: 'PUBLISHED',
  publicToken: 'T',
  capacityLimit: 10,
  maxCompanionsPerGuest: null,
};
const found = { invite, customization: { templateCode: 'classic', colorOverrides: [] } };
const categories = { listDietaryCategories: vi.fn(async () => []) };

function service(repo: Partial<Record<keyof InviteRepository, unknown>>) {
  return new RsvpService(
    repo as unknown as InviteRepository,
    categories as unknown as DietaryCategoryRepository,
  );
}

describe('RsvpService.registerRsvp (UC005)', () => {
  it('entrega aos Dados as vagas calculadas no Domínio, e não o status', async () => {
    const save = vi.fn(async () => ({ kind: 'saved', guest: { personalToken: 'P' } }));
    const repo = {
      findPublishedByPublicToken: vi.fn(async () => found),
      saveRsvpWithinCapacity: save,
    };
    await service(repo).registerRsvp('T', { name: 'Ana', status: 'MAYBE', companionCount: 3 });
    expect(save).toHaveBeenCalledWith('10', expect.anything(), null, 0);
    await service(repo).registerRsvp('T', { name: 'Ana', status: 'ACCEPTED', companionCount: 3 });
    expect(save).toHaveBeenLastCalledWith('10', expect.anything(), null, 4);
  });

  it('dá nome de negócio às recusas dos Dados (Guia, 9.2)', async () => {
    const refusing = (reason: string) => ({
      findPublishedByPublicToken: vi.fn(async () => found),
      saveRsvpWithinCapacity: vi.fn(async () => ({ kind: 'refused', reason })),
    });
    const body = { name: 'Ana', status: 'ACCEPTED' };
    await expect(
      service(refusing('CapacityExceeded')).registerRsvp('T', body),
    ).rejects.toBeInstanceOf(CapacityExceededError);
    await expect(service(refusing('InviteNotOpen')).registerRsvp('T', body)).rejects.toBeInstanceOf(
      InviteNotOpenError,
    );
  });

  it('devolve vazio quando o token não resolve', async () => {
    const repo = { findPublishedByPublicToken: vi.fn(async () => null) };
    await expect(service(repo).registerRsvp('X', { name: 'Ana' })).resolves.toBeNull();
  });
});

describe('isEditable (ADR-0013)', () => {
  const event = new Date('2026-12-01T23:00:00Z'); // 20h do dia 1º em São Paulo

  it('vale até 23:59 do dia do evento no fuso do projeto', () => {
    expect(isEditable(event, new Date('2026-12-02T02:59:00Z'))).toBe(true);
    expect(isEditable(event, new Date('2026-12-02T03:00:00Z'))).toBe(false);
  });
});
