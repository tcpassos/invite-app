# ADR-0002, Empacotamento em tiers

**Status:** Aceita
**Data do registro:** 13/09/2026

## Contexto

O [ADR-0001](0001-Estilo-arquitetural.md) definiu três camadas no back-end, mas camada e tier não são a mesma coisa. As três camadas são **lógicas** e podem perfeitamente morar na mesma imagem. O que um container separa é **tier**, ou seja, unidade de implantação.

Essa distinção precisa estar registrada porque confundir as duas coisas é o erro mais comum ao desenhar o diagrama de implantação, e foi um ponto corrigido durante a preparação do seminário sobre Docker.

O time ganhou familiaridade prática com Docker e compose ao preparar o T1, e já existe um problema concreto de padronização de ambiente entre os quatro integrantes.

## Decisão

**Três tiers, um container por serviço**, orquestrados por `docker compose`:

| Tier | Conteúdo |
|---|---|
| Front | Aplicação de interface servida estaticamente |
| API | As três camadas lógicas do back-end na mesma imagem |
| Banco | Banco de dados com volume nomeado para persistência |

A comunicação entre eles acontece por rede nomeada do compose, com resolução por nome de serviço.

## Consequências

**Positivas**
- Uma responsabilidade por imagem, o que aumenta a coesão de cada serviço.
- O arquivo de compose vira a forma executável do diagrama de implantação. Os dois passam a ser a mesma informação em notações diferentes.
- Resolve a padronização de ambiente entre os quatro integrantes, que hoje é fonte de atrito.
- O banco isolado com volume permite derrubar e subir a aplicação sem perder dados.

**Negativas**
- O acoplamento entre camadas não desaparece, muda de forma. Passa a ter latência de rede, falha parcial e ordem de subida.
- Exige `HEALTHCHECK` com `condition: service_healthy`, senão a API sobe antes do banco estar pronto.
- O compose é de host único. Se em algum momento o projeto precisar de mais de uma máquina, esta decisão precisa ser revista.
- Três containers custam mais memória na máquina de cada integrante do que um processo único.

## Relacionados

- [ADR-0001](0001-Estilo-arquitetural.md), que definiu as camadas lógicas
- [ADR-0003](0003-Ambiente-de-execução.md), que define onde estes containers rodam
