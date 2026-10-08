import { RATE_LIMITS, RateLimitGuard, RateLimitedException, SlidingWindow } from './rate-limit.js';

describe('SlidingWindow', () => {
  it('libera até o limite e diz quanto falta para a próxima vaga', () => {
    const window = new SlidingWindow(2, 1000);
    window.record('a', 0);
    window.record('a', 400);
    expect(window.wait('a', 500)).toBe(500);
    expect(window.wait('a', 1000)).toBe(0);
    expect(window.wait('b', 500)).toBe(0);
  });
});

describe('RateLimitGuard', () => {
  beforeEach(() => vi.useFakeTimers({ now: Date.UTC(2026, 9, 7, 12) }));
  afterEach(() => vi.useRealTimers());

  it('recusa a leitura acima do limite por token, com Retry-After em segundos', () => {
    const guard = new RateLimitGuard();
    for (let i = 0; i < RATE_LIMITS.publicRead.limit; i++) guard.enforceReadLimit('TOKEN');
    let erro: unknown;
    try {
      guard.enforceReadLimit('TOKEN');
    } catch (e) {
      erro = e;
    }
    expect(erro).toBeInstanceOf(RateLimitedException);
    expect((erro as RateLimitedException).getStatus()).toBe(429);
    expect((erro as RateLimitedException).retryAfterSeconds).toBe(60);
    expect(() => guard.enforceReadLimit('OUTRO')).not.toThrow();
  });

  it('conta só as entradas recusadas, e por email, sem diferenciar maiúscula', () => {
    const guard = new RateLimitGuard();
    for (let i = 0; i < 20; i++) guard.enforceSignInLimit('ana@exemplo.com', '1.1.1.1');
    for (let i = 0; i < RATE_LIMITS.signInEmail.limit; i++) {
      guard.recordSignInFailure(i % 2 ? 'ANA@exemplo.com' : 'ana@exemplo.com', `2.2.2.${i}`);
    }
    expect(() => guard.enforceSignInLimit('Ana@Exemplo.com', '3.3.3.3')).toThrow(
      RateLimitedException,
    );
    expect(() => guard.enforceSignInLimit('bia@exemplo.com', '3.3.3.3')).not.toThrow();
  });

  it('libera de novo quando a janela passa', () => {
    const guard = new RateLimitGuard();
    for (let i = 0; i < RATE_LIMITS.signUpOrigin.limit; i++) guard.enforceSignUpLimit('1.1.1.1');
    expect(() => guard.enforceSignUpLimit('1.1.1.1')).toThrow(RateLimitedException);
    vi.advanceTimersByTime(RATE_LIMITS.signUpOrigin.windowMs);
    expect(() => guard.enforceSignUpLimit('1.1.1.1')).not.toThrow();
  });
});
