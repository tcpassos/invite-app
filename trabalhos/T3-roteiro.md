# T3, roteiro da apresentação intermediária do projeto

> Documento de trabalho do time. Fica no GitHub e não vai para a wiki, porque tem decisão tática de
> apresentação. Apresentação em 27/10/2026, aula remota síncrona pelo Teams, Time 04 na agenda.
> Slides em PDF no Moodle, na tarefa "Entrega do Terceiro Trabalho da Disciplina", até 23h55 do
> mesmo dia. Subir antes da aula, não depois.

## O que o enunciado cobra

Do Plano de Ensino: apresentação de 20 a 25 minutos, depois 10 a 15 de arguição pelo professor e
pela turma. O objetivo é verificar a aderência entre os requisitos, a arquitetura do Grau A e a
solução implementada. A equipe precisa mostrar as funcionalidades prontas, explicar as decisões
arquiteturais e técnicas, apresentar as dificuldades e o planejamento para concluir. Precisa ter
demonstração ao vivo evidenciando a evolução do sistema, e mostrar o Azure DevOps, o Kanban, o
GitHub e a colaboração da equipe.

| Critério                                     | Peso | Onde a apresentação responde                                                                             |
| -------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------- |
| Evolução e qualidade da implementação        | 30%  | Slide 4, a linha do tempo, e os blocos 2, 3 e 4                                                          |
| Aderência à arquitetura e aos requisitos     | 20%  | Slide 7, com cada regra e o lugar do código onde ela está, e as histórias marcadas em cada passo da demo |
| Demonstração funcional e qualidade técnica   | 20%  | Bloco 5                                                                                                  |
| Organização no Azure DevOps, GitHub e Kanban | 10%  | Bloco 5b, ao vivo, logo depois da demo                                                                   |
| Apresentação, clareza e slides               | 10%  | O deck todo                                                                                              |
| Participação individual na arguição          | 10%  | Protocolo de arguição e o estudo de cada um, no fim                                                      |

A avaliação é individual. Por isso cada integrante fala do que construiu e do que aconteceu com isso
na integração, e o tempo de fala é equilibrado entre os quatro.

## Objetivo da apresentação

Mostrar o que foi implementado desde o Grau A, comparar com a arquitetura documentada e apontar o
que precisou ser ajustado. Nos blocos técnicos, cada regra da arquitetura citada vem com o lugar do
código onde ela está. Os ajustes estão registrados com o motivo nos Ajustes de Arquitetura para o
MVP da Sprint 5, e é para lá que se aponta quando o professor perguntar.

Tom das falas: descritivo. Dizer o que existe, como funciona e por quê. Nada de frase de efeito, de
adjetivo para o próprio trabalho ou de bordão repetido.

## Quem é responsável por quê

| Integrante | Responsável por                                                                                                                                                                                                                                                                                                         | O que apresenta                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Tiago      | A base do projeto: monorepo, `contract`, regra de camadas no lint, integração contínua e a orquestração dos três tiers no `docker compose`. A documentação de arquitetura. A integração do front e do back na `main`, com a adequação dos dois à arquitetura registrada nos Ajustes da Sprint 5                         | Arquitetura, base e Docker, e mostra o GitHub ao vivo                         |
| Guilherme  | O protótipo do front: [o fluxo e o visual das telas do anfitrião e do convidado, os três templates e a primeira versão do mock; confirmar com ele]. Na integração, o protótipo foi adequado à arquitetura. O projeto no Azure DevOps é da organização dele                                                              | O protótipo e o que mudou nele, conduz a demo e mostra o Azure Boards         |
| Gabriel    | A primeira versão das rotas e das regras do back-end, sobre a base: os serviços do anfitrião, do convite e da resposta, os repositórios, os controllers, a transação do teto com trava na linha do convite, o CSV com proteção contra fórmula e os primeiros testes. Na integração, essa versão foi adequada às camadas | O caminho de uma resposta pela API, e narra a parte da demo que passa por ela |
| Andreas    | Nesta apresentação, o problema, o escopo do MVP, como o time trabalha e o plano até a entrega. Na Sprint 6, [os itens que ele assumir], com o nome dele no quadro                                                                                                                                                       | Abertura, "como o time trabalha" e o planejamento                             |

Regras para todos: - **Ninguém diz "eu fiz" sobre o que não fez.** Para o que foi feito em conjunto,
a fala é "o time levantou" ou "o time decidiu". Para o que outro fez, diz quem fez. Uma atribuição
errada desmonta na primeira pergunta do professor. - **Cada um conta a dificuldade que viveu.**
Quando a correção foi feita por outro integrante, conta o que aprendeu com ela e diz quem corrigiu.

