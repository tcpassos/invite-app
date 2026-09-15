# Diagrama de Implantação

Visão de execução. Mostra em que máquina e em que ambiente cada artefato do sistema roda, e por onde esses ambientes conversam.

A página está organizada pelos sete passos da decomposição sugerida pelo professor, que são também as tasks do item **#60** no Azure Boards.

| Passo | Task | Resultado | Seção |
|---|---|---|---|
| 1. Identificar os nós de implantação | #71 | Lista de nós | 1 |
| 2. Mapear componentes para os nós | #72 | Componentes alocados | 2 |
| 3. Definir os dispositivos e artefatos | #73 | Dispositivos e artefatos por nó | 3 |
| 4. Desenhar o diagrama | #74 | Diagrama preliminar | 4 |
| 5. Definir os links de comunicação | #75 | Links com protocolo e endereço | 5 |
| 6. Refinar | #76 | Diagrama finalizado | 6 |
| 7. Revisão por pares | #77 | Feedback incorporado | 7 |

O insumo veio pronto da seção 10 do [Guia da Arquitetura](../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md), que distribuiu os artefatos por container na 10.3, montou a tabela de quem conversa com quem na 10.4, e listou na 10.7 o que estava em aberto com o dono de cada item. **Onze linhas daquela lista apontavam para cá.** A seção 8 desta página diz quais delas fecharam e quais continuam abertas.

Uma advertência de tempo verbal vale para a página inteira, a mesma da seção 10 do guia. **Nada descrito aqui existe hoje no repositório.** A implementação começa na Sprint 3 e o `docker-compose.yml` é entrega ainda não concluída da Sprint 2. O que segue é o desenho que o compose vai materializar.

---

## 1. Passo 1, os nós de implantação

### 1.1 O que conta como nó

Em UML, nó é lugar onde alguma coisa executa, e ele vem em dois tipos. **Dispositivo** é hardware. **Ambiente de execução** é software que hospeda outro software. Um nó pode conter outro, e é assim que o desenho fica.

O [ADR-0003](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0003-Ambiente-de-execução.md) fecha a execução no host de desenvolvimento, via `docker compose up`, sem alvo de publicação. Disso sai a forma do diagrama inteiro: **um dispositivo só.** Não há máquina de aplicação separada de máquina de banco, não há balanceador e não há nuvem. Desenhar qualquer um dos três seria desenhar um ambiente que o projeto decidiu não ter.

| Nó | Tipo | O que é |
|---|---|---|
| Máquina do integrante | Dispositivo | O computador de quem sobe o ambiente |
| Navegador | Ambiente de execução | Onde o convidado abre o convite e o anfitrião abre o painel |
| Docker Engine | Ambiente de execução | O que roda os containers, dentro da mesma máquina |
| `front` | Container | O processo Node do tier Front |
| `api` | Container | O processo NestJS com as três camadas |
| `db` | Container | O PostgreSQL |

São seis nós, um deles dispositivo. O volume nomeado aparece no diagrama ao lado do `db` e não é nó, é onde o estado persiste.

### 1.2 O navegador é nó e continua não sendo tier

Esta é a única coisa que o diagrama de implantação afirma e que os outros diagramas não podiam afirmar, então ela precisa ficar resolvida.

O Vocabulário do Guia da Arquitetura registra que **o navegador não é tier**, porque não é unidade de implantação do sistema, não sobe no `docker compose` e não está no [ADR-0002](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0002-Empacotamento-em-tiers.md). Nada disso muda aqui.

Ao mesmo tempo, o `front-client.bundle` é artefato que o sistema produz e entrega, e ele executa no navegador. Um diagrama de implantação que omitisse o navegador esconderia onde metade do tier Front roda, e esconderia justamente a metade que faz o POST do UC005.

> **Tier é de onde o artefato vem. Nó é onde o artefato executa. O navegador é nó e não é tier, e as duas coisas são verdadeiras ao mesmo tempo porque respondem a perguntas diferentes.**

O mesmo raciocínio vale ao contrário para o `db`. Ele é tier pelo ADR-0002 e é nó aqui, e nesse caso os dois coincidem. A coincidência em dois dos três tiers é o que torna fácil confundir os conceitos, e o navegador é o caso que desfaz a confusão.

### 1.3 O nó que não existe, e por quê

**Não há nó de rede nem de balanceador.** O ADR-0003 fecha no host e a seção 10.6 do guia registra que não existe ambiente compartilhado acessível fora da apresentação. Acrescentar um nó de borda aqui prometeria infraestrutura que ninguém vai montar.

