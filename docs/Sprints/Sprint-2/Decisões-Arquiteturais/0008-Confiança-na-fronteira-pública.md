# ADR-0008, Confiança na fronteira pública

**Status:** Aceita
**Data do registro:** 13/09/2026

## Contexto

O UC005 é o único endpoint de **escrita aberto e sem autenticação** do sistema, e até aqui a arquitetura não dizia nada sobre ele.

O [ADR-0005](0005-Identificador-público-do-convite.md) protege o convite contra descoberta, mas não contra repasse. O modelo de distribuição do produto é colar o link num grupo de WhatsApp, o que garante que o identificador vaza por desenho. Depois de distribuído, o token não é mais segredo.

O [ADR-0006](0006-Identidade-do-convidado.md) abriu mão da lista prévia de convidados, e com ela do único limite natural para o número de respostas.

Existe ainda um caminho de dados que sai de um formulário anônimo e termina numa planilha aberta na cozinha do buffet, sem nenhum ponto intermediário que autentique alguém.

## Decisão

Cinco medidas, todas na fronteira pública.

### 1. Teto de capacidade configurável

Campo opcional no Convite, com o **total de pessoas** aceitas. Nulo significa sem teto.

- Conta pessoas, não respostas, porque cada confirmação traz acompanhantes e o buffet cozinha para gente.
- Conta apenas respostas "sim". Se "talvez" ocupasse vaga, indecisos bloqueariam confirmações reais.
- Ao lotar, novos "sim" são recusados com mensagem clara. "Não" continua sempre aceito, porque recusa não ocupa vaga.
- Quem já confirmou pode reduzir acompanhantes ou mudar para "não" a qualquer momento, liberando vaga. Aumentar acompanhantes passa pela mesma verificação.

**A verificação é transacional, na camada de Dados.** Este é o ponto arquitetural da decisão: com duas respostas simultâneas num evento em 49 de 50, uma validação na camada de Apresentação deixa as duas passarem e o evento fecha em 51. A invariante **não pode** ser garantida na Apresentação, o que é a demonstração concreta da regra de dependência do [ADR-0001](0001-Estilo-arquitetural.md).

Não confundir com a RN2 do UC005, que limita acompanhantes **por resposta**. São limites diferentes e convivem.

### 2. Limite de taxa

Por token de convite e por endereço de origem. Não protege contra enumeração, que o token já resolve, e sim contra repasse abusivo do link e contra inflação da contagem.

### 3. Limite de tamanho no texto livre

A observação alimentar do UC006 tem campo de texto livre preenchido por anônimo. Tamanho máximo definido e validado no servidor.

### 4. Escape na renderização do painel

O texto da observação alimentar é escrito por um anônimo e renderizado na tela de um usuário autenticado. Sem escape, isso é XSS armazenado de manual, com o anfitrião como alvo.

### 5. Tratamento do CSV exportado

Campo que comece com `=`, `+`, `-` ou `@` é prefixado com aspa simples na exportação da ED2 do UC008. Sem isso, o conteúdo executa quando o buffet abre a planilha no Excel.

### Complementos de exposição

- `Cache-Control: private, no-cache, no-store` na página do convite.
- `robots.txt` bloqueando as rotas de convite. O token protege contra adivinhação e não contra indexação: basta um convidado colar o link num fórum para o convite virar resultado de busca com nome, data, endereço e lista de confirmados.
- Identificador inválido redireciona para uma rota de não encontrado em vez de devolver 404, o que reduz o sinal para quem sonda.
- As metatags Open Graph expõem parte do conteúdo a um terceiro para gerar a prévia do link. Isso é aceitável e precisa ser limitado: **o endereço exato do evento não entra na prévia**.

## Consequências

**Positivas**
- O teto substitui a lista de convidados como limite de escopo do evento, fechando a ponta solta que o [ADR-0006](0006-Identidade-do-convidado.md) deixou.
- O caminho do formulário anônimo até a planilha do buffet passa a ter tratamento declarado em cada etapa.
- A verificação transacional do teto dá ao projeto um exemplo real e citável de invariante que exige a camada de Dados, útil no Diagrama de Sequência.

**Negativas**
- O teto acrescenta um fluxo alternativo ao UC005, um campo ao UC002, uma regra de negócio e um atributo ao diagrama de classes.
- Limite de taxa exige guardar contador com janela de tempo, que é estado fora do banco principal ou uma tabela adicional.
- Nenhuma dessas medidas impede que alguém com o link responda de má-fé com nome falso. Elas limitam volume e dano, não intenção.

## Fora de escopo

**Captcha.** O levantamento de 19 produtos não encontrou captcha em formulário nenhum. O que o mercado usa é borda gerenciada, que este projeto não tem e não terá, conforme o [ADR-0003](0003-Ambiente-de-execução.md).
