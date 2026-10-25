import { RsvpStatus } from '@invite-app/contract';
import type { DietaryCategory, Invite } from '../model/index.js';
import { ValidationError } from './errors.js';
import { seatsRequested, validateRsvp, type RsvpCommand } from './rsvp-rules.js';

const invite: Invite = {
  id: '1',
  hostId: '1',
  eventName: 'Festa',
  eventStartsAt: new Date('2099-01-01T21:00:00Z'),
  location: 'Salão',
  status: 'PUBLISHED',
  publicToken: 'T',
  capacityLimit: null,
  maxCompanionsPerGuest: 2,
};

// As categorias vêm do banco, e a que exige descrição é decidida pelo dado (UC006 RN3).
const categories: DietaryCategory[] = [
  { code: 'VEGAN', displayName: 'Vegano', requiresDescription: false },
  { code: 'ALLERGY', displayName: 'Alergia', requiresDescription: true },
];

const accepted: RsvpCommand = { name: '  Ana  ', status: 'ACCEPTED', companionCount: 2 };
const refusal = (field: string, rule: string) => new ValidationError(field, rule as never);

describe('validateRsvp', () => {
  it('aceita a resposta e deriva as vagas', () => {
    expect(validateRsvp(accepted, invite, categories)).toEqual({
      guest: { name: 'Ana', status: 'ACCEPTED', companionCount: 2 },
      dietaryNote: null,
      seatsRequested: 3,
    });
  });

  it('cobra nome e status, e recusa status fora dos três (UC005 RN1)', () => {
    expect(() => validateRsvp({ ...accepted, name: ' ' }, invite, categories)).toThrow(
      refusal('name', 'required'),
    );
    expect(() => validateRsvp({ name: 'Ana' }, invite, categories)).toThrow(
      refusal('status', 'required'),
    );
    expect(() => validateRsvp({ ...accepted, status: 'YES' }, invite, categories)).toThrow(
      refusal('status', 'allowedValue'),
    );
  });

  it('recusa acompanhantes acima do limite do convite (UC005 RN2)', () => {
    expect(() => validateRsvp({ ...accepted, companionCount: 3 }, invite, categories)).toThrow(
      refusal('companionCount', 'companionLimit'),
    );
    expect(() => validateRsvp({ ...accepted, companionCount: -1 }, invite, categories)).toThrow(
      refusal('companionCount', 'minValue'),
    );
  });

  it('quem não vai grava zero acompanhantes, nenhuma observação e zero vagas (UC005 A1)', () => {
    const declined = validateRsvp(
      {
        ...accepted,
        status: 'DECLINED',
        companionCount: 9,
        dietaryNote: { categories: ['NADA'] },
      },
      invite,
      categories,
    );
    expect(declined).toEqual({
      guest: { name: 'Ana', status: 'DECLINED', companionCount: 0 },
      dietaryNote: null,
      seatsRequested: 0,
    });
  });

  it('cobra a descrição da categoria que exige, pelo dado do catálogo (UC006 RN2)', () => {
    const allergy = { ...accepted, dietaryNote: { categories: ['ALLERGY'], freeText: ' ' } };
    expect(() => validateRsvp(allergy, invite, categories)).toThrow(
      refusal('dietaryNote.freeText', 'descriptionRequired'),
    );
    const described = {
      ...accepted,
      dietaryNote: { categories: ['ALLERGY', 'ALLERGY'], freeText: 'Amendoim' },
    };
    expect(validateRsvp(described, invite, categories).dietaryNote).toEqual({
      categoryCodes: ['ALLERGY'],
      freeText: 'Amendoim',
    });
  });

  it('recusa categoria fora do catálogo e texto livre comprido demais', () => {
    expect(() =>
      validateRsvp({ ...accepted, dietaryNote: { categories: ['KOSHER'] } }, invite, categories),
    ).toThrow(refusal('dietaryNote.categories', 'allowedValue'));
    expect(() =>
      validateRsvp(
        { ...accepted, dietaryNote: { categories: ['VEGAN'], freeText: 'x'.repeat(501) } },
        invite,
        categories,
      ),
    ).toThrow(refusal('dietaryNote.freeText', 'maxLength'));
  });
});

describe('seatsRequested (ADR-0008, medida 1)', () => {
  it('só a confirmação ocupa vaga', () => {
    expect(seatsRequested(RsvpStatus.Accepted, 2)).toBe(3);
    expect(seatsRequested(RsvpStatus.Maybe, 2)).toBe(0);
    expect(seatsRequested(RsvpStatus.Declined, 0)).toBe(0);
  });
});
