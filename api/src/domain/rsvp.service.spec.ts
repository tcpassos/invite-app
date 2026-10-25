import { DietaryCategoryCode, RsvpStatus } from '@invite-app/contract';
import { ValidationError } from './errors.js';
import { isWithinResponseDeadline, validateRsvpRequest } from './rsvp.service.js';

describe('validateRsvpRequest', () => {
  it('accepts a response with dietary categories and companions within the configured limit', () => {
    expect(
      validateRsvpRequest(
        {
          name: 'Ana',
          status: RsvpStatus.Accepted,
          companionCount: 2,
          dietaryNote: {
            categories: [DietaryCategoryCode.Vegetarian, DietaryCategoryCode.Allergy],
            freeText: 'Amendoim',
          },
        },
        2,
      ),
    ).toMatchObject({
      name: 'Ana',
      companionCount: 2,
      categories: [DietaryCategoryCode.Vegetarian, DietaryCategoryCode.Allergy],
      freeText: 'Amendoim',
    });
  });

  it('requires an allergy description and enforces companion counts', () => {
    expect(() =>
      validateRsvpRequest(
        {
          name: 'Ana',
          status: RsvpStatus.Accepted,
          companionCount: 0,
          dietaryNote: { categories: [DietaryCategoryCode.Allergy] },
        },
        null,
      ),
    ).toThrow(new ValidationError('dietaryNote.freeText', 'descriptionRequired'));
    expect(() =>
      validateRsvpRequest({ name: 'Ana', status: RsvpStatus.Maybe, companionCount: 3 }, 2),
    ).toThrow(new ValidationError('companionCount', 'companionLimit'));
  });

  it('rejects unknown response statuses and dietary categories', () => {
    expect(() =>
      validateRsvpRequest({ name: 'Ana', status: 'UNKNOWN', companionCount: 0 }, null),
    ).toThrow(new ValidationError('status', 'allowedValue'));
    expect(() =>
      validateRsvpRequest(
        {
          name: 'Ana',
          status: RsvpStatus.Accepted,
          companionCount: 0,
          dietaryNote: { categories: ['UNKNOWN'] },
        },
        null,
      ),
    ).toThrow(new ValidationError('dietaryNote.categories', 'allowedValue'));
  });

  it('normalizes declined responses to zero companions and no dietary note', () => {
    expect(
      validateRsvpRequest(
        {
          name: 'Ana',
          status: RsvpStatus.Declined,
          companionCount: 5,
          dietaryNote: { categories: [DietaryCategoryCode.Allergy], freeText: 'Amendoim' },
        },
        0,
      ),
    ).toMatchObject({
      status: RsvpStatus.Declined,
      companionCount: 0,
      categories: [],
      freeText: null,
    });
  });
});

describe('isWithinResponseDeadline', () => {
  it('allows edits through the event day in the project timezone, but not after it', () => {
    const event = new Date('2026-10-20T22:00:00.000Z');
    expect(isWithinResponseDeadline(event, new Date('2026-10-21T02:59:59.000Z'))).toBe(true);
    expect(isWithinResponseDeadline(event, new Date('2026-10-21T03:00:00.000Z'))).toBe(false);
  });
});
