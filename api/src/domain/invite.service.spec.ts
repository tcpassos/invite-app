import { InviteStatus, type CustomizeInviteRequest } from '@invite-app/contract';
import type { InviteRepository } from '../data/invite.repository.js';
import type { Invite, InviteCustomization } from '../model/index.js';
import { ValidationError } from './errors.js';
import { InviteService } from './invite.service.js';

const HOST_ID = '1';
const INVITE_ID = '2';

const invite: Invite = {
  id: INVITE_ID,
  hostId: HOST_ID,
  eventName: 'Festa',
  eventStartsAt: new Date('2099-01-01T21:00:00.000Z'),
  location: 'Salão',
  status: InviteStatus.Draft,
  publicToken: null,
  capacityLimit: null,
  maxCompanionsPerGuest: null,
};

function serviceWith(repository: Partial<InviteRepository>) {
  return new InviteService(repository as InviteRepository);
}

describe('InviteService compatibility with the main front template catalog', () => {
  it('accepts event names up to the shared 80-character limit on creation', async () => {
    const repository = {
      create: vi.fn(async (_hostId: string, eventName: string) => ({ ...invite, eventName })),
    };
    const service = serviceWith(repository);
    const request = {
      eventName: 'F'.repeat(80),
      eventDate: '2099-01-01',
      eventTime: '18:00',
      location: 'Salão',
    };

    await expect(service.createInvite(HOST_ID, request)).resolves.toMatchObject({
      eventName: request.eventName,
    });
    await expect(
      service.createInvite(HOST_ID, { ...request, eventName: 'F'.repeat(81) }),
    ).rejects.toEqual(new ValidationError('eventName', 'maxLength'));
  });

  it.each([
    ['classic', { accent: '#123456' }, 80],
    ['garden', { primary: '#123456', accent: '#654321' }, 80],
    ['night', { primary: '#123456', accent: '#654321' }, 80],
    ['botanical', { primary: '#123456', background: '#654321', text: '#abcdef' }, 60],
    ['modern', { primary: '#123456', background: '#654321', text: '#abcdef' }, 60],
  ])(
    'accepts %s template and its color roles',
    async (templateCode, colorOverrides, eventNameLength) => {
      const customization: InviteCustomization = {
        templateCode,
        colorOverrides: Object.entries(colorOverrides).map(([role, value]) => ({ role, value })),
      };
      const repository = {
        findById: vi.fn().mockResolvedValue(invite),
        customize: vi.fn().mockResolvedValue(undefined),
        findDetails: vi.fn().mockResolvedValue({ invite, customization }),
      };
      const service = serviceWith(repository);
      const request: CustomizeInviteRequest = {
        templateCode,
        colorOverrides,
        eventName: 'F'.repeat(eventNameLength),
        location: 'Salão',
      };

      await expect(service.customizeInvite(INVITE_ID, HOST_ID, request)).resolves.toMatchObject({
        customization: { templateCode, colorOverrides },
      });
      expect(repository.customize).toHaveBeenCalledWith(
        INVITE_ID,
        templateCode,
        colorOverrides,
        request.eventName,
        request.location,
      );
    },
  );

  it('continues rejecting unsupported color roles and templates', async () => {
    const repository = {
      findById: vi.fn().mockResolvedValue(invite),
      customize: vi.fn().mockResolvedValue(undefined),
      findDetails: vi.fn().mockResolvedValue({
        invite,
        customization: { templateCode: 'classic', colorOverrides: [] },
      }),
    };
    const service = serviceWith(repository);
    const request: CustomizeInviteRequest = {
      templateCode: 'garden',
      colorOverrides: { unknown: '#123456' },
      eventName: 'Festa',
      location: 'Salão',
    };

    await expect(service.customizeInvite(INVITE_ID, HOST_ID, request)).rejects.toEqual(
      new ValidationError('colorOverrides.unknown', 'allowedValue'),
    );
    await expect(
      service.customizeInvite(INVITE_ID, HOST_ID, { ...request, templateCode: 'unsupported' }),
    ).rejects.toEqual(new ValidationError('templateCode', 'allowedValue'));
    expect(repository.customize).not.toHaveBeenCalled();
  });
});
