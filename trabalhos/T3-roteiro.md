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

| Critério                                     | Peso | Onde a apresentação responde                                                                 |
| -------------------------------------------- | ---- | -------------------------------------------------------------------------------------------- |
| Evolução e qualidade da implementação        | 30%  | Slide 4, a linha do tempo, e os blocos 2, 3 e 4                                              |
| Aderência à arquitetura e aos requisitos     | 20%  | Slides 5 a 7, os diagramas do Grau A, e o slide 9, com cada regra e o lugar do código onde ela está, e o que cada passo da demo mostra |
| Demonstração funcional e qualidade técnica   | 20%  | Bloco 5                                                                                      |
| Organização no Azure DevOps, GitHub e Kanban | 10%  | Slide 15 e, ao vivo, o quadro e o GitHub logo depois da demo                                  |
| Apresentação, clareza e slides               | 10%  | O deck todo                                                                                  |
| Participação individual na arguição          | 10%  | Protocolo de arguição e o estudo de cada um, no fim                                          |

A avaliação é individual. Por isso cada integrante fala do que construiu e do que aconteceu com isso
na integração. O Andreas fica com a abertura e a linha do tempo, o Tiago com a arquitetura, o Gabriel
com o back-end, e o Guilherme com o front-end, as dificuldades e a organização. Quem conduz a
demonstração faz o fechamento.

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
| Tiago      | A base do projeto: monorepo, `contract`, regra de camadas no lint, integração contínua e a orquestração dos três tiers no `docker compose`. A documentação de arquitetura. A integração do front-end e do back-end na `main`, com a adequação dos dois à arquitetura registrada nos Ajustes da Sprint 5                         | Os diagramas do Grau A, lint e integração contínua, e a demo com o quadro, o GitHub e o fechamento se for local |
| Guilherme  | O protótipo do front-end: [o fluxo e o visual das telas do anfitrião e do convidado, os três templates e a primeira versão do mock; confirmar com ele]. Na integração, o protótipo foi adequado à arquitetura. O projeto no Azure DevOps é da organização dele                                                              | O protótipo e o que mudou nele, as dificuldades, a organização, o planejamento, e a demo com o quadro, o GitHub e o fechamento se a aplicação estiver publicada |
| Gabriel    | A primeira versão das rotas e das regras do back-end, sobre a base: os serviços do anfitrião, do convite e da resposta, os repositórios, os controllers, a transação do teto com trava na linha do convite, o CSV com proteção contra fórmula e os primeiros testes. Na integração, essa versão foi adequada às camadas | As regras da arquitetura no código, o caminho de uma resposta pela API e os testes |
| Andreas    | Nesta apresentação, o problema, o escopo do MVP e a linha do tempo, que são artefatos do time. Cronometra a apresentação | Abertura, problema, escopo e linha do tempo |

Regras para todos:

- **Ninguém diz "eu fiz" sobre o que não fez.** Para o que foi feito em conjunto, a fala é "o time
  levantou" ou "o time decidiu". Para o que outro fez, diz quem fez. Uma atribuição errada desmonta
  na primeira pergunta do professor.
- **Cada um conta a dificuldade que viveu.** Quando a correção foi feita por outro integrante, conta
  o que aprendeu com ela e diz quem corrigiu.
- **Ferramentas de IA.** Assistentes de IA e ferramenta de prototipação foram usados no projeto, e o
  histórico do GitHub mostra isso. Se perguntarem, cada um responde com franqueza pelo que fez e pelo
  que revisou. As decisões estão nos ADRs, no Guia e nos Ajustes da Sprint 5.

## Tempo, donos e tela

| Bloco | Tema                                              | Min  | Slides  | Quem fala                                                 |
| ----- | ------------------------------------------------- | ---- | ------- | --------------------------------------------------------- |
| 1     | Problema, escopo e linha do tempo                 | 2:45 | 1 a 4   | Andreas                                                   |
| 2     | Diagramas do Grau A, lint e integração contínua   | 4:30 | 5 a 8   | Tiago                                                     |
| 3     | Back-end                                          | 3:30 | 9 a 11  | Gabriel                                                   |
| 4     | Front-end, dificuldades e organização             | 4:30 | 12 a 15 | Guilherme                                                 |
| 5     | Demonstração, quadro Kanban, GitHub e fechamento  | 7:45 | 16      | Guilherme, se a aplicação estiver publicada; senão, Tiago |

