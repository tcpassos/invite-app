# T4, roteiro do Pitch Final

> Documento de trabalho do time. Pitch Final em 17/11/2026, aula 16, remota síncrona pelo Teams.
> O deck está em `trabalhos/T4-Pitch-Final.pptx` e o PDF em `trabalhos/T4-Pitch-Final.pdf`. As
> falas de cada slide estão nas notas do apresentador. Até 13/11 o Moodle não tinha tarefa de entrega
> para o Pitch: conferir no dia 16/11 e, se houver, subir o PDF antes da aula.

## O que o professor pediu

Da aula "Preparação para o Pitch Final". O Pitch precisa responder: qual o propósito e o problema,
quem são os usuários e o que precisam, se o MVP atende essas necessidades, se usamos boas práticas e
como o projeto arquitetural ajudou a construir o MVP.

| Bloco sugerido pelo professor              | Tempo | Onde está no deck | Quem fala  |
| ------------------------------------------ | ----- | ----------------- | ---------- |
| Objetivo geral do projeto                  | 2 min | Slides 1 a 3      | Andreas    |
| Funcionalidades e personas                 | 2 min | Slides 4 e 5      | Andreas    |
| Gestão de backlog e refinamento            | 2 min | Slides 6 e 7      | Andreas    |
| Arquitetura prescritiva                    | 3 min | Slides 8 a 11     | Tiago      |
| Arquitetura descritiva, princípios e ADRs  | 3 min | Slides 12 a 15    | Tiago      |
| Prescritiva × descritiva                   | 3 min | Slides 16 a 18    | Gabriel    |
| Demonstração, tecnologias e código         | 7 min | Slides 19 a 24    | Gabriel e Guilherme |
| Reflexão                                   | 3 min | Slides 25 a 29    | Guilherme  |

O código entra antes da demonstração e não depois, para o Gabriel falar dele logo depois da
comparação e o Guilherme seguir do slide 23 até o fim sem troca de voz. A pergunta do professor sobre
como o projeto arquitetural ajudou a construir o MVP tem slide próprio, o 18, e a pergunta sobre boas
práticas também, o 22, com os testes. Os slides 30 e 31 são
apêndice, com as telas, para o caso de a demo falhar ou de perguntarem.

A rubrica do T4 pesa a aplicação (30%), a aderência à arquitetura (20%), a documentação (15%), o
uso do Azure DevOps, GitHub e Kanban (10%), o Pitch e a demonstração (15%) e a colaboração (10%).

## Tempo e voz

| Quem      | Slides   | Tempo | Assunto                                                        |
| --------- | -------- | ----- | -------------------------------------------------------------- |
| Andreas   | 1 a 7    | 4:30  | Problema, objetivo, personas, funcionalidades e backlog         |
| Tiago     | 8 a 15   | 6:00  | Arquitetura prescritiva, diagramas, descritiva, implantação, princípios e decisões |
| Gabriel   | 16 a 22  | 5:00  | Comparação, como a arquitetura ajudou, código e boas práticas   |
| Guilherme | 23 a 29  | 8:00  | Tecnologias, demonstração, Scrum, dificuldades, IA e fechamento |

Lidas em ritmo de fala, as notas dão cerca de 18 minutos, mais os 4 da demo. Com as trocas, cerca de
23 minutos. São quatro vozes em sequência, sem voltar a ninguém. O ensaio
cronometrado é o que diz se cabe. Se passar, corta-se nesta ordem: o passo 4 da demo, o link
pessoal, fica só dito; a fala do slide 15 fica nas quatro decisões da primeira coluna; o slide 17
fica numa frase; o slide 11 fica só com o diagrama de classes comentado.

**Tela.** O Tiago compartilha o PDF do slide 1 ao 22. No slide 23 o Guilherme assume a tela, com o
PDF, o navegador com a aplicação publicada, o quadro e o GitHub abertos na máquina dele, e segue até
o fim. Uma troca só. Quem fala diz "próximo" para avançar.

