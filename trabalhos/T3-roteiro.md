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
demonstração ao vivo, e mostrar o Azure DevOps, o Kanban, o GitHub e a colaboração no Teams.

| Critério | Peso | Onde a apresentação responde |
|---|---|---|
| Evolução e qualidade da implementação | 30% | Blocos 2, 3 e 4 |
| Aderência à arquitetura e aos requisitos | 20% | Bloco 2, e o fio "o Guia disse, o código faz" nos blocos 3 e 4 |
| Demonstração funcional e qualidade técnica | 20% | Bloco 5 |
| Organização no Azure DevOps, GitHub e Kanban | 10% | GitHub no bloco 2, Azure Boards no bloco 3, os dois ao vivo |
| Apresentação, clareza e slides | 10% | O deck todo |
| Participação individual na arguição | 10% | Protocolo de arguição e o estudo de cada um, no fim |

A avaliação é individual. Por isso cada integrante fala do que construiu, e o tempo de fala é
equilibrado entre os quatro, mesmo que o volume de trabalho não tenha sido.

## A ideia que sustenta tudo

No T2 entregamos uma arquitetura no papel. No T3 mostramos que ela virou código sem ser traída, e
contamos onde a implementação obrigou a ajustar o desenho.

O fio da apresentação inteira é uma frase repetida em cada bloco técnico: **"o Guia disse, o código
faz"**. Cada um mostra uma regra da arquitetura e o lugar do código onde ela é cumprida. Os ajustes
não são confissão de erro, são o critério de aderência funcionando: cada um está registrado com o
motivo, nos Ajustes de Arquitetura para o MVP da Sprint 5.

A frase que fecha: **o teto de vagas está onde o Guia disse que estaria, e um teste com respostas
simultâneas prova isso.**

## Quem fez o quê, e como isso entra na fala

| Integrante | O que construiu | O que apresenta |
|---|---|---|
| Tiago | A base do projeto: monorepo, `contract`, regra de camadas no lint, integração contínua e a orquestração dos três tiers no `docker compose`. A documentação de arquitetura. A integração do front com o back na `main` | Arquitetura, Docker e GitHub |
| Guilherme | O front: as telas do anfitrião e do convidado, o visual dos templates, a primeira versão do mock. O projeto no Azure DevOps é da organização dele | Front e Azure Boards, e conduz a demo |
| Gabriel | A primeira versão do back-end: os serviços do anfitrião, do convite e da resposta, os repositórios, os controllers, o CSV e os primeiros testes | Back-end, e narra a parte da demo que passa pela API |
| Andreas | Apresentou um bloco no seminário do T1. Os itens dele na Sprint 6 são definidos pelo time antes do ensaio | Abertura com o problema e o escopo, que são do time, e o planejamento até o fim |

Regra para todos: **ninguém diz "eu fiz" sobre o que não fez.** Para o que foi feito em conjunto, ou
por outro integrante, a fala é "o time decidiu" ou "o Gabriel escreveu". Nada perde ponto por ser
coletivo, e uma atribuição errada desmonta na primeira pergunta do professor.

Sobre o uso de assistente de IA, que aparece no histórico do GitHub: se perguntarem, responder com
franqueza. A ferramenta acelerou a escrita e a adequação do código, e as decisões, a revisão e a
validação foram do time. O quadro de Ajustes da Sprint 5 é a prova de que houve revisão contra a
arquitetura.

## Tempo e donos

| Bloco | Tema | Min | Slides | Dono |
|---|---|---|---|---|
| 1 | O problema, quem usa e o escopo do MVP | 3 | 1 a 3 | Andreas |
| 2 | Do Guia ao código: arquitetura, base e Docker | 5 | 4 a 7 | Tiago |
| 3 | O front e a organização do trabalho | 4 | 8 a 10 | Guilherme |
| 4 | O back-end e a regra mais importante do sistema | 3 | 11 e 12 | Gabriel |
| 5 | Demonstração ao vivo | 6 | 13 | Guilherme conduz, Gabriel narra |
| 6 | O que falta e como termina | 2 | 14 | Andreas |

Mais um minuto para as trocas. Total 24, dentro da faixa de 20 a 25.

As dificuldades não têm bloco próprio. Cada um conta a sua dentro do próprio bloco, porque quem
viveu a dificuldade é quem convence na arguição.