**Não há segundo dispositivo para o convidado.** No ambiente do projeto, quem abre o convite abre no mesmo computador que roda o compose. É por isso que os endereços do passo 5 são de laço local. Se o time algum dia publicar, o navegador passa a estar em outro dispositivo e essa é a primeira linha que muda no diagrama.

---

## 2. Passo 2, componentes para os nós

O mapeamento sai da seção 4.2 do [Diagrama de Componentes](Diagrama-de-Componentes.md), que já ligou cada componente a um artefato, e da seção 10.3 do guia, que ligou cada artefato a um container. Aqui as duas pontas se encontram.

| Componentes | Artefato que os carrega | Nó onde executa |
|---|---|---|
| `PublicInvitePage`, metade de leitura | `front-server.bundle` | `front` |
| `PublicInvitePage`, metade de escrita, e `HostPanelPage` | `front-client.bundle` | Navegador |
| `ApiClient` | `front-server.bundle` e `front-client.bundle` | `front` e Navegador |
| `TemplateSet` | `templates/` | `front` |
| Os quatro controllers, as duas guardas e o filtro | `api.bundle` | `api` |
| Os seis serviços de Domínio | `api.bundle` | `api` |
| Os três repositórios | `api.bundle` | `api` |
| `invite_app` | `postgres:<tag>@<digest>` | `db` |

**Dois componentes executam em dois nós, e isso não é erro de tabela.** `PublicInvitePage` e `ApiClient` aparecem duas vezes. É a assimetria que a seção 10.2 do guia descreve, chegando ao diagrama que mais deixa ela visível: o mesmo código sai de um build só e passa a rodar em dois lugares, um dentro do container e outro fora dele.

**Os 21 componentes couberam em quatro nós e três deles são container.** Nenhum componente ficou sem nó e nenhum nó ficou sem componente. O único nó sem componente é o Docker Engine, que hospeda os três containers e não executa código do sistema por conta própria.

---

## 3. Passo 3, os dispositivos e os artefatos

### 3.1 O dispositivo

**A máquina do integrante não tem especificação de hardware em artefato nenhum, e esta página não inventa uma.** Não há requisito de processador, de memória nem de disco escrito no projeto. O que existe é a consequência negativa que o ADR-0002 assumiu por escrito, de que três containers custam mais memória na máquina de cada integrante do que um processo único, e a seção 10.6 do guia registra que isso recai sobre as quatro máquinas do time, que são o único ambiente do projeto.

Escrever um número de memória aqui seria transformar palpite em requisito. Se a demonstração do T1 mostrar que alguma máquina do time não aguenta os três containers, aí existe medida e aí vale escrever.

### 3.2 Os artefatos por nó

| Nó | Artefato | Tipo | Como nasce |
|---|---|---|---|
| `front` | `invite-app-front:<tag>` | Imagem | Build do `Dockerfile` do front |
| `front` | `front-server.bundle` | Executável | Saída de servidor do build do Next.js |
| `front` | `front-client.bundle` | Executável | Saída de cliente do mesmo build, servida ao navegador |
| `front` | `templates/` | Ativo estático | Versionado, copiado no build, pelo [ADR-0009](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0009-Personalização-por-template.md) |
| `front` | `robots.txt` | Ativo estático | Versionado, copiado no build, pela seção 9.5 do guia |
| Navegador | `front-client.bundle` | Executável | O mesmo arquivo, entregue pela resposta HTTP |
| `api` | `invite-app-api:<tag>` | Imagem | Build do `Dockerfile` da API |
| `api` | `api.bundle` | Executável | Compilação do TypeScript, com as três camadas |
| `db` | `postgres:<tag>@<digest>` | Imagem | Obtida do registry, não construída pelo time |
| `db` | `migrations/` | Script | Versionado, montado no container |
| Docker Engine | `docker-compose.yml` | Especificação de implantação | Versionado |
| Docker Engine | `.env` | Configuração | Preenchido por quem sobe o ambiente |

O `robots.txt` entra no inventário aqui pela primeira vez. A seção 9.5 do guia decidiu que ele é servido pelo tier Front e é ativo estático versionado, e a seção 4.1 do Diagrama de Componentes ainda não o lista. É correção pendente naquela página.

### 3.3 O que não é artefato implantado

