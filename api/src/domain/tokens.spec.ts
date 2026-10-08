import { generatePersonalToken, generatePublicToken } from './tokens.js';

describe('tokens públicos', () => {
  it('têm 26 caracteres do alfabeto Crockford, sem I, L, O e U', () => {
    for (let i = 0; i < 200; i++) {
      expect(generatePublicToken()).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    }
  });

  it('cabem em 128 bits, então o primeiro caractere vai de 0 a 7', () => {
    for (let i = 0; i < 200; i++) {
      expect(generatePersonalToken()[0]).toMatch(/[0-7]/);
    }
  });

  it('não se repetem', () => {
    const vistos = new Set(Array.from({ length: 5000 }, () => generatePublicToken()));
    expect(vistos.size).toBe(5000);
  });
});
