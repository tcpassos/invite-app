# ADR-0003, Ambiente de execução

**Status:** Aceita
**Data do registro:** 13/09/2026

## Contexto

O [ADR-0002](0002-Empacotamento-em-tiers.md) definiu três containers orquestrados por compose, mas não onde eles rodam. O diagrama de implantação precisa de nós concretos, e sem essa definição ele fica genérico.

O projeto é um MVP de disciplina, avaliado pelos artefatos produzidos e por uma apresentação final. Não há requisito de disponibilidade, de usuários reais nem de acesso externo. O Team Charter registra que o projeto não tem custo financeiro.

## Decisão

**Execução apenas local**, na máquina de cada integrante, via `docker compose up`. Sem alvo de publicação nesta fase do projeto.

O nó do diagrama de implantação é, portanto, o **host de desenvolvimento**, contendo o engine de containers, que por sua vez contém os três ambientes de execução do [ADR-0002](0002-Empacotamento-em-tiers.md).

## Consequências

**Positivas**
- Custo zero e nenhuma credencial de nuvem para gerenciar ou vazar.
- O diagrama de implantação fica com um nó só, o que simplifica o desenho sem torná-lo incorreto.
- Qualquer integrante sobe o ambiente inteiro com um comando, sem depender de acesso compartilhado.
- Não gasta tempo de sprint com infraestrutura que a disciplina não cobra.

**Negativas**
- A demonstração final depende da máquina de quem apresenta. Mitigação: ensaiar a subida do ambiente antes, e ter um plano de contingência com capturas de tela.
- Não exercita deploy, que é uma lacuna que o próprio time reconhece nos Pontos de Melhoria do Team Charter.
- Não há ambiente compartilhado para o professor acessar por conta própria fora da apresentação.

## Revisão

Se o time decidir publicar o projeto, esta decisão não deve ser editada. Um novo ADR a substitui, e este passa para o status Substituída.
