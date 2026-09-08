# Roteiro de falas, seminário sobre Docker

Apresentação em 08/09/2026, deck de 28 slides, 24 minutos com as trocas. O formato é o que o
Gabriel usou na parte dele. As falas da parte 3 são as dele, com a numeração nova.

- Guilherme, slides 1 a 6, 4 min
- Tiago, slides 7 a 13, 6 min
- Gabriel, slides 14 a 20, 6 min
- Andreas, slides 21 a 28, 7 min

---

## Parte 1, Guilherme (slides 1 a 6, 4 min)

[Mudar para o Slide 1 - Capa]
Fala:
"Nosso seminário é sobre Docker e conteinerização, e a pergunta que vamos responder é como o empacotamento em containers se aplica ao nosso projeto, o Invite People. Somos quatro. Eu abro com o contexto e as definições. O Tiago explica a arquitetura do Docker e o que o kernel faz. O Gabriel aplica isso no projeto. E o Andreas fecha com a demonstração, as vantagens e as limitações. Na arguição, cada um responde pela própria parte."

[Mudar para o Slide 2 - O projeto Invite People]
Fala:
"O Invite People é um app web de convites virtuais. O anfitrião cria o convite, o convidado confirma presença pelo link, e o anfitrião consolida as restrições alimentares de quem confirmou. São duas superfícies sobre o mesmo modelo de dados: o convite público, que não pede login, e o painel do anfitrião. A arquitetura já está registrada na documentação do projeto, com MVC no front-end e três camadas no back-end. O que ainda não está decidido é em quantos processos separados essas camadas vão rodar, e como esses componentes serão distribuídos e implantados. É essa pergunta que a apresentação examina."

[Mudar para o Slide 3 - Para que o grupo quer usar Docker]
Fala:
"Antes de entrar na tecnologia, o motivo prático. Somos quatro pessoas com máquinas e sistemas diferentes, e queremos o mesmo ambiente de desenvolvimento para todos, com o banco rodando sem ninguém instalar nada na própria máquina. Queremos que esse ambiente esteja descrito num arquivo dentro do repositório, versionado junto com o código, e que qualquer um suba com um comando. E queremos que, na entrega e na apresentação do produto, o ambiente seja o mesmo do desenvolvimento. Um aviso de escopo: a implementação do produto começa em outubro, então ainda não existe aplicação para colocar em container. A demonstração do final mostra o ambiente e a topologia, e é isso que estamos avaliando hoje."

[Mudar para o Slide 4 - Capa da Seção 01]
Fala:
"A primeira seção é de definições e arquitetura. Antes de decidir onde cada parte roda, precisamos saber o que acontece quando alguém digita docker run e por que a imagem é em camadas."

[Mudar para o Slide 5 - Linha do tempo do isolamento de processos]
Fala:
"O isolamento de processos é bem mais antigo que o Docker. O chroot, que restringe a visão que um processo tem do sistema de arquivos, é de 1979. O primeiro namespace entrou no kernel do Linux em 2002. Os cgroups, que limitam o consumo de recursos, entraram no kernel em 2008. O Docker aparece em 2013 e junta essas peças numa ferramenta fácil de usar. Em 2015 surgem as primeiras especificações comuns de container. Em 2017 o containerd vai para a CNCF, a fundação que também abriga o Kubernetes. E em 2022 o Kubernetes remove o adaptador que falava direto com o Docker. Então, quando falamos de tecnologia emergente, o que é recente é a padronização da cadeia de execução, a partir de 2015."

[Mudar para o Slide 6 - Container e imagem]
Fala:
"Duas definições que sustentam o resto da apresentação. Container é um ou mais processos executados com visão isolada por namespaces, consumo limitado por cgroups e privilégio reduzido por capabilities e seccomp, sobre um sistema de arquivos raiz próprio. Essa definição o grupo montou a partir dos mecanismos, e o Tiago vai mostrar cada um deles. Imagem é um conjunto ordenado de camadas de sistema de arquivos mais a configuração de execução, identificado por um digest, que é o hash do próprio conteúdo. Essa vem da especificação de imagem da Open Container Initiative, a OCI. Guardem a última linha do slide, porque ela volta na parte do Gabriel: no diagrama de implantação, a imagem é o artefato e o container é o nó. Agora o Tiago mostra o que o kernel faz para criar um container."