**Na máquina que compartilha:** modo não perturbe, e-mail e WhatsApp fechados, barra de favoritos
oculta, carregador ligado. **Os outros:** câmera ligada enquanto falam, e a primeira frase de cada um
começa com o nome, porque a avaliação é individual.

## Por bloco

### Andreas, slides 1 a 7

- **Slide 1, capa.** Abertura de 20 segundos: o time, o produto em uma frase e o que vem.
- **Slide 3, o problema.** Três dores à esquerda, o objetivo no cartão azul. Falar do problema antes
  de falar do app.
- **Slide 4, personas.** Marina, Rafael e Jorge, com o que cada uma precisa e o que o app entrega.
  São as personas da Sprint 1, cadastradas no Azure Boards.
- **Slide 5, funcionalidades.** Seis grupos, doze histórias, todas implementadas. A etiqueta de cada
  grupo diz para qual persona ele foi feito.
- **Slide 6, backlog.** Os números e o fluxo sprint, item do backlog, tarefas. Os 115 são todas as
  tarefas do quadro, das seis sprints. Os épicos existem no quadro, mas a organização foi por sprint. Se perguntarem, as histórias
  são H01 a H12 no quadro, cada uma com a tag da persona.
- **Slide 7, refinamento.** As sprints e três refinamentos que mantiveram o valor: lista a cada
  20 segundos, saudação fixa, e a ordem das entregas: seis histórias planejadas para a Sprint 4
  (conta, convite, link, resposta, acompanhantes e restrição alimentar) entraram na Sprint 5, porque
  a Sprint 4 ficou com a base do código.
- Passagem: "O Tiago apresenta a arquitetura."

### Tiago, slides 8 a 15

- **Slide 9, prescritiva.** O que foi planejado no Grau A, com o diagrama de casos de uso grande ao
  lado.
- **Slide 10, camadas.** O diagrama de camadas como foi entregue no Grau A, sem o pacote de
  autenticação, que entrou no código e aparece na comparação. Apontar o caminho de leitura, pelo servidor do front-end, e o de escrita,
  direto do navegador.
- **Slide 11, classes e sequência.** O diagrama de classes do Grau A e um trecho do diagrama de
  sequência da confirmação de presença, com o cabeçalho dos participantes. O trecho é o mesmo caminho
  que o Gabriel mostra no código do slide 20.
- **Slide 12, descritiva.** O mapa das pastas, com `model/` e `templates/`. Dizer onde fica o Model do
  MVC: na API, e o navegador recebe a projeção pelos tipos do `contract` (Guia, 7.2).
- **Slide 13, implantação.** O diagrama de implantação atual, com o ambiente local e o Railway. É
  descritivo: no Grau A o ambiente era só local. Cada diagrama aparece uma vez no deck, no bloco a que
  pertence.
- **Slide 14, princípios.** Separação de interesses, regra de dependência, interface explícita,
  ocultação de informação, alta coesão e baixo acoplamento.
- **Slide 15, decisões.** Oito decisões com o número do ADR. A stack, o Kysely e o Railway ficam para
  o slide de tecnologias, para não repetir.
- Passagem: "O Gabriel compara o planejado com o implementado."

### Gabriel, slides 16 a 22

- **Slide 16, comparação.** O planejado no Grau A ao lado do que está no código, em seis linhas. As
  quatro primeiras são o que se manteve ou foi ajustado. As duas de baixo, separadas por uma faixa, são
  as correções feitas na integração: a regra das vagas, que era da versão dele, e as regras do
  protótipo. Contar isso com franqueza. A lista de presença não entra aqui: a consulta periódica já
  era a decisão do Grau A (ADR-0007), e o que mudou foi a história, no refinamento do slide 7.
- **Slide 17, semelhanças e diferenças.** Resumo em quatro tipos de mudança.
- **Slide 18, como a arquitetura ajudou.** Trabalho em paralelo pelo pacote de tipos, o Guia como
  referência na integração, a regra conferida em todo PR e as decisões registradas.
