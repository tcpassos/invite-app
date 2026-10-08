// ApiClient do DAS, seção 5.2: o ponto único por onde o front fala com a API.
// Cada parte acrescenta aqui, ou num arquivo ao lado, as operações das rotas que
// implementa, tipadas pelo contract. Tela nenhuma chama fetch direto.
import { ErrorCode, REQUEST_ID_HEADER, type ApiError } from '@invite-app/contract';

/**
 * A API respondeu com o corpo de erro da seção 9.3 do Guia da Arquitetura.
 * A tela decide pelo `code`, nunca pela mensagem.
 */
export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    readonly body: ApiError,
  ) {
    super(body.code);
    this.name = 'ApiRequestError';
  }

  get code(): ErrorCode {
    return this.body.code;
  }
}

/**
 * A API não respondeu, ou respondeu algo fora do formato de erro. Na leitura do
 * convite público é o caso da página de convite indisponível (Guia, 9.4).
 */
export class ApiUnavailableError extends Error {
  constructor(
    readonly requestId: string | undefined,
    options?: { cause?: unknown },
  ) {
    super('API indisponível', options);
    this.name = 'ApiUnavailableError';
  }
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  body?: unknown;
  /**
   * Repetição automática, só para falha de transporte e nunca para resposta 500.
   * Pela regra da seção 9.4 do Guia, vale 'once' apenas nas quatro leituras e em
   * POST /invites/{inviteId}/publish. O padrão é não repetir, e o POST de resposta
   * do convidado nunca pode mudar isso.
   */
  retry?: 'never' | 'once';
}

export interface ApiClientOptions {
  baseUrl: string;
  /** Gera o X-Request-Id da chamada. Só a cópia do tier Front usa (ADR-0012). */
  requestId?: () => string;
  /** 'include' no navegador, para o cookie de sessão do anfitrião ir junto (ADR-0010). */
  credentials?: RequestCredentials;
  fetch?: typeof fetch;
}

const ERROR_CODES = new Set<string>(Object.values(ErrorCode));

export function isApiError(value: unknown): value is ApiError {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.code === 'string' &&
    ERROR_CODES.has(v.code) &&
    typeof v.message === 'string' &&
    typeof v.traceId === 'string'
  );
}

export class ApiClient {
  private readonly fetch: typeof fetch;

  constructor(private readonly options: ApiClientOptions) {
    this.fetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  async request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
    const attempts = options.retry === 'once' ? 2 : 1;
    let lastFailure: ApiUnavailableError | undefined;
    for (let attempt = 0; attempt < attempts; attempt++) {
      const requestId = this.options.requestId?.();
      let response: Response;
      try {
        response = await this.fetch(new URL(path, this.options.baseUrl), {
          method,
          headers: this.headers(requestId, options.body !== undefined),
          body: options.body === undefined ? undefined : JSON.stringify(options.body),
          credentials: this.options.credentials,
          cache: 'no-store',
        });
      } catch (cause) {
        lastFailure = new ApiUnavailableError(requestId, { cause });
        continue;
      }
      return this.read<T>(response, requestId);
    }
    throw lastFailure;
  }

  private headers(requestId: string | undefined, hasBody: boolean): HeadersInit {
    const headers: Record<string, string> = { accept: 'application/json' };
    if (hasBody) headers['content-type'] = 'application/json';
    if (requestId) headers[REQUEST_ID_HEADER] = requestId;
    return headers;
  }

  private async read<T>(response: Response, requestId: string | undefined): Promise<T> {
    if (response.status === 204) return undefined as T;
    const body: unknown = await response.json().catch(() => undefined);
    if (response.ok) return body as T;
    if (isApiError(body)) throw new ApiRequestError(response.status, body);
    throw new ApiUnavailableError(requestId);
  }
}