---

## Parte 2, Tiago (slides 7 a 13, 6 min)

[Mudar para o Slide 7 - Container é um processo comum, com a visão restringida]
Fala:
"No kernel do Linux não existe nenhuma estrutura chamada container. O que existe é um processo comum com a visão restringida. Esse terminal foi capturado antes, no Docker Desktop, que no Windows roda o engine sobre o WSL2, uma máquina virtual leve com kernel Linux. Subi um nginx com docker run. No ps do host ele aparece como um processo qualquer, com o PID 4821. O lsns lista os namespaces desse processo: montagem, hostname, IPC, PID e rede. Dentro do container esse mesmo processo se enxerga como PID 1. Fora, ele é o 4821. É por isso que, no diagrama de implantação, o container fica desenhado dentro do nó do host."

[Mudar para o Slide 8 - Namespaces e cgroups fazem coisas diferentes]
Fala:
"Namespaces e cgroups costumam ser citados juntos, mas fazem coisas diferentes. Namespace é visão. O namespace de montagem dá ao processo uma árvore de diretórios própria. O de PID faz ele se enxergar como PID 1. O de rede dá uma pilha de rede própria, com interfaces e portas próprias, e é por isso que dois containers conseguem escutar na mesma porta ao mesmo tempo. No nosso projeto, é esse mecanismo que permite o front-end, a API e o banco rodarem no mesmo host sem conflito de porta. Cgroup é consumo. Ele contabiliza e limita CPU, memória e I/O, sem isolar nada. E os dois limites se comportam de forma diferente. Quando o processo estoura o limite de memória, o kernel encerra o processo na hora. O limite de CPU só reduz a velocidade: as requisições mais lentas ficam piores e a média quase não muda, o que torna esse problema mais difícil de diagnosticar."

[Mudar para o Slide 9 - Dockerfile, imagem e container]
Fala:
"Agora o ciclo de vida. Tudo começa num Dockerfile, que é um arquivo de texto com a imagem base, as dependências e o comando de inicialização. O exemplo é o da nossa API: parte do node 22 sobre alpine, copia o código e define o comando. O build transforma esse arquivo numa imagem, que é um pacote em camadas, imutável, identificado por uma tag e por um digest. O run transforma a imagem num container, que é um processo em execução com uma camada gravável própria. Ali dentro o node é o PID 1, como vimos no slide anterior. Quem guarda e distribui as imagens é um registry, como o Docker Hub. Na demonstração do Andreas as imagens vêm de lá prontas, sem build local."

[Mudar para o Slide 10 - Imagens em camadas e union filesystem]
Fala:
"Por que a imagem é em camadas? Porque cada instrução do Dockerfile gera uma camada somente leitura, e essas camadas são empilhadas por um union filesystem, que no Linux é o overlay2. O desenho mostra dois containers criados da mesma imagem. As três camadas de baixo, alpine, node e o código da API, existem uma vez só no disco e são compartilhadas. Cada container recebe por cima a própria camada gravável, que some quando ele é removido. Duas consequências. A primeira é o copy-on-write: alterar um arquivo de uma camada de baixo copia o arquivo inteiro para a camada gravável antes de escrever. Por isso banco de dados gravando na camada do container tem desempenho ruim e precisa de volume, e o Andreas volta nisso na demonstração. A segunda é o whiteout: apagar um arquivo cria uma marcação na camada gravável, e o arquivo continua na camada de baixo. Isso vale para o build também. Um Dockerfile que copia um .env e o apaga na instrução seguinte deixa o segredo legível na camada anterior. No nosso caso, seria a senha do banco e o segredo de sessão do anfitrião."

[Mudar para o Slide 11 - A pilha de execução do Docker]
Fala:
"O que acontece quando digitamos docker run. O docker da linha de comando é só um cliente. Ele fala com o dockerd, o daemon, que roda como root. O dockerd delega o ciclo de vida dos containers ao containerd, por gRPC. Para cada container o containerd cria um shim, um processo pequeno que fica como pai do container. E quem cria o container de fato é o runc: ele cria os namespaces, configura os cgroups, aplica capabilities e seccomp, inicia o processo e sai. Como o pai do container é o shim, reiniciar o daemon não encerra os containers em execução. Cada peça tem uma responsabilidade e pode ser trocada por outra que respeite a mesma interface, e isso aparece de novo daqui a dois slides."