**O `contract/` não aparece no diagrama, e a ausência é decisão e não esquecimento.** Ele é módulo de fonte compartilhado, tipo de TypeScript é apagado na compilação, e não existe arquivo dele rodando em lugar nenhum. O único vestígio em execução é o trecho que carrega valor, como o enum `RsvpStatus`, que vai compilado para dentro dos dois bundles. A seção 10.3 do guia trata disso.

**Os `Dockerfile` também não.** Eles produzem as imagens, e a imagem é que é implantada. São dois, um do front e um da API, e o terceiro container usa imagem pronta.

---

## 4. Passo 4, o diagrama

![Diagrama de Implantação](/.attachments/diagrama-de-implantacao.png)

### Como ler

**Caixa tridimensional é nó.** O estereótipo diz de que tipo. `<<device>>` é hardware, `<<execution environment>>` é software que hospeda software, e `<<container>>` é o ambiente de execução que o Docker cria.

**Retângulo com o canto dobrado é artefato.** É o que de fato é implantado, ou seja, imagem, executável, script e arquivo de configuração.

**Linha cheia entre nós é caminho de comunicação.** O rótulo traz o protocolo e o endereço pelo qual o destino é alcançado. São cinco e estão detalhados no passo 5.

**Linha tracejada com `<<deploy>>` é o mesmo artefato indo executar em outro nó.** Ela aparece uma vez só, do `front-client.bundle` dentro do container `front` para o `front-client.bundle` dentro do Navegador.

**A figura não tem legenda e não tem nota**, como as outras quatro da Sprint 2. Toda explicação de símbolo fica nesta seção.

### O que a figura afirma

**Tudo está dentro de um dispositivo só.** É o ADR-0003 desenhado. Quem olhar a figura procurando ambiente de produção não acha, e não acha porque ele não existe.

**O `front-client.bundle` aparece duas vezes e o mesmo nome se repete de propósito.** É o artefato único que atravessa a fronteira do container em tempo de execução, e a seta `<<deploy>>` é a única do desenho que não é caminho de comunicação.

**O `db` não tem linha até o Navegador.** Não há caminho desenhado entre os dois, e não há por decisão da seção 6.3 do guia. O que a topologia de fato impede é o acesso de fora da rede, porque o `db` não publica porta, e a seção 10.5 do guia registra que ela não impede o `front` de conectar, porque os três estão na mesma rede nomeada.

**O volume fica ao lado do `db` e não dentro dele.** Ele sobrevive ao container, que é a razão de existir. Os outros dois containers não têm volume porque não guardam estado.

---

## 5. Passo 5, os links de comunicação

### 5.1 Os cinco caminhos

| # | De | Para | Protocolo | Endereço usado por quem chama | Publicado no host |
|---|---|---|---|---|---|
| 1 | Navegador | `front` | HTTP | `127.0.0.1:3000` | Sim, `3000:3000` |
| 2 | Navegador | `api` | HTTP | `127.0.0.1:3001` | Sim, `3001:3000` |
| 3 | `front` | `api` | HTTP | `api:3000` | Não se aplica, nasce dentro da rede |
| 4 | `api` | `db` | TCP | `db:5432` | Não |
| 5 | `db` | volume | Montagem | `/var/lib/postgresql/data` | Não se aplica |

**Os links 1 e 3 são os dois saltos do convite público** que o ADR-0002 registra e que a seção 1.7 do guia chama de crítico de desempenho. O link 2 é o salto único do POST do UC005 e das cinco rotas do painel.

### 5.2 A armadilha dos dois endereços para o mesmo destino

A seção 10.4 do guia descreve o problema e esta seção o resolve com número.

**O `api` é alcançado por dois endereços diferentes, e quem escolhe qual usar é quem chama.** O `front`, rodando dentro da rede do compose, chama `api:3000` e usa a resolução por nome de serviço. O navegador não é container, não está na rede e não resolve aquele nome, então chama `127.0.0.1:3001`, que é a porta publicada.

> **O endereço da API que vai compilado no `front-client.bundle` nunca é o nome de serviço do compose.** Se `api:3000` aparecer em código entregue ao navegador, o convite quebra na máquina do convidado sem quebrar build nem teste. É o terceiro item da quarta busca da seção 10.5 do guia.

A consequência prática é que o build do front precisa de duas configurações de endereço, uma para o código de servidor e outra para o código de cliente. **Como cada uma chega ao build é decisão que continua aberta**, e está na seção 9.

### 5.3 Por que a `api` publica porta e o `db` não

