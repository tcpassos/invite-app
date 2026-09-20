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
| [0009](Decisões-Arquiteturais/0009-Personalização-por-template.md) | Personalização por template em HTML e CSS, sem upload de mídia | Aceita |
| [0010](Decisões-Arquiteturais/0010-Autenticação-do-anfitrião.md) | Argon2id, sessão em cookie assinado e guardas sem estado no banco | Aceita |
| [0011](Decisões-Arquiteturais/0011-Identificador-pessoal-do-convidado.md) | Token pessoal com a mesma geração do token do convite, sem revogação | Aceita |
| [0012](Decisões-Arquiteturais/0012-Observabilidade-entre-os-tiers.md) | Log em saída padrão e correlação por cabeçalho entre os dois saltos | Aceita |
| [0013](Decisões-Arquiteturais/0013-Tempo-do-evento.md) | Instante único, fuso do projeto e fim do dia como fronteira da alteração | Aceita |

As decisões de 0004 a 0008 foram confrontadas com um levantamento de 19 plataformas equivalentes de convite e RSVP. O relatório fica em `pesquisa-stack-benchmark.md`, no repositório do GitHub.

Ainda em aberto, e previsto como ADR: **o envio de e-mail com recuperação de senha**. Ele continua fora porque nenhum caso de uso o pede. O UC001 tem entrada, cadastro e credencial inválida, e não tem fluxo de recuperação. Decidir transporte de e-mail e política de redefinição antes de existir requisito seria responder uma pergunta que ninguém fez, no mesmo raciocínio que o ADR-0007 usou para descartar o Server-Sent Events.

Há também decisões que o [Guia da Arquitetura](../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md) tomou onde nenhum ADR decidia, listadas na seção 11.1 daquele documento. Elas valem como regra de código, precisam de aval do time e não têm o peso de um ADR aceito.
