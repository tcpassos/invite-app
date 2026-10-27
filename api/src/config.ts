// Configuração lida das variáveis de ambiente. Falha na subida, com mensagem clara,
// em vez de deixar a API rodar sem algo que ela vai precisar depois.
export interface AppConfig {
  port: number;
  databaseUrl: string;
  frontOrigin: string;
  sessionSecret: string;
  /** SESSION_COOKIE_CROSS_SITE=true: cookie com SameSite=None e Secure (ADR-0015). */
  crossSiteCookie: boolean;
  /** TRUST_PROXY: quantos proxies confiáveis há na frente da API, para o IP de origem (ADR-0015). */
  trustProxy: number;
}

export function readConfig(env: NodeJS.ProcessEnv): AppConfig {
  const missing = ['DATABASE_URL', 'FRONT_ORIGIN', 'SESSION_SECRET'].filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`);
  }
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT precisa ser um número inteiro positivo');
  }
  const trustProxy = Number(env.TRUST_PROXY ?? 0);
  if (!Number.isInteger(trustProxy) || trustProxy < 0) {
    throw new Error('TRUST_PROXY precisa ser um número inteiro, zero ou maior');
  }
  return {
    port,
    databaseUrl: env.DATABASE_URL as string,
    frontOrigin: env.FRONT_ORIGIN as string,
    sessionSecret: env.SESSION_SECRET as string,
    crossSiteCookie: env.SESSION_COOKIE_CROSS_SITE === 'true',
    trustProxy,
  };
}