O material do T1 enuncia a regra na forma de que só o serviço de fronteira publica porta, com o banco na rede interna sem mapeamento. **No invite-app os serviços de fronteira são dois e não um**, porque o POST do UC005 chega do navegador direto à API, sem passar pelo `front`. Sem a porta publicada da `api`, o fluxo mais importante do sistema não funciona.

O `db` não publica porta porque ninguém fora da rede precisa alcançá-lo. Quem precisa inspecionar o banco durante o desenvolvimento entra pelo `docker compose exec`, que não passa pela rede publicada.

### 5.4 Ordem de subida

O ADR-0002 exige `HEALTHCHECK` com `condition: service_healthy`, senão a API sobe antes de o banco estar pronto. A ordem que sai disso é `db`, depois `api`, depois `front`.

O `front` depende da `api` de forma mais fraca, porque ele só chama a API quando chega uma requisição de convite público, e não no arranque. Ele pode subir antes sem quebrar nada, e se a API ainda não estiver de pé quando o primeiro convidado abrir o link, o que aparece é a página de convite indisponível da seção 9.4 do guia. O comportamento já está decidido lá e não precisa de decisão nova aqui.

---

## 6. Passo 6, refinamento, o que mudou e por quê

**1. O navegador entrou como nó, depois de ter ficado de fora no primeiro rascunho.** Deixá-lo de fora respeitava a frase do Vocabulário sobre ele não ser tier, e escondia onde o `front-client.bundle` executa. A saída foi separar os dois conceitos por escrito, na seção 1.2, em vez de escolher um dos dois.

**2. O `migrate` não virou um quarto serviço.** A primeira versão tinha um container de execução única que aplicava as `migrations/` e saía. Ele resolveria o problema e criaria outro, porque o compose passaria a ter quatro serviços e a frase "três containers" do ADR-0002 deixaria de descrever o arquivo. A decisão e o custo dela estão na seção 7.3.

**3. As portas saíram de exemplo de slide e viraram decisão.** A porta 3000 aparece no material do T1 como exemplo, e o próprio slide que a mostra diz que aquilo é exemplo. A seção 10.7 do guia recusou-se a fixar número e apontou para cá. Aqui os números ficam fixados, marcados como decisão nova que precisa de aval.

**4. O nome do serviço do banco ficou `db` e não `invite_app`.** `invite_app` é o nome do banco e aparece dentro do container na figura. O nome do serviço é o que a resolução por nome usa, e `db` é o que o material do T1 emprega. A seção 1.6 do Diagrama de Componentes já tinha separado as duas coisas.

**5. O `robots.txt` entrou no inventário.** Ele foi decidido na seção 9.5 do guia e nunca chegou à seção 4.1 do Diagrama de Componentes. Como é ativo servido pelo tier Front, ele é artefato do container `front` e aparece aqui.

**6. Especificação de hardware ficou de fora.** A primeira versão trazia memória e processador mínimos. Nenhum artefato do projeto os define, e a seção 3.1 explica por que eles continuam de fora.

---

## 7. Passo 7, revisão por pares

| # | O que verificar | Onde olhar |
|---|---|---|
| 1 | Todo componente do Diagrama de Componentes tem nó | Seção 2 |
| 2 | Todo artefato da seção 4.1 do Diagrama de Componentes ou está no diagrama ou tem ausência justificada | Seções 3.2 e 3.3 |
| 3 | Nenhum nó de infraestrutura que o ADR-0003 não sustenta | Seção 1.3 |
| 4 | Nenhum caminho de comunicação entre o Navegador e o `db` | Figura |
| 5 | O `db` não publica porta | Seção 5.1 |
| 6 | O endereço da API no código de cliente não é nome de serviço do compose | Seção 5.2 |
| 7 | Nada dentro da figura é frase, nota ou legenda | Figura |
| 8 | Nenhum número inventado que algum artefato já tenha decidido de outro jeito | Seção 8 |

**O que precisa de decisão do time e não só de leitura:** as sete decisões novas da seção 8.

Registro da revisão, a preencher na cerimônia:

| Data | Revisores | Resultado |
|---|---|---|
| a preencher | a preencher | a preencher |

---

## 8. As decisões que este diagrama fechou

Todas são decisões novas, no mesmo sentido da seção 11 do Guia da Arquitetura. Valem como regra até o time avaliar, e não têm o peso de um ADR.

