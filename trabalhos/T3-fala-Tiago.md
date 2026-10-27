# T3, a parte do Tiago

Recorte do [roteiro completo](T3-roteiro.md) com só o que é meu: os slides 5 a 8, o plano B da
demonstração e as perguntas do meu território. Total de 4:30 de fala, do minuto 2:45 ao 7:15.

## Antes de começar

- Eu compartilho o PDF do slide 1 ao 15. No slide 16 o Guilherme assume a tela para a demo no
  Railway.
- Zoom do leitor de PDF pronto para os slides 5 e 6, que são densos. Ctrl e + no diagrama e
  voltar ao normal antes de passar.
- Compose local no ar, conta logada e convite de reserva lotado, para o plano B.
- Câmera ligada enquanto falo. Quem fala diz "próximo" para avançar.

## Entrada

O Andreas fecha a linha do tempo com: "O Tiago mostra os diagramas da arquitetura."

## Slide 5, Diagrama de camadas (1:00)

> "Aqui é o Tiago. Eu montei a base do projeto e a orquestração com Docker, e fiz a integração do
> front-end e do back-end. Este é o diagrama de camadas do documento de arquitetura do Grau A, o
> mesmo do DAS, só com a fonte maior.
>
> São três tiers, cada um num container: o front-end em Next.js, a API em NestJS e o PostgreSQL.
> Dentro da API ficam as três camadas lógicas: Apresentação, Domínio e Dados. O front-end segue
> MVC. O navegador fala com a API direto no painel e no envio da resposta, e a página do convite é
> lida pelo servidor do front-end.
>
> Camada é divisão lógica, tier é processo separado. As três camadas ficam no mesmo container da
> API."

Apontar: os três tiers, depois as três camadas dentro do tier da API.

## Slide 6, Diagrama de componentes (1:00)

> "O diagrama de componentes do Grau A, cortado em duas metades: à esquerda o front-end e a
> Apresentação, à direita o Domínio, os Dados e o banco.
>
> Os componentes da API existem no código com o mesmo nome: os quatro controllers, a guarda de
> sessão, o filtro de erro, os cinco services, o catálogo de templates e os três repositórios. Duas
> diferenças: o limite de tráfego virou um serviço que o controller chama, e não uma guarda do Nest,
> e o TemplateSet virou arquivos, um CSS com uma classe por template e uma imagem de prévia por
> template, como o documento de arquitetura registra. O código também tem peças que o diagrama não
> detalha, como a guarda que só aceita JSON."

Apontar: os controllers na metade da esquerda, os services e repositórios na da direita.

## Slide 7, Diagrama de implantação (1:00)

> "O diagrama de implantação. O docker-compose.yml é a forma executável dele: os três containers,
> o banco sem porta publicada, o front-end na 3000 e a API na 3001, porque o navegador chama a API
> direto. A API só sobe depois que o banco responde ao healthcheck. No T1 apresentamos o Docker como
> forma de cada integrante subir o ambiente com um comando, e é assim que desenvolvemos.
>
> Para esta apresentação publicamos as mesmas imagens no Railway, um serviço por tier. Isso é uma
> decisão nova, porque o ADR do ambiente de execução dizia só local. Ela está registrada num ADR
> novo, com o que precisou mudar: o cookie de sessão entre os dois domínios e o IP do convidado
> atrás do proxy, os dois ligados por variável de ambiente. O compose local continua igual."

## Slide 8, Lint e integração contínua (1:30)

> "A regra de camadas não fica só no documento. O lint recusa import que quebra a regra: o Domínio
> não importa da Apresentação, os Dados não importam de nenhuma camada de cima, e a Apresentação não
> chama os Dados direto. Um PR que quebra a regra fica vermelho.
>
> Em todo PR, a integração contínua roda lint, formatação, tipos, testes contra um PostgreSQL e o
> build, e constrói as imagens. Ao lado, os dois jobs verdes de um PR. Um segundo arquivo do compose
> troca a API por um mock, para trabalhar nas telas sem banco.
>
> A dificuldade deste bloco foi juntar o front-end e o back-end, que foram escritos em paralelo,
> fora da main. A integração foi em duas etapas: primeiro o front-end, com o mock respondendo às
> rotas com os tipos do pacote compartilhado, depois o back-end. Em cada etapa, o que não cabia na
> arquitetura foi adequado, registrado com o motivo nos Ajustes da Sprint 5, e só entrou na main com
> a CI verde. O pacote de tipos, criado no começo da Sprint 4, permitiu juntar as duas partes sem
> reescrever tudo. O protótipo do front-end foi feito sem ele, e foi isso que pediu a maior parte da
> adequação."

Passagem: "O Gabriel mostra o back-end."

Se o bloco estiver atrasado, o slide 8 fica numa frase: "o lint e a CI garantem a regra de camadas
em todo PR, e a dificuldade foi integrar o front-end e o back-end feitos em paralelo".