- **Ferramentas de IA.** Assistentes de IA e ferramenta de prototipação foram usados no projeto, e o
  histórico do GitHub mostra isso. Se perguntarem, cada um responde com franqueza pelo que fez e pelo
  que revisou. As decisões estão nos ADRs, no Guia e nos Ajustes da Sprint 5.

## Tempo, donos e tela

| Bloco | Tema                                                    | Min  | Slides  | Quem fala                       |
| ----- | ------------------------------------------------------- | ---- | ------- | ------------------------------- |
| 1     | Problema, escopo e linha do tempo                       | 2:45 | 1 a 4   | Andreas                         |
| 2     | Arquitetura, base do projeto e Docker                   | 4:15 | 5 a 7   | Tiago                           |
| 3     | Front-end                                               | 3:00 | 8 e 9   | Guilherme                       |
| 4     | Back-end                                                | 2:45 | 10 e 11 | Gabriel                         |
| 5     | Demonstração ao vivo                                    | 6:00 | 12      | Guilherme conduz, Gabriel narra |
| 5b    | Azure Boards, GitHub e organização do trabalho, ao vivo | 1:45 | 13      | Guilherme, Tiago e Andreas      |
| 6     | Planejamento até a entrega e perguntas                  | 2:00 | 14 e 15 | Andreas                         |

Com as trocas, cerca de 23 minutos, com folga de quase 2 até o limite de 25.

**Compartilhamento.** O Andreas compartilha o PDF do início ao fim e avança quando quem fala diz
"próximo". A tela muda só duas vezes: depois do slide 12, o Guilherme compartilha a **tela inteira**
para a demo e, em seguida, para o bloco 5b, com as abas já abertas. Depois, o Andreas volta ao PDF
no slide 14.

**Na máquina que compartilha:** modo não perturbe, e-mail e WhatsApp fechados, barra de favoritos
oculta, carregador ligado, de preferência cabo de rede. **Os outros:** câmera ligada enquanto falam,
e a primeira frase de cada um começa com o nome ("Aqui é o Gabriel..."), porque a avaliação é
individual.

**Ordem de corte.** O Tiago cronometra e avisa pelo WhatsApp do grupo, fora da reunião. Se o fim do
bloco 4 passar de 12 minutos, corta-se nesta ordem: o passo 4 da demo, que fica só dito; abrir a
planilha, mostrando só o download; o GitHub do bloco 5b, reduzido à aba de checks. Não entram na
ordem de corte a resposta do convidado, a lotação, o painel e o bloco 6.

---

## Bloco 1, problema, escopo e linha do tempo (2:45, Andreas)

**Slide 1, capa.** Nome do produto, os quatro nomes e a disciplina. Fala de abertura, 20 segundos:

> "Somos o Time 04, do Invite People. Vamos apresentar o problema e o escopo, a arquitetura
> implementada, o front-end, o back-end, uma demonstração e o planejamento até 17/11. Cada um
> responde pelo próprio bloco na arguição."

**Slide 2, título "O problema e os usuários".** Quem organiza uma festa junta confirmações pelo
WhatsApp e perde a conta de quantas pessoas vêm, quantos acompanhantes cada um leva e o que cada um
não pode comer. Na fala, as personas que o time levantou: a anfitriã que organiza e o convidado que
só quer responder rápido, sem criar conta, e o buffet como interessado secundário, que é quem recebe
a lista.

**Slide 3, título "Escopo do MVP".** Seis grupos com as doze histórias, H01 a H12, e a marca de
entregue em cada uma. Exceção à regra de identificadores: os códigos H01 a H12 ficam no slide,
porque são os mesmos do quadro que aparece ao vivo, e a rastreabilidade é o próprio critério de
aderência.

**Slide 4, título "Linha do tempo do projeto".** Linha do tempo horizontal: Sprint 1, requisitos;
Sprint 2, arquitetura; Sprint 3, documento de arquitetura e protótipo; marca do Grau A; Sprint 4, a
base; Sprint 5, integração e ajustes; Sprint 6, consolidação. Fala:

> "No Grau A o projeto tinha doze histórias, o Guia da Arquitetura e um protótipo de telas. Na
> Sprint 4 foi feita a base: o repositório, o pacote de tipos compartilhado entre front e back, a
> integração contínua e o compose. Na Sprint 5 o front e o back foram integrados nessa base, e o que
> precisou mudar na arquitetura foi registrado com o motivo. As doze histórias estão implementadas."