São quatro vozes em sequência, sem voltar a ninguém: Andreas, Tiago, Gabriel e Guilherme, que fica
do slide 12 até o fim se a aplicação estiver publicada. Se a demo for local, o Tiago volta só para ela
e para o fechamento. A demonstração é a última parte, e não há slide de perguntas: a arguição começa
com a aplicação ainda aberta. Com as trocas, cerca de 23 minutos, com folga até o limite de 25. O ensaio
cronometrado é o que diz se cabe.

**Compartilhamento.** O Tiago compartilha o PDF até o slide 15. Na demonstração:

- **Aplicação publicada:** o Guilherme assume o compartilhamento no slide 16 e segue até o fim, com
  o navegador, o quadro, o GitHub e o PDF abertos na máquina dele. Uma troca só.
- **Demonstração local:** o Tiago compartilha do começo ao fim, e o Guilherme fala dos slides 12 a 15
  sobre a tela do Tiago. Nenhuma troca de compartilhamento.

Quem fala diz "próximo" para avançar.

**Na máquina que compartilha:** modo não perturbe, e-mail e WhatsApp fechados, barra de favoritos
oculta, carregador ligado, de preferência cabo de rede. **Os outros:** câmera ligada enquanto falam,
e a primeira frase de cada um começa com o nome ("Aqui é o Gabriel..."), porque a avaliação é
individual.

**Ordem de corte.** O Andreas cronometra e avisa pelo WhatsApp do grupo, fora da reunião. Se o fim do
bloco 4 passar de 16:00, quando a demonstração deveria começar, corta-se nesta ordem: o slide 8 fica numa frase só; o passo 4 da demo, que fica só dito; abrir a
planilha, mostrando só o download; o GitHub depois da demo, reduzido à aba de checks. Não entram na
ordem de corte a resposta do convidado, a lotação, o painel e o fechamento.

---

## Bloco 1, problema, escopo e linha do tempo (2:45, Andreas)

**Slide 1, capa.** Título "App de gerenciamento de convites", os quatro nomes e a disciplina. O nome
provisório do projeto não vai para os slides. Fala de abertura, 20 segundos:

> "Somos o Time 04. O nosso projeto é um app para gerenciar convites de festa: o anfitrião cria o
> convite e acompanha quem vai, e o convidado responde pelo link. Vamos mostrar o problema, a
> arquitetura implementada, o front-end, o back-end, a aplicação funcionando e o que falta até
> 17/11."

**Slide 2, título "O problema e os usuários".** Quem organiza uma festa junta confirmações pelo
WhatsApp e perde a conta de quantas pessoas vêm, quantos acompanhantes cada um leva e o que cada um
não pode comer. Na fala, as personas que o time levantou: a anfitriã que organiza e o convidado que
só quer responder rápido, sem criar conta, e o buffet como interessado secundário, que é quem recebe
a lista.

**Slide 3, título "Escopo do MVP".** Uma tabela com os seis grupos de funcionalidades e o que cada
um permite, e a legenda "As doze histórias de usuário desses grupos estão implementadas". A criação
inclui o teto de pessoas e a confirmação o limite de acompanhantes, porque os dois voltam nos slides
do back-end e na demo. Os códigos H01 a H12 não vão no slide. Na fala: são doze histórias, as doze estão
implementadas, e no quadro elas aparecem como H01 a H12 (conta é a H01, criação do convite da H02 à
H04, compartilhamento H05 e H06, confirmação da H07 à H09, restrições H10, painel H11 e H12).

**Slide 4, título "Linha do tempo do projeto".** Linha do tempo horizontal: Sprint 1, requisitos;
Sprint 2, arquitetura; Sprint 3, documento de arquitetura; marca do Grau A; Sprint 4, a base;
Sprint 5, protótipo e integração; Sprint 6, consolidação. Fala:

> "No Grau A o projeto tinha as doze histórias, o Guia da Arquitetura, os ADRs e o documento de
> arquitetura. O protótipo de baixa fidelidade ficou incompleto e está no plano da Sprint 6. Na Sprint
> 4 o Tiago montou a base do código, sobre o repositório e o compose que já existiam: o pacote de
> tipos compartilhado entre front-end e back-end, o lint de camadas, a integração contínua e os
> esqueletos da API e do front-end. O plano era fechar o fluxo central nessa sprint, mas ele só fechou
> na Sprint 5. Na Sprint 5 o Guilherme fez o protótipo das telas, o front-end e o back-end foram
> integrados nessa base, e o que precisou mudar na arquitetura foi registrado com o motivo nos Ajustes
> da Sprint 5."

As datas são as sprints do time, de duas semanas. O Plano de Ensino põe a Sprint 6 a partir de
27/10, e a semana entre 29/09 e 05/10 foi a entrega do Grau A. Ter essa resposta pronta.

