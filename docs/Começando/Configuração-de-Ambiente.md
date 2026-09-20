# Configuração de Ambiente

Como subir o invite-app na sua máquina. O ambiente inteiro roda em containers, conforme o [ADR-0003](../Sprints/Sprint-2/Decisões-Arquiteturais/0003-Ambiente-de-execução.md), e não há nada para instalar além do Docker.

A topologia que este arquivo materializa está no [Diagrama de Implantação](../Sprints/Sprint-2/Diagrama-de-Implantação.md). O `docker-compose.yml` fica na raiz do repositório.

## Pré-requisitos

Docker com Compose v2 ou mais novo. Testado com Docker 29.3 e Compose v5.

    docker version
    docker compose version

Nada de Node, de npm e de PostgreSQL instalados na máquina. Tudo isso mora dentro dos containers.

## Primeira vez

**1. Copie o arquivo de exemplo e preencha.**

    cp .env.example .env

O `.env` não vai para o repositório, e o `.gitignore` já cuida disso. Troque pelo menos dois valores:

- `POSTGRES_PASSWORD`, a senha do banco.
- `SESSION_SECRET`, o segredo que assina o cookie de sessão do anfitrião ([ADR-0010](../Sprints/Sprint-2/Decisões-Arquiteturais/0010-Autenticação-do-anfitrião.md)). Gere um valor aleatório:

      node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"

**2. Suba o ambiente.**

    docker compose up

**O que sobe hoje é só o banco**, porque o código da aplicação começa na Sprint 3 e as pastas `front/` e `api/` ainda não existem. Até lá, use:

    docker compose up db

Quando as duas pastas existirem, `docker compose up` sobe os três de uma vez, na ordem `db`, `api`, `front`.

## Comandos do dia a dia

| O que fazer | Comando |
|---|---|
| Subir em segundo plano | `docker compose up -d` |
| Ver o que está de pé | `docker compose ps` |
| Acompanhar o log | `docker compose logs -f` |
| Log de um serviço só | `docker compose logs -f api` |
| Entrar no banco | `docker compose exec db psql -U invite_app -d invite_app` |
| Parar sem apagar dados | `docker compose down` |
| Parar e apagar os dados | `docker compose down -v` |
| Reconstruir depois de mudar código | `docker compose up --build` |

## Os três serviços

| Serviço | O que é | Endereço no navegador | Endereço entre containers |
|---|---|---|---|
| `front` | Processo Next.js que renderiza o convite público | `http://127.0.0.1:3000` | `http://front:3000` |
| `api` | Processo NestJS com as três camadas | `http://127.0.0.1:3001` | `http://api:3000` |
| `db` | PostgreSQL | Não alcançável | `db:5432` |

**O `db` não publica porta de propósito.** Nada fora da rede do compose precisa alcançar o banco, e quem precisa inspecionar entra pelo `docker compose exec`. Está na seção 5.3 do Diagrama de Implantação.

**São dois serviços publicados e não um.** O `front` porque o navegador pede a página do convite, e a `api` porque o POST de confirmação de presença sai do navegador direto para ela, sem passar pelo front.

## As variáveis de ambiente

| Variável | Quem usa | Para quê |
|---|---|---|
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` | `db` e `api` | Credencial do banco. A `api` monta a `DATABASE_URL` a partir delas |
| `SESSION_SECRET` | `api` | Assina o cookie de sessão do anfitrião (ADR-0010) |
| `NEXT_PUBLIC_API_URL` | `front`, na **construção** da imagem | Endereço da API como o navegador a alcança |
| `NODE_ENV` | `api` e `front` | Modo de execução |
| `IMAGE_TAG` | `api` e `front` | Etiqueta das imagens construídas. Padrão `dev` |

## A armadilha dos dois endereços

Vale ler antes de mexer na configuração do front, porque o sintoma é confuso.

**A API tem dois endereços, e qual usar depende de quem chama.** O processo do `front`, rodando dentro da rede do compose, chama `http://api:3000` e usa a resolução por nome de serviço. O navegador **não** está na rede do compose, não resolve aquele nome, e chama `http://127.0.0.1:3001`.

> **Se `api:3000` aparecer em código entregue ao navegador, o convite quebra na máquina do convidado sem quebrar o build nem o teste.**

Por isso são duas variáveis. A `API_URL_INTERNAL` fica fixa no `docker-compose.yml` e a `NEXT_PUBLIC_API_URL` vem do `.env`.

**A `NEXT_PUBLIC_API_URL` é argumento de construção, não variável de execução.** O Next.js congela tudo que começa com `NEXT_PUBLIC_` no momento da compilação. Mudar o valor no `.env` não tem efeito nenhum sobre uma imagem já construída, e é preciso reconstruir:

    docker compose up --build front

## Quando o esquema do banco mudar

As migrações ficam em `migrations/` e o container `db` as executa na inicialização. **A imagem do PostgreSQL só roda aquele diretório quando o volume está vazio**, então uma migração nova não é aplicada sozinha.

    docker compose down -v
    docker compose up db

Isso **apaga os dados**. É aceitável enquanto o ADR-0003 valer, porque o ambiente é de desenvolvimento e não guarda nada que precise ser conservado. O custo está registrado na seção 8.1 do Diagrama de Implantação, e a escolha cai no dia em que houver dado que não pode ser perdido.

## Se alguma coisa não subir

**A porta já está em uso.** Alguma outra coisa na máquina ocupa a 3000 ou a 3001. Descubra o que é, ou mude o lado esquerdo do mapeamento no `docker-compose.yml`. O lado direito é a porta dentro do container e não muda.

**A `api` não sobe e o log fala do banco.** Ela espera o `db` ficar saudável antes de iniciar, conforme o `HEALTHCHECK` que o [ADR-0002](../Sprints/Sprint-2/Decisões-Arquiteturais/0002-Empacotamento-em-tiers.md) exige. Se o `db` não fica saudável, o problema é ele, e `docker compose logs db` mostra.

**O convite abre mas o formulário não envia.** Provável endereço errado no bundle do navegador. Confira a `NEXT_PUBLIC_API_URL` e reconstrua a imagem do front.

**Mudei o `.env` e nada mudou.** Variável de execução exige recriar o container, com `docker compose up -d`. Argumento de construção exige reconstruir, com `--build`.