## Durante a demonstração: plano B

O Guilherme conduz a demo pelo Railway. Eu fico com o compose local no ar e a mesma preparação dele.

- Gatilho: se uma ação travar por mais de 20 segundos ou o Railway cair, o Guilherme diz "vamos
  seguir na máquina do Tiago". Ele para de compartilhar, eu compartilho e continuo do passo em que
  ele parou.
- Se eu assumir, o fechamento também fica comigo:

  > "As doze histórias estão implementadas, e as mudanças em relação à arquitetura do Grau A estão
  > registradas com o motivo. Até 17/11 vamos revisar a documentação contra o código e preparar o
  > Pitch. Ficamos à disposição para perguntas."

- Plano C: o vídeo do caminho da demo e as capturas do apêndice, slides 17 a 19.

## Arguição

Meu território: arquitetura, Docker, GitHub, integração e a publicação. Nesses eu respondo direto.
Nos outros, só completo se o dono pedir, e passo pelo nome: "o Gabriel fez essa parte".

- **Por que três camadas e não quatro?** Só existem três motivos de mudança com vida própria: o
  jeito de falar com o mundo, as regras do evento e o armazenamento. Seção 1 do Guia.
- **A pasta `api/src/model` é uma quarta camada?** Não. São as classes do modelo e as projeções que
  atravessam as camadas, e o lint impede que ela importe qualquer camada.
- **O Domínio pode importar dos Dados? Como o lint sabe?** Pode, a dependência só desce. O
  `import-x/no-restricted-paths` em `eslint.config.mjs` proíbe Domínio e Dados importando da
  Apresentação, Dados importando do Domínio, a Apresentação importando dos Dados, e no front-end o
  controller importando da view.
- **O navegador chamar a API direto não expõe a API?** A exposição é controlada: a API só aceita
  chamada do navegador vinda da origem do front-end, o cookie é `httpOnly`, as escritas públicas
  têm limite de tráfego, só aceitam JSON, e o banco não tem porta aberta. Passar tudo pelo Next
  poria lógica no tier do front-end, que o ADR-0004 restringe.
- **Por que publicar, se o ADR-0003 dizia só local?** Porque a apresentação é remota e a demo não
  podia depender da máquina de quem apresenta, que era a consequência negativa do próprio ADR-0003.
  O ADR-0015 propõe substituir o 0003: local para desenvolvimento, Railway para a demonstração. Ainda
  falta o aval do time.
- **O que precisou mudar para publicar?** Três coisas, as duas primeiras ligadas por variável de
  ambiente. O cookie de sessão passou a sair com `SameSite=None` e `Secure`, porque front-end e API
  ficam em domínios diferentes e o `Lax` não iria junto. A API lê o IP do convidado no
  `X-Forwarded-For`, senão o limite de tráfego contaria todo mundo como o proxy. E as migrations
  rodam no pré-deploy da API, porque o banco do Railway não roda os scripts sozinho.
- **`SameSite=None` não abre espaço para requisição forjada?** O que segura é o CORS, que só aceita
  a origem do front-end, e a guarda que só aceita `application/json`: um formulário de outro site
  não consegue mandar esse tipo sem a checagem prévia do navegador. O custo registrado é que o Safari
  e a janela anônima bloqueiam o cookie da API. Um domínio próprio resolveria.
- **As migrations só rodam com o banco vazio. Como evoluem o esquema?** É uma limitação aceita, no
  compose e no Railway: mudar o esquema exige banco novo. Está no Diagrama de Implantação e no
  ADR-0015. Vale enquanto não há dado que precise ser conservado.
- **E com duas instâncias da API?** O limite de tráfego fica na memória do processo e deixaria de
  valer. Está em aberto na seção 5 dos Ajustes. Hoje roda uma instância só.
- **Como vocês priorizaram as Sprints 4 e 5?** A Sprint 4 planejava fechar o fluxo central: conta,
  criação, link, resposta, acompanhantes e restrição alimentar. Na prática ela montou a base, e o
  fluxo fechou na Sprint 5, junto com personalização, prévia, despublicação, alteração da resposta,
  lista de presença e consolidação.
- **Por que o histórico da main está quase todo no seu nome?** Porque a integração passou por quem
  montou a base. O back-end entrou com a autoria do Gabriel, o front-end a partir do protótipo do
  Guilherme, e as mensagens dos commits registram isso. Se perguntarem sobre ferramentas de IA,
  responder com franqueza: foram usadas, e cada um responde pelo que fez e pelo que revisou.

## O que reler antes

A seção 1 do Guia. O `docker-compose.yml` e o `eslint.config.mjs`. A seção 5 dos Ajustes da
Sprint 5, o que continua em aberto. O ADR-0015 e o guia de [Publicação no Railway](../docs/Começando/Publicação-no-Railway.md).