Passagem: "O Tiago mostra os diagramas da arquitetura."

---

## Bloco 2, diagramas do Grau A, lint e integração contínua (4:30, Tiago)

**Slides 5, 6 e 7, os diagramas do documento de arquitetura do Grau A.** Os mesmos diagramas do
DAS, renderizados de novo com fonte maior para ler na chamada. As versões para slide estão em
`trabalhos/deck-t3/diagramas`.

- **Slide 5, "Diagrama de camadas".** Três tiers no compose (front-end em Next.js, API em NestJS e
  PostgreSQL) e as três camadas lógicas dentro da API: Apresentação, Domínio e Dados. O front-end segue
  MVC. Fala: "camada é divisão lógica, tier é processo separado. As três camadas ficam no mesmo
  container da API."
- **Slide 6, "Diagrama de componentes".** Cortado em duas metades lado a lado: o front-end com a
  Apresentação, e o Domínio com os Dados e o banco. Os rótulos das interfaces estão menores que os
  dos componentes, para não se encostarem. Fala: os componentes da API existem no código com o mesmo
  nome. O limite de tráfego virou um serviço chamado pelo controller, e não uma guarda do Nest. No
  front-end, o painel é montado pelo layout das telas do anfitrião. O `TemplateSet` virou um CSS com
  uma classe por template e uma imagem de prévia por template, como o DAS registra. O código tem peças
  que o diagrama não detalha, como a guarda que só aceita JSON e o cookie de sessão.
- **Slide 7, "Diagrama de implantação".** O `docker-compose.yml` é a forma executável dele. Fala: o
  banco não publica porta, o front-end fica na 3000 e a API na 3001 do host, porque o navegador fala com
  ela direto; a API sobe depois do healthcheck do banco. "No T1 apresentamos o Docker como forma de
  cada integrante subir o ambiente com um comando." Se a demo for local, é esse compose que roda
  nela. Se for publicada, dizer que publicar fora da máquina local é uma decisão nova, que revisa o
  ADR-0003.

**Slide 8, título "Lint e integração contínua".** O lint recusa import que quebra a regra de
camadas: o Domínio não importa da Apresentação, os Dados não importam de nenhuma camada de cima, e
a Apresentação não chama os Dados direto.
Em todo PR a integração contínua roda lint, formatação, tipos, testes contra um PostgreSQL e build,
e constrói as imagens. Um segundo arquivo do compose troca a API por um mock. Ao lado, o recorte
com os dois jobs verdes de um PR no GitHub.

Dificuldade do bloco, dita assim:

> "A dificuldade deste bloco foi juntar o front-end e o back-end, que foram escritos em paralelo, fora da
> `main`. A integração foi em duas etapas. Primeiro o front-end, com um mock que responde às rotas com os
> tipos do `contract`. Depois o back-end. Em cada etapa, o que não cabia na arquitetura foi adequado,
> registrado com o motivo nos Ajustes da Sprint 5, e só entrou na `main` com a CI verde. O
> `contract`, criado no começo da Sprint 4, permitiu juntar as duas partes sem reescrever tudo. O
> protótipo do front-end foi feito sem usar ele, e foi isso que exigiu a maior parte da adequação."

Passagem: "O Gabriel mostra o back-end."

---

## Bloco 3, back-end (3:30, Gabriel)

Fala de abertura do bloco:

> "As regras que vou mostrar são as que estão hoje no código. A primeira versão das rotas e dessas
> regras foi minha, inclusive a transação com a trava na linha do convite. Na integração, algumas
> regras mudaram de camada, e eu conto isso no fim do bloco."

**Slide 9, título "Regras da arquitetura no código".** Três regras, cada uma com o lugar do código
onde está:

- Quem não tem acesso não descobre se um convite existe. O Domínio distingue os casos, e a
  Apresentação responde a todos com o mesmo 404: link inválido, convite despublicado e convite de
  outro anfitrião. Um teste de ponta a ponta confere o status e o corpo.
- A sessão do anfitrião é cookie assinado, e o front-end não guarda token.
- O link do convite nasce no Domínio, com gerador seguro, na primeira publicação. Nunca no
  navegador.

Fala final do slide: "A regra do teto de vagas está no próximo slide."

**Slide 10, título "Caminho de uma resposta na API".** Diagrama de três raias, uma por camada, com
sete passos:

- Apresentação: confere o formato e o limite de tráfego. Na fala, a ordem real: limite por endereço
  de origem, formato do corpo, se o link existe, e só então o limite por link, para o erro de excesso
  de tentativas não revelar que o link existe.
