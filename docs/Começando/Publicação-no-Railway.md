# Publicação no Railway

Como publicar os três tiers no Railway para a demonstração. A decisão e o que ela muda estão no [ADR-0015](../Sprints/Sprint-2/Decisões-Arquiteturais/0015-Publicação-para-a-demonstração.md). O ambiente local continua sendo o do [compose](Configuração-de-Ambiente.md).

São três serviços num projeto só: `Postgres`, `api` e `front`. Os nomes importam, porque o endereço da rede privada sai do nome do serviço.

## 1. Projeto e banco

1. No Railway, **New Project → Deploy PostgreSQL**. O serviço se chama `Postgres`.

As tabelas não são criadas aqui: quem cria é o comando de pré-deploy da API, no passo 2.

## 2. API

1. **New → GitHub Repo**, escolha o repositório. Renomeie o serviço para `api`.
2. Em **Settings → Source**, escolha a branch que tem este arquivo.
3. Em **Variables**:

   | Variável                    | Valor                                                                                         |
   | --------------------------- | --------------------------------------------------------------------------------------------- |
   | `RAILWAY_DOCKERFILE_PATH`   | `api/Dockerfile`                                                                              |
   | `PORT`                      | `3000`                                                                                        |
   | `NODE_ENV`                  | `production`                                                                                  |
   | `DATABASE_URL`              | `${{Postgres.DATABASE_URL}}`                                                                  |
   | `SESSION_SECRET`            | um valor novo: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
   | `SESSION_COOKIE_CROSS_SITE` | `true`                                                                                        |
   | `TRUST_PROXY`               | `1`                                                                                           |
   | `FRONT_ORIGIN`              | o endereço do front, preenchido no passo 4                                                    |

4. Em **Settings → Deploy → Pre-deploy Command**, coloque `node api/dist/migrate.js`. Antes de cada deploy, ele aplica os scripts de `migrations/` se o banco estiver vazio, e não faz nada se já houver tabelas. No log do deploy aparece uma linha por migração aplicada.
5. Em **Settings → Networking → Generate Domain**, com a porta `3000`. Anote o endereço, por exemplo `https://api-xxxx.up.railway.app`.

## 3. Front

1. **New → GitHub Repo**, o mesmo repositório. Renomeie o serviço para `front`, e escolha a mesma branch em **Settings → Source**.
2. Em **Settings → Networking → Generate Domain**, com a porta `3000`. Anote o endereço, por exemplo `https://front-xxxx.up.railway.app`.
3. Em **Variables**:

   | Variável                  | Valor                                                     |
   | ------------------------- | --------------------------------------------------------- |
   | `RAILWAY_DOCKERFILE_PATH` | `front/Dockerfile`                                        |
   | `PORT`                    | `3000`                                                    |
   | `NODE_ENV`                | `production`                                              |
   | `NEXT_PUBLIC_API_URL`     | o endereço público da API, sem barra no fim               |
   | `API_URL_INTERNAL`        | `http://api.railway.internal:3000`                        |
   | `FRONT_ORIGIN`            | o endereço público do front, sem barra no fim             |

   O `NEXT_PUBLIC_API_URL` entra no build, porque o Next.js o congela no código do navegador. Trocar esse valor exige um novo deploy do front.

## 4. Fechar a volta

1. Na `api`, preencha `FRONT_ORIGIN` com o endereço público do front, sem barra no fim. A API só aceita chamada do navegador vinda dessa origem.
2. Faça um novo deploy dos dois serviços, para pegarem as variáveis.

## 5. Conferir antes da apresentação

- `https://<api>/` responde, mesmo que com 404: o serviço está no ar.
- No front, criar uma conta e entrar, **no Chrome, no Edge ou no Firefox, em janela normal**. Se entrar e cair de volta na tela de entrada, o cookie não está indo: confira `SESSION_COOKIE_CROSS_SITE`, `FRONT_ORIGIN` e o navegador.
- Criar e publicar um convite, abrir o link no celular e responder.
- Nos logs da `api`, cada requisição sai numa linha JSON (ADR-0012).

## O que não muda

- O esquema só é criado em banco vazio, como no compose. Uma migração acrescentada depois exige um banco novo.