[Mudar para o Slide 12 - Como o privilégio do container é reduzido]
Fala:
"Pela definição, o processo do container tem privilégio reduzido. São três mecanismos, em ordem. Capabilities dividem os poderes do root em unidades independentes, e o Docker remove a maior parte delas por padrão. O perfil padrão de seccomp bloqueia parte das chamadas de sistema que o processo poderia fazer. E por cima o AppArmor ou o SELinux aplicam uma restrição adicional pelo módulo de segurança do kernel. A opção --privileged devolve tudo de uma vez e ainda desliga o seccomp, por isso ela não entra em nenhum arquivo nosso. O Andreas retoma esse ponto ao comparar container com máquina virtual."

[Mudar para o Slide 13 - Docker implementa as especificações da OCI]
Fala:
"Fechando a seção. A Open Container Initiative foi fundada em 2015 sob a Linux Foundation e mantém três especificações: a de runtime, a de imagem e a de distribuição. O Docker é uma implementação desse padrão. Isso quer dizer que o runc pode ser trocado por crun, gVisor ou Kata, e o engine inteiro pode ser trocado pelo Podman. O caso mais conhecido é de 2022, quando o Kubernetes removeu o adaptador embutido que falava com o Docker Engine, e nenhuma imagem parou de funcionar, porque o formato é o da OCI. É a substituibilidade por compatibilidade de interface que vimos na aula de arquiteturas baseadas em componentes, acontecendo dentro da própria pilha da ferramenta. Agora o Gabriel leva isso para o projeto."

---

## Parte 3, Gabriel (slides 14 a 20, 6 min)

[Mudar para o Slide 14 - Capa da Seção 02]
Fala:
"Agora que entendemos os conceitos por trás da conteinerização, vamos trazer isso para a nossa realidade. Vamos ver como esses conceitos se aplicam diretamente na arquitetura do nosso projeto, o Invite People, e como mapeamos o nosso desenho lógico para a infraestrutura."

[Mudar para o Slide 15 - Camada lógica e tier]
Fala:
"Começamos diferenciando as camadas lógicas da aplicação dos tiers, que são as camadas físicas de implantação. A nossa lógica de back-end (que engloba Apresentação e API, Domínio e Dados) vai sempre rodar unida. A decisão que o Docker nos obriga a tomar é de infraestrutura: em quantos processos separados vamos rodar isso?
Podemos colocar tudo num processo só (1 tier), separar o front-end (2 tiers) ou isolar também o banco de dados (3 tiers). O projeto lógico não muda, mas a conteinerização nos dá a flexibilidade de definir e testar essa separação de forma muito simples. Os rascunhos dos próximos slides seguem a opção de três tiers, e a escolha final fica registrada no documento de decisões arquiteturais."

[Mudar para o Slide 16 - Container e imagem no diagrama de implantação]
Fala:
"E como representamos essa decisão na nossa documentação? No diagrama de implantação da UML, é importante fazer a distinção correta.
O nosso host (a máquina física) hospeda o Container. O container, na UML, entra como um ambiente de execução (um nó aninhado). O que nós realmente implantamos ali dentro, o nosso artefato, é a Imagem. É uma diferença sutil para as máquinas virtuais, que seriam desenhadas como nós completamente separados com seus próprios sistemas operacionais."

[Mudar para o Slide 17 - Dos componentes para os nós]
Fala:
"Aqui fica claro como fazemos a ponte entre o design e a execução. O nosso diagrama de componentes à esquerda (Convite público, Painel, API e Dados) mapeia diretamente para os nós no diagrama de implantação à direita.
Na prática, cada um desses nós vira um serviço no nosso arquivo do Docker Compose. E o mais interessante é que eles rodam dentro de uma rede virtual nomeada. Ou seja, a API não precisa saber o IP do banco de dados, ela o encontra simplesmente pelo nome do serviço."

