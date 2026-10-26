# T3, roteiro da apresentação intermediária do projeto

> Documento de trabalho do time. Fica no GitHub e não vai para a wiki, porque tem decisão tática de
> apresentação. Apresentação em 27/10/2026, aula remota síncrona pelo Teams, Time 04 na agenda.
> Slides no Moodle, na tarefa "Entrega do Terceiro Trabalho da Disciplina", até 23h55 do mesmo dia.
> Subir antes da aula, não depois.

## O que o enunciado cobra

Do Plano de Ensino: apresentação de 20 a 25 minutos, depois 10 a 15 de arguição pelo professor e
pela turma. O objetivo é verificar a aderência entre os requisitos, a arquitetura do Grau A e a
solução implementada. A equipe precisa mostrar as funcionalidades prontas, explicar as decisões
arquiteturais e técnicas, apresentar as dificuldades e o planejamento para concluir. Precisa ter
demonstração ao vivo, e mostrar o Azure DevOps, o Kanban, o GitHub e a colaboração no Teams.

| Critério | Peso | Onde a apresentação responde |
|---|---|---|
| Evolução e qualidade da implementação | 30% | Blocos B e C |
| Aderência à arquitetura e aos requisitos | 20% | Bloco B, com o quadro "planejado e implementado" |
| Demonstração funcional e qualidade técnica | 20% | Bloco C inteiro |
| Organização no Azure DevOps, GitHub e Kanban | 10% | Bloco A, com o quadro aberto ao vivo |
| Apresentação, clareza e slides | 10% | O deck todo |
| Participação individual na arguição | 10% | Protocolo de arguição, no fim |

A avaliação é individual. Cada um precisa ter um bloco que consiga defender sozinho.

## A ideia que sustenta tudo

No T2 entregamos uma arquitetura no papel. No T3 mostramos que ela virou código sem ser traída, e
contamos onde a implementação obrigou a ajustar o desenho. A frase que fecha a apresentação: **a
regra mais importante do sistema, o teto de vagas, está onde o Guia disse que estaria, e um teste
com respostas simultâneas prova isso.**

Isso responde de uma vez aos dois critérios mais pesados, evolução (30%) e aderência (20%). Os
ajustes não são confissão de erro, são o critério de aderência funcionando: cada um está registrado
com o motivo, nos Ajustes de Arquitetura para o MVP da Sprint 5.

## Situação real em 26/10, para ninguém ser pego de surpresa

- **O MVP está completo e integrado na `main`.** As doze histórias, H01 a H12, funcionam de ponta a
  ponta com a API de verdade e o banco, e tudo sobe pelo `docker compose`. Front no PR #7, backend
  e fechamento no PR #8, os dois mergeados.
- **O quadro do Azure Boards não mostra isso.** Na leitura de hoje, as doze histórias e quase todas
  as tarefas das Sprints 4 e 5 estão em To Do, e as tarefas de API não têm responsável. O professor
  vai abrir o quadro. Atualizar antes da aula é o item 1 do checklist.
