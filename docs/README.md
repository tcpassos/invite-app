# /docs, Wiki do Projeto (Azure DevOps)

Esta pasta contém os artefatos do projeto em Markdown, organizados no **layout da Wiki do Azure DevOps**. É a versão oficial versionada no GitHub e é publicada na Wiki provisionada do projeto `GUITOEBE/invite-people` pelo script `tools/sync-wiki.sh`.

## Convenções (Azure Wiki)
- **Traço vira espaço.** `Team-Charter.md` aparece como "Team Charter".
- **Subpágina** é um arquivo `.md` mais uma pasta de mesmo nome no mesmo diretório (por exemplo `Sprints.md` e a pasta `Sprints`).
- **`.order`** em cada pasta define a ordem das páginas na navegação.
- **Links entre páginas** são relativos ao arquivo, com extensão `.md`, então funcionam no GitHub e no Azure. Caminhos absolutos como `/Página` só funcionam no Azure.
- Diagramas em **Mermaid**: no GitHub a cerca é ` ```mermaid `. No Azure use `::: mermaid` (sintaxe limitada, prefira `graph`). Imagens ficam em `/.attachments`.
- O índice `[[_TOC_]]` é do Azure. No GitHub o índice fica no botão de outline da página.

## Como publicar na Wiki do Azure DevOps
A Wiki do projeto é um repositório git. O script `tools/sync-wiki.sh` clona esse repositório, troca o conteúdo pelo que está aqui em `docs/`, converte as cercas de Mermaid e envia. Ele mostra o que mudou e pede confirmação antes do push.

    bash tools/sync-wiki.sh

Commitar no GitHub antes de rodar, porque a mensagem do commit da Wiki referencia o commit de origem.

O que fica de fora do script e é feito na mão:
- **Personas** na extensão Personas, dentro do Boards. A extensão tem banco próprio e não lê a Wiki.
- **Retrospectivas** na extensão Team Retrospectives.
- **Backlog** no Boards, épicos e histórias como work items.
- Este `README.md` e a `pesquisa-de-mercado.md` da raiz do repositório ficam só no GitHub.

## Hierarquia
- Proposta de Trabalho (página inicial)
  - Visão do Produto
  - Começando (Configuração de Ambiente, Configuração do Projeto, Protótipo de Baixo Nível)
  - Diretrizes do Projeto (Guia da Arquitetura, Guia de Estilo, Instruções de Implementação)
  - Sprints
    - Sprint 1 (Personas, Jornada, Histórias, Casos de Uso, Diagrama de Casos de Uso)
  - Team Charter (uma página por membro)
