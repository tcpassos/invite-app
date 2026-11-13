import type { MockInstance } from 'vitest';
import { ApiUnavailableError } from './api-client';
import { readPublic } from './api-errors';
import { getPublishedInvite } from './public-invite';
import { serverApi } from './server-api';

// O pacote só existe para quebrar o build se este arquivo for parar no navegador.
vi.mock('server-only', () => ({}));

describe('serverApi', () => {
  let log: MockInstance<typeof console.error>;
  beforeEach(() => {
    log = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    log.mockRestore();
    vi.unstubAllEnvs();
  });

  it('sem API_URL_INTERNAL, a leitura falha como API fora do ar, sem exceção solta', async () => {
    vi.stubEnv('API_URL_INTERNAL', undefined);
    const fetch = vi.spyOn(globalThis, 'fetch');
    const leitura = getPublishedInvite(serverApi(), 'TOKEN-QUE-NAO-VAI-PARA-O-LOG');
    await expect(leitura).rejects.toBeInstanceOf(ApiUnavailableError);
    expect(fetch).not.toHaveBeenCalled();
    fetch.mockRestore();
  });

  it('a página recebe o caso de convite indisponível e o log não leva o token', async () => {
    vi.stubEnv('API_URL_INTERNAL', 'api.railway.internal:3000');
    const outcome = await readPublic(getPublishedInvite(serverApi(), 'TOKEN-SECRETO'));
    expect(outcome).toEqual({ kind: 'unavailable' });
    const saida = log.mock.calls.map(([line]) => String(line)).join('\n');
    expect(saida).toContain('API_URL_INTERNAL');
    expect(saida).toContain('leitura pública sem resposta da API');
    expect(saida).not.toContain('TOKEN-SECRETO');
  });
});
