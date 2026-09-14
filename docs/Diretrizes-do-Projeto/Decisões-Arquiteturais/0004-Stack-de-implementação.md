# ADR-0004, Stack de implementação

**Status:** Aceita
**Data do registro:** 13/09/2026

## Contexto

O [ADR-0001](0001-Estilo-arquitetural.md) definiu MVC no front e três camadas no back, e o [ADR-0002](0002-Empacotamento-em-tiers.md) definiu três tiers em containers. Faltava escolher as tecnologias.

O critério adotado foi **qual stack melhor evidencia e sustenta as decisões arquiteturais**, e não qual o time digita mais rápido. A implementação nesta disciplina é mínima, e o artefato avaliado é a arquitetura.

Um levantamento de 19 produtos equivalentes foi feito para confrontar as escolhas. Os resultados estão em `pesquisa-stack-benchmark.md`, no repositório do GitHub.

## Decisão

| Tier | Tecnologia |
|---|---|
| Front | Next.js (React) |
| API | NestJS (TypeScript) |
| Banco | PostgreSQL |

**Next.js** porque as duas superfícies do produto têm requisitos opostos. O convite público é aberto por link no celular, lido muitas vezes e escrito uma, e precisa de HTML pronto na primeira resposta. O painel do anfitrião é sessão longa e interativa. Next.js atende as duas com estratégias de renderização diferentes no mesmo framework.

**NestJS** porque impõe a separação em camadas por estrutura de módulos e injeção de dependência. Com Express ou Koa a separação declarada como inegociável no ADR-0001 existiria apenas por convenção e dependeria de disciplina de time, que o Team Charter lista como risco.

**PostgreSQL** porque o modelo é claramente relacional, a consolidação do UC008 é agregação e a exportação sai de junções. O JSONB cobre a personalização, que é o único trecho semiestruturado.

**Next.js é front-end apenas.** Não usar API routes nem server actions para regra de negócio. Se a lógica migrar para o Next, o tier da API perde a razão de existir e o [ADR-0002](0002-Empacotamento-em-tiers.md) vira ficção.

**Delimitação do JSONB:** entram apenas cores e ajustes livres da personalização. Tema fica em coluna tipada por ser conjunto pequeno e fechado. Os textos do convite já estão definidos na Especificação de Casos de Uso e são dado consultado, então ficam em colunas próprias. Imagem de fundo é arquivo e nunca entra no JSONB.

## Consequências

**Positivas**
- TypeScript nas duas pontas permite que o contrato entre os tiers seja um tipo compartilhado, e não uma convenção documentada. No diagrama de componentes isso aparece como interface real.
- A estrutura do NestJS torna a fronteira entre camadas visível em revisão de código, não só em diagrama.
- O convite público responde com HTML pronto, o que atende a prévia de link no WhatsApp e o tempo de carregamento no celular.

**Negativas**
- **Apenas um integrante tem experiência prévia com esta stack.** Decisão consciente: o critério foi mérito arquitetural, e a implementação nesta disciplina é mínima. Se o escopo de código crescer, esta decisão precisa ser reavaliada.
- O levantamento de mercado **não sustenta NestJS**. Nenhum dos 19 produtos usa. A justificativa acima é de contexto próprio e é assim que deve ser defendida. Apelar a popularidade no segmento seria falso.
- O levantamento também **não sustenta PostgreSQL como padrão do segmento**. Houve uma única confirmação direta em 19 produtos, porque banco de dados não é observável por HTTP. A justificativa é técnica e própria.
- Com o front renderizando no servidor e chamando a API pela rede, existem dois saltos no caminho do convite público, e um erro passa a ter dois lados. Ver [ADR-0002](0002-Empacotamento-em-tiers.md).

## Alternativas consideradas

- **Django:** descartado por conflito arquitetural. O ORM é ActiveRecord, o model é a persistência, e o domínio não teria como não depender da camada de dados, contrariando a regra do ADR-0001.
- **FastAPI e Flask:** a separação em camadas ficaria como convenção, não estrutura.
- **Spring Boot:** equivalente em mérito ao NestJS, perde apenas no contrato de tipos compartilhado entre os tiers.
- **SPA pura no convite público:** descartada. Dos 19 produtos levantados, 11 renderizam a página pública no servidor, sobre 8 tecnologias diferentes. O único que entrega SPA precisou injetar as metatags pelo servidor mesmo assim.
