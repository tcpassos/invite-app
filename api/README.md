# api

Tier API do invite-app, em NestJS. As três camadas do ADR-0001 moram aqui, cada uma numa pasta, conforme a seção 5.1 do DAS.

| Pasta | O que vai nela |
|---|---|
| `src/presentation/public` | Controllers das rotas que o convidado alcança sem sessão |
| `src/presentation/authenticated` | Controllers das rotas do painel do anfitrião |
| `src/presentation/auth` | Entrada e cadastro do anfitrião |
| `src/presentation/common` | Filtro de erro, identificador de correlação, log, sessão e limite de taxa. Tudo já existe |
| `src/domain` | Serviços e regras de negócio. Já existem os erros, o gerador de token e a conferência de dono |
| `src/data` | Repositórios e o acesso ao banco com Kysely (ADR-0014). Já existe a parte compartilhada do `InviteRepository` |
| `src/model` | As classes do Diagrama de Classes, todas já escritas |

A regra de dependência entre essas pastas é verificada pelo lint. Se o Domínio importar da Apresentação, ou a Apresentação importar dos Dados, o `npm run lint` falha.

## Comandos

Na raiz do repositório:

```bash
npm install
npm run build --workspace contract
npm test --workspace api
npm run dev --workspace api
```

O `dev` precisa de `DATABASE_URL` e de `FRONT_ORIGIN`, o endereço do front de onde o navegador chama a API. O jeito mais simples de ter tudo é subir pelo compose, na raiz:

```bash
docker compose up db api
```

## Peças compartilhadas

Estas peças são usadas por mais de uma parte e já estão prontas. Use em vez de escrever a sua.

**Sessão do anfitrião**, em `presentation/common/session.ts`.

- Rota do painel: `@UseGuards(SessionGuard)` no controller ou no método, e `@HostId() hostId: string` no parâmetro. Sem sessão válida, a resposta é 401 `UNAUTHENTICATED`, e com sessão válida a janela de 30 minutos é renovada sozinha.
- Entrada e cadastro: depois que o Domínio devolve o anfitrião, o controller chama `sessionCookie.issue(res, host.id)`. Na saída, `sessionCookie.clear(res)`. Use `@Res({ passthrough: true })` para continuar devolvendo o corpo normalmente.

**Limite de taxa**, em `presentation/common/rate-limit.ts`. Injete `RateLimitGuard` e chame na ordem certa, porque a seção 9.5 do Guia proíbe o 429 de revelar que um token existe.

| Rota | Antes de resolver o token | Depois de resolver o token |
|---|---|---|
| Leitura pública, do convite ou do link pessoal | Nada | `enforceReadLimit(token)` |
| Escrita pública, do convite ou do link pessoal | `enforceOriginLimit(clientIp(req))` | `enforceWriteLimit(token)` |
| Entrada do anfitrião | `enforceSignInLimit(email, clientIp(req))` | `recordSignInFailure(email, clientIp(req))` quando o Domínio recusa |
| Cadastro do anfitrião | `enforceSignUpLimit(clientIp(req))` | Nada |

Rodando no Docker Desktop, todas as requisições do navegador chegam à API com o mesmo endereço, o do gateway da rede do Docker. Então, na sua máquina, os limites por endereço contam você e qualquer outra aba como uma pessoa só.

**Forma do corpo**, em `presentation/common/parse-request.ts`. O controller lê o corpo com `asObject` e os campos com `optionalString`, `optionalInteger` e as outras. Campo no tipo errado vira 400. Campo ausente passa como `undefined`, porque ausência é a regra `required`, e quem recusa é o Domínio com 422. Faixa, conjunto de valores e tamanho também são do Domínio.

**Tokens**, em `domain/tokens.ts`. `generatePublicToken()` na publicação e `generatePersonalToken()` no registro da resposta. É o mesmo gerador, como o ADR-0011 pede.

**Conferência de dono**, em `domain/ownership.ts`. Todo serviço do painel faz `validateOwnership(await repo.findById(inviteId), hostId)`. Convite que não existe e convite de outro anfitrião saem pelo mesmo `NotInviteOwner`, que vira o mesmo 404.

**`InviteRepository`**, em `data/invite.repository.ts`. `findById` e `findPublishedByPublicToken` já existem. Cada parte acrescenta as próprias operações no bloco marcado com o número dela, no fim da classe, para os PRs não disputarem as mesmas linhas.

## Como responder um erro

O Domínio levanta um dos erros de `src/domain/errors.ts`, e o filtro em `presentation/common` traduz no formato único da seção 9.3 do Guia da Arquitetura. Controller nenhum monta corpo de erro à mão, e nada que vem de dentro de uma exceção vai para a resposta.

## Testes de integração do banco

`src/data/schema.spec.ts` confere o esquema contra um PostgreSQL de verdade e só roda com `TEST_DATABASE_URL` definida. Sem ela, os testes aparecem como pulados e o resto roda normalmente.

Para rodar na sua máquina, suba um banco descartável com as migrações aplicadas, numa porta separada para não mexer no banco do compose:

```bash
docker run --rm -d --name invite-teste-db -e POSTGRES_USER=teste -e POSTGRES_PASSWORD=teste -e POSTGRES_DB=teste -p 55432:5432 -v "$(pwd)/migrations:/docker-entrypoint-initdb.d:ro" postgres:17-alpine
```

E rode os testes apontando para ele:

```bash
TEST_DATABASE_URL=postgres://teste:teste@127.0.0.1:55432/teste npm test --workspace api
```

Para apagar o banco descartável: `docker rm -f invite-teste-db`.
