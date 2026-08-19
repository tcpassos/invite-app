# Diagrama de Casos de Uso

> **A detalhar nesta Sprint 1.** Notação UML: fronteira do sistema, atores (Anfitrião, Convidado), casos de uso (mesmos nomes da [Especificação](Especificação-de-Casos-de-Uso.md)) e relações `<<include>>`/`<<extend>>`.
> Diagrama final desenhado em draw.io, Astah ou PlantUML e anexado como imagem em `/.attachments`. Abaixo, um rascunho aproximado em Mermaid. No GitHub a cerca é ` ```mermaid `; no Azure Wiki use `::: mermaid`.

```mermaid
graph LR
  Anfitriao([Anfitrião])
  Convidado([Convidado])
  subgraph Sistema[App de Convites Virtuais]
    UC001[UC001 Autenticar anfitrião]
    UC002[UC002 Criar convite]
    UC003[UC003 Personalizar visual]
    UC004[UC004 Compartilhar convite]
    UC005[UC005 Confirmar presença]
    UC006[UC006 Registrar observação alimentar]
    UC007[UC007 Ver lista de presença]
    UC008[UC008 Consolidar e exportar restrições]
  end
  Anfitriao --- UC001
  Anfitriao --- UC002
  Anfitriao --- UC003
  Anfitriao --- UC004
  Anfitriao --- UC007
  Anfitriao --- UC008
  Convidado --- UC005
  Convidado --- UC006
```
