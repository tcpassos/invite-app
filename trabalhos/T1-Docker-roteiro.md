# T1, roteiro do seminário sobre Docker e conteinerização

> Documento de trabalho do time. Fica no GitHub e **não** vai para a wiki, porque tem decisão
> tática de apresentação. Work item [#78](https://dev.azure.com/GUITOEBE/invite-people/_workitems/edit/78).
> Apresentação em 08/09/2026, slides no Moodle até 23h55 do mesmo dia.

## A tese

O container é a realização executável da definição de componente que a própria disciplina adota,
e o arquivo de compose é a forma executável do diagrama de implantação que temos que entregar no
item #60 desta sprint.

Por isso conteinerização não entra como assunto de infraestrutura. Entra como decisão de
arquitetura sobre empacotamento e implantação, com custo declarado, que vai registrada no ADR #63.

## Distinção que atravessa a apresentação inteira

As três camadas do back-end (Apresentação e API, Domínio, Dados) são **camadas lógicas** e ficam
na mesma imagem. O que o container separa são **tiers**: front, API e banco.

A decisão arquitetural não é "usar Docker". É escolher em quantos tiers as camadas lógicas serão
empacotadas e onde cada um roda.

Na modelagem UML, o container é um **ambiente de execução** aninhado no nó do host, e a imagem é
o **artefato** implantado nele. Ambiente de execução é especialização de nó, então nunca dizer
"container não é nó".

## Tempo e donos

| Bloco | Tema | Min | Slides | Dono |
|---|---|---|---|---|
| A | Contexto, o que a disciplina define e por que Docker entrou na Sprint 2 | 4 | 5 | Guilherme |
| B | Definições, arquitetura do Docker e o que o kernel faz | 6 | 7 | Tiago |
| C | Aplicação no Invite People, do diagrama para o arquivo | 6 | 7 | Gabriel |
| D | Vantagens, desvantagens, demonstração e considerações finais | 7 | 8 | Andreas, com Tiago nas partes de segurança |

Mais um minuto para as três trocas de apresentador. Total 24, dentro da faixa de 20 a 25.

Nomes da agenda no formato que o professor usa nas aulas dele: Introdução, Definições,
Arquitetura, Aplicação no projeto, Vantagens e Desvantagens, Considerações Finais, Referências.

---

## Bloco A, contexto (4 min, Guilherme)

**Objetivo:** enunciar a tese no vocabulário do professor antes de qualquer jargão, provar com
documento datado que o tema nasceu de necessidade do projeto, e fechar o contrato de escopo no
minuto dois para que a ausência de código não pareça desculpa no final.

1. **Abertura fria.** Projetar só a frase da Aula 05, sem logo e sem a palavra Docker: unidade de
   composição com interfaces especificadas e dependências de contexto explícitas, que pode ser
   implantada de forma independente. Perguntar à turma que conceito da disciplina aquilo define.
   Esperar quinze segundos. A resposta é componente, e quem ensinou foi o professor.
2. **A revelação.** A mesma frase com três setas apontando para um serviço de um compose.
   Interface especificada é a porta publicada mais o contrato HTTP. Dependência de contexto
   explícita é o Dockerfile mais as variáveis de ambiente. Implantável de forma independente é
   subir aquele serviço sozinho.
   Fala: esta apresentação não é sobre ferramenta de infraestrutura, é sobre a coisa mais próxima
   do ideal de componente que a indústria entregou, e sobre o que ela muda no diagrama de
   implantação que temos que entregar até o dia 14.
   **Contra-argumento a ter na ponta da língua:** o container não garante contrato de interface
   como uma linguagem garante, ele expõe uma porta e um protocolo. A analogia é forte no
   empacotamento e fraca na verificação. Dizer isso se perguntarem, não antes.
3. **A prova datada.** Recorte do #78 com a data de criação visível e a frase de que o tema foi
   escolhido para alimentar o #60, ao lado do recorte do #60. Fala: não escolhemos tecnologia da
   moda para depois procurar onde encaixar, está registrado no board antes desta apresentação.
   Mostrar só os dois recortes, nunca o quadro inteiro.
4. **O projeto em quarenta segundos.** Invite People, convites virtuais com RSVP e consolidação de
   restrições alimentares. Duas superfícies sobre o mesmo Model, o convite público sem login e o
   painel do anfitrião. Arquitetura registrada no Guia da Arquitetura. Ler em voz alta a Questão
   Norteadora da Sprint 2: como os componentes serão distribuídos e implantados no ambiente de
   execução. Fecho do slide: hoje temos três camadas lógicas decididas e zero separação física
   decidida.
5. **Contrato e agenda.** Dizer de frente, no minuto dois: a implementação começa na Sprint 4, em
   06/10, então não existe aplicação para conteinerizar e a demonstração é do ambiente, não do
   produto. Em seguida a agenda com o dono de cada bloco. Avisar que cada um responde pelo próprio
   bloco na arguição.

**Perguntas prováveis:** por que Docker e não outra da lista, vocês já entregaram o diagrama de
implantação, qual a diferença entre camada lógica e separação física, o que exatamente vão
demonstrar já que o produto não existe.

---

## Bloco B, definições e arquitetura do Docker (6 min, Tiago)

**Objetivo:** entregar o critério mais caro da rubrica definindo container por mecanismo e não por
metáfora, e fechar posicionando Docker como implementação de padrão aberto, que é a ponte para a
substituibilidade da Aula 05.

1. **Linha do tempo, que responde antes da pergunta.** chroot em 1979, cgroups e namespaces
   entrando no kernel a partir de 2007, LXC em 2008, Docker em 2013, OCI em 2015, containerd na
   CNCF em 2017, Kubernetes removendo o Docker Engine em 2022. Fala que fecha: o mecanismo é
   antigo, o que é recente é a padronização e a estabilização da cadeia. Isso responde de
   antemão "por que isso conta como tecnologia emergente em 2026".
2. **Definições com fonte.** Container é um ou mais processos executados com visão isolada por
   namespaces, consumo limitado por cgroups e privilégio reduzido por capabilities e seccomp,
   sobre um sistema de arquivos raiz próprio. Ao lado, a definição de imagem da Image Spec da OCI.
   Duas definições, duas fontes, quinze segundos.
3. **Não existe container no kernel.** O que existe é processo comum com a visão restringida.
   Terminal **pré-capturado**, nunca ao vivo, com o processo aparecendo no `ps` do host e o `lsns`
   listando os namespaces. Dizer em voz alta onde foi capturado e por quê: no Docker Desktop em
   Windows o daemon e os containers rodam numa distro própria do WSL, com namespace de PID
   separado, então `ps` na distro de trabalho não mostraria container nenhum.
4. **Namespaces e cgroups.** Namespaces nomeados pela consequência: mnt dá árvore de montagem
   própria, pid faz o processo virar PID 1 lá dentro, net dá pilha de rede própria e é por isso que
   dois containers escutam na mesma porta. Citar clone, unshare e setns pelo nome.
   cgroup não isola, contabiliza e limita. Estourar `memory.max` não deixa lento, o kernel mata e
   o Docker reporta código 137. Limite de CPU é throttling, degrada latência de cauda e não a
   média, o que é mais difícil de diagnosticar.
5. **A imagem por dentro. Diagrama obrigatório.** Camadas somente leitura endereçadas por digest
   mais a camada de escrita. overlay2 com lowerdir, upperdir, workdir e merged. Copy-up: alterar um
   byte de arquivo grande copia o arquivo inteiro para a camada de escrita, e é por isso que banco
   na camada de escrita tem desempenho ruim e precisa de volume. O Bloco D volta nessa frase.
   Whiteout: apagar arquivo de camada inferior cria marcação, não apaga. Consequência concreta e
   **ligada ao nosso projeto**: um Dockerfile que copia um `.env` e faz `RUN rm` na instrução
   seguinte produz imagem em que o segredo continua legível. No nosso caso o segredo seria a senha
   do banco e o segredo de sessão do UC001. Build time e run time são coisas diferentes, o que
   entra na imagem é público e o que entra por variável de ambiente é de execução. Essa distinção
   é exatamente o que falta escrever na nossa página Configuração de Ambiente.
6. **A pilha de execução. Diagrama obrigatório.** CLI, dockerd, containerd por gRPC, um shim por
   container, runc. O runc cria namespaces, configura cgroups, aplica capabilities e seccomp, faz
   pivot_root, dá execve e sai, não fica residente. O shim é pai do container e não filho do
   daemon, e foi esse desenho que fez reiniciar o daemon deixar de matar os containers.
   Três paredes: capabilities com o root fatiado em cerca de quarenta bits, seccomp-bpf bloqueando
   cerca de 44 chamadas de sistema, e o LSM por cima. `--privileged` devolve tudo e desliga seccomp.
7. **OCI, o fecho arquitetural.** Três specs sob a Linux Foundation desde 2015. Enquadrar no
   vocabulário da Aula 03, em que padronização é propriedade de camada e TCP e IP são citados como
   padrões. Docker é implementação de um padrão, não o padrão. runc é trocável por crun, gVisor ou
   Kata. O engine é trocável por Podman. Passagem para o próximo bloco: isso é a substituibilidade
   por compatibilidade de interface da Aula 05 acontecendo na própria pilha da ferramenta.

**Munição de arguição, fora dos slides:** semântica de PID 1, que ignora sinal sem tratador e por
isso não encerra de forma graciosa, com a causa no CMD em forma shell e a correção pela forma exec
ou por tini. E o `/proc` que não é isolado, que faz `free` e `nproc` mostrarem o host e levou JVM,
Go e Nginx a dimensionarem contra a máquina inteira.

**Perguntas prováveis:** diferença entre namespace e cgroup, então container é VM pequena, o que
acontece se estourar a memória, por que a imagem é em camadas, se apago um arquivo no Dockerfile
ele some, por que existe containerd e runc, o que é OCI e por que importa para arquitetura, esse
terminal está rodando agora.

---

## Bloco C, aplicação no Invite People (6 min, Gabriel)

**Objetivo:** provar a tese central usando só o vocabulário das aulas e apontando o número de cada
task do board.

1. **Vocabulário, antes de qualquer mapeamento.** Componente é abstração de serviço, coesa e de
   baixo acoplamento, como na Aula 05. Artefato é o do passo 4 do roteiro do #59, arquivos de
   código, bibliotecas e executáveis, e a imagem é isso mais o runtime e as bibliotecas de sistema.
   Container é esse artefato em execução. Nó é o host.
   Aviso de armadilha: Docker usa *layer* para empilhamento de sistema de arquivos, sem nenhuma
   relação com a camada lógica da Aula 03. E cuidado com *artefato*, que na disciplina aparece em
   dois sentidos, executável no diagrama de componentes e entregável no Scrum.
   **Enquadramento que evita uma pergunta:** Docker não é padrão arquitetural nem estilo, é
   mecanismo de empacotamento e execução.
2. **Layer contra tier.** Layer é camada lógica, tier é separação física. Mostrar as nossas três
   camadas em três granularidades: tudo em um tier, front separado da API, e os três separados.
   Nenhuma delas muda uma linha do projeto lógico, todas mudam o empacotamento. Docker obriga a
   escolher a granularidade em vez de deixá-la implícita, e essa escolha é entrada do ADR.
3. **A modelagem UML correta.** Em UML, ambiente de execução é especialização de nó. O modelo fiel
   é o nó do host contendo um ambiente de execução, que é o container, contendo o artefato, que é a
   imagem. Máquina virtual, essa sim, é nó novo com sistema operacional próprio.
4. **Os dois diagramas lado a lado.** Rascunho do diagrama de componentes (#59) à esquerda e do de
   implantação (#60) à direita, com uma seta de cada componente para o ambiente de execução
   correspondente. Sobre eles, os sete passos do #60 mapeados: #71 identificar nós vira o host com
   o engine, #72 mapear componentes vira a definição de serviço, #73 dispositivos e artefatos vira
   a imagem por tag e digest, #75 links de comunicação vira a rede nomeada com resolução por nome
   de serviço. Fala: o compose é a forma executável do diagrama que temos que desenhar nesta sprint.
   Carimbar **rascunho** e o número do item no canto.
5. **Notação de componente sobre o arquivo.** Pirulito e soquete desenhados por cima do trecho de
   compose. Interface provida é a porta publicada mais o contrato HTTP. Interface requerida é a
   variável de conexão mais a dependência declarada. A porta da UML é literalmente a porta do
   container.
6. **Coesão, acoplamento e o que o container garante de verdade.** A fronteira do container aumenta
   a coesão do serviço porque força uma responsabilidade por imagem. O acoplamento não desaparece,
   muda de forma e passa a ter latência, falha parcial e ordem de subida, que é a razão de existir
   HEALTHCHECK com `condition: service_healthy`.
   **Cuidado, aqui é fácil exagerar.** O container **não** torna estrutural a regra entre as nossas
   três camadas, porque elas ficam na mesma imagem do back-end. O que ele torna estrutural são duas
   outras coisas: o código do front não está dentro da imagem da API, então a API não consegue
   depender dele nem por acidente, e só o serviço de fronteira publica porta, com o banco na rede
   interna sem mapeamento. Amarrar com degradação arquitetural, tema da Aula 02: regra escrita na
   wiki depende de disciplina de revisão, regra virando topologia é sustentada pela estrutura.
7. **A pergunta que o seminário devolve ao projeto.** Nosso MVC tem duas views sobre o mesmo Model,
   o convite público do UC005 e o painel do UC007, com perfis de exposição e de carga
   completamente diferentes. A jornada da Marina descreve o link caindo no grupo da família, ou
   seja, pico no convite público enquanto o painel tem uma pessoa. Replicar só o serviço público
   faz sentido, replicar o painel não. E a restrição volta para o projeto: para isso valer, o
   convite público não pode guardar sessão em memória nem gravar upload em disco local.
   Pergunta em aberto na tela: mesma imagem de front ou imagens separadas. Entrada direta para o
   #59 e o #60, ainda não decidida.
   Fecho de honestidade: os seis itens de arquitetura da Sprint 2 estão em To Do, então isto é
   insumo desses itens e não relato de item concluído.

**Perguntas prováveis:** o container é nó ou artefato, diferença entre componente e imagem, vão
separar as três camadas em três containers, onde fica a interface requerida, como garantir que a
regra de dependência não seja violada, o convite público e o painel vão na mesma imagem, vocês
estão indo para microsserviços.

**Resposta pronta para microsserviços:** não. A arquitetura decidida é três camadas, e
conteinerizar um sistema de três camadas não o transforma em microsserviços. Microsserviço implica
autonomia de dados e de ciclo de vida por serviço, o que não é o caso e não está no escopo do MVP.

---

## Bloco D, vantagens, desvantagens e considerações finais (7 min, Andreas com Tiago na segurança)

**Objetivo:** entregar a demonstração sem fingir que existe produto, tratar vantagens e limitações
com o mesmo peso no padrão das aulas da disciplina, e converter o seminário em recomendação
registrada para o ADR.

1. **Escopo repetido em uma frase** antes de abrir o terminal. Não existe código do produto, o que
   vai subir é o ambiente e a topologia. Dizer de novo mesmo tendo sido dito no Bloco A.
2. **Demonstração, 90 segundos, cronometrada.** Imagens baixadas na véspera, **zero instrução
   `build`** no compose para não depender de rede nem de código. PostgreSQL oficial mais nginx
   oficial servindo um HTML de uma linha, rede nomeada e volume nomeado. Sequência: subir, mostrar
   `compose ps`, provar resolução por nome de serviço com um container efêmero
   (`docker compose run --rm client psql -h db`), criar tabela e inserir linha, derrubar e subir de
   novo com o dado ainda lá, e por fim derrubar removendo o volume para o dado sumir.
   Narrar: persistência é decisão declarada e não sorte.
   Amarrar em regra que já está escrita: a imagem de fundo do UC003 e o CSV do UC008 não podem
   morrer junto com o container, ou seja, a decisão de implantação volta como restrição de projeto.
3. **Estudo de caso externo.** O Kubernetes removeu o Docker Engine como runtime na versão 1.24, em
   2022, e nenhuma imagem parou de funcionar, porque imagem é OCI e não Docker. É substituição por
   compatibilidade de interface acontecendo em escala real. Se houver tempo, citar Felter et al.
   2015, o relatório técnico da IBM que compara desempenho de máquinas virtuais e containers.
4. **Vantagens, em slide próprio**, no vocabulário do professor e não em vocabulário de DevOps.
   Usar o quarteto que ele credita às camadas, modularidade, reusabilidade, compreensibilidade e
   extensibilidade, e o que ele credita a componentes, reuso e desenvolvimento e teste em paralelo.
   Mais dois bullets curtos: ambiente de teste reprodutível com banco real em container, que
   viabiliza teste de integração antes da Sprint 4, e a imagem como unidade que atravessa notebook,
   pipeline e a demonstração funcional que o T3 vai exigir.
5. **Limitações, em slide próprio.** O daemon roda como root e estar no grupo docker equivale a
   root no host, sem sudo e sem trilha de auditoria, com rootless e Podman como respostas. O Docker
   escreve a regra de DNAT antes das regras do administrador, então um deny de firewall na porta
   publicada não bloqueia. I/O de bind mount atravessando a fronteira da VM no WSL2. Estado, que
   traz backup e upgrade de versão maior. Licenciamento do Docker Desktop.
   **Sem número inventado.** Ou medimos e o slide traz o modelo da máquina e a data, ou dizemos que
   a documentação do Docker Desktop recomenda manter os arquivos dentro do WSL2 por causa do custo
   de I/O na fronteira, sem quantificar.
6. **Container contra VM pela superfície de ataque (Tiago apresenta).** A VM tem kernel próprio e
   fronteira imposta em hardware. O container compartilha o kernel e a fronteira é a interface de
   chamadas de sistema, mais de trezentas, mais /proc, /sys e ioctl. Uma CVE só, a do runc de 2019,
   em que o processo de dentro sobrescrevia o binário do runtime pelo `/proc/self/exe`. Conclusão:
   container é fronteira de isolamento, não fronteira de segurança da mesma classe que uma VM.
   **Quem apresentar precisa saber explicar o mecanismo sem consultar nada. Se não souber, o slide
   sai.**
7. **Alternativas e quando não compensa.** Quatro linhas: README com instalação nativa, custo zero
   e quebra na primeira divergência de versão. VM compartilhada, isola de verdade mas é pesada e
   difícil de versionar. Podman, mesmo modelo sem daemon root, menos material e menos gente do time
   conhece. Compose, escolhido, com o custo já declarado.
   Quando não compensa: monolito num servidor que nunca escala, time sem integração contínua,
   aplicação sensível a latência de cauda, sistema dominado por estado.
   **Conceder antes que perguntem:** pelos nossos próprios critérios estamos na zona cinzenta. Não
   temos integração contínua nem hospedagem decidida, então dois dos três retornos clássicos não
   valem para nós hoje. O que sustenta a adoção é um só, e é suficiente: ambiente igual para quatro
   pessoas com stacks diferentes, com banco rodando sem instalação local, antes de começar a
   escrever código.
   Fronteira com orquestração em uma linha: compose é de host único, o MVP cabe em um host,
   Kubernetes entraria com múltiplos nós, e isso é tema de outro grupo.
   Frase que fecha: conteinerização move complexidade, não apaga complexidade.
8. **Considerações Finais.** Duas colunas, ganho e custo, com os quatro atributos das Questões
   Norteadoras nomeados dos dois lados. Manutenibilidade ganha, o ambiente passa a ser versionado
   junto com o código. Escalabilidade ganha de forma seletiva. Segurança ganha isolamento e herda
   superfície nova. Desempenho custa, principalmente I/O no Windows, e a Aula 03 já avisa que
   camada extra prejudica desempenho.
   Recomendação em três frases, que é o que vai para o ADR #63. Adotamos conteinerização como
   estratégia de empacotamento e de ambiente, registrada como troca e não como benefício puro. O
   #60 deixa de ser caixa genérica e passa a ter arquivo correspondente executável. E a mais forte:
   conteinerizar barateia errar, porque a stack ainda não está decidida e com Dockerfile a escolha
   de runtime e de banco vira uma linha de arquivo em vez de instalação em quatro notebooks.
   Emendar: esta recomendação é insumo direto da Sprint 3, que começa no dia 15 e tem como objetivo
   declarado definir as tecnologias e os mecanismos da implementação.

**Perguntas prováveis:** isso não é exagero para um MVP, o que acontece com o banco quando o
container morre, colocariam o banco em container em produção, diferença entre volume nomeado e bind
mount, quanto custa em desempenho no Windows, Docker é seguro, por que não Kubernetes, Docker
Desktop é pago, esse arquivo já está no repositório, se a stack mudar quanto se perde.

---

## Fechamento

Voltar ao slide de evidência do Bloco A, com a linha do `.gitattributes` de um lado e o compose do
outro. Fala: abrimos com uma evidência de que os ambientes deste time já divergem antes de existir
código, e fechamos com um arquivo que descreve o ambiente inteiro e que qualquer um dos quatro sobe
com um comando.

Dito em voz alta, o que **não** estamos afirmando, com número de item: #58 a #63 em To Do, #56 e
#57 ainda em Doing na Sprint 1, o #63 é onde a stack será decidida, e a Sprint 2 fecha no dia 14.
Enumerar as próprias lacunas com número de work item transforma pendência em processo registrado, e
é a defesa mais forte que existe na arguição.

Três pontos para a turma levar para a P1, que cobre os temas dos seminários: container é processo
isolado por mecanismo de kernel e não VM pequena, imagem é artefato e container é ambiente de
execução na modelagem UML, e a decisão arquitetural é a granularidade de tier.

Referências no formato de tag que ele usa: as três specs da OCI, Sommerville, Fowler, Felter et al.
2015, Merkel 2014 no Linux Journal, NIST SP 800-190, Twelve-Factor App, e as Aulas 03 e 05.

Última fala antes da arguição, anunciando quem responde pelo quê.

## Protocolo de arguição

A avaliação é individual e vale 15%, então:

1. Quem recebe a pergunta responde a primeira frase e depois passa nominalmente para o dono do
   bloco. Ninguém fica em silêncio olhando para o lado.
2. Ninguém responde duas perguntas seguidas enquanto houver integrante que ainda não respondeu
   nenhuma.
3. Segurança e mecanismos de kernel são com o Tiago, em qualquer bloco, e isso é anunciado na
   agenda.
4. Guilherme fica com um segundo território técnico simples e defensável, para não passar a
   arguição inteira calado.

## Ordem de corte, combinada antes do ensaio

Caem primeiro os bullets de cache de build e a ressalva do Alpine. Depois o detalhe da pilha de
execução. **Nunca caem** namespaces, cgroups, OCI, os dois diagramas do Bloco B, e nenhuma parte da
demonstração, que são 10% inteiros e insubstituíveis.

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
- [ ] Escrever o ADR #63 com status de proposta, mesmo que em uma página, senão "o time adota" não
      tem lastro
- [ ] Ensaiar cronometrado bloco a bloco, com as três trocas, mais uma rodada de perguntas cruzadas
- [ ] Exportar o deck em PDF, subir no Moodle na véspera, levar em pendrive e deixar cópia aberta
      na máquina de um segundo integrante

## Regras de honestidade que não se negociam

- Nenhuma saída de terminal entra no slide sem ter sido capturada de verdade, e todo slide de
  terminal leva no rodapé a máquina e a data da captura.
- Nenhum número de tamanho de imagem, tempo de build ou tempo de partida sem medição própria.
- Nenhuma contagem de arquivos ou de commits em slide, porque envelhece sozinha até o dia 08.
- A ressalva de que a stack está em aberto aparece no primeiro slide em que houver código, não só
  no final.
- Toda fala sobre arquitetura em tempo de proposta, não de relato. A Sprint 1 não está concluída,
  #56 e #57 seguem em Doing.
