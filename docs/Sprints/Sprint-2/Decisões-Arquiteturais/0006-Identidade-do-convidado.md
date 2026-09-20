# ADR-0006, Identidade do convidado

**Status:** Aceita
**Data do registro:** 13/09/2026

## Contexto

O produto promete consolidação por convidado: a lista de presença do UC007, a linha por convidado da ED2 do UC008 e a observação alimentar individual do UC006, que é o diferencial declarado na Visão do Produto. Além disso, a RN3 do UC005 e a H09 permitem ao convidado alterar a resposta.

Nada disso funciona se o sistema não souber quem respondeu. A questão é **como** obter essa identidade.

Um levantamento de mercado mostrou que produtos que prometem consolidação por convidado emitem identidade por convidado, com token individual na URL. Produtos que usam link único não prometem consolidação individual.

Havia portanto duas saídas: o anfitrião cadastra a lista e o sistema emite um link por convidado, ou o convite tem link único e o convidado se identifica ao responder.

## Decisão

**Link único por convite. A identidade do convidado é criada no momento da resposta.**

Esse é o modelo que a própria Especificação de Casos de Uso já descreve. O passo 5 do UC005 diz que o convidado informa o nome para identificação, e o passo 8 oferece a opção de alterar a resposta depois.

**O mecanismo do passo 8 é um token pessoal do convidado**, gerado no registro da resposta e devolvido na tela de confirmação, com a instrução de guardar o link para editar. Ele atende a RN3 e a H09.

**Consequência no UC007:** "pendentes" sai da lista de presença. Sem lista prévia de convidados não existe pendente, apenas quem respondeu. O painel passa a agrupar confirmados, recusados e talvez, com o total de pessoas somando acompanhantes.

## Por que não link por convidado

O modelo de link individual quebra três artefatos já entregues e aprovados na Sprint 1:

- **H05** pede um link do convite para enviar pelo WhatsApp, no singular.
- A **Jornada da anfitriã**, passo 7, descreve compartilhar o link no grupo da família.
- A **persona Marina** é descrita como sem tempo nem paciência para ferramentas complexas.

Além disso, exigiria um caso de uso que não existe. O UC002 cria o convite com nome, data, hora e local, sem lista de convidados. Link individual obrigaria o anfitrião a cadastrar todos os nomes antes de enviar qualquer coisa, e depois enviar mensagens individuais em vez de uma no grupo. Toda a fricção cairia sobre a persona descrita como impaciente.

## Consequências

**Positivas**
- A distribuição continua sendo um link colado no grupo, coerente com as personas e a jornada.
- Cada resposta gera um registro de convidado, o que sustenta a consolidação do UC008 e a observação alimentar individual do UC006.
- Nenhum caso de uso novo é necessário. O UC005 já descreve o fluxo inteiro.

**Negativas**
- **Dois convidados com o mesmo nome são dois registros**, e o sistema não distingue se é a mesma pessoa respondendo duas vezes.
- **É possível inflar a contagem** respondendo várias vezes com nomes diferentes. Mitigado pelo teto de capacidade e pelo limite de taxa do [ADR-0008](0008-Confiança-na-fronteira-pública.md).
- **Quem perder o token pessoal não consegue editar** e provavelmente responderá de novo, criando duplicata.
- **Some o "pendentes"**, que é informação que o anfitrião gostaria de ter, já que a dor declarada da persona é não saber quantos vão comparecer.

Nenhuma dessas consequências é aceitável num sistema de bilheteria. Todas são aceitáveis numa festa, e é essa distinção que sustenta a decisão.

## Reversibilidade

Esta decisão é barata de reverter, e isso foi critério para tomá-la.

**A entidade Convidado é a mesma nos dois modelos**, com nome, status, acompanhantes e token. O que muda é apenas **quando ela nasce**: no cadastro feito pelo anfitrião ou no ato da resposta.

Se em uma sprint futura o time quiser lista prévia, ela vira uma forma adicional de criar o mesmo Convidado, e não uma refatoração do modelo de domínio. Nesse caso, "pendentes" volta ao UC007 e este ADR é substituído.
