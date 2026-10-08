# ADR-0014, Acesso a dados

**Status:** Aceita
**Data do registro:** 07/10/2026

## Contexto

O [ADR-0004](0004-Stack-de-implementação.md) escolheu NestJS na API e PostgreSQL no banco, mas não definiu como o código da camada de Dados conversa com o banco.

Essa camada tem necessidades concretas, todas descritas na seção 8 do [DAS](../../Sprint-3/Documento-de-Arquitetura-do-Sistema-%28DAS%29.md):

- `SELECT ... FOR UPDATE` dentro de uma transação, para garantir o teto de capacidade do [ADR-0008](0008-Confiança-na-fronteira-pública.md)
- coluna `jsonb` para as cores da personalização
- agregação com `GROUP BY` e `string_agg` feita no banco, na consolidação do UC008
- atualização condicional pelo `WHERE`, na publicação do UC004

As migrações são arquivos `.sql` aplicados pelo container `db` na inicialização, conforme a seção 8.1 do [Diagrama de Implantação](../Diagrama-de-Implantação.md).

E existe uma restrição herdada. O ADR-0004 descartou o Django porque o ORM dele faz a classe de domínio ser a própria persistência, e o Domínio passaria a depender dos Dados. A ferramenta escolhida aqui não pode reabrir esse problema pela porta dos fundos.

## Decisão

A camada de Dados usa o **Kysely**, um construtor de consultas tipado, sobre o driver `pg`.

O esquema do banco é descrito numa interface TypeScript escrita a partir da seção 8.3 do DAS. Essa interface mora no pacote `data` e não sai dele. Cada repositório recebe uma linha do banco e devolve uma classe de `model`, então o Domínio nunca vê tipo do Kysely.

A transação do teto usa `transaction()` com `forUpdate()` na linha do convite. As consultas com `jsonb` e agregação são escritas com o próprio construtor, sem SQL solto em texto.

As migrações continuam em `.sql` no diretório `migrations/`. A ferramenta de migração do Kysely não é usada enquanto a decisão da seção 8.1 do Diagrama de Implantação valer.

### Alternativas descartadas

| Alternativa | Por que não |
|---|---|
| Prisma | O cliente gerado expõe tipos de modelo que tendem a atravessar para o Domínio. Traz migração própria, que conflita com os `.sql` aplicados pelo container. `FOR UPDATE` só sai com SQL escrito à mão |
| TypeORM | A entidade decorada é ao mesmo tempo classe de domínio e mapeamento de tabela, que é o mesmo motivo que tirou o Django no ADR-0004 |
| Driver `pg` sem nada por cima | Consulta é texto. Nome de coluna errado só aparece quando a linha roda |

## Consequências

**Positivas**
- As consultas são verificadas contra o esquema na compilação.
- O código das consultas fica próximo do SQL descrito na seção 8.3 do DAS, o que facilita conferir um contra o outro.
- A regra de dependência do [ADR-0001](0001-Estilo-arquitetural.md) continua valendo sem exceção, porque nenhum tipo do banco sai do pacote `data`.
- Transação com trava de linha, `jsonb` e agregação são suportados sem recorrer a SQL em texto.

**Negativas**
- A interface do esquema é escrita à mão e pode divergir dos arquivos `.sql`. Toda migração nova precisa mudar os dois no mesmo PR.
- A conversão entre linha do banco e classe de `model` é escrita em cada repositório.
- É uma biblioteca menos conhecida que Prisma e TypeORM, então tem curva de aprendizado para o time.

## Condição para reabrir

Se as migrações passarem a usar uma ferramenta de verdade, o que a seção 8.1 do Diagrama de Implantação prevê para o dia em que houver dado que não pode ser perdido, vale reavaliar a geração automática da interface do esquema a partir do banco.

## O que esta decisão fecha

- A lacuna do ADR-0004 sobre como a camada de Dados acessa o banco.
