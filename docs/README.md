# /docs, Wiki do Projeto (Azure DevOps)

Esta pasta contém os artefatos do projeto em Markdown, organizados no **layout da Wiki do Azure DevOps**. É a versão oficial versionada no GitHub. O conteúdo é espelhado **manualmente** na Wiki provisionada do projeto `GUITOEBE/invite-people`.

## Convenções (Azure Wiki)
- **Traço vira espaço.** `Team-Charter.md` aparece como "Team Charter".
- **Subpágina** é um arquivo `.md` mais uma pasta de mesmo nome no mesmo diretório (por exemplo `Sprints.md` e a pasta `Sprints`).
- **`.order`** em cada pasta define a ordem das páginas na navegação.
- **Links entre páginas** são relativos ao arquivo, com extensão `.md`, então funcionam no GitHub e no Azure. Caminhos absolutos como `/Página` só funcionam no Azure.
- Diagramas em **Mermaid**: no GitHub a cerca é ` ```mermaid `. No Azure use `::: mermaid` (sintaxe limitada, prefira `graph`). Imagens ficam em `/.attachments`.
- O índice `[[_TOC_]]` é do Azure. No GitHub o índice fica no botão de outline da página.

## Como espelhar no Azure DevOps
1. Na Wiki do projeto, criar as páginas seguindo a hierarquia abaixo.
2. Colar o conteúdo de cada `.md` correspondente.
3. Personas também na extensão **Personas**. Retrospectivas na extensão **Team Retrospectives**. Backlog no **Boards**.

## Hierarquia
- Proposta de Trabalho (página inicial)
  - Visão do Produto
  - Começando (Configuração de Ambiente, Configuração do Projeto, Protótipo de Baixo Nível)
  - Diretrizes do Projeto (Guia da Arquitetura, Guia de Estilo, Instruções de Implementação)
  - Sprints
    - Sprint 1 (Personas, Jornada, Histórias, Casos de Uso, Diagrama de Casos de Uso)
  - Team Charter (uma página por membro)
