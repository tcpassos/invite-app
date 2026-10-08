# front

Tier Front do invite-app, em Next.js. Renderiza o convite público no servidor e serve o painel do anfitrião. As pastas seguem os pacotes do front na seção 5.1 do DAS.

| Pasta | O que vai nela |
|---|---|
| `src/app` | As rotas do Next.js. Cada página busca o dado pelo `ApiClient` e entrega para a view |
| `src/controller` | O `ApiClient`, que já existe, e a lógica de tela, como a consulta periódica do ADR-0007 |
| `src/view` | Os componentes de tela do convite público e do painel |
| `src/templates` | Os templates em HTML e CSS do ADR-0009 |
| `public` | Arquivos servidos como estão, entre eles o `robots.txt` |

A view pode usar o controller, e o controller não conhece a view. `templates` não importa código nenhum. O lint verifica as duas regras e também recusa `pg`, `kysely` e `'use server'` dentro do front, porque o Next.js aqui é front-end apenas (ADR-0004).

## Comandos

Na raiz do repositório:

```bash
npm install
npm run build --workspace contract
npm test --workspace front
npm run dev --workspace front
```

O `dev` sobe em `http://localhost:3000`. Para falar com a API, ele precisa de `API_URL_INTERNAL` no lado do servidor e de `NEXT_PUBLIC_API_URL` no navegador. Rodando fora do compose, os dois apontam para `http://127.0.0.1:3001`.

## Como chamar a API

Sempre pelo `ApiClient`, nunca com `fetch` direto. Existem duas cópias dele, e a escolha depende de onde o código roda.

- `serverApi()`, em `server-api.ts`, para a leitura do convite público feita no servidor. Ela gera o `X-Request-Id` (ADR-0012) e usa o nome de serviço do compose. O arquivo importa `server-only`, então o build falha se uma tela do navegador tentar usá-lo.
- `browserApi`, em `browser-api.ts`, para o POST de resposta do convidado e para as rotas do painel. Manda o cookie de sessão junto.

Erro da API chega como `ApiRequestError`, e a tela decide pelo `code`. API fora do ar chega como `ApiUnavailableError`, que na leitura do convite vira a página de convite indisponível da seção 9.4 do Guia da Arquitetura.

A repetição automática é desligada por padrão. Só as quatro leituras e o `publish` podem pedir `retry: 'once'`, e o POST de resposta do convidado nunca pode, pela regra da mesma seção 9.4.

## As rotas de convite

`/i/{publicToken}` e `/r/{personalToken}` já saem com `X-Robots-Tag: noindex`, configurado em `next.config.mjs`, e o `robots.txt` bloqueia as duas.

O `Cache-Control: private, no-cache, no-store` não pode ser configurado ali, porque o Next sobrescreve esse cabeçalho em produção. Ele sai certo sozinho quando a página é dinâmica, e a página do convite é dinâmica por natureza, já que lê o token da rota a cada pedido. Quem escrever essas páginas confere com `curl -I` depois do build.