- **O Gabriel não tem nenhum work item atribuído**, embora as rotas da API tenham vindo da branch
  dele. **O Andreas tem só a ficha do Team Charter (#87), ainda em To Do.** Na avaliação individual
  isso pesa, e o quadro é onde o professor olha.
- **O GitHub mostra os commits de cada um.** O front do Guilherme veio do repositório dele,
  `guitoebe/frontend-invite-people`, e foi transplantado no PR #7. O backend do Gabriel entrou com
  a autoria dele preservada no primeiro commit do PR #8. Parte do trabalho foi feita com apoio de
  assistente de IA, e os commits mostram isso. Se perguntarem, responder com franqueza: a decisão e
  a revisão foram do time, a ferramenta acelerou a escrita.

## Tempo e donos

Proposta de divisão. O critério foi dar a cada um o território que ele construiu ou que consegue
defender. O time confirma ou troca antes do ensaio.

| Bloco | Tema | Min | Slides | Dono sugerido |
|---|---|---|---|---|
| A | Problema, escopo do MVP e como o time se organizou | 5 | 1 a 4 | Andreas |
| B | Arquitetura planejada e implementada, e os ajustes | 6 | 5 a 8 | Tiago |
| C | Demonstração ao vivo | 8 | 9 | Guilherme e Gabriel |
| D | Dificuldades, qualidade e planejamento até o fim | 4 | 10 a 12 | Gabriel |

Mais um minuto para as trocas. Total 24, dentro da faixa de 20 a 25.

A demonstração tem dois donos de propósito. O Guilherme conduz o lado do anfitrião, que são as telas
que ele fez. O Gabriel conduz o lado do convidado e explica o que a API faz em cada passo, que é o
código que veio dele. Assim os dois aparecem no critério de 20%.

---

## Bloco A, problema, escopo e organização (5 min, Andreas)

Objetivo: situar em um minuto e gastar o resto no critério de organização, que é o mais fácil de
garantir e o único que depende só de mostrar o que existe.

1. **O problema em uma frase.** Quem organiza uma festa junta confirmações por WhatsApp e perde a
   conta de quantas pessoas vêm e do que cada uma não pode comer. O Invite People é um convite por
   link, com confirmação sem cadastro, limite de acompanhantes e teto de vagas, e um painel com a
   lista de presença e as restrições alimentares exportáveis para o buffet.
2. **O escopo do MVP.** Seis épicos e doze histórias, H01 a H12. Slide com os seis épicos e, ao lado,
   a marca de entregue. Não listar as doze no slide, citar na fala.
3. **Como o time trabalhou.** Seis sprints de duas semanas no Azure Boards: requisitos na 1,
   arquitetura na 2, projeto da solução na 3, implementação na 4 e na 5, consolidação na 6.
4. **Ao vivo, trocar para o navegador e mostrar o Azure Boards.** O quadro da Sprint 5 com as
   histórias em Done, uma história aberta com as tarefas filhas separadas em API e tela, e o
   responsável de cada uma. Mostrar a lista de sprints com as datas.
5. **Ao vivo, mostrar o GitHub.** A lista de PRs fechados, com o fluxo de branch, PR, CI verde e
   merge. Abrir o PR #8 e mostrar a descrição com "o que entra" e "como verificar", e a aba de
   checks. Mostrar o `docs/` com as pastas por sprint.
6. **O Teams.** Uma captura do canal do time com uma discussão de decisão, já que a aula é pelo
   próprio Teams e trocar de janela confunde. Escolher a captura antes.

Perguntas prováveis: como vocês dividiram o trabalho, por que as tarefas têm API e tela separadas,
o que ficou para a Sprint 6, como o GitHub se liga ao Azure Boards.

---

## Bloco B, arquitetura planejada e implementada (6 min, Tiago)

Objetivo: o critério de aderência. Mostrar que o desenho do Grau A está no código, e que cada
desvio foi decidido e registrado.

1. **Slide 5, o desenho em uma figura.** Três tiers no compose (front em Next.js, API em NestJS,
   PostgreSQL) e as três camadas dentro da API: Apresentação, Domínio e Dados. O front segue MVC. O
   `contract` é o pacote de tipos que os dois lados compartilham, e é por ele que o front não
   inventa rota nem campo.
2. **Slide 6, "o Guia disse, o código faz".** Um quadro de quatro linhas, cada uma com a regra e o
   arquivo onde ela mora:
   - O teto de vagas é conferido pela camada de Dados dentro da transação, com `SELECT ... FOR
     UPDATE`. O Domínio calcula quantas vagas a resposta pede e entrega o número.
   - O convite público não confirma se um convite existe: token inexistente, rascunho, despublicado
     e de outro anfitrião dão o mesmo 404 (ADR-0008).
   - A sessão do anfitrião é cookie assinado, e o front não guarda token (ADR-0010).
   - O link do convite tem 128 bits de gerador seguro e nasce no Domínio (ADR-0005).
3. **Slide 7, o que o protótipo fazia e a arquitetura não permitia.** Três exemplos da seção 2 dos
   Ajustes: contagem de vagas na página pública, CSV montado no navegador e token no
   `localStorage`. Para cada um, a regra e como ficou. Isto mostra que a revisão contra a
   arquitetura aconteceu de verdade.
4. **Slide 8, o que a arquitetura precisou ajustar.** A saudação virou texto fixo do template, os
   templates ganharam dois papéis de cor, a faixa numérica passou a ser tratada como erro de forma
   (400) e não de regra (422), e o tempo limite das chamadas ganhou número: 4 segundos no servidor
   e 15 no navegador. Cada um tem linha na seção 11.1 do Guia.

Perguntas prováveis: por que três camadas e não quatro, por que o teto fica nos Dados e não no
Domínio, por que o front não confere o limite de acompanhantes, o que acontece se duas pessoas
confirmarem ao mesmo tempo com uma vaga sobrando, por que 404 e não 403 para convite de outro
anfitrião.

---

## Bloco C, demonstração ao vivo (8 min, Guilherme e Gabriel)

Objetivo: os 20% da demo. Um caminho só, ensaiado, sem improviso. Tudo roda na máquina de quem
compartilha a tela, com `docker compose up -d --build` feito antes da aula.

Preparação, antes de entrar na chamada:
- Subir o ambiente e abrir `http://127.0.0.1:3000` no navegador. Não usar `localhost`.
- Deixar uma conta de anfitrião criada e logada numa janela normal.
- Deixar uma janela anônima aberta para o convidado.
- Deixar um convite de reserva já publicado e lotado, com teto de 2 pessoas e uma confirmação com 1
  acompanhante, para mostrar a lotação sem depender do caminho principal.

O caminho, com quem fala:

1. **Guilherme, anfitrião.** Criar o convite com nome, data, hora, local, teto de 4 pessoas e no
   máximo 1 acompanhante. Personalizar: trocar o template e as cores e mostrar a prévia mudando.
   Publicar e copiar o link.
2. **Gabriel, convidado.** Colar o link na janela anônima. Mostrar que não pede conta. Confirmar
   com 1 acompanhante e restrição alimentar "alergia", com a descrição. Mostrar o link pessoal que
   aparece no fim. Na fala: a API calculou duas vagas no Domínio e conferiu o teto dentro da
   transação.
3. **Gabriel, recusas.** Mostrar que o campo não aceita 2 acompanhantes. Na fala: isso é só conforto
   da tela, e quem decide é a API, que recusa do mesmo jeito se a tela for contornada. No convite de
   reserva, que já está lotado, tentar confirmar: aparece a lotação, sem dizer quantas vagas
   existem.
4. **Gabriel, alteração.** Abrir o link pessoal e trocar a resposta para "talvez". Na fala: o
   talvez não ocupa vaga, e a alteração vale até o fim do dia do evento.
5. **Guilherme, painel.** Voltar ao painel. A lista de presença já mostra a resposta, porque a tela
   consulta a cada 20 segundos. Abrir a consolidação alimentar e baixar o CSV. Abrir o CSV na
   planilha e mostrar que os acentos estão certos.
6. **Guilherme, despublicar.** Despublicar o convite e recarregar a janela do convidado: a página
   de não encontrado, igual à de um link que nunca existiu.

Plano B: se a API cair, `docker compose -f docker-compose.yml -f docker-compose.mock.yml up -d` sobe
o mock com o convite de exemplo, e quem fala avisa que é o mock. Plano C: um vídeo de 2 minutos do
caminho acima, gravado hoje, e quatro capturas no fim do deck.

Perguntas prováveis: o que acontece se o convidado abrir o link depois do evento, a senha é
guardada como, por que o painel não atualiza na hora, o que impede alguém de adivinhar um link.

---

## Bloco D, dificuldades, qualidade e o que falta (4 min, Gabriel)

1. **Slide 10, dificuldades.** Três, contadas como decisão e não como desculpa:
   - **Juntar o trabalho de quatro pessoas.** O front e o backend foram feitos em paralelo, cada um
     no seu repositório ou branch, e precisaram ser adequados ao contrato e às camadas para entrar
     na `main`. Lição: o `contract` deveria ter sido a primeira entrega, antes de qualquer tela.
   - **Regra de negócio fugindo de camada.** A primeira versão do backend tinha a regra das vagas e
     a do "talvez" escritas no SQL. Mover para o Domínio, deixando nos Dados só a conferência do
     teto, foi a maior mudança do PR #8.
   - **Fuso horário.** "Até o fim do dia do evento" exigiu o fuso de São Paulo pelo nome e
     comparação por dia, no ADR-0013. Com `-03:00` fixo, um convite para hoje era recusado depois
     da hora marcada.
2. **Slide 11, como a qualidade foi conferida.** Integração contínua no GitHub Actions com lint,
   formatação, tipos, testes e build em todo PR. Testes do Domínio, testes de integração contra
   PostgreSQL e testes de ponta a ponta das rotas. O teste que vale citar: quatro respostas
   simultâneas num teto de cinco vagas, e só as que cabem passam.
3. **Slide 12, o planejamento até 17/11.** Sprint 6, de 03/11 a 16/11: consolidar e preparar o
   Pitch Final. Itens: o Protótipo de Baixa Fidelidade da Sprint 3, que ainda está a preencher; o
   diagrama de sequência do UC007; o aval do time às linhas 35 a 40 do Guia; revisar os artefatos
   contra o código; e o deck e o ensaio do pitch.

Perguntas prováveis: o que vocês fariam diferente, o que acontece se a API tiver duas instâncias
(o limite de taxa fica na memória do processo, registrado em aberto), por que não publicaram na
nuvem (ADR-0003, ambiente local).

---

## Fechamento

Sem slide próprio. A última fala retoma a frase do início: o desenho do Grau A está no código, os
desvios estão registrados com motivo, e o teto de vagas está onde o Guia disse que estaria. Depois
anunciar quem responde pelo quê e abrir para a arguição.

## Protocolo de arguição

1. Quem recebe a pergunta responde a primeira frase e passa nominalmente para o dono do assunto.
2. Ninguém responde duas seguidas enquanto houver integrante que ainda não respondeu.
3. Territórios: organização e requisitos com o Andreas, arquitetura e decisões com o Tiago, telas e
   fluxo do anfitrião com o Guilherme, API, regras e testes com o Gabriel.
4. Pergunta sobre uso de IA: responder com franqueza, como está na situação real acima.

## Regras para os slides

Mesmas do T1: nenhum identificador interno no slide (UC, número de work item, ADR, linha do Guia),
tudo isso vai na fala. Um título por slide. Nenhuma contagem de commits, de testes ou de arquivos no
slide, porque envelhece. Nenhuma captura de tela que não tenha sido feita de verdade.

## Checklist até terça

- [ ] **Atualizar o Azure Boards.** Mover para Done as histórias H01 a H12 (#40 a #51), a #125 e as
      tarefas filhas (#134 a #162), que estão entregues nos PRs #7 e #8. Atribuir as tarefas de API
      a quem fez. Os épicos #34 a #39 também vão para Done
- [ ] Conferir a #57 e a #87, do Team Charter, que seguem abertas desde a Sprint 1. A ficha do
      Andreas já existe em `docs/Team-Charter`
- [ ] Criar os itens da Sprint 6, para o slide 12 ter lastro no quadro
- [ ] Criar o item do T3 no quadro, como o #78 foi para o T1, com o dono do deck
- [ ] Confirmar a divisão de blocos no grupo
- [ ] Escolher a captura do Teams para o Bloco A
- [ ] Ensaiar a demo duas vezes na máquina que vai compartilhar a tela, com o ambiente subido do
      zero, e gravar o vídeo do plano C
- [ ] Ensaiar cronometrado, com as trocas, e uma rodada de perguntas cruzadas
- [ ] Exportar em PDF e subir no Moodle antes das 19h30. Um envio pelo grupo ou um por pessoa?
      Conferir na tarefa
