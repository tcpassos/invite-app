# ADR-0001, Estilo arquitetural

**Status:** Aceita
**Data do registro:** 13/09/2026. A decisão foi tomada na Sprint 1 e está sendo formalizada agora.

## Contexto

O produto expõe duas interfaces bem diferentes sobre o mesmo conjunto de dados. O convite público, que o convidado abre por link e sem login, e o painel do anfitrião, que exige autenticação. As duas leem e escrevem sobre as mesmas entidades: convite, confirmação de presença e observação alimentar.

O time tem quatro integrantes com experiência desigual, e a implementação do MVP acontece em duas sprints. A disciplina avalia a justificativa arquitetural, não apenas o funcionamento.

## Decisão

**MVC no front-end e arquitetura em três camadas no back-end**, sendo as camadas Apresentação e API, Domínio e Dados.

A regra de dependência é única e inegociável: **o Domínio e a camada de Dados nunca dependem da Apresentação**. As dependências apontam sempre para dentro.

O MVC no front se justifica pela característica central do produto, que são duas Views sobre o mesmo Model. É exatamente o problema que o padrão resolve.

## Consequências

**Positivas**
- As duas interfaces compartilham o mesmo modelo sem duplicar regra de negócio.
- O Domínio fica testável sem precisar subir a API nem o banco.
- Trocar ou reescrever o front não afeta o Domínio, o que dá margem para o time revisar a escolha de framework sem refazer a regra.
- A separação dá nomes claros para dividir tarefas entre quatro pessoas.

**Negativas**
- Mais estrutura do que um CRUD desse tamanho exigiria. O custo é disciplina de time, não linhas de código.
- Risco de over engineering, que o próprio Team Charter lista como ponto de melhoria do time. Mitigação: a regra de dependência é a única obrigatória, o resto se resolve caso a caso.
- Exige combinar antecipadamente onde mora cada tipo de validação, senão a regra vaza para a Apresentação.

## Relacionados

- [Guia da Arquitetura](../Guia-da-Arquitetura.md), que detalha responsabilidades por camada
- [ADR-0002](0002-Empacotamento-em-tiers.md), que trata de como estas camadas são empacotadas