---

## Bloco 1, o problema e o escopo (3 min, Andreas)

Objetivo: situar a turma em três minutos, sem detalhe técnico. Tudo aqui saiu dos artefatos da
Sprint 1, que estão em `docs/Sprints/Sprint-1`.

**Slide 1, capa.** Nome do produto, os quatro nomes e a disciplina.

**Slide 2, o problema.** Quem organiza uma festa junta confirmações por WhatsApp e perde a conta de
quantas pessoas vêm, quantos acompanhantes cada um leva e o que cada um não pode comer. O buffet
precisa desse número e dessa lista. Na fala, as duas personas: o anfitrião que organiza e o
convidado que só quer responder rápido, sem criar conta.

**Slide 3, o MVP em seis grupos.** Conta do anfitrião, criação e personalização do convite,
compartilhamento por link, confirmação de presença, restrições alimentares e o painel com a
consolidação. Ao lado de cada grupo, a marca de entregue. Na fala: são doze histórias de usuário e
as doze funcionam hoje de ponta a ponta.

Passagem: "Como isso foi construído em cima da arquitetura que apresentamos no Grau A, o Tiago
mostra agora."

Perguntas prováveis e o que responder:
- **Por que o convidado não cria conta?** Porque o convidado só abre o link e responde. Exigir conta
  derruba a taxa de resposta, que é o que o anfitrião mais quer.
- **Como o convidado altera a resposta, se não tem conta?** Ao responder, ele recebe um link pessoal,
  só dele, que serve para voltar e alterar.
- **Quais restrições alimentares existem?** Vegetariano, vegano, sem glúten, sem lactose e alergia.
  A alergia exige descrever o quê.

---

## Bloco 2, do Guia ao código (5 min, Tiago)

Objetivo: o critério de aderência. Mostrar que o desenho do Grau A está no código e que a regra de
camadas é verificada por máquina, não só por boa vontade.

**Slide 4, o desenho em uma figura.** Três tiers no compose (front em Next.js, API em NestJS e
PostgreSQL) e as três camadas lógicas dentro da API: Apresentação, Domínio e Dados. O front segue
MVC. O `contract` é o pacote de tipos compartilhado entre os dois lados. Fala: "camada é divisão
lógica, tier é processo separado. As três camadas moram no mesmo container da API."

**Slide 5, a base que segura o resto.** O monorepo com `contract`, `api` e `front`. A regra de
camadas está no lint: o Domínio não pode importar da Apresentação, e os Dados não podem importar de
nenhuma camada de cima. Um PR que quebra a regra fica vermelho. A integração contínua roda lint,
formatação, tipos, testes contra um PostgreSQL de verdade, build e a construção das imagens, em
todo PR. Ao vivo, dez segundos: a lista de PRs fechados no GitHub e a aba de checks verdes de um
deles.

**Slide 6, o Docker que apresentamos no T1, agora com o produto dentro.** O `docker-compose.yml` é a
forma executável do Diagrama de Implantação: o banco não publica porta, o front publica a 3000 e a
API publica a 3001, porque o navegador fala com ela direto, em todo o painel do anfitrião e quando o
convidado envia ou altera a resposta. Só a leitura da página do convite passa pelo servidor do
front. A API só sobe depois que o banco responde ao healthcheck, e as migrations rodam quando o
volume do banco está vazio. Um segundo arquivo troca a API por um mock, para desenvolver as telas
sem banco. Fala: "no T1 a promessa era um
arquivo que qualquer um de nós sobe com um comando. Esse comando é o que vai rodar na demo."

**Slide 7, o Guia disse, o código faz.** Quatro linhas, cada uma com a regra e onde ela mora:
- O teto de vagas é conferido pela camada de Dados dentro da transação, travando a linha do
  convite. O Domínio calcula quantas vagas a resposta nova pede.
- Nenhuma rota confirma que um convite existe. Link inválido e convite despublicado dão o mesmo 404
  na página pública, e o convite de outro anfitrião dá o mesmo 404 no painel. Um teste de ponta a
  ponta confere que o corpo e o cabeçalho são idênticos.
- A sessão do anfitrião é cookie assinado, e o front não guarda token.
- O link do convite tem 128 bits de gerador seguro e nasce no Domínio, nunca no navegador.