- Domínio: aplica as regras da resposta e calcula as vagas pedidas.
- Dados: trava o convite e soma as vagas ocupadas, confere o teto e grava, ou devolve a recusa.
- Se cabe, a seta volta direto para a Apresentação.
- Domínio: se não cabe, dá nome à recusa (convite lotado).
- Apresentação: responde com o link pessoal ou com o erro.

A legenda resume as regras: "Sim" ocupa uma vaga para o convidado e uma para cada acompanhante,
"Talvez" e "Não" não ocupam vaga, "Não" zera acompanhantes e observação, e alergia exige descrição.

Fala de fecho do slide: "o Domínio calcula quantas vagas a resposta pede, e a camada de Dados
confere o teto dentro da transação."

**Slide 11, título "Testes".** Testes do Domínio, testes contra um PostgreSQL de verdade e
testes das rotas de ponta a ponta. Fala:

> "Os testes de hoje foram reescritos na integração, porque os meus testavam assinaturas antigas. O
> que vale citar: quatro respostas simultâneas, cada uma pedindo duas vagas, num convite com teto de
> cinco. Duas são gravadas e duas recusadas."

Dificuldade do bloco:

> "A dificuldade deste bloco foi regra de negócio na camada errada. Na minha primeira versão, a
> consulta da camada de Dados decidia quanto cada resposta ocupava, e o Guia diz que isso é regra do
> Domínio. Na integração, o Tiago levou para o Domínio o cálculo das vagas que a resposta nova pede. A
> camada de Dados continua somando as vagas das respostas já gravadas, dentro da transação, como o
> documento de arquitetura define, e confere o teto. Outras mudanças do mesmo tipo estão nos Ajustes
> da Sprint 5: o 'Não' zerando acompanhantes também saiu dos Dados, o Domínio deixou de receber os
> tipos HTTP do pacote de tipos e passou a receber comandos, e a data do evento passou a usar o fuso
> pelo nome, como manda o ADR-0013."

Passagem: "O Guilherme mostra o front-end, que partiu do protótipo dele."

---

## Bloco 4, front-end, dificuldades e organização (4:30, Guilherme)

**Slide 12, título "Telas do front-end".** Três capturas da aplicação atual: o editor com a prévia, o
convite no celular e a resposta enviada com o link pessoal. O protótipo, como está no repositório do
Guilherme, não sobe sozinho (faltam o cliente do Supabase e o `@tanstack/react-start`), por isso o
slide não tem a captura dele. Se o Guilherme tiver uma captura do protótipo, ela pode entrar ao lado.
Fala:

> "O protótipo foi meu: [o fluxo, as telas, os três templates e as cores; ajustar ao que for
> verdade]. Ele foi gerado numa ferramenta de prototipação, e por isso trazia muita coisa que a nossa
> stack não usa. Na integração, o Tiago adequou o protótipo à arquitetura: o visual ficou, reescrito
> em CSS puro, e o que era regra de negócio saiu da tela e foi para a API."

**Slide 13, título "Mudanças no front-end para seguir a arquitetura".** Uma tabela com três
colunas: o ponto, como era no protótipo e como está na versão atual.

| Ponto                   | No protótipo                                                          | Na versão atual                                                                        |
| ----------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Teto do evento          | O convite mostrava o teto e avisava de lotado antes da resposta       | O convite não mostra teto nem contagem. O aviso de lotado só aparece para quem tenta responder |
| Link do convite         | Gerado no navegador                                                   | Gerado pela API, na primeira publicação                                                |
| Lista para o buffet     | O CSV era montado no navegador                                        | O CSV é gerado pela API, que protege a planilha contra fórmulas                        |
| Login do anfitrião      | Um token ficava guardado no navegador                                 | A sessão fica num cookie controlado pela API                                           |
| Limite de acompanhantes | Conferido na tela. A parte de servidor do protótipo não chegava a rodar | A tela limita o campo, mas quem aceita ou recusa a resposta é a API                  |

O protótipo calculava as vagas restantes, mas não mostrava o número: mostrava o teto e o aviso de
lotado. As conferências de servidor dele dependiam de bibliotecas que não estavam no projeto.

Fala: "o teto saiu do convite porque é dado do anfitrião, e quem só tem o link não precisa saber
quantas pessoas cabem. O link e o CSV saíram do navegador porque são regras do servidor no Guia. A
tela ainda limita os campos, para ajudar quem preenche, mas a validação que vale é a da API."

Dificuldade do bloco:

