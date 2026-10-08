import type { ApiError } from '@invite-app/contract';
import { ApiClient, ApiRequestError, ApiUnavailableError } from './api-client';

const apiError: ApiError = {
  code: 'NOT_FOUND',
  message: 'Não encontrado.',
  traceId: 'a1b2c3d4e5f60718',
};

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function client(fetch: typeof globalThis.fetch, requestId?: () => string) {
  return new ApiClient({ baseUrl: 'http://api:3000', fetch, requestId });
}

describe('ApiClient', () => {
  it('devolve o corpo da resposta de sucesso', async () => {
    const fetch = vi.fn().mockResolvedValue(json(200, { eventName: 'Aniversário' }));
    await expect(client(fetch).request('GET', '/public/invites/abc')).resolves.toEqual({
      eventName: 'Aniversário',
    });
    const [url, init] = fetch.mock.calls[0]!;
    expect(String(url)).toBe('http://api:3000/public/invites/abc');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
  });

  it('manda o X-Request-Id só quando há gerador, e o corpo como JSON', async () => {
    const fetch = vi.fn().mockResolvedValue(json(201, {}));
    await client(fetch, () => '0123456789abcdef').request('POST', '/x', { body: { a: 1 } });
    const init = fetch.mock.calls[0]![1];
    expect(init.headers['x-request-id']).toBe('0123456789abcdef');
    expect(init.headers['content-type']).toBe('application/json');
    expect(init.body).toBe('{"a":1}');

    await client(fetch).request('GET', '/x');
    expect(fetch.mock.calls[1]![1].headers).not.toHaveProperty('x-request-id');
  });

  it('transforma o corpo de erro da API em ApiRequestError com o code', async () => {
    const fetch = vi.fn().mockResolvedValue(json(404, apiError));
    const erro = await client(fetch)
      .request('GET', '/x')
      .catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ApiRequestError);
    expect((erro as ApiRequestError).code).toBe('NOT_FOUND');
    expect((erro as ApiRequestError).status).toBe(404);
  });

  it('trata resposta fora do formato de erro como API indisponível', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(new Response('<html>Bad Gateway</html>', { status: 502 }));
    await expect(client(fetch).request('GET', '/x')).rejects.toBeInstanceOf(ApiUnavailableError);
  });

  it('não repete por padrão quando a rede falha', async () => {
    const fetch = vi.fn().mockRejectedValue(new TypeError('fetch failed'));
    const erro = await client(fetch, () => 'ffffffffffffffff')
      .request('POST', '/public/invites/abc/rsvp', { body: {} })
      .catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(ApiUnavailableError);
    expect((erro as ApiUnavailableError).requestId).toBe('ffffffffffffffff');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('repete uma vez quando pedido, só em falha de transporte', async () => {
    const transporte = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce(json(200, { ok: true }));
    await expect(client(transporte).request('GET', '/x', { retry: 'once' })).resolves.toEqual({
      ok: true,
    });
    expect(transporte).toHaveBeenCalledTimes(2);

    const quinhentos = vi
      .fn()
      .mockResolvedValue(json(500, { ...apiError, code: 'INTERNAL_ERROR' }));
    await expect(client(quinhentos).request('GET', '/x', { retry: 'once' })).rejects.toBeInstanceOf(
      ApiRequestError,
    );
    expect(quinhentos).toHaveBeenCalledTimes(1);
  });
});