Passagem: "O Tiago apresenta a arquitetura implementada."

---

## Bloco 2, arquitetura, base do projeto e Docker (4:15, Tiago)

**Slide 5, título "Tiers e camadas".** Três tiers no compose (front em Next.js, API em NestJS e
PostgreSQL) e as três camadas lógicas dentro da API: Apresentação, Domínio e Dados. O front segue
MVC. O `contract` é o pacote de tipos compartilhado entre os dois lados. Fala: "camada é divisão
lógica, tier é processo separado. As três camadas moram no mesmo container da API."

**Slide 6, título "Base do projeto: lint, CI e docker compose".** Duas colunas.

- Esquerda, "Lint e CI": o Domínio não pode importar da
  Apresentação, e os Dados não podem importar de nenhuma camada de cima. Um PR que quebra a regra
  fica vermelho. A CI roda lint, tipos, testes contra um PostgreSQL de verdade, build e as imagens.
- Direita, "docker compose": o banco não publica porta, o front publica a 3000 e a
  API a 3001, porque o navegador fala com ela direto. Fala: "no T1 apresentamos o Docker como forma
  de cada integrante subir o ambiente com um comando. É esse compose que roda na demo."

**Slide 7, título "Regras da arquitetura no código".** Três regras, cada uma com o lugar do código
onde está: - Nenhuma rota confirma que um convite existe: link inválido e convite despublicado dão o
mesmo 404 na página pública, e o convite de outro anfitrião dá o mesmo 404 no painel. - A sessão do
anfitrião é cookie assinado, e o front não guarda token. - O link do convite nasce no Domínio, com
gerador seguro, nunca no navegador.

Fala final do slide: "A regra do teto de vagas o Gabriel mostra no bloco dele."

Dificuldade do bloco, dita assim:

> "A dificuldade deste bloco foi juntar o front e o back, que foram escritos em paralelo, fora da
> `main`. A integração foi em duas etapas. Primeiro o front, com um mock que responde às rotas com os
> tipos do `contract`. Depois o back. Em cada etapa, o que não cabia na arquitetura foi adequado,
> registrado com o motivo nos Ajustes da Sprint 5, e só entrou na `main` com a CI verde. O
> `contract` permitiu juntar as duas partes sem reescrever tudo. Ele deveria ter sido feito antes
> das telas."

Passagem: "O Guilherme apresenta o front-end, que partiu do protótipo dele."

---

## Bloco 3, front-end (3:00, Guilherme)

**Slide 8, título "Telas do front-end".** Três capturas da aplicação atual: o editor com a prévia, o
convite no celular e a resposta enviada com o link pessoal. O protótipo, como está no repositório do
Guilherme, não sobe sozinho (faltam o cliente do Supabase e o `@tanstack/react-start`), por isso o
slide não tem a captura dele. Se o Guilherme tiver uma captura do protótipo, ela pode entrar ao lado.
Fala:

> "O protótipo foi meu: [o fluxo, as telas, os três templates e as cores; ajustar ao que for
> verdade]. Ele foi gerado numa ferramenta de prototipação, e por isso trazia muita coisa que a nossa
> stack não usa. Na integração, o Tiago adequou o protótipo à arquitetura: o visual ficou, reescrito
> em CSS puro, e o que era regra de negócio saiu da tela e foi para a API."

**Slide 9, título "Mudanças no front para seguir a arquitetura".** Três linhas de antes e depois:

- A página pública mostrava quantas vagas restavam. Hoje não mostra contagem, porque isso expõe dado
  do anfitrião. A lotação só aparece quando a resposta é recusada.
- O CSV para o buffet era montado no navegador. Hoje vem pronto da API, com proteção contra fórmula
  de planilha.
- O login guardava um token no navegador. Hoje a sessão é cookie, e o front não guarda nada.

Fala: "a tela ainda limita os campos, para ajudar quem preenche, mas a validação que vale é a da
API."

Dificuldade do bloco:

> "A dificuldade deste bloco foi que o protótipo nasceu antes de a arquitetura estar no código, e
> algumas regras de negócio ficaram na tela. O que eu aprendi vendo a adequação: prototipar com
> ferramenta é rápido para validar o visual, mas o protótipo precisa ser lido contra o Guia antes de
> virar código. Se eu fizesse de novo, desenharia as telas em cima do `contract` desde o começo."

