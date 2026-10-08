# Instruções de Implementação

O que cada parte implementa, o que ler antes e como escrever uma rota ou uma tela seguindo a arquitetura. As regras completas estão no [Guia da Arquitetura](Guia-da-Arquitetura.md), e esta página aponta onde cada uma está.

## As quatro partes

| Parte | O que entrega | Casos de uso |
|---|---|---|
| 1. Fundação | O repositório, o ambiente, a integração contínua, a documentação e as peças compartilhadas | Nenhum |
| 2. Front | As telas do convite público e do painel, os templates e o mock da API para desenvolver as telas antes do back-end ficar pronto | Todos, do lado do navegador |
| 3. Convite do anfitrião | As rotas de entrada, de criação, de correção, de personalização e de publicação | UC001 a UC004 |
| 4. Respostas e painel | As rotas da página do convite, da resposta, do link pessoal, da lista de presença e da consolidação alimentar | UC005 a UC008 |

As partes 2, 3 e 4 trabalham em paralelo. O que as liga são os tipos de `contract/` e a tabela de rotas da seção 4.1 do Guia, que já estão prontos.

### Parte 2, front

| | |
|---|---|
| Rotas de tela | `/i/{publicToken}`, `/r/{personalToken}` e as telas do painel: entrada, cadastro, lista de convites, criação, correção, personalização, publicação, lista de presença e consolidação |
| Ler antes | Guia 7, sobre o MVC no front. Guia 9.4, sobre a página de convite indisponível, o formulário depois de uma falha e o recuo da consulta periódica. Guia 9.5, sobre cache, `robots.txt`, metatags, o redirecionamento temporário do 404 e o escape no painel. ADR-0007, ADR-0009 e ADR-0013. O README do front |
| Já pronto | O `ApiClient` nas duas cópias, a do servidor e a do navegador, o `robots.txt`, o `noindex` nas rotas de token e os tipos de todas as rotas |
| Cuidados | Nenhuma regra de negócio no front. A tela decide pelo `code` do erro, nunca pela mensagem. Dado escrito pelo convidado nunca entra como HTML |

O jeito de fazer o mock é decisão da parte 2. O que ele precisa cumprir é responder com os tipos de `contract/` e com o formato de erro, incluindo os casos de recusa da tabela da seção 4.1, para as telas de erro também existirem antes da integração.

### Parte 3, convite do anfitrião

| | |
|---|---|
| Rotas | `/auth/sign-up`, `/auth/sign-in`, `/auth/sign-out`, `/auth/session`, `GET` e `POST /invites`, `GET` e `PUT /invites/{inviteId}`, `PUT /invites/{inviteId}/customization`, `publish` e `unpublish` |
| Ler antes | UC001 a UC004. Guia 4.1 e 4.2. ADR-0005, ADR-0009, ADR-0010 e ADR-0013. O diagrama de sequência do UC004 e as realizações do UC001 e do UC004 |
| Já pronto | A sessão e o `SessionGuard`, o limite de tentativas, o gerador de token, a conferência de dono, o `parseRequest` e a leitura do convite por identificador |
| A criar | O `HostRepository`, o `TemplateCatalog` a partir do catálogo de `contract/`, e as operações da parte 3 no `InviteRepository` |

### Parte 4, respostas e painel

| | |
|---|---|
| Rotas | `GET /public/invites/{publicToken}`, `POST /public/invites/{publicToken}/rsvp`, `GET` e `PUT /public/responses/{personalToken}`, `attendance`, `dietary-summary` e `dietary-notes.csv` |
| Ler antes | UC005 a UC008. Guia 3.4, sobre o teto verificado na transação. Guia 9.5 inteira, porque a rota pública é a fronteira mais exposta do sistema. ADR-0006, ADR-0008, ADR-0011 e ADR-0013. Os diagramas de sequência do UC005 e do UC008 e as realizações dos dois |
| Já pronto | O limite de taxa da fronteira pública, o gerador de token, a conferência de dono, o `parseRequest`, a leitura do convite publicado pelo token e o `SessionGuard` |
| A criar | O `DietaryCategoryRepository`, a escrita da resposta dentro do teto e as operações da parte 4 no `InviteRepository` |

A parte 4 não depende da entrada do anfitrião para testar o painel. Nos testes, a sessão é aberta direto pelo `SessionCookie`, como faz o `session.spec.ts` da API, e o convite publicado é inserido direto no banco, como faz o `invite.repository.spec.ts`.

## Como escrever uma rota na API

1. **Os tipos já existem.** A entrada e a saída de cada rota estão em `contract/` e na tabela da seção 4.1 do Guia. Se precisar mudar um deles, o PR muda `contract/` e passa pela revisão do front.
2. **O controller fica na Apresentação**, no pacote da rota: `public`, `authenticated` ou `auth`. Ele lê o corpo com o `parseRequest`, monta o comando, chama um serviço do Domínio e devolve o tipo do contrato. Não monta corpo de erro, não chama `res.status` e não fala com a camada de Dados.
3. **O serviço fica no Domínio.** É onde ficam as regras, as validações e a conferência de dono. Recusa com os erros de `domain/errors.ts`, como `ValidationError(field, rule)`. Não conhece rota nem código de status.
4. **O repositório fica em Dados.** Consulta com o Kysely e devolve as classes de `model/`, nunca a linha do banco.
5. **O módulo da rota** entra em `imports` no `app.module.ts`.

Cada rota leva três tipos de teste, e cada um já tem um exemplo na API:

| Teste | O que confere | Exemplo |
|---|---|---|
| Unitário do Domínio | As regras do caso de uso, sem banco e sem HTTP | `domain/ownership.spec.ts` |
| De ponta a ponta do controller | Status, corpo e cabeçalhos da resposta, incluindo os casos de recusa | `presentation/common/session.spec.ts` |
| De integração do repositório | A consulta contra um PostgreSQL de verdade | `data/invite.repository.spec.ts` |

Antes de abrir o PR, rode as buscas da seção 6.4 e da 10.5 do Guia. Elas levam menos de um minuto e pegam o que o lint não pega, como `404` ou `HttpException` fora da Apresentação e SQL fora da camada de Dados.

## Como escrever uma tela no front

1. **A rota fica em `src/app`.** Ela busca o dado e entrega para a view.
2. **O dado vem do `ApiClient`.** Use `serverApi()` na leitura do convite e do link pessoal, que rodam no servidor, e `browserApi` em todo o resto. Nunca `fetch` direto.
3. **A tela fica em `src/view`.** Ela pode usar o controller, e o controller não conhece a view.
4. **O erro é tratado pelo `code`.** `ApiRequestError` traz o corpo de erro da API, e `ApiUnavailableError` quer dizer que a API não respondeu.

As páginas `/i/{publicToken}` e `/r/{personalToken}` precisam ser dinâmicas, para sair com o cache privado da seção 9.5. Depois do build, confira com `curl -I`.

## Decisão que nenhum documento cobre

Ela entra no mesmo PR, como linha nova na seção 11.1 do Guia, com o motivo de nenhum ADR cobrir e o que acontece se o time recusar. A aprovação do PR é a aprovação da linha, e a frase de aval no fim da tabela é atualizada no merge.