[Mudar para o Slide 18 - As interfaces no arquivo de compose]
Fala:
"Olhando para o código desse arquivo Compose, conseguimos enxergar as interfaces da arquitetura ganhando vida.
A 'interface provida' que desenhamos na UML é, na prática, a porta que o container expõe para o mundo externo, como a porta 3000. Já a nossa 'interface requerida' se traduz nas variáveis de ambiente (como a URL do banco de dados) e na regra depends_on, que faz o banco subir antes da API. As imagens do arquivo são exemplo. A stack definitiva é decisão do documento de decisões arquiteturais."

[Mudar para o Slide 19 - Coesão e acoplamento]
Fala:
"Pensando em atributos de qualidade, essa separação afeta diretamente a coesão e o acoplamento do sistema.
A coesão é reforçada, porque cada imagem tem uma única responsabilidade muito bem definida. O acoplamento lógico entre os serviços continua existindo, mas agora a comunicação passa pela rede, o que introduz latência, falha parcial e ordem de subida. Entre as nossas três camadas nada muda, porque elas ficam na mesma imagem do back-end. A grande vantagem aqui é estrutural: as regras arquiteturais não ficam só no papel. Se o design diz que o front-end não acessa o banco, a própria rede isolada do Docker garante e impõe essa regra."

[Mudar para o Slide 20 - Área pública e área com login]
Fala:
"Por fim, analisando o comportamento do sistema, percebemos que nossos serviços têm perfis de carga muito diferentes. Quando a anfitriã manda o link do convite no WhatsApp, temos um pico de acessos no 'Convite Público'. Já o 'Painel' tem o acesso de apenas uma pessoa.
Isso significa que só o serviço público precisa de réplicas para escalar. Mas para que o Docker consiga escalar esse serviço corretamente, ele precisa ser stateless. Isso nos gera uma restrição de projeto: não podemos salvar sessões em memória ou fazer upload de arquivos no disco local desse container, caso contrário, as réplicas ficariam dessincronizadas. O Andreas mostra agora esse ambiente rodando."

---

## Parte 4, Andreas (slides 21 a 28, 7 min)

[Mudar para o Slide 21 - Capa da Seção 03]
Fala:
"Última seção: vantagens, desvantagens e a demonstração. Repetindo o combinado do começo: ainda não existe código do produto, a implementação começa em outubro. O que vai subir agora é o ambiente e a topologia que o Gabriel acabou de mostrar, com as três peças, front-end, API e banco."

[Mudar para o Slide 22 - O que acontece com o dado]
(Rodar os comandos no terminal enquanto fala. O slide é a referência. Se a rede da sala falhar, usar o vídeo gravado e, em último caso, o próprio slide.)
Fala:
"A demonstração dura um minuto e meio e responde uma pergunta: o que acontece com o dado quando o container é removido. O docker compose up sobe os três serviços a partir de um arquivo só. O compose ps mostra front-end, API e banco no ar, e o banco com o healthcheck passando. Agora entro no banco pelo nome do serviço, db, sem IP nenhum, e crio uma tabela. Derrubo tudo com compose down e subo de novo. A tabela continua lá, porque o dado está num volume nomeado, fora do container. Por fim, compose down com a opção -v, que remove o volume também. Agora o dado sumiu. A conclusão é que persistência é uma decisão declarada no arquivo. Para o nosso projeto isso é concreto: a imagem de fundo que a anfitriã envia ao personalizar o convite e o CSV de restrições alimentares que ela exporta não podem ser perdidos quando o container é removido. A decisão de implantação vira uma restrição para as camadas de cima."

[Mudar para o Slide 23 - Casos de uso na infraestrutura moderna]
Fala:
"Onde o Docker é usado hoje, em quatro casos. Paridade entre ambientes: a mesma imagem roda na máquina de cada integrante, no teste e na apresentação do produto. Esse é o nosso caso, e é o único em destaque no slide. Integração e entrega contínuas: cada commit constrói uma imagem e roda os testes num ambiente limpo e descartável. Microsserviços: cada serviço no próprio container, escalado de forma independente por um orquestrador como o Kubernetes. E escala e densidade: réplicas sobem em segundos e dezenas de serviços isolados dividem o mesmo host. Os três últimos não estão no nosso plano. O Compose é de host único, o MVP cabe em um host, e orquestração é tema de outro grupo."