> "A dificuldade deste bloco foi que o protótipo foi feito numa ferramenta de prototipação, fora da
> base do projeto e sem o pacote de tipos, e algumas regras de negócio ficaram na tela. O que eu aprendi vendo a adequação: prototipar com
> ferramenta é rápido para validar o visual, mas o protótipo precisa ser lido contra o Guia antes de
> virar código. Se eu fizesse de novo, desenharia as telas em cima do `contract` desde o começo."

**Slide 14, título "Dificuldades encontradas".** Uma lista com as três dificuldades que cada dono já
contou no próprio bloco (a integração, o protótipo e a regra de vagas) e uma linha com o que o time
faria diferente: fazer as telas já em cima do pacote de tipos, que existia desde 07/10, e
juntar front-end e back-end ainda na Sprint 4, quando o plano era fechar o fluxo central. O slide existe para o item "dificuldades encontradas" do enunciado ficar visível.
Fala do Guilherme, 30 segundos:

> "Cada dificuldade já foi contada por quem passou por ela: a integração pelo Tiago, a regra de
> vagas pelo Gabriel e o protótipo por mim. Aqui elas aparecem juntas."

Se perguntarem detalhes, passar para quem passou por cada uma.

**Slide 15, título "Organização do trabalho".** Ao lado, a coluna Done do quadro Kanban, recortada
para não mostrar o item do Grau A que ficou aberto. Quatro itens:
sprints de duas semanas no quadro Kanban do Azure Boards, com cada história dividida em tarefas de
tela e de API; conversas pelo WhatsApp e nas aulas, com as decisões registradas na documentação do
repositório; cada mudança entrando na `main` por PR, depois que a integração contínua passa; e o que
falta até a apresentação final, em 17/11. Dizer com franqueza que o time não usou o Teams.

O planejamento, que o enunciado pede, fica no último item e na fala, sem slide próprio. A data é a
da apresentação do protótipo no Plano de Ensino. Na fala, os itens da Sprint 6, de 03/11 a 16/11:

- Revisar os artefatos das Sprints 1 a 3 contra o código, história por história.
- Desenhar o diagrama de sequência da lista de presença, que faltou no Grau A.
- Completar o protótipo de baixa fidelidade da Sprint 3 a partir das telas reais.
- Dar o aval do time às decisões novas da arquitetura.
- Preparar e ensaiar o Pitch Final.

Passagem: "Agora a demonstração."

---

## Bloco 5, demonstração, quadro Kanban, GitHub e fechamento (7:45, Guilherme ou Tiago)

**Slide 16, título "Demonstração".** Só um divisor, que fica na tela enquanto quem conduz a demo
assume a tela. Pela chamada do Teams só uma pessoa compartilha a tela e conduz a demonstração
inteira. Se a aplicação estiver publicada no Railway, quem conduz é o Guilherme, compartilhando a
tela dele e usando o endereço público. Se não estiver, é o Tiago, na máquina dele, com o compose
local. O passo a passo fica aqui e nas notas do apresentador, não no slide:

| Passo                          | O que mostra                                               |
| ------------------------------ | ---------------------------------------------------------- |
| Criar, personalizar e publicar | Template, cores, prévia e o link gerado                    |
| Responder como convidado       | Resposta sem conta, com acompanhante e restrição alimentar |
| Responder num convite lotado   | A recusa pelo teto de vagas                                |
| Alterar pelo link pessoal      | A troca da resposta para talvez                            |
| Painel e CSV                   | Lista de presença e restrições exportadas                  |
| Despublicar                    | O link do convite deixa de abrir                           |

Se perguntarem pelas histórias, a correspondência é: criar e publicar, H02 a H06; responder, H07,
H08 e H10; lotação, H07; alterar, H09; painel e CSV, H11 e H12.

**Preparação, antes de entrar na chamada.** Na demo pelo Railway, os três primeiros itens viram:
front aberto pelo endereço público, no Chrome ou no Edge, em janela normal, porque o Safari, o
Brave e a janela anônima bloqueiam o cookie da API. O convidado pode ficar na janela anônima, porque
não usa cookie. O resto vale igual. Na demo local:

- `.env` criado a partir do `.env.example`. Para começar do zero, `docker compose down -v`, porque as
  migrations só rodam com o volume do banco vazio.
- `docker compose up -d --build` e conferir com `docker compose ps`.
- `http://127.0.0.1:3000` aberto. Não usar `localhost`. Fonte do navegador em 125%.
- Conta de anfitrião criada e logada numa janela normal.
- Uma janela anônima aberta para o convidado.
- Um convite de reserva já publicado e lotado, com teto de 2 pessoas e uma confirmação com 1
  acompanhante, com a página dele aberta numa aba da janela anônima.
