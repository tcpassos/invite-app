# T1, roteiro do seminário sobre Docker e conteinerização

> Documento de trabalho do time. Fica no GitHub e não vai para a wiki, porque tem decisão tática de
> apresentação. Work item [#78](https://dev.azure.com/GUITOEBE/invite-people/_workitems/edit/78).
> Apresentação em 08/09/2026, slides no Moodle até 23h55 do mesmo dia.

## A ideia que sustenta tudo

O container é a forma executável do que a disciplina chama de componente, e o arquivo de compose é
a forma executável do diagrama de implantação que temos que entregar no item #60 desta sprint.

Conteinerização entra aqui como decisão de arquitetura sobre empacotamento e implantação, com custo
declarado, e sai registrada no ADR #63.

## Camada lógica e tier não são a mesma coisa

As três camadas do back-end, Apresentação e API, Domínio e Dados, são camadas lógicas e ficam na
mesma imagem. O que o container separa são tiers: front-end, API e banco.

A decisão arquitetural em jogo é a granularidade, ou seja, em quantos tiers as camadas lógicas serão
empacotadas e onde cada um roda.

Em UML, o container é um ambiente de execução aninhado no nó do host, e a imagem é o artefato
implantado nele. Ambiente de execução é uma especialização de nó, então nunca dizer "container não
é nó".

## Onde o deck responde "para que vamos usar"

No slide 3, logo depois do slide do projeto, com o título "Para que o grupo quer usar Docker". Os
três usos: ambiente igual para os quatro com o banco sem instalação local, um arquivo versionado no
repositório que qualquer um sobe com um comando, e mais adiante o mesmo ambiente na entrega e na
apresentação do produto.

Esse slide é do Guilherme e resolve o bloco de abertura, que antes tinha um slide de conteúdo só.
Ele deve deixar claro, em voz alta, que nada disso está feito, que é proposta, e que o resto da
apresentação é o exame dessa ideia. Isso não está escrito no slide de propósito. Aviso de pendência
impresso fica feio e soa a desculpa. Dito, soa a honestidade.

O fecho retoma os três, agora como resultado. Nenhum deles precisa ser repetido no meio.

## Nada de identificador interno na tela

Regra sem exceção: se a plateia não consegue resolver o termo sozinha, ele não vai no slide. Isso
cobre UC, número de work item, nome de coluna do quadro, nome de persona, nome de documento do
grupo, Sprint numerada, Questão Norteadora, ADR e número de trabalho da disciplina.

Na fala é o contrário, tudo isso pode e deve aparecer, principalmente na arguição, que é onde
rastreabilidade vira ponto. Quem apresenta precisa saber de cor o que é o #59, o #60 e o #63 antes
de subir.

Antes de subir o arquivo no Moodle, rodar:

    python trabalhos/deck-t1/checar-identificadores.py trabalhos/T1-Docker-Invite-People.pptx

## Um título por slide

Os slides tinham dois títulos, a cartola laranja em caixa alta e o título azul grande, e na maioria
dos casos os dois diziam a mesma coisa em duas formas. Cabeçalho seguido de subcabeçalho é formato
de documento, não de slide, e era uma das coisas que davam ao deck cara de texto gerado.

Agora é um título só, curto, sempre o mais direto dos dois. Quem apresenta pode dizer a versão longa
em voz alta. Onde o título antigo trazia a tese do slide, essa tese passou a ser a primeira frase da
fala, não uma linha na tela.

## O slide traz o fato, quem apresenta traz o nome

Os slides pararam de nomear a categoria de cada frase. Onde antes estava escrito "a mesma imagem
atravessa notebook, pipeline e a demonstração do T3, o que ajuda a manutenibilidade", agora está só
a primeira metade. Frase que enuncia um fato e depois classifica ele soa a texto gerado, e ocupa
espaço com uma palavra que quem apresenta diz de graça.

Isso vale principalmente no slide de ganho e custo, onde os sete itens perderam o nome do atributo.
O Andreas precisa dizer cada um em voz alta: modularidade e reusabilidade na primeira linha,
compreensibilidade na segunda, extensibilidade na terceira, manutenibilidade na quarta,
escalabilidade na quinta, e do outro lado segurança e desempenho. Sem isso o slide vira lista de
benefícios genéricos e perde a ligação com o vocabulário da disciplina.

## Número de item também fica na fala

Pelo mesmo motivo das aulas, os números de work item saíram quase todos dos slides. A plateia não
tem o board aberto e um "#60" sozinho não diz nada. Onde o slide antes trazia o número, agora traz o
nome do artefato: diagrama de componentes, diagrama de implantação, ADR.

Sobraram três números, todos no fecho, que é onde a rastreabilidade é o assunto: o intervalo #58 a
#63 e o ADR #63, citado duas vezes. Quem apresenta pode citar número à vontade na fala, e deve, na
arguição. Só não precisa estar impresso em dez slides.

## Citar as aulas na fala, não no slide

Os slides ficaram com duas citações de aula apenas, na legenda do slide de tiers e no custo de
desempenho. Nos outros pontos o vocabulário dele aparece sem a etiqueta, porque nove menções a
Aula 03 e Aula 05 espalhadas pelo deck viram enfeite e poluem a projeção.

A ligação continua sendo esperada, só que dita. Onde o slide fala em modularidade, reusabilidade,
compreensibilidade, extensibilidade, coesão, acoplamento, degradação arquitetural ou
substituibilidade por compatibilidade de interface, quem apresenta diz de qual aula veio. É de graça
na fala e conta nos 25% de relacionar a tecnologia às decisões arquiteturais.

## Tempo e donos

| Bloco | Tema | Min | Slides | Dono |
|---|---|---|---|---|
| A | Contexto do projeto e escopo da apresentação | 3 | 3 | Guilherme |
| B | Definições, arquitetura do Docker e o que o kernel faz | 6 | 7 | Tiago |
| C | Aplicação no Invite People, do diagrama para o arquivo | 6 | 6 | Gabriel |
| D | Vantagens, desvantagens, demonstração e considerações finais | 7 | 8 | Andreas, com Tiago na segurança |

Mais um minuto para as três trocas de apresentador. Total 23, dentro da faixa de 20 a 25.

No rodapé dos slides os blocos aparecem como as seções numeradas dos divisores, para bater com o
vocabulário do professor: o A é Introdução, o B é 01 Definições e arquitetura, o C é 02 Aplicação no
projeto e o D é 03 Vantagens e desvantagens, com Considerações finais e Referências no fim.

Os nomes falados na agenda seguem o formato das aulas dele: Introdução, Definições, Arquitetura,
Aplicação no projeto, Vantagens e Desvantagens, Considerações Finais, Referências.

---

## Bloco A, contexto (3 min, Guilherme)

Objetivo: situar o projeto em quarenta segundos e fechar o contrato de escopo logo no começo, para
que a ausência de código não pareça desculpa no final.

1. O projeto em quarenta segundos. Invite People, convites virtuais com RSVP e consolidação de
   restrições alimentares. Duas superfícies sobre o mesmo Model, o convite público sem login e o
   painel do anfitrião. Arquitetura já registrada no Guia da Arquitetura. A nota lateral do slide dá
   a situação de hoje: as três camadas do back-end já decididas e ainda sem decisão de em quantos
   processos separados elas vão rodar. Não usar aqui os termos camada lógica e separação física, que
   só ganham sentido no slide de tiers, no Bloco 02.
2. Contrato e agenda, ditos no minuto dois. A implementação começa na Sprint 4, em 06/10, então não
   existe aplicação para conteinerizar e a demonstração do final é do ambiente. Nem o contrato nem a
   agenda têm slide, os dois são falados. O contrato aparece escrito só no divisor da seção 03, onde
   ele importa, logo antes da demonstração. Na agenda o Guilherme diz os quatro nomes e os quatro
   blocos em voz alta, avisando que cada um responde pelo próprio bloco na arguição.
3. Terminar no gancho. O último item do slide é a Questão Norteadora da Sprint 2, sobre como os
   componentes serão distribuídos e implantados. Ler ela em voz alta e passar para o Tiago sem
   explicar o que vem pela frente. O divisor da seção 01 já faz essa ligação sozinho.

Perguntas prováveis: por que Docker e não outra da lista, vocês já entregaram o diagrama de
implantação, qual a diferença entre camada lógica e separação física, o que exatamente vão
demonstrar já que o produto não existe.

---

## Bloco B, definições e arquitetura do Docker (6 min, Tiago)

Objetivo: entregar o critério de 30% definindo container por mecanismo em vez de metáfora, e
terminar posicionando Docker como implementação de um padrão aberto, que é a ponte para a
substituibilidade da Aula 05.

1. Linha do tempo. chroot em 1979, o primeiro namespace no kernel em 2002, cgroups no mainline em
   2008, Docker em 2013, OCI em 2015, containerd na CNCF em 2017, e a remoção do dockershim no
   Kubernetes em 2022. A fala que fecha o slide responde de antemão por que isso conta como
   tecnologia emergente em 2026: o isolamento de processos existe desde 1979, o que é recente é a
   padronização da cadeia de execução, a partir de 2015.
2. Duas definições, em quinze segundos. Container é um ou mais processos executados com visão
   isolada por namespaces, consumo limitado por cgroups e privilégio reduzido por capabilities e
   seccomp, sobre um sistema de arquivos raiz próprio. O slide já diz que essa foi montada pelo
   grupo e que a de imagem vem da Image Spec da Open Container Initiative. É aqui que o nome é dito
   por extenso pela primeira vez. Não usar a sigla OCI antes deste ponto.
3. Abrir com a afirmação de que não existe estrutura chamada container no kernel do Linux. O que
   existe é um processo comum com a visão restringida. Terminal pré-capturado, nunca ao vivo, com o
   processo aparecendo no `ps` do host e o `lsns` listando os namespaces. Dizer em voz alta onde foi
   capturado e por quê: no Docker Desktop em Windows o daemon e os containers rodam numa distro
   própria do WSL, com namespace de PID separado, então `ps` na distro de trabalho não mostraria
   container nenhum.
4. Namespaces nomeados pela consequência. mnt dá árvore de montagem própria. pid faz o processo
   virar PID 1 lá dentro. net dá pilha de rede própria, e é por isso que dois containers escutam na
   mesma porta ao mesmo tempo.
   Em seguida cgroups, que não isolam, contabilizam e limitam. Estourar `memory.max` não deixa o
   processo lento, o kernel mata o processo. Limite de CPU é throttling na virada
   de cada período, o que degrada latência de cauda e não a média, e por isso é mais difícil de
   diagnosticar.
5. A imagem por dentro, com diagrama obrigatório. Camadas somente leitura endereçadas por digest
   mais a camada de escrita que o container adiciona por cima. overlay2 monta isso com lowerdir,
   upperdir, workdir e merged. No copy-up, alterar um byte de um arquivo grande copia o arquivo
   inteiro para a camada de escrita, e é por isso que banco de dados na camada de escrita tem
   desempenho ruim e precisa de volume. Guardar essa frase, porque o Bloco D volta nela.
   Whiteout: apagar um arquivo de camada inferior cria uma marcação em vez de apagar. A consequência
   é concreta e vale ligar ao nosso projeto. Um Dockerfile que copia um `.env` e faz `RUN rm` na
   instrução seguinte produz uma imagem em que o segredo continua legível. No nosso caso o segredo
   seria a senha do banco e o segredo de sessão do UC001. Build time e run time são coisas
   diferentes: o que entra na imagem é público, o que entra por variável de ambiente é de execução.
   Essa distinção é justamente o que falta escrever na nossa página Configuração de Ambiente.
6. A pilha de execução, com diagrama obrigatório. CLI, dockerd, containerd por gRPC, um shim por
   container e o runc. O runc cria os namespaces, configura cgroups, aplica capabilities e seccomp,
   sai sem ficar residente. O shim é pai do container e
   não filho do daemon, e foi esse desenho que fez reiniciar o daemon deixar de matar os containers
   em execução.
   Depois as três paredes de segurança em ordem: capabilities, com o root do POSIX fatiado em cerca
   independentes, seccomp-bpf, que bloqueia parte das chamadas
   de sistema, e o LSM por cima. A opção `--privileged` devolve tudo de uma vez e ainda desliga
   seccomp.
7. OCI como fecho do bloco. Três especificações sob a Linux Foundation desde 2015. Enquadrar no
   vocabulário da Aula 03, em que padronização é propriedade de camada e TCP e IP aparecem como
   exemplo. Docker é implementação de um padrão, não o padrão. O runc é trocável por crun, gVisor ou
   Kata, e o engine por Podman. Passagem para o próximo bloco: isso é a substituibilidade por
   compatibilidade de interface da Aula 05 acontecendo dentro da própria pilha da ferramenta.

Munição de arguição, combinada no ensaio e deliberadamente fora dos slides. A semântica de PID 1,
que ignora sinal sem tratador registrado e por isso não encerra de forma graciosa, com a causa no
CMD em forma shell e a correção pela forma exec ou por tini. E o `/proc`, que não é isolado, o que
faz `free` e `nproc` mostrarem o host e levou JVM, Go e Nginx a dimensionarem contra a máquina
inteira.

Perguntas prováveis: diferença entre namespace e cgroup, então container é uma VM pequena, o que
acontece se estourar a memória, por que a imagem é em camadas, se apago um arquivo no Dockerfile ele
some, por que existe containerd e runc, o que é OCI e por que importa para arquitetura, esse
terminal está rodando agora.

---

## Bloco C, aplicação no Invite People (6 min, Gabriel)

Objetivo: mostrar que o container realiza os diagramas de componentes e de implantação da Sprint 2,
usando só o vocabulário das aulas e apontando o número de cada task do board.

1. Layer contra tier, a distinção da Aula 03. Layer é camada lógica, tier é separação física. Avisar
   no mesmo slide que Docker usa a palavra layer para o empilhamento do sistema de arquivos, sem
   relação nenhuma com a camada lógica.
   Mostrar as nossas três camadas em três granularidades: tudo em um tier, front-end separado da API, e
   os três separados com o banco isolado. Nenhuma delas muda uma linha do projeto lógico e todas
   mudam o empacotamento. Docker obriga a escolher a granularidade em vez de deixá-la implícita, e
   essa escolha é entrada do ADR.
2. A modelagem UML dita com precisão, porque é aqui que a banca cobra. Ambiente de execução é uma
   especialização de nó, então o modelo fiel é o nó do host contendo um ambiente de execução, que é
   o container, contendo o artefato, que é a imagem. Máquina virtual, essa sim, é um nó novo, com
   sistema operacional próprio.
3. Os dois diagramas lado a lado. Rascunho do diagrama de componentes (#59) à esquerda, rascunho do
   de implantação (#60) à direita, e uma seta de cada componente para o ambiente de execução
   correspondente. Sobre eles, os sete passos do #60 mapeados um a um, com o número da task na tela.
   #71 identificar os nós vira o host com o engine instalado. #72 mapear componentes vira a
   definição de serviço no compose. #73 dispositivos e artefatos vira a imagem por tag e digest. #75
   links de comunicação vira a rede nomeada, com resolução por nome de serviço. A fala: o compose é
   a forma executável do diagrama que temos que desenhar nesta sprint. Carimbar a palavra rascunho e
   o número do item no canto.
4. Notação de componente sobreposta ao arquivo. Pirulito e soquete desenhados por cima do trecho de
   compose. Interface provida é a porta publicada mais o contrato HTTP. Interface requerida é a
   variável de conexão que o serviço espera receber mais a dependência declarada. A porta da UML é
   literalmente a porta do container, com o mesmo desenho e o mesmo nome.
5. Coesão e acoplamento, que são as palavras que ele mais repete nas três aulas. A fronteira do
   container aumenta a coesão do serviço porque força uma responsabilidade por imagem. O acoplamento
   muda de forma em vez de desaparecer, e passa a ter latência, falha parcial e ordem de subida, que
   é a razão de existir HEALTHCHECK com `condition: service_healthy`.
   Aqui é fácil exagerar, então cuidado com a afirmação. O container não torna estrutural a regra
   entre as nossas três camadas, porque elas ficam na mesma imagem do back-end. Ele torna estrutural
   outras duas coisas. O código do front-end não está dentro da imagem da API, então a API não consegue
   depender dele nem por acidente. E só o serviço de fronteira publica porta, com o banco na rede
   interna sem mapeamento. Amarrar com degradação arquitetural, tema da Aula 02: uma regra escrita na
   wiki depende de disciplina de revisão, a mesma regra virando topologia é sustentada pela
   estrutura.
6. A pergunta que o seminário devolve para o projeto. Nosso MVC tem duas views sobre o mesmo Model,
   o convite público do UC005 e o painel do UC007, com perfis de exposição e de carga bem
   diferentes. A jornada da Marina descreve o link caindo no grupo da família, ou seja, pico no
   convite público enquanto o painel tem uma pessoa olhando. Replicar só o serviço público faz
   sentido, replicar o painel não. E a restrição volta para o projeto: para isso valer, o convite
   público não pode guardar sessão em memória nem gravar upload em disco local.
   O slide das duas áreas é direto: convite público sem login, com pico e sem estado, e painel com
   login, uma pessoa por evento. A conclusão é que a API ganha réplicas por causa da área pública.
   A dúvida entre uma imagem de front-end ou duas fica para a fala, se perguntarem, e para o
   documento de decisões arquiteturais.

Perguntas prováveis: o container é nó ou artefato, diferença entre componente e imagem, vão separar
as três camadas em três containers, onde fica a interface requerida, como garantir que a regra de
dependência não seja violada, o convite público e o painel vão na mesma imagem, vocês estão indo
para microsserviços.

Resposta pronta para a de microsserviços: não. A arquitetura decidida é três camadas, e
conteinerizar um sistema de três camadas não o transforma em microsserviços. Microsserviço implica
autonomia de dados e de ciclo de vida por serviço, o que não é o caso e nem está no escopo do MVP.

---

Coerência entre os slides 14, 16, 17 e 19, para quem apresentar a parte 3: o desenho em destaque
no 14 é o de três tiers, o rascunho do 16 tem três nós e o compose do 17 agora tem três serviços,
front, api e db. O que se replica, no 19 e no 27, é o container da API, por causa do convite público,
e só se esse caminho for sem estado. Não dizer que três tiers é o que permite escalar. O que permite
é a API separada do banco e sem estado no caminho público, em qualquer desenho com dois ou três.
O número final de tiers é decisão do documento de decisões arquiteturais.

## Bloco D, vantagens, desvantagens e considerações finais (7 min, Andreas com Tiago na segurança)

Objetivo: entregar a demonstração sem fingir que existe produto, tratar vantagens e limitações com o
mesmo peso, no padrão das aulas da disciplina, e converter o seminário em recomendação registrada
para o ADR.

1. Repetir o escopo em uma frase antes de abrir o terminal. Não existe código do produto, o que vai
   subir aqui é o ambiente e a topologia. Dizer de novo mesmo tendo dito no Bloco A, porque é o que
   impede a demo de parecer improviso.
2. Demonstração de 90 segundos, cronometrada no ensaio. Imagens baixadas na véspera e nenhuma
   instrução `build` no compose, para não depender da rede da sala nem de código que não existe.
   PostgreSQL oficial mais um nginx oficial servindo um HTML de uma linha, com rede nomeada e volume
   nomeado. A sequência: subir, mostrar `compose ps`, provar a resolução por nome de serviço com um
   de dentro do container do banco (`docker compose exec db psql -U app`), criar uma tabela e inserir uma
   linha, derrubar e subir de novo com o dado ainda lá, e por fim derrubar removendo o volume para o
   dado sumir. Narrar a conclusão: persistência é decisão declarada.
   Amarrar em regra que já está escrita, para não ficar genérico. A imagem de fundo que a anfitriã
   envia no UC003 e o CSV gerado no UC008 não podem morrer junto com o container, ou seja, a decisão
   de implantação volta como restrição de projeto para as camadas de cima.
3. O caso do Kubernetes 1.24 deixou de ter slide próprio. A frase está no fim do slide da OCI, na
   parte 2: em 2022 o Kubernetes removeu o adaptador embutido que falava com o Docker Engine e
   nenhuma imagem parou de funcionar, porque o formato é o da OCI. Quem apresentar a parte 2 diz
   isso ali. No bloco de vantagens e desvantagens não precisa voltar ao assunto.
4. As vantagens não têm slide próprio, elas estão no slide de ganho e custo, no fim do bloco, com o
   quarteto que ele credita às camadas de um lado. Aqui basta anunciar que o balanço vem no fim e
   seguir para as limitações, senão a mesma lista é dita duas vezes.
5. As limitações ficaram no slide de vantagens e limitações, só as que atingem o protótipo:
   superfície de ataque nova, I/O mais lento no Windows, banco com estado exigindo backup e
   upgrade, e a camada a mais de build e orquestração para o time aprender. Logo antes vem a
   figura das duas pilhas, container contra máquina virtual. Apontar o SO convidado repetido três
   vezes de um lado e ausente do outro, é isso que a figura existe para mostrar.
   Três limitações gerais saíram da tela e ficam para a arguição, se perguntarem: o daemon roda
   como root e estar no grupo docker equivale a root no host; a regra de rede do Docker é aplicada
   antes das do administrador, então bloqueio de firewall na porta publicada não tem efeito; e o
   Docker Desktop é pago para empresa acima de certo porte. Nenhuma delas atinge quatro notebooks
   sem servidor, por isso não estão no slide.
   Nenhum número de desempenho sai daqui sem medição própria.
6. Container e máquina virtual pela superfície de ataque, apresentado pelo Tiago. A VM tem kernel
   próprio e a fronteira é imposta em hardware. O container compartilha o kernel do host e a
   fronteira dele é a interface de chamadas de sistema, mais de trezentas, mais /proc, /sys e ioctl.
   Uma CVE só, a do runc de 2019, em que o processo de dentro sobrescrevia o binário do runtime pelo
   `/proc/self/exe`. A conclusão honesta: container é fronteira de isolamento, e não fronteira de
   segurança da mesma classe que uma VM. Para cargas de um mesmo time serve, para inquilinos que não
   confiam uns nos outros existem gVisor e Kata.
   Quem apresentar precisa explicar o mecanismo da CVE sem consultar nada. Se não conseguir no
   ensaio, o slide sai.
7. Alternativas e quando não compensa. Quatro linhas: README com instalação nativa, custo zero e
   quebra na primeira divergência de versão. VM compartilhada, que isola de verdade mas é pesada e
   difícil de versionar. Podman, mesmo modelo sem daemon root, com menos material e menos gente do
   time conhecendo. E o compose, escolhido, com o custo já declarado.
   Quando não compensa: monolito num servidor que nunca escala, time sem integração contínua,
   aplicação sensível a latência de cauda, sistema dominado por estado.
   Conceder antes que perguntem, porque dois desses critérios descrevem o nosso caso. Pelos nossos
   próprios critérios estamos na zona cinzenta, já que não temos integração contínua nem hospedagem
   decidida. O que sustenta a adoção é um motivo só, e ele basta: ambiente igual para quatro pessoas
   com stacks diferentes, com banco rodando sem instalação local, antes de começar a escrever
   código.
   A fronteira com orquestração em uma linha: compose é de host único, o MVP cabe em um host,
   Kubernetes entraria com múltiplos nós, e isso é tema de outro grupo.
   Fecho do slide, sem frase de efeito: o que o Compose acrescenta é uma camada de build e de
   orquestração, e o grupo aceita esse custo pelo ambiente igual para os quatro.
8. Ganho e custo, em duas colunas, com o quarteto da Aula 03 e os quatro atributos das Questões
   Norteadoras nomeados. É aqui que as vantagens são ditas, uma vez só. Manutenibilidade ganha, porque o ambiente passa a ser
   versionado junto com o código. Escalabilidade ganha de forma seletiva, e isso impõe que a
   aplicação seja mesmo sem estado. Segurança ganha isolamento e herda uma superfície nova, imagem
   base e privilégio de execução. Desempenho custa, principalmente I/O nas máquinas Windows, e a
   própria Aula 03 já avisa que camada extra prejudica desempenho.
   A recomendação em três frases, que é o que vai para o ADR #63. Adotamos conteinerização como
   estratégia de empacotamento e de ambiente de desenvolvimento, com o custo declarado junto. O #60 deixa
   de ser caixa genérica e passa a ter um arquivo correspondente que roda, e esse arquivo vira
   artefato do repositório. E a terceira, que é a mais forte: conteinerizar barateia errar, porque a
   stack ainda não está decidida e com Dockerfile a escolha de runtime e de banco vira uma linha de
   arquivo em vez de instalação em quatro notebooks.
   Emendar que esta recomendação é insumo direto da Sprint 3, que começa no dia 15 e tem como
   objetivo declarado definir as tecnologias e os mecanismos da implementação.

Perguntas prováveis: isso não é exagero para um MVP, o que acontece com o banco quando o container
morre, colocariam o banco em container em produção, diferença entre volume nomeado e bind mount,
quanto custa em desempenho no Windows, Docker é seguro, por que não Kubernetes, Docker Desktop é
pago, esse arquivo já está no repositório, se a stack mudar quanto desse trabalho se perde.

---

## Fechamento

O último slide de conteúdo é o de vantagens e limitações. Depois de percorrer as duas colunas,
fechar ali mesmo com três frases ditas devagar, sem slide próprio, porque as três já foram títulos
ao longo da apresentação. Container é um processo comum, isolado por mecanismos do kernel. Imagem é
o artefato, container é o ambiente de execução. A decisão de arquitetura é em quantos processos
separados o sistema vai rodar.

A promessa do slide 3, um arquivo que qualquer um dos quatro sobe com um comando, foi cumprida pelo
compose do slide 17 e pela demonstração do 21. Se quiser retomar, é a esses dois que se aponta.

As pendências saíram da tela, mas ficam na fala: os seis itens de modelagem seguem em aberto e o
documento de decisões arquiteturais, item #63, ainda não foi escrito. Dizer isso antes de abrir para
perguntas. Enumerar as próprias lacunas com número de work item transforma pendência em processo
registrado, e é a melhor defesa que existe na arguição.

Referências no formato de tag que ele usa: as três specs da OCI, Sommerville, Fowler, Felter et al.
2015, Merkel 2014 no Linux Journal, NIST SP 800-190, Twelve-Factor App, e as Aulas 03 e 05.

A última fala, antes de abrir para a arguição, anuncia quem responde pelo quê.

## Protocolo de arguição

A avaliação é individual e vale 15%, então vale combinar quatro regras por escrito:

1. Quem recebe a pergunta responde a primeira frase e depois passa nominalmente para o dono do
   bloco. Ninguém fica em silêncio olhando para o lado.
2. Ninguém responde duas perguntas seguidas enquanto houver integrante que ainda não respondeu
   nenhuma.
3. Segurança e mecanismos de kernel são com o Tiago, em qualquer bloco, e isso é anunciado na
   agenda falada da abertura.
4. O Guilherme fica com um segundo território técnico simples e defensável, para não passar a
   arguição inteira calado.

## Ordem de corte, combinada antes do ensaio

Caem primeiro os pontos de cache de build e a ressalva do Alpine. Depois o detalhe da pilha de
execução. Namespaces, cgroups, OCI, os dois diagramas do Bloco B e qualquer parte da demonstração
não entram na ordem de corte, porque a demo sozinha vale 10% e não tem substituto.

## Checklist até terça

- [ ] Postar o tema no fórum e obter validação do professor (#79, ainda em To Do)
- [ ] Definir dono do compose e commitar antes de domingo (#84)
- [ ] Capturar o terminal com `ps` e `lsns` numa máquina Linux ou na distro docker-desktop
- [ ] Desenhar os rascunhos do #59 e do #60, mesmo grosseiros, no draw.io
- [ ] Desenhar os dois diagramas do Bloco B, pilha de execução e camadas de imagem
- [ ] Baixar as imagens na véspera nas máquinas que vão apresentar
- [ ] Gravar vídeo de 90 segundos da demo como plano B, e guardar de quatro a seis capturas
      numeradas no fim do deck como plano C
- [ ] Verificar nas quatro máquinas: virtualização habilitada, WSL2 atualizado, Docker Desktop
      abrindo
- [ ] Escrever o ADR #63 com status de proposta, mesmo que em uma página, senão a frase "o time
      adota" fica sem lastro
- [ ] Ensaiar cronometrado bloco a bloco, com as três trocas, mais uma rodada de perguntas cruzadas
- [ ] Exportar o deck em PDF, subir no Moodle na véspera, levar em pendrive e deixar cópia aberta na
      máquina de um segundo integrante

## Regras de honestidade que não se negociam

- Nenhuma saída de terminal entra no slide sem ter sido capturada de verdade, e todo slide de
  terminal leva no rodapé a máquina e a data da captura.
- Nenhum número de tamanho de imagem, tempo de build ou tempo de partida sem medição própria.
- Nenhuma contagem de arquivos ou de commits em slide, porque envelhece sozinha até o dia 08.
- A ressalva de que a stack está em aberto aparece no primeiro slide em que houver código, e não só
  no final.
- Toda fala sobre arquitetura em tempo de proposta. A Sprint 1 não está concluída, #56 e #57 seguem
  em Doing.
