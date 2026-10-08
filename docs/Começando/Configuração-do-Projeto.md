# Configuração do Projeto

Como o repositório está organizado e como o trabalho entra nele. Para subir o ambiente na sua máquina, veja a [Configuração de Ambiente](Configuração-de-Ambiente.md).

## Estrutura do repositório

| Pasta | O que é |
|---|---|
| `contract/` | Os tipos que a API e o front compartilham. É o acordo entre os dois lados |
| `api/` | A API em NestJS, com as camadas de Apresentação, Domínio e Dados em pastas próprias |
| `front/` | O front em Next.js, com o convite público e o painel do anfitrião |
| `migrations/` | O esquema do banco e a carga inicial, aplicados pelo container do banco |
| `docs/` | A documentação, publicada nesta wiki |
| `tools/` | Scripts de apoio, como o que publica a wiki |
| `.github/workflows/` | A integração contínua |

O README de `api/` e o de `front/` mostram o que vai em cada pasta interna.

## Scripts

Todos rodam na raiz do repositório e valem para os três pacotes de uma vez.

| Script | O que faz |
|---|---|
| `npm run lint` | Lint, incluindo a regra de camadas, que falha quando uma camada importa de onde não pode |
| `npm run format` | Formata o código. `npm run format:check` só confere |
| `npm run typecheck` | Confere os tipos |
| `npm test` | Roda os testes. Os de banco precisam de `TEST_DATABASE_URL`, conforme o README da API |
| `npm run build` | Compila os três pacotes |

Rode `npm run build --workspace contract` uma vez depois de clonar e sempre que mudar algo em `contract/`, porque a API e o front leem os tipos dele já compilados.

## Branches

A `main` é sempre a versão que funciona. Ninguém faz commit direto nela, e tudo entra por pull request.

Cada tarefa tem um branch próprio, criado a partir da `main` atualizada, com o nome `parteN/assunto-curto`. Por exemplo, `parte3/entrada-do-anfitriao` ou `parte4/lista-de-presenca`. Mudança só de documentação usa `docs/assunto-curto`.

Branch vive pouco. O ideal é abrir o PR em até dois dias. Um PR por rota ou por tela é um bom tamanho, porque a revisão fica rápida e o conflito fica pequeno.

## Commits

Uma linha só, no formato `tipo(escopo): resumo`, com o resumo em português.

| Tipo | Quando |
|---|---|
| `feat` | Funcionalidade nova |
| `fix` | Correção de defeito |
| `test` | Só testes |
| `refactor` | Mudança de código sem mudar comportamento |
| `docs` | Documentação |
| `build` | Dependências, Docker e configuração de build |
| `ci` | Integração contínua |

O escopo é a parte do repositório: `api`, `front`, `contract`, `data` ou `docs`. Exemplos do histórico:

    feat(api): esqueleto em NestJS com filtro de erro, correlacao e log por requisicao
    feat(contract): formato de erro, codigos, situacoes e categorias compartilhados
    docs: README com o passo a passo para subir e testar o app

## Pull requests

O PR aponta para a `main`. A descrição diz o que entra, como conferir e o número da tarefa no quadro do Azure DevOps.

Para entrar na `main`, o PR precisa de duas coisas:

- **A integração contínua verde.** Se ela falhar, o autor corrige antes de pedir revisão.
- **A aprovação de alguém de outra parte.** PR que muda `contract/` precisa também da aprovação de quem cuida do front, porque o contrato é o acordo entre o front e a API.

O merge é feito pelo botão de merge do GitHub, e o branch é apagado em seguida.

Se o PR precisar de uma decisão que nenhum ADR nem o Guia da Arquitetura cobre, ela entra no mesmo PR como linha nova na seção 11.1 do Guia, com o que acontece se o time recusar. A revisão do PR é o momento de aprovar ou recusar.

## Integração contínua

O GitHub roda em todo pull request e em todo push na `main`:

- lint, formatação e tipos
- os testes, com um PostgreSQL descartável e as migrações aplicadas, então os testes de banco rodam de verdade
- o build dos três pacotes
- a construção das imagens da API e do front

As mesmas conferências rodam na sua máquina com os scripts da tabela acima, menos os testes de banco, que precisam do banco descartável descrito no README da API.
