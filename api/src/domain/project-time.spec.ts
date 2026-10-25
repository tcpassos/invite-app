import { projectDate, projectInstant } from './project-time.js';

describe('tempo do projeto (ADR-0013)', () => {
  it('lê a data e a hora no fuso de São Paulo', () => {
    expect(projectInstant('2026-12-01', '20:00')?.toISOString()).toBe('2026-12-01T23:00:00.000Z');
    expect(projectInstant('2026-12-01', '23:30')?.toISOString()).toBe('2026-12-02T02:30:00.000Z');
  });

  it('recusa data ou hora que não existem', () => {
    expect(projectInstant('2026-02-31', '20:00')).toBeNull();
    expect(projectInstant('2026-12-01', '24:00')).toBeNull();
    expect(projectInstant('01/12/2026', '20:00')).toBeNull();
    expect(projectInstant('2026-12-01', '8h')).toBeNull();
  });

  it('conta o dia no fuso do projeto, e não em UTC', () => {
    // 01:30 em UTC ainda é o dia anterior em São Paulo.
    expect(projectDate(new Date('2026-12-02T01:30:00Z'))).toBe('2026-12-01');
    expect(projectDate(new Date('2026-12-02T03:30:00Z'))).toBe('2026-12-02');
  });
});
