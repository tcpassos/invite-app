# Decisões Arquiteturais

Registro das decisões de arquitetura do projeto, no formato **ADR** (Architecture Decision Record). Cada decisão tem a própria página, numerada em sequência.

## Como funciona

Cada ADR responde por que a decisão foi tomada, não só o que foi decidido. A estrutura é sempre a mesma: Status, Contexto, Decisão e Consequências, com as consequências positivas e negativas separadas.

**Os registros são imutáveis.** Quando uma decisão muda, não se edita o ADR antigo. Escreve-se um novo que substitui o anterior, e o anterior passa para o status Substituída com o link para o sucessor. Assim o histórico do raciocínio fica legível em ordem, incluindo os caminhos abandonados.

Status possíveis: **Proposta**, **Aceita**, **Substituída** e **Descartada**.

## Registros

| ADR | Decisão | Status |
|---|---|---|
| [0001](Decisões-Arquiteturais/0001-Estilo-arquitetural.md) | MVC no front-end e três camadas no back-end | Aceita |
| [0002](Decisões-Arquiteturais/0002-Empacotamento-em-tiers.md) | Três tiers em containers separados, orquestrados por compose | Aceita |
| [0003](Decisões-Arquiteturais/0003-Ambiente-de-execução.md) | Execução apenas local durante o desenvolvimento | Aceita |

Decisões ainda em aberto, que viram ADR quando fechadas: a stack de implementação e a forma do identificador do link do convite.