Passagem: "Quem recebe essas chamadas é a API. A primeira versão das rotas e das regras dela foi
escrita pelo Gabriel."

---

## Bloco 4, back-end (2:45, Gabriel)

**Slide 10, título "Caminho de uma resposta na API".** Diagrama de três raias, uma por camada, sem
texto corrido: - Apresentação: valida a forma e o limite de tráfego. - Domínio: limite de
acompanhantes; "não vou" zera acompanhantes e observação; "talvez" não ocupa vaga; alergia exige
descrição; calcula quantas vagas a resposta nova pede. - Dados: abre a transação, trava a linha do
convite, soma as vagas ocupadas, confere o teto e grava, ou devolve a recusa para o Domínio dar nome
ao erro.

Fala de abertura:

> "As regras que vou mostrar são as que estão hoje no código. A primeira versão das rotas e dessas
> regras foi minha, inclusive a transação com a trava na linha do convite. Na integração, algumas
> regras mudaram de camada, e eu conto isso no fim do bloco."

Fala de fecho do slide: "o Domínio calcula quantas vagas a resposta pede, e a camada de Dados
confere o teto dentro da transação."

**Slide 11, título "Testes".** Testes do Domínio, testes contra um PostgreSQL de verdade e
testes das rotas de ponta a ponta. Fala:

> "Os testes de hoje foram reescritos na integração, porque os meus testavam assinaturas antigas. O
> que vale citar: quatro respostas simultâneas, cada uma pedindo duas vagas, num convite com teto de
> cinco. Passam exatamente duas."

Dificuldade do bloco:

> "A dificuldade deste bloco foi uma regra de negócio na camada errada. Na minha primeira versão, a
> regra de que só a confirmação ocupa vaga estava na consulta da camada de Dados, junto com a
> conferência do teto. Funcionava, mas a camada de Dados passava a saber o que é uma vaga, e o Guia
> diz que isso é do Domínio. Na integração, o Tiago subiu o cálculo das vagas que a resposta pede para
> o Domínio, e a camada de Dados ficou com a soma do que já está gravado e a conferência do teto."

Passagem: "Agora a demonstração."

---

## Bloco 5, demonstração ao vivo (6:00, Guilherme conduz, Gabriel narra)

**Slide 12, título "Roteiro da demonstração".** Fica na tela enquanto o Guilherme assume o
compartilhamento, e serve de guia se a demo cair:

| Passo                          | Histórias               |
| ------------------------------ | ----------------------- |
| Criar, personalizar e publicar | H02, H03, H04, H05, H06 |
| Responder como convidado       | H07, H08, H10           |
| A lotação                      | H07, o teto de vagas    |
| Alterar pelo link pessoal      | H09                     |
| Painel e CSV                   | H11, H12                |
| Despublicar                    | H06                     |

**Preparação, antes de entrar na chamada:** - `.env` criado a partir do `.env.example`. Para começar
do zero, `docker compose down -v`, porque as migrations só rodam com o volume do banco vazio. -
`docker compose up -d --build` e conferir com `docker compose ps`. - `http://127.0.0.1:3000` aberto.
Não usar `localhost`. Fonte do navegador em 125%. - Conta de anfitrião criada e logada numa janela
normal. - Uma janela anônima aberta para o convidado. - Um convite de reserva já publicado e lotado,
com teto de 2 pessoas e uma confirmação com 1 acompanhante, com a página dele aberta numa aba da
janela anônima. - A planilha já aberta, para o CSV. - Um bloco de notas fora da tela com os textos
para colar: nome do evento, local e uma data futura fixa. - As abas do bloco 5b abertas, na ordem:
quadro da Sprint 5, uma história com tarefas filhas, a lista de sprints, a lista de PRs, a aba de
checks de um PR e a branch `gabriel`.

**O caminho:**

1. **Guilherme, criar e personalizar (1:30).** Abrir dizendo: "a conta já está criada para poupar
   tempo; cadastro e entrada estão no vídeo do apêndice." Criar o convite colando os textos, com teto
   de 4 pessoas e no máximo 1 acompanhante. Trocar o template e as cores e mostrar a prévia mudando.
   Publicar e copiar o link.
2. **Gabriel narra, o convidado responde (1:30).** Colar o link na janela anônima: não pede conta.
   Confirmar com 1 acompanhante e restrição "Alergia", com a descrição. Durante o preenchimento: "a
   tela limita o campo a 1 acompanhante, mas quem valida é a API." Mostrar o
   link pessoal que aparece no fim. Fala: "a API calculou duas vagas no Domínio e conferiu o teto
   dentro da transação."
