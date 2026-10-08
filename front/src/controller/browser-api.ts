// A cópia do ApiClient que roda no navegador: o POST de resposta do convidado e as
// rotas do painel. O endereço é o publicado no host, congelado na construção da
// imagem (Guia, 10.4). Sem X-Request-Id: aqui ele nasce na API (ADR-0012).
import { ApiClient } from './api-client';

export const browserApi = new ApiClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:3001',
  credentials: 'include',
});