- A planilha já aberta, para o CSV.
- Um bloco de notas fora da tela com os textos para colar: nome do evento, local e uma data futura
  fixa.
- As abas do quadro e do GitHub abertas, na ordem: quadro da Sprint 5, uma história com tarefas filhas, a
  lista de sprints, a lista de PRs, a aba de checks de um PR e a branch `gabriel`.

**O caminho:**

1. **Criar e personalizar (1:30).** Abrir dizendo: "a conta já está criada para poupar
   tempo; a tela de entrada está no apêndice." Criar o convite colando os textos, com teto
   de 4 pessoas e no máximo 1 acompanhante. Trocar o template e as cores e mostrar a prévia mudando.
   Publicar e copiar o link.
2. **O convidado responde (1:30).** Colar o link na janela anônima: não pede conta.
   Confirmar com 1 acompanhante e restrição "Alergia", com a descrição. Durante o preenchimento: "a
   tela limita o campo a 1 acompanhante, mas quem valida é a API." Mostrar o
   link pessoal que aparece no fim. Fala: "a API calculou duas vagas no Domínio e conferiu o teto
   dentro da transação."
3. **A lotação (0:40).** Na aba do convite de reserva, tentar confirmar: aparece a
   lotação, sem dizer quantas vagas existem.
4. **A alteração (0:30).** Abrir o link pessoal e trocar a resposta para "talvez".
   Fala: "o talvez não ocupa vaga, e a alteração vale até o fim do dia do evento."
5. **O painel (1:20).** Voltar ao painel: a lista de presença mostra a resposta. Abrir a
   consolidação alimentar e baixar o CSV. Na planilha, mostrar os acentos certos e a alergia com a
   descrição.
6. **Despublicar (0:30).** Despublicar e, na janela do convidado, abrir de novo o **link
   do convite**, não o link pessoal: aparece a página de não encontrado, igual à de um link que nunca
   existiu. O link pessoal continua valendo para quem já respondeu, por decisão da seção 9.5 do Guia.

**Se der errado.**

- **Plano B:** a máquina do Guilherme, com o mesmo estado preparado (ambiente no ar, conta logada,
  convite de reserva lotado), pronta para compartilhar. Gatilho: se uma ação travar por mais de 20
  segundos, o Tiago diz "vamos seguir na máquina do Guilherme", para de compartilhar, o Guilherme
  compartilha e o Tiago continua narrando e dizendo o que clicar.
- **Plano C:** o vídeo de 2 minutos do caminho acima, gravado hoje, sem som e narrado ao vivo, e as
  capturas do apêndice.
- O mock (`docker-compose.mock.yml`) só entra se a imagem tiver sido construída no ensaio, e sempre
  anunciado como mock. Ele entra com `demo@convite.dev` e a senha `senha1234`.

---

### Depois da demo: quadro Kanban e GitHub (1:15)

Na mesma tela e com a mesma pessoa falando, sem trocar de voz.

1. **O quadro (0:40).** O quadro Kanban com as histórias em Done, uma história
   aberta com as tarefas de tela e de API, cada uma com responsável, e a lista de sprints com as
   datas.
2. **O GitHub (0:35).** A lista de PRs fechados e a aba de checks verdes de um deles. Depois, a
   branch `gabriel` e a mensagem do commit que trouxe o back-end com a autoria dele, e a do commit do
   front-end, que registra que as telas vieram do protótipo do Guilherme. Fala: "a integração foi feita
   pelo Tiago, e as mensagens dos commits indicam de onde veio cada parte."

### Fechamento (0:30)

Por quem conduziu a demo, ainda com a aplicação na tela:

> "As doze histórias estão implementadas, e as mudanças em relação à arquitetura do Grau A estão
> registradas com o motivo. Até 17/11 vamos revisar a documentação contra o código e preparar o
> Pitch. Ficamos à disposição para perguntas."

Na arguição, quem compartilha deixa na tela o que estiver sendo discutido: a aplicação, o quadro, o
GitHub ou o PDF. Quem responde cada assunto está no protocolo de arguição, mais abaixo.

---

**Apêndice, slides 17 a 19.** Capturas da aplicação de 26/10: a tela de entrada e a lista de
convites, as telas do convidado (convite, resposta enviada, lotação e link pessoal), o painel e o link
despublicado. Servem ao plano C e ficam no PDF do Moodle como evidência. As capturas do quadro e do
GitHub ficam nos slides 8 e 15.

## O deck

