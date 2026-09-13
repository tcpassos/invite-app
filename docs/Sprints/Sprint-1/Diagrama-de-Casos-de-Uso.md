# Diagrama de Casos de Uso

Notação UML: fronteira do sistema, atores (Anfitrião, Convidado), casos de uso (mesmos nomes da [Especificação](Especificação-de-Casos-de-Uso.md)) e relações `<<include>>` e `<<extend>>`.

![Diagrama de Casos de Uso](/.attachments/diagrama-casos-de-uso.png)

## Relações representadas
- **UC002 `<<include>>` UC003:** ao criar o convite, o fluxo sempre abre a personalização, então UC003 é parte obrigatória de UC002.
- **UC006 `<<extend>>` UC005:** registrar a observação alimentar é uma extensão opcional da confirmação de presença. A seta parte da extensão para o caso base, que é a direção correta em UML.

## Sobre as associações de ator
O Anfitrião se associa a UC001, UC002, UC004, UC007 e UC008. O Convidado se associa a UC005.

UC003 e UC006 não recebem associação direta de ator de propósito. UC003 é sempre incluído por UC002, e UC006 estende UC005, então em ambos os casos o ator chega até eles pelo caso de uso base. Ligar o ator direto a um caso incluído ou extensor duplicaria a relação.

## Fonte do diagrama
O diagrama é gerado a partir de [`diagrama-casos-de-uso.puml`](/.attachments/diagrama-casos-de-uso.puml), versionado junto com a imagem. Para regerar depois de editar o fonte, com Docker:

    docker run --rm -v "<caminho de docs/.attachments>:/data" plantuml/plantuml -tpng /data/diagrama-casos-de-uso.puml
