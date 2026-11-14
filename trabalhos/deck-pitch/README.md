# Deck do Pitch Final

Gera `trabalhos/T4-Pitch-Final.pptx` com o mesmo template institucional dos decks do T1 e do T3. O
texto de cada slide e as falas, que vão nas notas do apresentador, estão em `conteudo.py`, que
escreve o `slides.json`. O roteiro do Pitch está em `trabalhos/T4-roteiro.md`.

## O que tem aqui

| Arquivo | Para que serve |
|---|---|
| `conteudo.py` | Conteúdo dos slides e falas. Gera o `slides.json` |
| `montar-pptx.py` | Monta o `.pptx`. Adaptado do `deck-t3`, com os modelos do Pitch: problema, personas, grade de ícones, números, refinamento, mosaico, mapa do código, comparação, duas colunas com ícones, fluxo de código, divisor, demonstração e encerramento |
| `icones/` | Ícones do Lucide em PNG, branco, azul e laranja. O motivo visual do deck é o ícone dentro de um círculo |
| `gerar-icones.cjs` | Refaz os ícones a partir do `react-icons` |
| `imagens/` | Diagramas da documentação e capturas da aplicação usados no deck |
| `diagramas/` | O diagrama de camadas com fonte maior, para o slide. O `.puml` diz como gerar o PNG |

## Como regerar

Da pasta `trabalhos/deck-pitch`, com Python, `python-pptx`, `Pillow` e a fonte Roboto:

```bash
python3 conteudo.py
python3 montar-pptx.py ../T1-Docker-Invite-People.pptx slides.json ../T4-Pitch-Final.pptx ../deck-t3/logos imagens
soffice --headless --convert-to pdf --outdir .. ../T4-Pitch-Final.pptx
```

Para refazer os ícones, com `react-icons`, `react`, `react-dom` e `sharp` instalados numa pasta:

```bash
NODE_PATH=<pasta>/node_modules node gerar-icones.cjs
```

O `checar-identificadores.py` do `deck-t3` acusa no Pitch os nomes das personas e dos arquivos de
código. Aqui é de propósito: as personas são apresentadas no slide 4, e o professor pede para mostrar
como a arquitetura aparece no código.
