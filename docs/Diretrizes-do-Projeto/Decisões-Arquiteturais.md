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
| [0004](Decisões-Arquiteturais/0004-Stack-de-implementação.md) | Next.js no front, NestJS na API e PostgreSQL no banco | Aceita |
| [0005](Decisões-Arquiteturais/0005-Identificador-público-do-convite.md) | Token CSPRNG de 128 bits em base32, separado da chave primária | Aceita |
| [0006](Decisões-Arquiteturais/0006-Identidade-do-convidado.md) | Link único por convite, identidade criada na resposta | Aceita |
| [0007](Decisões-Arquiteturais/0007-Atualização-da-lista-de-presença.md) | Consulta periódica em vez de Server-Sent Events | Aceita |
| [0008](Decisões-Arquiteturais/0008-Confiança-na-fronteira-pública.md) | Teto de capacidade, limite de taxa e tratamento do endpoint aberto | Aceita |

As decisões de 0004 a 0008 foram confrontadas com um levantamento de 19 plataformas equivalentes de convite e RSVP. O relatório fica em `pesquisa-stack-benchmark.md`, no repositório do GitHub.

Ainda em aberto, e previstas como ADR: onde a imagem de fundo enviada pelo anfitrião é armazenada, a autenticação do anfitrião, o envio de e-mail com recuperação de senha, e a observabilidade entre os tiers.
