# front

Tier Front do invite-app, em Next.js. Renderiza o convite público no servidor e serve o painel do anfitrião. As pastas seguem os pacotes do front na seção 5.1 do DAS.

| Pasta | O que vai nela |
|---|---|
| `src/app` | As rotas do Next.js. Cada página busca o dado pelo `ApiClient` e entrega para a view |
| `src/controller` | O `ApiClient`, as operações de cada rota da API, a leitura dos erros e a consulta periódica do ADR-0007 |
| `src/view` | Os componentes de tela do convite público e do painel |
| `src/templates` | Os templates em HTML e CSS do ADR-0009 |
| `public` | Arquivos servidos como estão, entre eles o `robots.txt` |
| `mock` | O mock da API para desenvolver as telas. Não entra na imagem |

A view pode usar o controller, e o controller não conhece a view. `templates` não importa código nenhum. O lint verifica as duas regras e também recusa `pg`, `kysely` e `'use server'` dentro do front, porque o Next.js aqui é front-end apenas (ADR-0004).

## As telas

| Rota | O que é | Casos de uso |
|---|---|---|
| `/` | Página inicial | Nenhum |
| `/sign-in` | Entrada e cadastro do anfitrião | UC001 |
| `/invites` | Lista de convites e criação | UC002 |
| `/invites/{inviteId}` | Correção do rascunho, personalização com prévia, publicação, lista de presença e restrições | UC002 A2, UC003, UC004, UC007 e UC008 |
| `/i/{publicToken}` | O convite público e a resposta do convidado | UC005 e UC006 |
| `/r/{personalToken}` | O link pessoal, para ver e alterar a resposta | UC005 ED2 e RN3 |
| `/invite-not-found` | A rota de não encontrado do ADR-0008, para onde o token que não resolve é redirecionado | Nenhum |

As cores e os textos do painel vêm de `src/app/globals.css`, com Tailwind. As cores do convite vêm do template escolhido, em `src/templates`, e o catálogo dos templates fica em `contract/src/templates.ts`, porque a API valida a escolha. Acrescentar um template muda os dois no mesmo PR.

## Comandos

Na raiz do repositório:

```bash
npm install
npm run build --workspace contract
npm test --workspace front
npm run dev --workspace front
```

O `dev` sobe na porta 3000. Abra pelo endereço `http://127.0.0.1:3000`, e não por `localhost`, porque é o nome que a API aceita e o cookie de sessão depende disso (Guia da Arquitetura, 10.4). Para falar com a API, ele precisa de `API_URL_INTERNAL` no lado do servidor e de `NEXT_PUBLIC_API_URL` no navegador. Rodando fora do compose, os dois apontam para `http://127.0.0.1:3001`.

## O mock da API

Enquanto as rotas da API não ficam prontas, `mock/mock-api.ts` responde as rotas da tabela 4.1 do Guia com os tipos de `contract/` e com o formato de erro da seção 9.3, inclusive as recusas, para as telas de erro também existirem antes da integração. Os dados ficam na memória e somem quando ele para. Ele não é referência das regras: quem decide de verdade é a API.

Em dois terminais, na raiz do repositório:

```bash
npm run mock --workspace front
```

```bash
API_URL_INTERNAL=http://127.0.0.1:3001 npm run dev --workspace front
```

O mock usa a porta 3001, então o `api` do compose não pode estar de pé ao mesmo tempo. Ele já sobe com o anfitrião `demo@convite.dev`, senha `senha1234`, e com um convite publicado em `http://127.0.0.1:3000/i/DEMO0000000000000000000000`.

## Como chamar a API

Sempre pelo `ApiClient`, nunca com `fetch` direto. As operações de cada rota já estão tipadas em `src/controller/public-invite.ts`, para a superfície pública, e em `src/controller/host-panel.ts`, para o painel. Existem duas cópias do cliente, e a escolha depende de onde o código roda.

- `serverApi()`, em `server-api.ts`, para a leitura do convite público e do link pessoal, feitas no servidor. Ela gera o `X-Request-Id` (ADR-0012) e usa o nome de serviço do compose. O arquivo importa `server-only`, então o build falha se uma tela do navegador tentar usá-lo.
- `browserApi`, em `browser-api.ts`, para a resposta do convidado e para as rotas do painel. Manda o cookie de sessão junto.

Erro da API chega como `ApiRequestError`, e a tela decide pelo `code`, com `fieldErrors` para apontar o campo recusado. API fora do ar chega como `ApiUnavailableError`, que na leitura do convite vira a página de convite indisponível da seção 9.4 do Guia da Arquitetura. O `readPublic`, em `api-errors.ts`, faz essa escolha para as duas páginas de token.

A repetição automática é desligada por padrão. Só as quatro leituras e o `publish` podem pedir `retry: 'once'`, e o POST de resposta do convidado nunca pode, pela regra da mesma seção 9.4. Quando a resposta falha sem a API dizer o que aconteceu, o formulário continua preenchido e avisa que reenviar pode duplicar o nome na lista.

## As rotas de convite

`/i/{publicToken}` e `/r/{personalToken}` já saem com `X-Robots-Tag: noindex`, configurado em `next.config.mjs`, e o `robots.txt` bloqueia as duas.

O `Cache-Control: private, no-cache, no-store` não pode ser configurado ali, porque o Next sobrescreve esse cabeçalho em produção. Ele sai certo sozinho quando a página é dinâmica, e a página do convite é dinâmica por natureza, já que lê o token da rota a cada pedido. Quem mexer nessas páginas confere com `curl -I` depois do build.
