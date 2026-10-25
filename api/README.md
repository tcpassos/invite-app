# api

Tier API do invite-app, em NestJS. As três camadas do ADR-0001 moram aqui, cada uma numa pasta, conforme a seção 5.1 do DAS.

| Pasta | O que vai nela |
|---|---|
| `src/presentation/public` | Controllers das rotas que o convidado alcança sem sessão |
| `src/presentation/authenticated` | Controllers das rotas do painel do anfitrião |
| `src/presentation/auth` | Entrada e cadastro do anfitrião |
| `src/presentation/common` | Filtro de erro, identificador de correlação, log, sessão, limite de taxa e leitura da forma do corpo |
| `src/domain` | Os serviços da tabela 4.2 do Guia, as regras da resposta, o catálogo de templates, o tempo do projeto, os erros, o gerador de token e a conferência de dono |
| `src/data` | Os três repositórios, com as operações da tabela 4.3 do Guia, e o acesso ao banco com Kysely (ADR-0014) |
| `src/model` | As classes do Diagrama de Classes e as projeções que atravessam as camadas, como as linhas do painel |

A regra de dependência entre essas pastas é verificada pelo lint. Se o Domínio importar da Apresentação, ou a Apresentação importar dos Dados, o `npm run lint` falha.

## Rotas, serviços e repositórios

Todas as rotas da tabela 4.1 do Guia da Arquitetura estão implementadas. Cada controller lê a forma do corpo, chama um serviço do Domínio e traduz o modelo devolvido para o tipo de `contract/`.

| Pacote | Controller | Serviço do Domínio | Rotas |
|---|---|---|---|
| `auth` | `AuthController` | `HostService` | `/auth/sign-up`, `sign-in`, `sign-out` e `session` |
| `authenticated` | `InviteController` | `InviteService` e `AttendanceService` | `/invites`, `/invites/{inviteId}`, `customization`, `publish`, `unpublish` e `attendance` |
| `authenticated` | `DietaryController` | `DietaryService` | `dietary-summary` e `dietary-notes.csv` |
| `public` | `PublicRsvpController` | `RsvpService`, e só os quatro serviços da seção 5.3 | `/public/invites/{publicToken}`, `rsvp` e `/public/responses/{personalToken}` |

O que mora onde, nos pontos em que é fácil errar:

- **As vagas de uma resposta** são calculadas no Domínio, em `seatsRequested`, e chegam prontas a `saveRsvpWithinCapacity`. A camada de Dados compara com o teto dentro da transação e não sabe que o talvez não ocupa vaga (Guia, 3.4).
- **Quem conta no painel**, sim e talvez, sai do Domínio como parâmetro `statuses`, e as categorias que exigem descrição saem do catálogo do banco. Nenhum dos dois está escrito em SQL (Guia, 4.3 e 6.3).
- **A data e a hora** chegam separadas e viram um instante no fuso do projeto na Apresentação, em `authenticated/invite-command.ts`. O Domínio compara por dia nesse fuso, em `domain/project-time.ts` (ADR-0013).
- **O CSV** é montado na Apresentação, em `authenticated/render-csv.ts`, com ponto e vírgula, BOM e o prefixo contra fórmula da medida 5 do ADR-0008.

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

**Forma do corpo**, em `presentation/common/parse-request.ts`. O controller lê o corpo com `asObject` e os campos com `optionalString`, `optionalInteger` e as outras. Campo no tipo errado vira 400, e inteiro que não cabe numa coluna `integer` do banco também. Campo ausente passa como `undefined`, porque ausência é a regra `required`, e quem recusa é o Domínio com 422. Faixa, conjunto de valores e tamanho também são do Domínio.

**Tokens**, em `domain/tokens.ts`. `generatePublicToken()` na publicação e `generatePersonalToken()` no registro da resposta. É o mesmo gerador, como o ADR-0011 pede.

**Conferência de dono**, em `domain/ownership.ts`. Todo serviço do painel faz `validateOwnership(await repo.findById(inviteId), hostId)`. Convite que não existe e convite de outro anfitrião saem pelo mesmo `NotInviteOwner`, que vira o mesmo 404.

**`InviteRepository`**, em `data/invite.repository.ts`. As operações seguem os nomes da tabela 4.3 do Guia, e as que vieram depois estão na mesma seção. Nenhuma decide regra de negócio: status, categorias e vagas chegam por parâmetro, e a recusa da escrita dentro do teto volta como valor, `CapacityExceeded` ou `InviteNotOpen`, para o Domínio dar nome a ela (Guia, 9.2).

## Como responder um erro

O Domínio levanta um dos erros de `src/domain/errors.ts`, e o filtro em `presentation/common` traduz no formato único da seção 9.3 do Guia da Arquitetura. Controller nenhum monta corpo de erro à mão, e nada que vem de dentro de uma exceção vai para a resposta.

## Testes de integração do banco

Três arquivos de teste precisam de um PostgreSQL de verdade e só rodam com `TEST_DATABASE_URL` definida. Sem ela, aparecem como pulados e o resto roda normalmente.

- `src/data/schema.spec.ts` confere o esquema.
- `src/data/invite.repository*.spec.ts` confere as consultas, inclusive o teto com respostas simultâneas.
- `src/presentation/routes.e2e.spec.ts` sobe a API inteira e percorre as rotas da tabela 4.1, inclusive o 404 igual para as situações de ausência da seção 9.5.

Para rodar na sua máquina, suba um banco descartável com as migrações aplicadas, numa porta separada para não mexer no banco do compose:

```bash
docker run --rm -d --name invite-teste-db -e POSTGRES_USER=teste -e POSTGRES_PASSWORD=teste -e POSTGRES_DB=teste -p 55432:5432 -v "$(pwd)/migrations:/docker-entrypoint-initdb.d:ro" postgres:17-alpine
```

E rode os testes apontando para ele:

```bash
TEST_DATABASE_URL=postgres://teste:teste@127.0.0.1:55432/teste npm test --workspace api
```

Para apagar o banco descartável: `docker rm -f invite-teste-db`.
