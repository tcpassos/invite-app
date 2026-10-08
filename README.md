# invite-app

Convites virtuais com confirmação de presença e observação alimentar por convidado. O anfitrião cria e personaliza o convite, compartilha um link, e acompanha no painel quem vai, quantas pessoas leva e o que cada um não pode comer, com exportação para o buffet.

A documentação do projeto fica em [`docs/`](docs/Proposta-de-Trabalho.md) e é publicada na wiki do Azure DevOps.

## Como subir o app na sua máquina

O app roda inteiro em containers: o front, a API e o banco. Para testar, você só precisa do Docker.

### O que precisa estar instalado

- **Docker Desktop**, ou Docker com Compose v2, **aberto e rodando** antes de qualquer comando.
- **Git**, para baixar o repositório.
- As portas **3000** e **3001** livres na sua máquina.

Node e PostgreSQL não precisam estar instalados para testar. Eles só entram se você for mexer no código, e isso está mais abaixo.

### Passo a passo

**1. Baixe o repositório e entre na pasta.**

```bash
git clone https://github.com/tcpassos/invite-app.git
```

```bash
cd invite-app
```

**2. Crie o arquivo `.env` a partir do exemplo.**

No Git Bash, no macOS ou no Linux:

```bash
cp .env.example .env
```

No PowerShell:

```powershell
Copy-Item .env.example .env
```

Abra o `.env` e troque `POSTGRES_PASSWORD` e `SESSION_SECRET` por valores seus. Qualquer texto longo serve para testar. O resto pode ficar como está. O `.env` não vai para o repositório.

**3. Suba os três serviços.**

```bash
docker compose up -d --build
```

Na primeira vez demora alguns minutos, porque as imagens da API e do front são construídas na hora. Das próximas vezes é bem mais rápido.

**4. Confira que os três estão de pé.**

```bash
docker compose ps
```

Na coluna `STATUS`, os três serviços, `db`, `api` e `front`, devem aparecer como `Up`, e o `db` com `(healthy)` ao lado. Se algum aparecer como `Restarting`, veja a seção "Se algo der errado".

**5. Abra o app no navegador.**

Use `http://127.0.0.1:3000`, com o número, e não `localhost`. É o mesmo endereço que está no `.env`, e misturar os dois atrapalha a sessão do anfitrião quando ela existir.

### O que dá para testar hoje

O app está na fase de fundação. A estrutura dos três serviços está pronta e as telas do convite e do painel ainda vão ser construídas. Por enquanto, dá para conferir que cada peça está de pé:

| O que conferir | Como | O que deve aparecer |
|---|---|---|
| O front | Abrir `http://127.0.0.1:3000` | A página com "invite-app" e "O front está de pé." |
| A API | Abrir `http://127.0.0.1:3001/qualquer` | Um JSON com `"code":"NOT_FOUND"` e um `traceId` |
| O banco | Rodar o comando logo abaixo da tabela | As cinco categorias alimentares, de `ALLERGY` a `VEGETARIAN` |
| O log da API | `docker compose logs api` | Uma linha em JSON por requisição, com o mesmo `requestId` do `traceId` acima |

Comando para ver as categorias no banco:

```bash
docker compose exec db psql -U invite_app -d invite_app -c "select * from dietary_category"
```

Esta tabela cresce conforme as telas forem entrando.

### Parar, atualizar e recomeçar

| O que fazer | Comando |
|---|---|
| Parar sem perder os dados | `docker compose down` |
| Subir de novo | `docker compose up -d` |
| Atualizar depois de um `git pull` | `docker compose up -d --build` |
| Apagar os dados e começar do zero | `docker compose down -v` e depois `docker compose up -d --build` |

Uma migração nova do banco só é aplicada com o banco vazio. Se alguém do time avisar que o esquema mudou, use a última linha da tabela.

### Se algo der errado

**Erro falando em `dockerDesktopLinuxEngine` ou em não conseguir conectar ao Docker.** O Docker Desktop não está aberto. Abra, espere ele terminar de iniciar e rode o comando de novo.

**Avisos de que `POSTGRES_USER` ou `POSTGRES_PASSWORD` não estão definidas.** Faltou o passo 2, ou o `.env` foi criado em outra pasta. Ele precisa ficar na raiz do repositório, ao lado do `docker-compose.yml`.

**Porta já em uso.** Outro programa ocupa a 3000 ou a 3001. Feche o programa, ou troque o número do lado esquerdo em `ports` no `docker-compose.yml`.

**A API fica reiniciando.** Veja o motivo com o comando abaixo. Quase sempre é o banco que não subiu, e aí o log do `db` mostra o problema.

```bash
docker compose logs api
```

**Mudei o `.env` e nada mudou.** Rode `docker compose up -d` para recriar os containers. Se a variável mudada foi a `NEXT_PUBLIC_API_URL`, precisa reconstruir, com `--build`.

## Para mexer no código

Aí entra o Node 24, a versão que está no arquivo `.nvmrc`. O passo a passo completo, com os comandos que rodam antes de abrir um pull request, está na página [Configuração de Ambiente](docs/Começando/Configuração-de-Ambiente.md). O resumo:

```bash
npm install
```

```bash
npm run build --workspace contract
```

Depois disso, `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` na raiz. O GitHub roda as mesmas conferências em todo pull request.

## Onde fica cada coisa

| Pasta | O que é |
|---|---|
| [`api/`](api/README.md) | A API, em NestJS, com as camadas de Apresentação, Domínio e Dados |
| [`front/`](front/README.md) | O front, em Next.js, com o convite público e o painel do anfitrião |
| `contract/` | Os tipos que a API e o front compartilham |
| [`migrations/`](migrations/README.md) | O esquema do banco e a carga inicial |
| [`docs/`](docs/README.md) | A documentação do projeto, publicada na wiki |