O deck está em `trabalhos/T3-Apresentacao-Intermediaria.pptx`, e o PDF para o Moodle em
`trabalhos/T3-Apresentacao-Intermediaria.pdf`. As falas de cada slide estão nas notas do apresentador. Ele é
gerado a partir de `trabalhos/deck-t3/slides.json`, e o `README.md` dessa pasta diz como regerar
depois de mudar o texto.

---

## Protocolo de arguição

1. Quem recebe a pergunta responde a primeira frase e passa nominalmente para o dono do assunto.
2. Ninguém responde duas seguidas enquanto houver integrante que ainda não respondeu.
3. Territórios: problema, requisitos e evolução do projeto com o Andreas; arquitetura, Docker,
   GitHub e integração com o Tiago; protótipo, telas, dificuldades, Azure Boards, organização e
   planejamento com o Guilherme; API, regras e testes com o Gabriel.
4. Nas perguntas de arquitetura, Docker, GitHub e integração, o Tiago responde direto. Nas dos outros
   territórios, ele só completa quando o dono pedir.

## Perguntas prováveis, por território

### Andreas

- **Qual foi a sua participação no projeto?** Responder com franqueza, sem tomar como seus os
  artefatos do time.
- **Como uma história vira caso de uso?** A história é o valor para a persona, com critério de
  aceitação. O caso de uso tem fluxo principal, fluxos alternativos e regras. Exemplo: H07, H08 e
  H10 viram o UC005, confirmar presença. O diagrama está em `docs/Sprints/Sprint-1`.
- **Algum requisito mudou por causa da arquitetura?** A lista de presença pedia tempo real e passou
  a "se atualiza sozinha sem recarregar", com consulta periódica (ADR-0007). O recado livre do
  convite saiu, e a saudação virou texto fixo do template.
- **Por que o convidado não cria conta?** Porque exigir conta derruba a taxa de resposta. Ele recebe
  um link pessoal para voltar e alterar.

### Tiago

- **Como vocês priorizaram as Sprints 4 e 5?** A Sprint 4 planejava fechar o fluxo central de ponta
  a ponta: conta, criação, link, resposta, acompanhantes e restrição alimentar. Na prática, ela montou
  a base, e o fluxo central fechou na Sprint 5, junto com o resto. A Sprint 5 completou com
  personalização, prévia, despublicação, alteração da resposta, lista de presença e consolidação.
- **Por que três camadas e não quatro?** Porque só existem três motivos de mudança com vida própria:
  o jeito de falar com o mundo, as regras do evento e o armazenamento. Seção 1 do Guia.
- **A pasta `api/src/model` é uma quarta camada?** Não. São as classes do modelo e as projeções que
  atravessam as camadas, e o lint impede que ela importe qualquer camada.
- **O Domínio pode importar dos Dados? Como o lint sabe a regra?** Pode, a dependência só desce. O
  `import-x/no-restricted-paths` em `eslint.config.mjs` proíbe Domínio e Dados importando da
  Apresentação, Dados importando do Domínio, a Apresentação importando dos Dados, e no front-end o
  controller importando da view.
- **Se o navegador chama a API direto na 3001, isso não expõe a API?** A exposição é controlada: a
  API só aceita chamada do navegador vinda da origem do front-end, o cookie é `httpOnly` e `SameSite`,
  as escritas públicas têm limite de tráfego e o banco não publica porta. Passar tudo pelo Next
  poria lógica no tier Front, que o ADR-0004 restringe a front-end.
- **As migrations só rodam com o volume vazio. Como evoluem o esquema?** É uma limitação aceita e
  registrada no Diagrama de Implantação: mudar o esquema exige `docker compose down -v`. Vale porque
  o ADR-0003 limita o ambiente ao local, e precisa ser revista antes de qualquer publicação.
- **E com duas instâncias da API?** O limite de tráfego fica na memória do processo e deixaria de
  valer. Está em aberto na seção 5 dos Ajustes. Hoje o ADR-0003 não prevê réplica.
- **Por que local e não na nuvem?** ADR-0003: nesta fase o MVP não tem requisito de disponibilidade,
  de usuários reais nem de acesso externo, e o projeto não tem custo. A demo está no Railway, e por
  isso o ADR-0015 propõe substituir o ADR-0003: o compose local continua para desenvolvimento, e a
  publicação é para a demonstração. Ela pediu duas mudanças ligadas por variável de ambiente, o
  cookie com `SameSite=None` e `Secure`, porque front e API ficam em domínios diferentes, e a leitura
  do IP do convidado atrás do proxy.