Dificuldade do bloco: **juntar o trabalho de quatro pessoas.** O front e o back foram escritos em
paralelo, fora da `main`, e precisaram ser adequados ao contrato e às camadas para entrar. Lição: o
`contract`, com os tipos de pedido e resposta das 18 rotas, foi o que permitiu juntar sem reescrever
tudo, e deveria ter sido a primeira entrega de todas.

Passagem: "As telas que o convidado e o anfitrião usam são do Guilherme."

Perguntas prováveis:
- **Por que três camadas e não quatro?** Porque só existem três motivos de mudança com vida
  própria: o jeito de falar com o mundo, as regras do evento e o armazenamento. Uma quarta camada
  cobraria o custo sem entregar separação. Está na seção 1 do Guia.
- **Por que o teto fica nos Dados e não no Domínio?** Porque a conferência precisa ser atômica com
  a gravação. Se o Domínio lesse a soma e depois gravasse, duas respostas simultâneas passariam
  juntas. O Domínio decide quantas vagas a resposta pede, os Dados garantem o teto na transação.
- **Por que 404 e não 403 para convite de outro anfitrião?** Porque 403 confirmaria que o convite
  existe. Quem decide o que o mundo lê é a Apresentação.
- **Por que local e não na nuvem?** Decisão do ADR-0003: nesta fase o MVP não tem requisito de
  disponibilidade, de usuários reais nem de acesso externo, e o projeto não tem custo. O compose
  local cobre o que o projeto precisa, e o mesmo arquivo serve de base se um dia houver publicação.
- **A pasta `api/src/model` é uma quarta camada?** Não. São as classes do modelo e as projeções que
  atravessam as camadas, que todas podem ler e que não importam nenhuma camada. O lint garante isso.

---

## Bloco 3, o front e a organização (4 min, Guilherme)

Objetivo: mostrar as telas como produto e contar a adequação do protótipo à arquitetura, que é a
melhor prova de aderência do front. Depois, o quadro ao vivo.

**Slide 8, do protótipo às telas.** As telas nasceram de um protótipo feito com ferramenta de
prototipação, com o visual que está no produto hoje. Para entrar na arquitetura, o protótipo foi
adequado: o visual foi mantido e reescrito em CSS puro, e o front ficou só com Next.js e React,
como manda a stack escolhida. Fala: "o visual é o mesmo do protótipo. O que mudou foi onde cada
decisão mora."

**Slide 9, o que a tela fazia e a arquitetura não deixa.** Três exemplos, cada um com o antes e o
depois:
- A página pública mostrava quantas vagas restavam. Hoje não mostra contagem nenhuma, porque isso
  expõe dado do anfitrião. A lotação só aparece quando a resposta é recusada.
- O CSV para o buffet era montado no navegador. Hoje vem pronto da API, com a proteção contra
  fórmula de planilha.
- O login guardava um token no navegador. Hoje a sessão é cookie, e o front não guarda nada.

Fala: "a checagem na tela é conforto. Quem decide é a API."

**Slide 10, como o time se organizou.** Seis sprints de duas semanas no Azure Boards: requisitos,
arquitetura, projeto da solução, duas de implementação e uma de consolidação. As histórias quebradas
em tarefas de API e de tela, com responsável. Ao vivo, um minuto: o quadro da Sprint 5 com as
histórias em Done, uma história aberta com as tarefas filhas, e a lista de sprints com as datas.
Depois, uma captura do canal do time no Teams com uma discussão de decisão. Não trocar de janela
para o Teams, porque a aula já é nele.

Dificuldade do bloco: **o protótipo trazia muita coisa que a arquitetura não queria**, de
bibliotecas de componentes a um banco de outra plataforma, e algumas regras de negócio estavam na
tela. Separar o que era visual, e fica, do que era regra, e sai, foi o trabalho da adequação.

Passagem: "Quem recebe essas chamadas é a API, e a primeira versão dela é do Gabriel."

Perguntas prováveis:
- **Onde fica o Controller do MVC no Next.js?** Em `front/src/controller`: o `ApiClient`, por onde
  passa toda chamada à API, com tempo limite de 4 segundos no servidor e 15 no navegador, e os
  módulos que traduzem cada ação da tela numa chamada tipada. A View está em `front/src/view` e as
  rotas de tela em `front/src/app`.
