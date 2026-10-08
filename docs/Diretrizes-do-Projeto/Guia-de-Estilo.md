# Guia de Estilo

Convenções para manter o código e a documentação consistentes.

## Idioma

- Código em inglês. Nomes de variáveis, funções, classes, métodos, arquivos, rotas, tabelas e colunas do banco são escritos em inglês.
- Texto em português do Brasil. Comentários, documentação e literais de interface (rótulos, mensagens ao usuário, textos de tela) ficam em português do Brasil.

Exemplo:

```ts
// Conta os convidados que confirmaram presença
function countConfirmedGuests(guests: Guest[]): number {
  return guests.filter((guest) => guest.status === "confirmed").length;
}

const RSVP_SUCCESS_MESSAGE = "Presença confirmada. Obrigado!";
```

## Convenções gerais
- **Formatação é do Prettier**, com aspas simples, vírgula no fim das listas e linha de até 100 caracteres. Ninguém formata à mão, e a integração contínua recusa código fora do padrão. Rode `npm run format` antes do commit.
- **O lint é do ESLint**, e inclui a regra de camadas do ADR-0001. Erro de lint não se desliga com comentário, e se a regra estiver errada, o lugar de discutir é o PR.
- **Nomes de arquivo em minúsculas, separados por hífen**, com o papel no fim quando houver: `invite.repository.ts`, `session.guard.ts`, `api-client.ts`. Teste fica ao lado do arquivo testado, com `.spec.ts` no fim.
- **Classes e tipos em PascalCase, funções e variáveis em camelCase, constantes de módulo em MAIÚSCULAS.**
- **Nomes de campo no contrato são os mesmos da tela**, e nunca os da coluna do banco. É `companionCount`, e não `companion_count`.
- **Comentário explica o porquê**, e cita a regra ou a decisão quando existe uma, como `(UC005 RN2)` ou `(ADR-0010)`. O que o código já diz não precisa de comentário.
- **Branches, commits e pull requests** seguem a [Configuração do Projeto](../Começando/Configuração-do-Projeto.md).
