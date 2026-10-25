import { toProjectDateTimeInput } from './project-date-time';

describe('toProjectDateTimeInput', () => {
  it('converts an ISO instant to the project timezone date and time', () => {
    expect(toProjectDateTimeInput('2026-10-21T02:30:00.000Z')).toEqual({
      eventDate: '2026-10-20',
      eventTime: '23:30',
    });
  });
});