- **O `ApiClient` repete chamada que falhou?** Só as leituras e o publicar, uma vez. O envio da
  resposta do convidado nunca repete, porque repetir poderia gravar duas vezes.
- **Como a lista de presença se atualiza?** A tela consulta a API a cada 20 segundos. Na primeira
  falha a tela avisa que a lista pode estar desatualizada. A partir da segunda falha seguida o
  intervalo dobra, até 2 minutos. Falha nunca vira lista vazia.
- **Como funciona a personalização?** Três templates prontos (Clássico, Jardim e Noite), cada um com
  duas cores que o anfitrião escolhe. O convidado vê o convite com o template e as cores escolhidos.
- **Por que não deixaram as bibliotecas do protótipo?** A maior parte não era usada por tela nenhuma,
  e só um integrante tinha experiência com a stack. Cada biblioteca a mais é mais coisa para
  aprender e manter.

---

## Bloco 4, o back-end e a regra mais importante (3 min, Gabriel)

Objetivo: mostrar as regras de negócio e onde elas moram. Este bloco prepara a demo, que vem logo
depois e mostra as mesmas regras funcionando.

**Slide 11, o caminho de uma resposta.** O convidado envia a resposta. A Apresentação valida a forma
e o limite de tráfego. O Domínio aplica as regras: limite de acompanhantes, "não vou" zera os
acompanhantes e a observação, "talvez" não ocupa vaga, a alergia exige descrição, e calcula quantas
vagas a resposta nova pede. Os Dados abrem a transação, travam o convite, somam as vagas já
ocupadas pelos confirmados e seus acompanhantes, conferem o teto e gravam. Se não cabe, devolvem a
recusa, e o Domínio dá nome ao erro. Fala: "o Domínio decide quantas vagas a resposta pede, o banco
garante o teto."

**Slide 12, como sabemos que funciona.** Testes do Domínio para as regras, testes contra um
PostgreSQL de verdade e testes das rotas de ponta a ponta. O teste que vale citar: quatro respostas
simultâneas, cada uma pedindo duas vagas, num convite com cinco vagas. Passam exatamente duas.

Dificuldade do bloco: **a regra de negócio fugiu de camada.** Na primeira versão, a regra das vagas
e a do "talvez" estavam escritas na consulta SQL. Funcionava, mas a camada de Dados passava a saber
o que é uma vaga, e o Guia diz que isso é do Domínio. Na adequação, o cálculo das vagas que a
resposta pede subiu para o Domínio, e a camada de Dados ficou com a soma das vagas ocupadas e a
conferência do teto. Uma segunda: o fuso horário. A data e a hora do convite eram juntadas com o
fuso fixo `-03:00`, e a regra de "data no passado" comparava com o instante atual, então criar um
convite para hoje com a hora já passada era recusado. Agora a data e a hora são juntadas no fuso
`America/Sao_Paulo`, pelo nome, e o Domínio compara por dia. A mesma comparação por dia vale para o
prazo de alteração da resposta.

Passagem: "Agora vamos ver isso funcionando."

Perguntas prováveis:
- **O que acontece se duas pessoas confirmarem ao mesmo tempo com uma vaga sobrando?** A transação
  trava a linha do convite. A segunda só soma depois de conseguir a trava, então já enxerga a
  primeira gravada, e é recusada. É o que o teste de concorrência prova.
- **Como a senha é guardada?** Com hash argon2id. A senha nunca é gravada.
- **O que impede alguém de adivinhar um link de convite?** O token tem 128 bits de gerador
  criptográfico, então adivinhar é inviável. Além disso, enviar resposta tem limite por endereço de
  origem e por token. Link inválido e convite despublicado dão o mesmo 404. O link só nasce na
  primeira publicação, então rascunho nem tem link.
- **E o link pessoal, depois que o anfitrião despublica?** Continua valendo para quem já respondeu,
  por decisão da seção 9.5 do Guia: a pessoa ainda consegue ver e alterar a própria resposta.
- **O que acontece se o convidado abrir o link pessoal depois do evento?** Ele vê a resposta, mas não
  consegue mais alterar depois do fim do dia do evento.

