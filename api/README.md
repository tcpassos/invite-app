# api

Tier API do invite-app, em NestJS. As três camadas do ADR-0001 moram aqui, cada uma numa pasta, conforme a seção 5.1 do DAS.

| Pasta | O que vai nela |
|---|---|
| `src/presentation/public` | Controllers das rotas que o convidado alcança sem sessão |
| `src/presentation/authenticated` | Controllers das rotas do painel do anfitrião |
| `src/presentation/auth` | Entrada e cadastro do anfitrião |
| `src/presentation/common` | Filtro de erro, identificador de correlação e log, que já existem, e as guardas |
| `src/domain` | Serviços e regras de negócio, e os erros de domínio em `errors.ts` |
| `src/data` | Repositórios e o acesso ao banco com Kysely (ADR-0014) |
| `src/model` | As classes do Diagrama de Classes |

A regra de dependência entre essas pastas é verificada pelo lint. Se o Domínio importar da Apresentação, ou a Apresentação importar dos Dados, o `npm run lint` falha.

## Comandos

Na raiz do repositório:

```bash
npm install
npm run build --workspace contract
npm test --workspace api
npm run dev --workspace api
```

O `dev` precisa de `DATABASE_URL`. O jeito mais simples de ter tudo é subir pelo compose, na raiz:

```bash
docker compose up db api
```

## Como responder um erro

O Domínio levanta um dos erros de `src/domain/errors.ts`, e o filtro em `presentation/common` traduz no formato único da seção 9.3 do Guia da Arquitetura. Controller nenhum monta corpo de erro à mão, e nada que vem de dentro de uma exceção vai para a resposta.
