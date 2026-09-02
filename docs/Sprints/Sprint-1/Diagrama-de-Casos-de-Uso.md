# Diagrama de Casos de Uso

Notação UML: fronteira do sistema, atores (Anfitrião, Convidado), casos de uso (mesmos nomes da [Especificação](Especificação-de-Casos-de-Uso.md)) e relações `<<include>>` e `<<extend>>`.

Relações representadas:
- UC002 `<<include>>` UC003: ao criar o convite, o fluxo abre a personalização.
- UC005 `<<extend>>` UC006: registrar a observação alimentar é uma extensão opcional da confirmação de presença.


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
  UC002 -. «include» .-> UC003
  UC006 -. «extend» .-> UC005
```