---

## Bloco 5, demonstração ao vivo (6 min, Guilherme conduz, Gabriel narra)

Objetivo: os 20% da demo. Um caminho só, ensaiado, sem improviso.

**Quem compartilha a tela.** Uma máquina só para a demo inteira, a que passar no ensaio de hoje com o
ambiente subido do zero. Padrão: a do Guilherme, que conduz. Reserva: a do Tiago. Os slides ficam
compartilhados por quem não está na demo, e a troca de compartilhamento é ensaiada.

**Preparação, antes de entrar na chamada:**
- Ter o `.env` criado a partir do `.env.example`. Para começar do zero, `docker compose down -v`,
  porque as migrations só rodam com o volume do banco vazio.
- Subir com `docker compose up -d --build` e conferir com `docker compose ps`.
- Abrir `http://127.0.0.1:3000`. Não usar `localhost`.
- Conta de anfitrião criada e logada numa janela normal.
- Uma janela anônima aberta para o convidado.
- Um convite de reserva já publicado e lotado, com teto de 2 pessoas e uma confirmação com 1
  acompanhante, para mostrar a lotação sem depender do caminho principal.
- Fonte do navegador em 125%, para ficar legível na transmissão.

**O caminho, com quem fala:**

1. **Guilherme, criar e personalizar (1 min 30).** Criar o convite com nome, data, hora, local, teto
   de 4 pessoas e no máximo 1 acompanhante. Trocar o template e as cores e mostrar a prévia mudando.
   Publicar e copiar o link.
2. **Gabriel narra, convidado responde (1 min 30).** Colar o link na janela anônima. Mostrar que não
   pede conta. Confirmar com 1 acompanhante e restrição "Alergia", com a descrição. Mostrar o link
   pessoal que aparece no fim. Fala: "a API calculou duas vagas no Domínio e conferiu o teto dentro
   da transação."
3. **Gabriel narra, as recusas (1 min).** Digitar 2 acompanhantes e tentar enviar: o navegador
   barra. Dizer que isso é só conforto da tela: a API recusa do mesmo jeito se a tela for
   contornada. No convite de
   reserva, tentar confirmar: aparece a lotação, sem dizer quantas vagas existem.
4. **Gabriel narra, a alteração (30 s).** Abrir o link pessoal e trocar a resposta para "talvez".
   Fala: "o talvez não ocupa vaga, e a alteração vale até o fim do dia do evento."
5. **Guilherme, o painel (1 min).** Voltar ao painel. A lista de presença mostra a resposta. Abrir a
   consolidação alimentar e baixar o CSV. Abrir na planilha e mostrar os acentos certos e a alergia
   com a descrição.
6. **Guilherme, despublicar (30 s).** Despublicar e, na janela do convidado, abrir de novo o **link
   do convite**, não o link pessoal: aparece a página de não encontrado, igual à de um link que
   nunca existiu. O link pessoal continua valendo para quem já respondeu, e isso é de propósito.

**Se der errado.** Plano B: `docker compose -f docker-compose.yml -f docker-compose.mock.yml up -d`
sobe o mock. Entrar com `demo@convite.dev` e a senha `senha1234`. O convite de exemplo está em
`http://127.0.0.1:3000/i/DEMO0000000000000000000000`. A sessão da API real não vale no mock, e quem
fala avisa que é o mock. Plano C: o vídeo de 2
minutos do caminho acima, gravado hoje, e quatro capturas no fim do deck. Nenhum dos dois é
improvisado na hora: os dois são ensaiados.

---

## Bloco 6, o que falta e como termina (2 min, Andreas)

**Slide 14, até a entrega final em 17/11.** A Sprint 6, de 03/11 a 16/11, consolida a solução e
prepara o Pitch Final. Os itens:
- Completar o Protótipo de Baixa Fidelidade da Sprint 3 com as telas que agora existem.
- Desenhar o diagrama de sequência da lista de presença, que faltou no Grau A.
- Fechar o Team Charter, que ainda tem uma ficha a preencher.
- Revisar os artefatos das Sprints 1 a 3 contra o código, e registrar o que divergir.
- Preparar o deck e o ensaio do Pitch Final.

Na fala, Andreas diz quais desses itens ficam com ele. **O time decide isso antes do ensaio**, e os
itens entram no quadro da Sprint 6 com o dono, para a fala ter lastro.