3. **Gabriel narra, a lotação (0:40).** Na aba do convite de reserva, tentar confirmar: aparece a
   lotação, sem dizer quantas vagas existem.
4. **Gabriel narra, a alteração (0:30).** Abrir o link pessoal e trocar a resposta para "talvez".
   Fala: "o talvez não ocupa vaga, e a alteração vale até o fim do dia do evento."
5. **Guilherme, o painel (1:20).** Voltar ao painel: a lista de presença mostra a resposta. Abrir a
   consolidação alimentar e baixar o CSV. Na planilha, mostrar os acentos certos e a alergia com a
   descrição.
6. **Guilherme, despublicar (0:30).** Despublicar e, na janela do convidado, abrir de novo o **link
   do convite**, não o link pessoal: aparece a página de não encontrado, igual à de um link que nunca
   existiu. O link pessoal continua valendo para quem já respondeu, por decisão da seção 9.5 do Guia.

**Se der errado.**

- **Plano B:** a máquina do Tiago, com o mesmo estado preparado (ambiente no ar, conta logada,
  convite de reserva lotado), pronta para compartilhar. Gatilho: se uma ação travar por mais de 20
  segundos, o Guilherme diz "vamos seguir na máquina do Tiago" e para de compartilhar.
- **Plano C:** o vídeo de 2 minutos do caminho acima, gravado hoje, sem som e narrado ao vivo, e as
  capturas do apêndice.
- O mock (`docker-compose.mock.yml`) só entra se a imagem tiver sido construída no ensaio, e sempre
  anunciado como mock. Ele entra com `demo@convite.dev` e a senha `senha1234`.

---

## Bloco 5b, Azure Boards, GitHub e organização do trabalho (1:45)

Na mesma tela da demo, sem trocar de compartilhamento.

1. **Guilherme, o quadro (0:40).** O quadro da Sprint 5 com as histórias em Done, uma história aberta
   com as tarefas de tela e de API, cada uma com responsável, e a lista de sprints com as datas.
2. **Tiago, o GitHub (0:35).** A lista de PRs fechados e a aba de checks verdes de um deles. Depois, a
   branch `gabriel` e a mensagem do commit que trouxe o back com a autoria dele, e a do commit do
   front, que registra que as telas vieram do protótipo do Guilherme. Fala: "a integração foi feita
   por mim, e as mensagens dos commits indicam de onde veio cada parte."
3. **Andreas, organização do trabalho (0:30).** Três frases:
   - Planejamos em sprints de duas semanas no Azure Boards, com cada história quebrada em tarefas de
     tela e de API.
   - Conversamos pelo WhatsApp e discutimos o projeto no tempo de aula. O que decidimos fica
     registrado no repositório, no Guia, nos ADRs e nos Ajustes da Sprint 5.
   - Integramos por PR, e a CI verde é a nossa definição de pronto.

**Slide 13, título "Organização do trabalho".** As mesmas três frases, para o PDF do Moodle ter o
registro. Se o grupo concordar, uma captura de uma conversa do WhatsApp que virou decisão, com nomes
e números cobertos.

---

## Bloco 6, planejamento até a entrega e perguntas (2:00, Andreas)

**Slide 14, título "Planejamento até 17/11".** Tabela preenchida antes do ensaio e espelhada no
quadro da Sprint 6, de 03/11 a 16/11:

| O quê                                                                                                                                   | Quem | Até |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---- | --- |
| Revisar os artefatos das Sprints 1 a 3 contra o código, com uma matriz que liga cada história ao caso de uso, à rota, à tela e ao teste |      |     |
| Diagrama de sequência da lista de presença, que faltou no Grau A                                                                        |      |     |
| Protótipo de baixa fidelidade com as telas reais                                                                                        |      |     |
| Aval do time às decisões novas do Guia                                                                                                  |      |     |
| Fechar o Team Charter                                                                                                                   |      |     |
| Deck e ensaio do Pitch Final                                                                                                            |      |     |

Embaixo, uma linha "Lições": definir os tipos compartilhados antes das telas, integrar front e back
antes do fim da sprint, e manter as regras de negócio no Domínio desde a primeira versão.

Na fala, o Andreas diz quais itens assumiu. Ele escolhe antes do ensaio, e os itens entram no quadro
com o nome dele, para a fala ter lastro.

**Slide 15, título "Perguntas".** Os quatro nomes com o assunto de cada um. Fica na tela durante a
arguição. Fechamento:

