// A cópia do ApiClient que roda no processo do tier Front, no caminho de leitura do convite
// público e do link pessoal. Usa o nome de serviço do compose, que o navegador não resolve,
// e por isso este arquivo não pode ir para o bundle do navegador (Guia, 10.5).
import 'server-only';
import { randomBytes } from 'node:crypto';
import { ApiClient } from './api-client';
import { apiUrlInternal } from './server-env';

// O identificador de correlação nasce aqui e a API o reaproveita (ADR-0012).
const newRequestId = () => randomBytes(8).toString('hex');

// Sem endereço da API, a chamada falha como rede caída, e não como exceção solta que vira
// o erro genérico do Next. O motivo já foi para o log em apiUrlInternal.
const noApiAddress: typeof fetch = () =>
  Promise.reject(new Error('API_URL_INTERNAL ausente ou inválida'));

export function serverApi(): ApiClient {
  const baseUrl = apiUrlInternal();
  // Salto 2 do Guia, 9.4: o tier Front desiste antes do convidado, para servir a página de
  // convite indisponível em vez do erro do navegador. Com a repetição, são até 8 segundos.
  return new ApiClient({
    baseUrl: baseUrl ?? 'http://api-url-internal.invalid',
    fetch: baseUrl ? undefined : noApiAddress,
    requestId: newRequestId,
    timeoutMs: 4_000,
  });
}
