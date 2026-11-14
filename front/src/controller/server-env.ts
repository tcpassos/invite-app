// Os endereços que o servidor do tier Front lê das variáveis de ambiente (Guia, 10.4).
// Valor fora do formato não derruba a página do convite nem a do link pessoal: vira
// ausência, com uma linha de erro em JSON na saída padrão dizendo qual variável conferir
// (ADR-0012). Sem 'server-only' de propósito, para o teste unitário importar.

/** O padrão do compose e do `npm run dev`, para o ambiente local seguir igual. */
const LOCAL_FRONT_ORIGIN = 'http://127.0.0.1:3000';

/** process.env, ou só as variáveis que o teste passa. */
type Env = Readonly<Record<string, string | undefined>>;

/**
 * Linha de erro do tier Front. Nunca leva token nem mensagem de exceção, que pode trazer
 * o caminho com o token dentro (ADR-0012).
 */
export function logServerError(fields: Record<string, unknown>): void {
  console.error(JSON.stringify({ level: 'error', tier: 'front', ...fields }));
}

function parseHttpUrl(name: string, value: string): URL | undefined {
  const url = URL.parse(value.trim());
  if (url && (url.protocol === 'http:' || url.protocol === 'https:')) return url;
  logServerError({
    message: `${name} precisa ser um endereço completo, com http:// ou https://`,
    variable: name,
    value,
  });
  return undefined;
}

/**
 * Base dos endereços absolutos da prévia do link (ADR-0009). Inválida, a prévia sai sem
 * base e a página abre mesmo assim. Ausente, vale o endereço local.
 */
export function frontOrigin(env: Env = process.env): URL | undefined {
  return parseHttpUrl('FRONT_ORIGIN', env.FRONT_ORIGIN ?? LOCAL_FRONT_ORIGIN);
}

/**
 * Endereço da API pela rede interna. Ausente ou inválido, quem chama trata como API fora
 * do ar, que vira a página de convite indisponível (Guia, 9.4).
 */
export function apiUrlInternal(env: Env = process.env): string | undefined {
  const value = env.API_URL_INTERNAL;
  if (!value?.trim()) {
    logServerError({ message: 'API_URL_INTERNAL não está definida', variable: 'API_URL_INTERNAL' });
    return undefined;
  }
  return parseHttpUrl('API_URL_INTERNAL', value)?.href;
}