> "As doze histórias estão implementadas, e as mudanças em relação à arquitetura do Grau A estão
> registradas com o motivo. Até 17/11 vamos revisar a documentação contra o código e preparar o
> Pitch. Para perguntas: requisitos e planejamento comigo, arquitetura e Docker com o Tiago, telas e
> quadro com o Guilherme, API e regras com o Gabriel."

**Apêndice, slides 16 a 18.** Capturas da aplicação de 26/10: entrada e lista de convites, as telas
do convidado (convite, resposta enviada, lotação e link pessoal), o painel e o link despublicado.
Servem ao plano C e ficam no PDF do Moodle como evidência. Capturas do quadro e de um PR com os
checks ainda não estão no deck.

## O deck

O deck está em `trabalhos/T3-Invite-People.pptx`, e o PDF para o Moodle em
`trabalhos/T3-Invite-People.pdf`. As falas de cada slide estão nas notas do apresentador. Ele é
gerado a partir de `trabalhos/deck-t3/slides.json`, e o `README.md` dessa pasta diz como regerar
depois de mudar o texto.

---

## Protocolo de arguição

1. Quem recebe a pergunta responde a primeira frase e passa nominalmente para o dono do assunto.
2. Ninguém responde duas seguidas enquanto houver integrante que ainda não respondeu.
3. Territórios: problema, requisitos e planejamento com o Andreas; arquitetura, Docker, GitHub e
   integração com o Tiago; protótipo, telas e Azure Boards com o Guilherme; API, regras e testes com
   o Gabriel.
4. Nas perguntas de arquitetura, Docker, GitHub e integração, o Tiago responde direto. Nas dos outros
   territórios, ele só completa quando o dono pedir.

## Perguntas prováveis, por território

### Andreas

- **Qual foi a sua participação no projeto?** Responder com franqueza, sem tomar como seus os
  artefatos do time, e citar os itens que assumiu na Sprint 6.
- **Como uma história vira caso de uso?** A história é o valor para a persona, com critério de
  aceitação. O caso de uso tem fluxo principal, fluxos alternativos e regras. Exemplo: H07, H08 e
  H10 viram o UC005, confirmar presença. O diagrama está em `docs/Sprints/Sprint-1`.
- **Como vocês priorizaram as Sprints 4 e 5?** A Sprint 4 fechou o fluxo central de ponta a ponta:
  conta, criação, link, resposta, acompanhantes e restrição alimentar. A Sprint 5 completou com
  personalização, prévia, despublicação, alteração da resposta, lista de presença e consolidação.
- **Algum requisito mudou por causa da arquitetura?** A lista de presença pedia tempo real e passou
  a "se atualiza sozinha sem recarregar", com consulta periódica (ADR-0007). O recado livre do
  convite saiu, e a saudação virou texto fixo do template.
- **Por que o convidado não cria conta?** Porque exigir conta derruba a taxa de resposta. Ele recebe
  um link pessoal para voltar e alterar.

### Tiago

- **Por que três camadas e não quatro?** Porque só existem três motivos de mudança com vida própria:
  o jeito de falar com o mundo, as regras do evento e o armazenamento. Seção 1 do Guia.
- **A pasta `api/src/model` é uma quarta camada?** Não. São as classes do modelo e as projeções que
  atravessam as camadas, e o lint impede que ela importe qualquer camada.
- **O Domínio pode importar dos Dados? Como o lint sabe a regra?** Pode, a dependência só desce. O
  `import-x/no-restricted-paths` em `eslint.config.mjs` proíbe Domínio e Dados importando da
  Apresentação, Dados importando do Domínio, a Apresentação importando dos Dados, e no front o
  controller importando da view.
- **Se o navegador chama a API direto na 3001, isso não expõe a API?** A exposição é controlada: a
  API só aceita chamada do navegador vinda da origem do front, o cookie é `httpOnly` e `SameSite`,
  as escritas públicas têm limite de tráfego e o banco não publica porta. Passar tudo pelo Next
  poria lógica no tier Front, que o ADR-0004 restringe a front-end.
- **As migrations só rodam com o volume vazio. Como evoluem o esquema?** É uma limitação aceita e
  registrada no Diagrama de Implantação: mudar o esquema exige `docker compose down -v`. Vale porque
  o ADR-0003 limita o ambiente ao local, e precisa ser revista antes de qualquer publicação.