- **Slide 20, código.** O caminho de uma resposta pelas três camadas. Os trechos são do código real,
  encurtados para caber.
- **Slide 21, lint.** A regra de camadas no `eslint.config.mjs` e o erro que o PR recebe.
- **Slide 22, boas práticas.** Os testes em três níveis (Domínio, banco de verdade e rotas), a
  integração contínua em todo PR, a mudança por PR e as decisões em ADRs. Responde à pergunta do
  professor sobre boas práticas.
- Passagem: "O Guilherme apresenta as tecnologias e a aplicação funcionando."

### Guilherme, slides 23 a 29

- **Slide 23, tecnologias.** Cada tecnologia pelo que resolve na arquitetura.
- **Slide 24, demonstração.** O slide fica na tela enquanto a aplicação abre. O caminho está nas
  notas e abaixo, não no slide.
- **Slide 26, Scrum.** O que o processo trouxe para o resultado. Dizer com franqueza que o time não
  usou o Teams, e sim o WhatsApp e as aulas.
- **Slide 27, dificuldades.** Quatro dificuldades, cada uma com a lição.
- **Slide 28, IA.** O professor pergunta explicitamente se usamos assistentes de IA e se fomos nós que
  desenvolvemos. O slide diz onde usamos e o que foi do time. **O texto precisa ser confirmado pelos
  quatro antes do ensaio**, e cada um responde na arguição pelo que fez e revisou.
- **Slide 29, fechamento.** A aplicação publicada e o time. Abre a arguição.

## Demonstração (4 minutos)

**Preparação, antes de entrar na chamada:**

- `https://front-production-5556.up.railway.app` aberto no Chrome ou no Edge, em janela normal, com a
  conta de anfitrião criada e logada. Safari, Brave e janela anônima bloqueiam o cookie da API.
- Uma janela anônima, ou o celular, para o convidado.
- Um convite de reserva já publicado e lotado (teto de 2 pessoas, uma confirmação com 1 acompanhante),
  com a página dele aberta na janela do convidado.
- A planilha aberta, para o CSV.
- Abas do quadro do Azure Boards e do GitHub, se perguntarem.

**O caminho:**

1. Criar o convite com teto de 4 pessoas e no máximo 1 acompanhante, trocar o template e as cores,
   mostrar a prévia e publicar.
2. Abrir o link como convidado: não pede conta. Confirmar com 1 acompanhante e alergia.
3. No convite de reserva, tentar confirmar: aparece a lotação.
4. Abrir o link pessoal e trocar a resposta para "talvez".
5. Voltar ao painel: a lista mostra a resposta. Baixar o CSV e mostrar na planilha.
6. Despublicar e abrir de novo o link do convite: a página de não encontrado.

Se o tempo apertar, o passo 4 fica só dito.

Se der tempo, convidar o professor a abrir o link do convite no celular.

**Plano B:** o Tiago, com o compose local no ar e o mesmo estado preparado. Gatilho: uma ação travada
por mais de 20 segundos ou o Railway fora do ar. O Guilherme diz "vamos seguir na máquina do Tiago",
o Tiago compartilha e continua do passo em que parou. **Plano C:** as telas do apêndice.

## Perguntas prováveis

Protocolo: quem recebe a pergunta responde a primeira frase e passa pelo nome para o dono do assunto.
Territórios: produto, personas e backlog com o Andreas; arquitetura, Docker, publicação e integração
com o Tiago; back-end, regras e comparação com o Gabriel; front-end, Azure DevOps, demonstração e
processo com o Guilherme.

- **Qual a diferença entre a arquitetura prescritiva e a descritiva no projeto de vocês?** A
  prescritiva é a do Grau A, nos diagramas e nos ADRs. A descritiva é a que está no código. A forma é
  a mesma; as diferenças estão no slide 16 e registradas com o motivo nos Ajustes de Arquitetura da
  Sprint 5 e no ADR-0015.
