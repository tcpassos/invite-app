import { nextPollDelay, POLL_INTERVAL_MS, POLL_MAX_INTERVAL_MS } from './polling';

describe('nextPollDelay', () => {
  it('fica no intervalo do ADR-0007 sem falha e na primeira falha', () => {
    expect(POLL_INTERVAL_MS).toBeGreaterThanOrEqual(15_000);
    expect(POLL_INTERVAL_MS).toBeLessThanOrEqual(30_000);
    expect(nextPollDelay(0)).toBe(POLL_INTERVAL_MS);
    expect(nextPollDelay(1)).toBe(POLL_INTERVAL_MS);
  });

  it('dobra a partir da segunda falha seguida, até dois minutos', () => {
    expect(nextPollDelay(2)).toBe(POLL_INTERVAL_MS * 2);
    expect(nextPollDelay(3)).toBe(POLL_INTERVAL_MS * 4);
    expect(nextPollDelay(4)).toBe(POLL_MAX_INTERVAL_MS);
    expect(nextPollDelay(50)).toBe(POLL_MAX_INTERVAL_MS);
  });

  it('em dez minutos de API fora do ar faz bem menos que quarenta pedidos (Guia, 9.4)', () => {
    let elapsed = 0;
    let requests = 0;
    for (let failures = 1; elapsed < 600_000; failures++) {
      requests += 1;
      elapsed += nextPollDelay(failures);
    }
    expect(requests).toBeLessThanOrEqual(10);
  });
});