Fechamento, dito devagar e sem slide próprio: o desenho do Grau A está no código, os desvios estão
registrados com motivo, e o teto de vagas está onde o Guia disse que estaria. Depois, anunciar quem
responde pelo quê e abrir para a arguição.

Perguntas prováveis:
- **O que vocês fariam diferente?** Começar pelo contrato de tipos e pela base, antes de qualquer
  tela, e integrar mais cedo, em vez de juntar front e back no fim.
- **Qual o maior risco até a entrega?** Divergência entre a documentação do Grau A e o código, que é
  o que a revisão da Sprint 6 resolve.

---

## Protocolo de arguição

1. Quem recebe a pergunta responde a primeira frase e passa nominalmente para o dono do assunto.
2. Ninguém responde duas seguidas enquanto houver integrante que ainda não respondeu.
3. Territórios: problema, requisitos e planejamento com o Andreas; arquitetura, Docker, GitHub e
   integração com o Tiago; telas, MVC do front e Azure Boards com o Guilherme; API, regras e testes
   com o Gabriel.
4. O Tiago não responde primeiro. Ele completa quando o dono travar, para o professor ouvir os
   outros três.

## O que cada um precisa saber de cor

A arguição vale 10% e é individual. Cada um estuda o próprio território antes do ensaio.

**Andreas.** `docs/Sprints/Sprint-1`: as personas, a jornada e as histórias H01 a H12. Saber dizer
em uma frase o que cada um dos seis grupos do MVP faz. Saber os itens da Sprint 6 que ficam com ele.

**Tiago.** A seção 1 do Guia, para a pergunta das três camadas. O `docker-compose.yml` linha a linha.
A seção 3 dos Ajustes da Sprint 5, porque perguntas sobre a adequação do back podem cair em você.

**Guilherme.** A estrutura final de `front/src`, que mudou na adequação: `app` são as rotas de tela,
`view` são as telas e `controller` são o `ApiClient` e as chamadas tipadas. A seção 2 dos Ajustes da
Sprint 5, que é a tabela "o protótipo fazia, a arquitetura não permite". O `polling.ts`, para a
pergunta da atualização.

**Gabriel.** Os serviços em `api/src/domain`, principalmente `rsvp-rules.ts` e `rsvp.service.ts`, e
o `saveRsvpWithinCapacity` em `api/src/data/invite.repository.ts`. A seção 3.1 dos Ajustes da Sprint
5, que diz o que mudou no código dele e por quê. O teste de concorrência em
`api/src/data/invite.repository.writes.spec.ts`.

## Regras para os slides

- Nenhum identificador interno no slide: UC, número de work item, ADR, linha do Guia, nome de
  arquivo. Tudo isso vai na fala, e na arguição vira ponto de rastreabilidade.
- Um título por slide, que já diz a mensagem.
- Nenhuma contagem de commits, testes ou arquivos no slide, porque envelhece.
- Nenhuma captura de tela que não tenha sido feita de verdade, com data no rodapé.
- No rodapé de cada slide, o nome de quem apresenta, para o professor associar fala e pessoa.

## Checklist até terça

- [x] Atualizar o Azure Boards: H01 a H12, a #125, as tarefas das Sprints 4 e 5 e os épicos em
      Done, e as tarefas de API com o Gabriel
- [ ] Confirmar a divisão de blocos no grupo
- [ ] Definir os itens da Sprint 6 que ficam com o Andreas, e criar os itens da Sprint 6 no quadro
- [ ] Criar o item do T3 no quadro, como o #78 foi para o T1, com o dono do deck
- [ ] Fechar a #87 e a #57, do Team Charter, quando a ficha do Andreas estiver preenchida
- [ ] Escolher a captura do Teams para o bloco 3
- [ ] Ensaiar a demo duas vezes na máquina que vai compartilhar, com o ambiente subido do zero, e
      gravar o vídeo do plano C
- [ ] Ensaiar cronometrado, com as trocas de fala e de compartilhamento, e uma rodada de perguntas
      cruzadas
- [ ] Exportar em PDF e subir no Moodle antes das 19h30. Conferir na tarefa se o envio é um pelo
      grupo ou um por pessoa
