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
_[a completar: formatação e lint, nomenclatura de branches e commits, padrões de UI e de componentes]_