- **Por que o histórico da `main` está quase todo em um nome?** Porque a integração passou por quem
  montou a base. O back-end entrou com a autoria do Gabriel, o front-end a partir do protótipo do Guilherme,
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
- **Se o front-end é MVC, onde está o Model?** O Model é o estado que a API guarda, e o front-end o conhece
  pelos tipos do `contract`. O ADR-0001 justifica o MVC com duas Views sobre o mesmo Model: o
  convite público e o painel.
- **Por que o convite é renderizado no servidor e o painel no navegador?** O convite precisa das
  metatags da prévia do link quando é compartilhado no WhatsApp, então é lido no servidor do front-end.
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
casos de uso. Para a linha do tempo, `docs/Sprints.md` e as páginas de cada sprint. Se der tempo, subir o ambiente na própria máquina, pelo README, e percorrer as telas.

**Tiago.** A seção 1 do Guia. O `docker-compose.yml` e o `eslint.config.mjs`. A seção 5 dos Ajustes
da Sprint 5, o que continua em aberto.

**Guilherme.** O `front/README.md`. A estrutura de `front/src`: `app`, `view` e `controller`. Em
`controller`, o cabeçalho de `api-client.ts`, mais `polling.ts`, `server-api.ts` e `browser-api.ts`.
As seções 1 e 2 dos Ajustes da Sprint 5. Os ADRs 0001, 0007 e 0009. O quadro, a ponto de abrir
qualquer item que o professor clicar, e os itens da Sprint 6, que ele diz no slide 15.

**Gabriel.** A própria versão, na branch `gabriel`, e o que mudou nela, com
`git diff a3fb8db e088d73 -- api/src`. Em `api/src/domain`, `rsvp-rules.ts`, `rsvp.service.ts` e
`project-time.ts`. Em `api/src/data/invite.repository.ts`, o `saveRsvpWithinCapacity` e o
`exceedsCapacity`. O `render-csv.ts`. O teste de concorrência em
`api/src/data/invite.repository.writes.spec.ts`. A seção 3 dos Ajustes da Sprint 5 e os ADRs 0008,
0013 e 0014.

## Regras para os slides

- Nenhum identificador interno no slide: nada de código de história, UC, número de work item, ADR,
  linha do Guia ou nome de arquivo. Tudo isso vai na fala, e na arguição vira ponto de
  rastreabilidade.
- Nada do nome provisório do projeto. Nos slides, o projeto é o "app de gerenciamento de convites".
- Sem o caractere "·" como separador. Usar vírgula ou dois-pontos.
- Um título por slide, descritivo: diz o assunto, sem frase de efeito.
- Nenhuma contagem de commits, testes ou arquivos no slide, porque envelhece.
- Nenhuma captura de tela que não tenha sido feita de verdade, com data no rodapé.
- No rodapé de cada slide, o nome de quem apresenta.

## Checklist até terça

- [x] Atualizar o Azure Boards: H01 a H12, a #125, as tarefas das Sprints 4 e 5 e os épicos em
      Done, e as tarefas de API com o Gabriel
- [ ] Confirmar a divisão de blocos no grupo
- [ ] Guilherme confirma o que foi dele no protótipo, para preencher a fala do slide 12
- [ ] Criar os itens da Sprint 6 no quadro, para mostrar ao vivo depois da demo junto com o plano até 17/11
- [ ] Lembrar que o projeto no Azure DevOps ainda se chama invite-people e aparece no topo da tela
      quando o quadro for mostrado ao vivo. Se perguntarem, é o nome provisório do projeto
- [ ] Criar o item do T3 no quadro, como o #78 foi para o T1, com o dono do deck
- [ ] Decidir se entra uma captura do WhatsApp no slide 15
- [ ] Decidir hoje se a demo é no Railway (Guilherme) ou local (Tiago), e ensaiar duas vezes na
      versão escolhida, com o ambiente subido do zero. Gravar o vídeo do plano C com cadastro e
      entrada no começo
- [x] Publicar no Railway e registrar a publicação no ADR-0015, que substitui o ADR-0003 com o aval
      do time
- [ ] No Railway: percorrer a demo inteira pelo endereço público antes da aula, com o anfitrião no
      Chrome ou no Edge em janela normal e o convidado no celular
- [x] Tirar as capturas da aplicação para o apêndice
- [x] Capturas do quadro Kanban e de um PR com os checks no apêndice
- [ ] Ensaiar cronometrado, com as trocas de fala e de compartilhamento, e uma rodada de perguntas
      cruzadas usando a seção de perguntas prováveis
- [ ] Exportar em PDF e subir no Moodle antes das 19h30. Conferir na tarefa se o envio é um pelo
      grupo ou um por pessoa