- **Como vocês garantem que a arquitetura não se degrada?** O lint recusa import que quebra a regra de
  camadas, e a integração contínua roda em todo PR. Regra de negócio fora do lugar o lint não pega, e
  foi a revisão na integração que pegou o caso das vagas.
- **Por que três camadas e não quatro?** Só existem três motivos de mudança com vida própria: o jeito
  de falar com o mundo, as regras do evento e o armazenamento. Seção 1 do Guia.
- **Por que publicar no Railway, se o ADR-0003 dizia só local?** A apresentação é remota e a demo não
  podia depender da máquina de quem apresenta. O ADR-0015 substituiu o 0003: local para desenvolver,
  Railway para a demonstração. Pediu o cookie com `SameSite=None` e `Secure`, a leitura do IP atrás do
  proxy e as migrations no pré-deploy.
- **O que acontece com duas respostas ao mesmo tempo no último lugar?** A transação trava a linha do
  convite. A segunda espera, enxerga a primeira gravada e é recusada. Há teste de concorrência.
- **Como a sessão funciona?** E-mail e senha, senha com hash Argon2id, e a sessão é um cookie assinado
  e `httpOnly`, sem tabela de sessão (ADR-0010).
- **O backlog foi refinado como?** Pelos três exemplos do slide 7. A lista em tempo real virou consulta
  periódica, decidida no Grau A, porque a história pedia a lista atualizada sem exigir tempo real
  (ADR-0007).
- **Vocês usaram IA? Foram vocês que desenvolveram?** Pela resposta combinada no slide 28. Cada um diz
  o que fez, o que a IA fez na parte dele e o que revisou.
- **A camada de Domínio depende das classes concretas dos repositórios. Isso não fere a inversão de
  dependência?** Foi uma escolha consciente: a regra do projeto é a dependência num sentido só, e não
  a inversão. Com uma implementação de cada repositório, uma interface a mais não pagava o código. Os
  testes do Domínio substituem o repositório por um falso sem precisar dela.
- **Por que o histórico da main está quase todo em um nome, e uma parte com autor "Claude"?** Quem
  abrir o GitHub vê cerca de 70 commits do Tiago, cerca de 50 com o assistente de código como autor,
  1 do Gabriel e nenhum do Andreas e do Guilherme. A resposta precisa ser a mesma para os quatro e
  verdadeira: a integração passou por quem montou a base, com o assistente de código; o back-end
  entrou com a autoria do Gabriel; o front-end veio do protótipo do Guilherme, feito fora do
  repositório; e as mensagens dos commits registram de onde veio cada parte.
- **O que cada um fez?** Cada um responde pela própria parte, sem tomar o trabalho do time como seu.
  Rascunho para o time ajustar:
  - Tiago: a base do repositório, o pacote de tipos, o lint, a CI, o compose, a integração e a
    publicação, com o assistente de código.
  - Gabriel: a primeira versão das rotas e das regras do back-end, incluindo a transação com trava.
  - Guilherme: o protótipo das telas e o projeto no Azure DevOps. [Completar com o que mais foi dele.]
  - Andreas: [o time precisa combinar com franqueza o que foi do Andreas, por exemplo nos artefatos
    das Sprints 1 a 3, sem atribuir a ele o que ele não fez.]

## Checklist até 17/11

- [ ] Os quatro confirmam o texto do slide 28, sobre IA, a resposta sobre o histórico do GitHub e o que cada um fez
- [ ] Andreas preenche a ficha dele no Team Charter (#87 no quadro), que fecha também o #57
- [ ] Guilherme prepara a conta de anfitrião e o convite de reserva no Railway antes da aula
- [ ] Tiago deixa o compose local pronto para o plano B
- [ ] Ensaio cronometrado com a demo no Railway e uma rodada de perguntas (#188)
- [ ] Conferir no Moodle, em 16/11, se há tarefa de entrega do Pitch e subir o PDF (#189)
- [ ] Fechar no quadro as tarefas #186 e #187, e o #185 depois da apresentação