[Mudar para o Slide 24 - Container vs máquina virtual]
Fala:
"A comparação que mais aparece. Na máquina virtual, cada aplicação leva um sistema operacional convidado inteiro, e a fronteira entre elas é imposta pelo hardware, através do hipervisor. No container, todos dividem o kernel do host, e a fronteira é a interface de chamadas de sistema: mais de trezentas chamadas, mais /proc, /sys e ioctl. Isso dá o ganho de densidade e de velocidade de subida, e dá também a limitação. A CVE de 2019 do runc mostrou o risco: um processo de dentro do container conseguia sobrescrever o binário do próprio runtime no host, através do /proc/self/exe, e ganhar root na máquina. A conclusão que vai para o documento de decisões arquiteturais é que container é uma fronteira de isolamento mais fraca que a de uma máquina virtual. Para cargas de um mesmo time, como as nossas, serve. Para inquilinos que não confiam uns nos outros existem runtimes como gVisor e Kata, que o Tiago citou."

[Mudar para o Slide 25 - Alternativas consideradas]
Fala:
"O que consideramos antes de escolher. Instalação manual pelo README: custo zero para começar e quebra na primeira divergência de versão, e divergência de ambiente a gente já teve antes do primeiro código do produto. Uma máquina virtual compartilhada: isolamento imposto em hardware, mas pesada e difícil de versionar. Podman: o mesmo modelo, sem daemon rodando como root, com menos material disponível e menos gente do time conhecendo. E o Compose, que foi a escolha: ambiente igual para os quatro integrantes, ao custo de uma camada a mais de build e de orquestração para aprender."

[Mudar para o Slide 26 - Quando não compensa]
Fala:
"Para ser honesto com a escolha, os casos em que container não compensa. Um monolito num servidor só, que nunca vai escalar. Um time sem integração contínua, para quem é só um passo de build a mais. Uma aplicação sensível a latência de cauda, por causa do throttling de CPU que o Tiago mostrou. E um sistema dominado por estado. Dois desses quatro descrevem o nosso caso hoje: não temos integração contínua definida nem hospedagem decidida. Ainda assim adotamos, por um motivo que basta: ambiente igual para quatro pessoas com máquinas diferentes, com o banco rodando sem instalação local, antes da primeira linha de código."

[Mudar para o Slide 27 - Vantagens e limitações]
Fala:
"O balanço, com os atributos da disciplina. Do lado das vantagens: uma responsabilidade por imagem, com a fronteira declarada, isso é modularidade e reusabilidade. O ambiente descrito num arquivo legível, versionado com o código, isso é compreensibilidade. Trocar runtime ou banco editando uma linha, extensibilidade. A mesma imagem no notebook, no pipeline e na apresentação, manutenibilidade. E replicar só a API, se o caminho do convite público for mesmo sem estado, escalabilidade seletiva. Do lado das limitações: uma superfície de ataque nova, na imagem base e no privilégio de execução, que é segurança. I/O mais lento, principalmente nas máquinas Windows, que é desempenho, e a aula de arquiteturas em camadas já avisa que camada a mais custa desempenho. Container com estado continua exigindo backup e upgrade de versão maior do banco. E uma camada a mais de build e orquestração para os quatro aprenderem.
Para fechar, três frases. Container é um processo comum, isolado por mecanismos do kernel. Imagem é o artefato, container é o ambiente de execução. E a decisão de arquitetura é em quantos processos separados o sistema vai rodar. A promessa do slide 3, um arquivo que qualquer um dos quatro sobe com um comando, é o compose do slide 18 e a demonstração do slide 22."

[Mudar para o Slide 28 - Referências]
Fala:
"Essas são as referências: as especificações da OCI, o artigo original do Docker na Linux Journal, o relatório da IBM comparando máquinas virtuais e containers, o guia de segurança de containers do NIST, o Twelve-Factor App, Sommerville, Fowler e as aulas 03 e 05 da disciplina. Obrigado. Estamos abertos a perguntas."
