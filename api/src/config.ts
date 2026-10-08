// Configuração lida das variáveis de ambiente. Falha na subida, com mensagem clara,
// em vez de deixar a API rodar sem algo que ela vai precisar depois.
export interface AppConfig {
  port: number;
  databaseUrl: string;
}

export function readConfig(env: NodeJS.ProcessEnv): AppConfig {
  const missing = ['DATABASE_URL'].filter((name) => !env[name]);
  if (missing.length > 0) {
    throw new Error(`Variáveis de ambiente obrigatórias ausentes: ${missing.join(', ')}`);
  }
  const port = Number(env.PORT ?? 3000);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT precisa ser um número inteiro positivo');
  }
  return { port, databaseUrl: env.DATABASE_URL as string };
}
