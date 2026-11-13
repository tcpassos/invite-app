import type { MockInstance } from 'vitest';
import { apiUrlInternal, frontOrigin } from './server-env';

let log: MockInstance<typeof console.error>;
beforeEach(() => {
  log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
});
afterEach(() => log.mockRestore());

const lines = () => log.mock.calls.map(([line]) => JSON.parse(String(line)));

describe('frontOrigin', () => {
  it('aceita o endereço público, com ou sem barra no fim e com espaço em volta', () => {
    const publico = 'https://front-production-5556.up.railway.app';
    expect(frontOrigin({ FRONT_ORIGIN: publico })?.origin).toBe(publico);
    expect(frontOrigin({ FRONT_ORIGIN: `${publico}/` })?.origin).toBe(publico);
    expect(frontOrigin({ FRONT_ORIGIN: ` ${publico} ` })?.origin).toBe(publico);
    expect(log).not.toHaveBeenCalled();
  });

  it('ausente, fica com o endereço local, como no compose', () => {
    expect(frontOrigin({})?.href).toBe('http://127.0.0.1:3000/');
    expect(log).not.toHaveBeenCalled();
  });

  it('sem esquema, vazia ou entre aspas, some e deixa uma linha de erro', () => {
    for (const valor of ['front-production-5556.up.railway.app', '', '"https://x.app"']) {
      expect(frontOrigin({ FRONT_ORIGIN: valor })).toBeUndefined();
    }
    expect(lines()).toHaveLength(3);
    expect(lines()[0]).toMatchObject({
      level: 'error',
      tier: 'front',
      variable: 'FRONT_ORIGIN',
      value: 'front-production-5556.up.railway.app',
    });
  });
});

describe('apiUrlInternal', () => {
  it('aceita o endereço da rede interna', () => {
    expect(apiUrlInternal({ API_URL_INTERNAL: 'http://api.railway.internal:3000' })).toBe(
      'http://api.railway.internal:3000/',
    );
    expect(log).not.toHaveBeenCalled();
  });

  it('ausente ou vazia, some e deixa uma linha de erro', () => {
    expect(apiUrlInternal({})).toBeUndefined();
    expect(apiUrlInternal({ API_URL_INTERNAL: ' ' })).toBeUndefined();
    expect(lines()).toEqual([
      expect.objectContaining({ message: 'API_URL_INTERNAL não está definida' }),
      expect.objectContaining({ message: 'API_URL_INTERNAL não está definida' }),
    ]);
  });

  it('sem http://, some e deixa uma linha de erro com o valor', () => {
    expect(apiUrlInternal({ API_URL_INTERNAL: 'api.railway.internal:3000' })).toBeUndefined();
    expect(lines()[0]).toMatchObject({
      variable: 'API_URL_INTERNAL',
      value: 'api.railway.internal:3000',
    });
  });
});