- **E com duas instâncias da API?** O limite de tráfego fica na memória do processo e deixaria de
  valer. Está em aberto na seção 5 dos Ajustes. Hoje o ADR-0003 não prevê réplica.
- **Por que local e não na nuvem?** ADR-0003: nesta fase o MVP não tem requisito de disponibilidade,
  de usuários reais nem de acesso externo, e o projeto não tem custo.
- **Por que o histórico da `main` está quase todo em um nome?** Porque a integração passou por quem
  montou a base. O back entrou com a autoria do Gabriel, o front a partir do protótipo do Guilherme,
  e as mensagens dos commits registram isso. [Se o time combinar que, na Sprint 6, cada um abre o
  próprio PR com revisão cruzada, dizer isso aqui. Só se for verdade.]

### Guilherme

- **O que foi seu?** O protótipo e o projeto no Azure DevOps. O código de hoje em `front/src` é a
  adequação do protótipo, feita na integração. Conhecer a estrutura e o porquê de cada mudança, que
  está na seção 2 dos Ajustes.
- **Onde fica o Controller do MVC no Next.js?** Em `front/src/controller`: o `ApiClient`, por onde
  passa toda chamada à API, com tempo limite de 4 segundos no servidor e 15 no navegador, e os
  módulos que traduzem cada ação da tela numa chamada tipada. A View está em `front/src/view` e as
  rotas de tela em `front/src/app`.
- **Se o front é MVC, onde está o Model?** O Model é o estado que a API guarda, e o front o conhece
  pelos tipos do `contract`. O ADR-0001 justifica o MVC com duas Views sobre o mesmo Model: o
  convite público e o painel.
- **Por que o convite é renderizado no servidor e o painel no navegador?** O convite precisa das
  metatags da prévia do link quando é compartilhado no WhatsApp, então é lido no servidor do front.
  O painel roda no navegador, que manda o cookie de sessão direto para a API.
- **Como a lista de presença se atualiza?** A tela consulta a API a cada 20 segundos. Na primeira
  falha avisa que a lista pode estar desatualizada. A partir da segunda falha seguida, o intervalo
  dobra, até 2 minutos. Falha nunca vira lista vazia. Consulta periódica e não tempo real porque a
  história nunca pediu latência, só que a lista se atualize sozinha (ADR-0007).
- **O `ApiClient` repete chamada que falhou?** Só as leituras e o publicar, uma vez. O envio da
  resposta nunca repete, porque repetir poderia gravar duas vezes.
- **O que a tela mostra se a API cair?** Na página do convite, uma página de convite indisponível,
  diferente da de não encontrado. No painel, a lista anterior continua na tela com o aviso.
- **Por que não deixaram as bibliotecas do protótipo?** A maior parte não era usada por tela
  nenhuma, e cada biblioteca a mais é mais coisa para o time aprender e manter (ADR-0004).

### Gabriel

- **O que aconteceria se duas pessoas confirmassem ao mesmo tempo com uma vaga sobrando?** A
  transação trava a linha do convite. A segunda só soma depois de conseguir a trava, então já
  enxerga a primeira gravada, e é recusada. É o que o teste de concorrência prova.
- **O SQL ainda soma confirmados mais acompanhantes. Então os Dados ainda sabem o que é vaga?** Em
  parte, e foi consciente. As vagas da resposta nova vêm do Domínio. A soma do que já está gravado
  precisa estar dentro da transação para ser atômica. Tirar a regra de vez exigiria gravar as vagas
  de cada resposta numa coluna, uma mudança de esquema que ficou fora do MVP.
- **Por que `FOR UPDATE` e não isolamento serializável?** A trava serializa só as escritas do mesmo
  convite, então convites diferentes não se bloqueiam. Com serializável, uma transação seria
  abortada e teria de ser repetida, e a resposta do convidado nunca é repetida automaticamente.
- **Por que o Domínio não recebe os tipos do `contract`?** Porque o Domínio recebe comando e devolve
  modelo, e a Apresentação traduz. Se o HTTP mudar, o Domínio não muda. Na primeira versão o Domínio
  recebia os tipos do `contract`, e isso foi uma das coisas que mudaram na integração.
- **Como fica o fuso horário?** O ADR-0013 manda usar `America/Sao_Paulo` pelo nome e comparar por
  dia. Na primeira versão, a criação do convite juntava data e hora com `-03:00` fixo e comparava
  com o instante atual, então um convite para hoje com a hora já passada era recusado. O prazo de
  alteração da resposta já comparava por dia.
