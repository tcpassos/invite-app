import type { Invite } from '../model/index.js';
import { NotInviteOwner } from './errors.js';
import { validateOwnership } from './ownership.js';

const invite: Invite = {
  id: '10',
  hostId: '1',
  eventName: 'Aniversário',
  eventStartsAt: new Date('2026-12-01T23:00:00Z'),
  location: 'Salão',
  status: 'DRAFT',
  publicToken: null,
  capacityLimit: null,
  maxCompanionsPerGuest: null,
};

describe('validateOwnership', () => {
  it('devolve o convite quando ele é do anfitrião', () => {
    expect(validateOwnership(invite, '1')).toBe(invite);
  });

  it('recusa do mesmo jeito o convite de outro anfitrião e o que não existe', () => {
    expect(() => validateOwnership(invite, '2')).toThrow(NotInviteOwner);
    expect(() => validateOwnership(null, '1')).toThrow(NotInviteOwner);
  });
});