| # | Decisão | Fecha qual linha da seção 10.7 do guia |
|---|---|---|
| 1 | O `front` publica `3000:3000` e a `api` publica `3001:3000`. O `db` não publica porta | Número de porta e mapeamento para o host |
| 2 | Os serviços do compose se chamam `front`, `api` e `db` | Nome de cada serviço |
| 3 | O volume nomeado do tier Banco se chama `invite_app_pgdata`, montado em `/var/lib/postgresql/data` | Nome do volume |
| 4 | Ordem de subida `db`, `api`, `front`, com `HEALTHCHECK` no `db` e `condition: service_healthy` na `api` | A declaração de `HEALTHCHECK` e a ordem de subida |
| 5 | As `migrations/` são montadas no diretório de inicialização do container `db` e aplicadas por ele | Quem aplica as `migrations/` e em que momento |
| 6 | O `robots.txt` é artefato do container `front` | Nenhuma, é correção no Diagrama de Componentes |
| 7 | O dispositivo não recebe especificação de hardware enquanto não houver medida | Nenhuma, é limite desta página |

### 8.1 O custo da decisão 5, dito em voz alta

A imagem do PostgreSQL executa os scripts do diretório de inicialização **apenas quando o volume está vazio**. Isso significa que uma mudança de esquema depois da primeira subida não é aplicada sozinha, e a única forma de aplicá-la é derrubar o volume com `docker compose down -v` e subir de novo, perdendo os dados.

Para este projeto isso é aceitável e o motivo está escrito no ADR-0003: o ambiente é de desenvolvimento, na máquina de cada integrante, e não guarda dado que alguém precise conservar. A alternativa, uma ferramenta de migração de verdade, custaria um quarto serviço no compose ou faria a `api` carregar o esquema, e as duas contrariam decisões já tomadas.

> **No dia em que o projeto tiver dado que não pode ser perdido, esta decisão cai.** Ela vale enquanto o ADR-0003 valer, e é a primeira coisa a rever se o time decidir publicar.

---

## 9. O que continua em aberto

Quatro linhas da seção 10.7 do guia não fecham aqui.

1. **Valores de tag e de digest das três imagens.** Só existem quando houver build e quando a imagem do PostgreSQL for escolhida. Os marcadores da figura são literais e sem valor de propósito.
2. **Quais variáveis de ambiente cada container recebe.** Sabe-se que são pelo menos a senha do banco, o segredo de sessão do UC001 e os dois endereços da API da seção 5.2. A lista fechada é do `.env.example` e da página Configuração de Ambiente, que hoje é um marcador de uma linha.
3. **Onde `SessionGuard` e `RateLimitGuard` guardam estado.** Continua pedindo ADR próprio. Nenhuma das alternativas em discussão acrescenta nó, então este diagrama não muda por causa dela, o que é o mesmo que a seção 10.7 já registrava.
4. **Se a API ganha réplicas.** Se ganhar, este diagrama muda de verdade, porque passa a ter mais de uma instância do mesmo container e a decisão do contador em memória do `RateLimitGuard` deixa de valer junto.

Fica também a pendência do item 6 da seção 8: a seção 4.1 do Diagrama de Componentes precisa da linha do `robots.txt`.

---

## 10. Rastreabilidade

| Artefato | Relação |
|---|---|
| Seção 10 do [Guia da Arquitetura](../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md) | Entrada direta. A 10.3 deu os artefatos por container, a 10.4 deu os caminhos e a 10.7 deu a lista do que decidir aqui |
| [Diagrama de Componentes](Diagrama-de-Componentes.md) | A seção 4.2 daquela página ligou componente a artefato, e esta liga artefato a nó. Nenhum componente novo foi criado |
| [ADR-0002](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0002-Empacotamento-em-tiers.md) | Os três containers e a exigência de `HEALTHCHECK` e de volume |
| [ADR-0003](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0003-Ambiente-de-execução.md) | O dispositivo único e a ausência de ambiente publicado |
| `docker-compose.yml` | Entrega pendente da Sprint 2. O ADR-0002 registra que ele é a forma executável deste diagrama, e as sete decisões da seção 8 são o que ele precisa conter |

## Fonte do diagrama

Gerado a partir de [`diagrama-de-implantacao.puml`](/.attachments/diagrama-de-implantacao.puml), versionado junto com a imagem. Para regerar depois de editar o fonte, com Docker:

    docker run --rm -v "<caminho de docs/.attachments>:/data" plantuml/plantuml -tpng /data/diagrama-de-implantacao.puml
