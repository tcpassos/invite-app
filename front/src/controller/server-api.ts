// A cópia do ApiClient que roda no processo do tier Front, no caminho de leitura do
// convite público. Usa o nome de serviço do compose, que o navegador não resolve,
// e por isso este arquivo não pode ir para o bundle do navegador (Guia, 10.5).
import 'server-only';
import { randomBytes } from 'node:crypto';
import { ApiClient } from './api-client';

// O identificador de correlação nasce aqui e a API o reaproveita (ADR-0012).
const newRequestId = () => randomBytes(8).toString('hex');

export function serverApi(): ApiClient {
  const baseUrl = process.env.API_URL_INTERNAL;
  if (!baseUrl) throw new Error('API_URL_INTERNAL não está definida');
  return new ApiClient({ baseUrl, requestId: newRequestId });
}
