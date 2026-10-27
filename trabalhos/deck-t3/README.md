# Deck do T3

Gera `trabalhos/T3-Apresentacao-Intermediaria.pptx` a partir de `slides.json`, com o mesmo sistema visual do
deck do T1. O texto de cada slide e as falas, que vão nas notas do apresentador, ficam em
`slides.json`. O roteiro da apresentação está em `trabalhos/T3-roteiro.md`.

## O que tem aqui

| Arquivo | Para que serve |
|---|---|
| `slides.json` | Conteúdo dos slides: modelo, título, itens, tabelas, capturas e notas |
| `montar-pptx.py` | Monta o `.pptx`. Adaptado do `deck-t1`, com o modelo de capturas e os diagramas de tiers e de raias |
| `diagramas/` | Os diagramas de camadas, componentes e implantação do DAS, com fonte maior para o slide. O `.puml` de cada um diz como gerar o PNG |
| `capturas/` | Telas da aplicação real, tiradas em 26/10/2026 |
| `capturar-telas.cjs` | Refaz as capturas, percorrendo o caminho da demo com o Playwright |
| `checar-identificadores.py` | Procura no `.pptx` identificador interno que a turma não consegue resolver |
| `logos/` | Fundos e marcas do template institucional |

## Como regerar

Precisa de Python com `python-pptx` e `Pillow`, e da fonte Roboto instalada. Sem a Roboto, a
medição do texto usa a Arial ou a Liberation Sans, que são mais largas, e o texto fica com folga.

O template é o próprio deck do T1, que carrega os masters da Unisinos. O script apaga os slides
dele e mantém o tema. Da pasta `trabalhos/deck-t3`:

```bash
python3 montar-pptx.py ../T1-Docker-Invite-People.pptx slides.json ../T3-Apresentacao-Intermediaria.pptx logos capturas
python3 checar-identificadores.py ../T3-Apresentacao-Intermediaria.pptx
```

Para o PDF do Moodle, exportar pelo PowerPoint, ou pelo LibreOffice:

```bash
soffice --headless --convert-to pdf --outdir .. ../T3-Apresentacao-Intermediaria.pptx
```

## Modelos usados

`capa`, `conteudo`, `cartoes`, `linhaTempo`, `diagrama`, `duasColunas`, `tabela`, `impacto` e
`capturas`. A `tabela` aceita `xs` e `ws` para a posição e a largura das colunas, e uma `legenda`.
O `diagrama` aceita `svgArquitetura` e `svgRaias`, desenhados com formas nativas, que dá para
editar no PowerPoint. Os diagramas do DAS entram pelo modelo `capturas`, apontando para
`../diagramas/*.png`.
