// Configuração do Next.js do tier Front.
import { fileURLToPath } from 'node:url';

// As duas rotas que carregam token (ADR-0005). O Cache-Control delas não fica aqui,
// porque o Next sobrescreve esse cabeçalho em produção. Ele sai certo quando a
// página é dinâmica, e o README do front explica como garantir isso.
const tokenRoutes = ['/i/:token', '/r/:token'];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Gera um servidor Node enxuto para a imagem, com só as dependências usadas.
  output: 'standalone',
  // Raiz do monorepo, para o rastreio de arquivos achar o contract/.
  outputFileTracingRoot: fileURLToPath(new URL('..', import.meta.url)),
  poweredByHeader: false,
  async headers() {
    return tokenRoutes.map((source) => ({
      source,
      headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
    }));
  },
};

export default nextConfig;
