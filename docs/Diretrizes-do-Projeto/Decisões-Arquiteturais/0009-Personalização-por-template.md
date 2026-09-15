# ADR-0009, Personalização por template

**Status:** Aceita
**Data do registro:** 15/09/2026

## Contexto

O UC003 previa que o anfitrião ajustasse tema, cores, **imagem de fundo** e textos do convite. A RN2 aceitava upload de JPG e PNG com tamanho máximo, e o fluxo alternativo A1 tratava arquivo inválido.

Ao detalhar a arquitetura, esse upload se revelou **o item mais caro de todo o MVP**, e de longe. Sozinho ele exigiria:

- Um lugar para os bytes, que os três tiers do [ADR-0002](0002-Empacotamento-em-tiers.md) não têm. As saídas improvisadas são todas ruins: `bytea` no Postgres infla banco e dump e faz toda abertura de convite passar pelo banco para devolver bytes, base64 no JSONB põe binário na linha lida na rota mais quente, e disco de container some no próximo `docker compose down`.
- Política de nomeação aleatória, porque **o nome do arquivo de mídia é um segundo identificador público**. Servido como `/uploads/1.jpg`, um raspador enumeraria todos os convites pela mídia e o token de 128 bits do [ADR-0005](0005-Identificador-público-do-convite.md) não protegeria nada.
- Validação de tamanho e tipo, redimensionamento e recusa de SVG, que carrega script e vira XSS.
- Uma rota servindo o arquivo, e possivelmente um quarto tier, o que mexeria no ADR-0002.

Nenhum outro item do escopo custa isso.

E a Visão do Produto é explícita sobre onde está o valor: o diferencial é **tratar a observação alimentar como recurso principal**, capturada por convidado e consolidada para o buffet. A personalização visual é paridade competitiva, não diferencial.

## Decisão

**A personalização do convite acontece por templates web, escritos em HTML e CSS. Não existe upload de mídia no sistema.**

O anfitrião escolhe um template e ajusta cores e textos. A riqueza visual vem de tipografia, paleta, layout, gradiente e padrões em CSS, e não de imagem enviada.

Os templates são **ativos estáticos do tier Front**, versionados junto com o código. Acrescentar um template é mudança de código revisada, não conteúdo enviado em tempo de execução.

**Imagem da prévia do link:** cada template embarca a própria imagem de Open Graph, pré-renderizada e servida como ativo estático. Assim a prévia no WhatsApp continua tendo imagem, sem nenhum armazenamento dinâmico.

## Consequências

**Positivas**
- **Elimina uma categoria inteira de decisão arquitetural.** Não há armazenamento de mídia, nomeação de arquivo, rota servindo binário, limite de tamanho, redimensionamento nem recusa de tipo.
- Os três tiers do ADR-0002 continuam de pé sem alteração.
- Remove um vetor de ataque completo. Sem upload não há SVG com script, não há arquivo enumerável e não há segundo identificador público.
- O convite fica mais leve, o que ajuda no carregamento em celular pela rede móvel, que é o cenário real da persona do convidado.
- Template em HTML e CSS é revisável em diff, e a qualidade visual fica sob controle do time em vez de depender do arquivo que o anfitrião subir.

**Negativas**
- **O anfitrião não usa foto própria.** Quem quiser o rosto do aniversariante no convite não consegue. É a perda real desta decisão e não deve ser minimizada.
- A palavra "imagem" sai do item 2 do escopo do MVP na Visão do Produto, e o UC003 perde o fluxo alternativo de arquivo inválido.
- A variedade visual passa a depender de quantos templates o time conseguir produzir. Poucos templates significa convites parecidos entre si.
- Concorrentes do segmento oferecem upload. Esta decisão é assumidamente um corte de escopo, e não paridade.

## Alternativas consideradas

- **Manter o upload:** descartada pelo custo arquitetural desproporcional diante do valor, já que personalização visual não é o diferencial declarado do produto.
- **Galeria de imagens embarcadas no sistema:** o anfitrião escolheria entre imagens fornecidas pelo projeto. Resolveria o custo de armazenamento dinâmico, mas ainda traria ativos binários para manter e não acrescenta nada que um template em CSS bem-feito não entregue.

## Revisão

Se em algum momento o upload voltar ao escopo, esta decisão não deve ser editada. Um ADR novo a substitui, e aí volta a valer tudo que está registrado no Contexto acima como custo a pagar.