- **O que é a proteção contra fórmula no CSV?** Um campo que começa com `=`, `+`, `-` ou `@` ganha
  uma aspa simples na frente, para a planilha não executar o que o convidado escreveu (ADR-0008). O
  CSV tem ponto e vírgula e BOM, para a planilha em português abrir com acentos.
- **Como a senha é guardada?** Com hash argon2id. A senha nunca é gravada.
- **O que impede alguém de adivinhar um link de convite?** O token tem 128 bits de gerador
  criptográfico, então adivinhar é inviável. Enviar resposta tem limite por endereço de origem e por
  token. O link só nasce na primeira publicação, então rascunho nem tem link.
- **E o link pessoal, depois que o anfitrião despublica?** Continua valendo para quem já respondeu,
  por decisão da seção 9.5 do Guia.

## O que cada um estuda antes do ensaio

**Andreas.** `docs/Sprints/Sprint-1`: as personas, a jornada, as histórias H01 a H12 e o diagrama de
casos de uso. `docs/Sprints/Sprint-4.md` e `Sprint-5.md`. Subir o ambiente do zero na própria
máquina, pelo README, e percorrer as doze histórias, para poder dizer "as doze funcionam" com
propriedade.

**Tiago.** A seção 1 do Guia. O `docker-compose.yml` e o `eslint.config.mjs`. A seção 5 dos Ajustes
da Sprint 5, o que continua em aberto.

**Guilherme.** O `front/README.md`. A estrutura de `front/src`: `app`, `view` e `controller`. Em
`controller`, o cabeçalho de `api-client.ts`, mais `polling.ts`, `server-api.ts` e `browser-api.ts`.
As seções 1 e 2 dos Ajustes da Sprint 5. Os ADRs 0001, 0007 e 0009. O quadro, a ponto de abrir
qualquer item que o professor clicar.

**Gabriel.** A própria versão, na branch `gabriel`, e o que mudou nela, com
`git diff a3fb8db e088d73 -- api/src`. Em `api/src/domain`, `rsvp-rules.ts`, `rsvp.service.ts` e
`project-time.ts`. Em `api/src/data/invite.repository.ts`, o `saveRsvpWithinCapacity` e o
`exceedsCapacity`. O `render-csv.ts`. O teste de concorrência em
`api/src/data/invite.repository.writes.spec.ts`. A seção 3 dos Ajustes da Sprint 5 e os ADRs 0008,
0013 e 0014.

## Regras para os slides

- Nenhum identificador interno no slide, exceto os códigos das histórias: nada de UC, número de work
  item, ADR, linha do Guia ou nome de arquivo. Tudo isso vai na fala, e na arguição vira ponto de
  rastreabilidade.
- Um título por slide, descritivo: diz o assunto, sem frase de efeito.
- Nenhuma contagem de commits, testes ou arquivos no slide, porque envelhece.
- Nenhuma captura de tela que não tenha sido feita de verdade, com data no rodapé.
- No rodapé de cada slide, o nome de quem apresenta.

## Checklist até terça

- [x] Atualizar o Azure Boards: H01 a H12, a #125, as tarefas das Sprints 4 e 5 e os épicos em
      Done, e as tarefas de API com o Gabriel
- [ ] Confirmar a divisão de blocos no grupo
- [ ] Guilherme confirma o que foi dele no protótipo, para preencher a fala do slide 8
- [ ] Andreas escolhe os itens dele na Sprint 6, e os itens da Sprint 6 entram no quadro com dono
- [ ] Preencher a tabela do slide 14 com quem e até quando
- [ ] Andreas preenche a ficha dele no Team Charter, e o Guilherme o papel dele no time. Depois,
      fechar a #87 e a #57
- [ ] Criar o item do T3 no quadro, como o #78 foi para o T1, com o dono do deck
- [ ] Decidir se entra uma captura do WhatsApp no slide 13
- [ ] Ensaiar a demo duas vezes na máquina do Guilherme e uma na do Tiago, com o ambiente subido do
      zero, e gravar o vídeo do plano C com cadastro e entrada no começo
- [x] Tirar as capturas da aplicação para o apêndice
- [ ] Decidir se entram capturas do quadro e de um PR com os checks no apêndice
- [ ] Ensaiar cronometrado, com as trocas de fala e de compartilhamento, e uma rodada de perguntas
      cruzadas usando a seção de perguntas prováveis
- [ ] Exportar em PDF e subir no Moodle antes das 19h30. Conferir na tarefa se o envio é um pelo
      grupo ou um por pessoa
