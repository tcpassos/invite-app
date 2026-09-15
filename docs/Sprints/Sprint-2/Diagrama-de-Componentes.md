# Diagrama de Componentes

Este documento descreve os componentes do invite-app, as interfaces que oferecem e consomem e as dependências entre eles.

A organização segue os sete passos sugeridos pelo professor e usados nas tasks do item #59 no Azure Boards.

| Passo | Task | Resultado | Seção |
|---|---|---|---|
| 1. Identificar os principais componentes | #64 | Lista inicial de componentes | 1 |
| 2. Definir as interfaces expostas | #65 | Lista de interfaces e métodos | 2 |
| 3. Identificar as dependências | #66 | Dependências entre componentes | 3 |
| 4. Associar os artefatos | #67 | Componentes associados a artefatos | 4 |
| 5. Desenhar o diagrama | #68 | Diagrama preliminar | 5 |
| 6. Refinar | #69 | Diagrama finalizado | 6 |
| 7. Revisão por pares | #70 | Feedback incorporado | 7 |

As definições de componente e de interface provida e requerida seguem [Ian04], referência da Aula 05. Um componente é uma unidade de composição com interfaces definidas e dependências explícitas. Seu comportamento depende tanto das interfaces que oferece quanto das que consome.

O diagrama parte do [ADR-0001](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0001-Estilo-arquitetural.md), do [ADR-0002](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0002-Empacotamento-em-tiers.md), do [ADR-0004](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0004-Stack-de-implementação.md), do [ADR-0007](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0007-Atualização-da-lista-de-presença.md), do [ADR-0008](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0008-Confiança-na-fronteira-pública.md), do [ADR-0009](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0009-Personalização-por-template.md) e das seções 3 a 9 do [Guia da Arquitetura](../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md). As decisões tomadas durante esta modelagem estão identificadas e reunidas na seção 10.1.

---

## 1. Passo 1, componentes identificados

### 1.1 Critérios para identificar um componente

[Ian04] aponta como dificuldade desse tipo de diagrama a escolha do nível de detalhe e da responsabilidade de cada componente. As classes do [Diagrama de Classes](Diagrama-de-Classes.md) não foram reaproveitadas como componentes. `Invite`, `Guest` e `DietaryNote`, por exemplo, são classificadores encapsulados por componentes.

Cada candidato foi avaliado com três perguntas:

1. Presta um serviço que pode ser nomeado com um substantivo? Se o nome precisa de uma conjunção, pode haver duas responsabilidades.
2. Encapsula mais de um classificador ou uma decisão que não cabe em uma função? Se encapsula apenas uma operação, deve ser uma função.
3. Tem pelo menos uma interface provida ou requerida com nome? Um componente sem interface definida não tem uma fronteira clara.

Também foram evitados nomes de tecnologia, como `Next.js` e `NestJS`, e nomes genéricos, como `Core`, `Common` ou `Shared`. As tecnologias aparecem no passo 4, e o nome do componente deve indicar sua responsabilidade.

### 1.2 Tier Front

| Componente | Responsabilidade | O que encapsula |
|---|---|---|
| `PublicInvitePage` | Servir a superfície pública do convite | Rota `/i/{publicToken}`, montagem do convite e o formulário do UC005 com a extensão do UC006 |
| `HostPanelPage` | Servir as telas do painel do anfitrião | Criação, personalização, lista de presença e consolidação, mais a consulta periódica do ADR-0007 |
| `TemplateSet` | Guardar os templates de convite | HTML, CSS e imagem de Open Graph de cada template do ADR-0009 |
| `ApiClient` | Falar com a API por um ponto só | Chamada HTTP tipada pelo contrato compartilhado do ADR-0004 e leitura do corpo de erro |

O sufixo `Page` foi escolhido porque esses componentes incluem exibição, resolução de rota, seleção da View e consulta periódica. Na tabela 7.3 do Guia da Arquitetura, as três últimas tarefas pertencem ao Controller do MVC. O termo `View` fica reservado para a parte executada no navegador. `ApiClient` traduz os eventos do usuário em chamadas HTTP.

`PublicInvitePage` é dividido entre o servidor do tier Front, responsável pela leitura, e o navegador, responsável pela escrita, conforme a seção 7.4 do guia. A divisão física aparece no passo 4, em dois artefatos.

### 1.3 Tier API, camada de Apresentação

| Componente | Responsabilidade | O que encapsula |
|---|---|---|
| `PublicRsvpController` | Expor a superfície pública do convite | As duas rotas `/public/invites/...` e o `parseRequest(dto)` delas |
| `InviteController` | Expor o recurso convite ao anfitrião | Publicação, despublicação e lista de presença, mais criação e personalização quando as rotas existirem |
| `DietaryController` | Expor a consolidação alimentar ao anfitrião | As duas rotas do UC008, com `renderCsv(rows)` e `neutralizeFormulaPrefix(field)` |
| `AuthController` | Expor a entrada e o cadastro do anfitrião | Fluxo básico e A1 do UC001 |
| `SessionGuard` | Autenticar a sessão do anfitrião | `authenticateSession(session)` e a validação do cookie assinado |
| `RateLimitGuard` | Controlar tráfego na fronteira pública | A janela de tempo da medida 2 do ADR-0008, contada conforme a seção 4.1 do guia |
| `HttpExceptionFilter` | Traduzir erro em protocolo, num ponto só | A tabela da seção 9.1 do guia e o formato único de erro da seção 9.3 |

`SessionGuard` e `RateLimitGuard` representam a infraestrutura de sessão e de limite de taxa citada na seção 8 do Guia da Arquitetura e no ADR-0008. Por isso aparecem neste diagrama, mas não no Diagrama de Classes. As decisões sobre o estado de cada um estão na seção 10.2.

### 1.4 Tier API, camada de Domínio

| Componente | Responsabilidade | O que encapsula |
|---|---|---|
| `RsvpService` | Registrar a resposta do convidado | `Guest`, `DietaryNote`, `RsvpStatus`, `checkCompanionLimit`, `validateDietaryNote`, `seatsRequested` e `generatePersonalToken` |
| `InviteService` | Conduzir o ciclo de vida do convite | `Invite`, `InviteCustomization`, `InviteStatus`, `validateForPublication`, `validateOwnership` e `generatePublicToken` |
| `AttendanceService` | Devolver a lista de presença | Projeção de `Guest` por status e o total de pessoas do UC007 |
| `DietaryService` | Consolidar e exportar observação alimentar | A ordem das três consultas do UC008 e as projeções de contagem e de exportação |
| `HostService` | Responder pela conta do anfitrião | `Host`, conferência de credencial e unicidade de email do UC001 |
| `TemplateCatalog` | Guardar as regras de template que o Domínio precisa | `Template`, `ColorSetting` e `TextFieldLimit`, que sustentam a RN2 do UC003 |

`TemplateCatalog` permite que o Domínio valide os limites de texto exigidos pelo UC003. Embora o ADR-0009 coloque os templates no tier Front, a tabela 9.1 do guia atribui essa validação ao Domínio. A origem dos dados do catálogo está descrita na seção 4.3.

### 1.5 Tier API, camada de Dados

| Componente | Responsabilidade | O que encapsula |
|---|---|---|
| `InviteRepository` | Persistir e consultar o agregado do convite | `Invite`, `InviteCustomization`, `Guest`, `DietaryNote`, as transações e as projeções do painel |
| `DietaryCategoryRepository` | Servir o dado de referência alimentar | `DietaryCategory` |
| `HostRepository` | Persistir e consultar a conta do anfitrião | `Host` |

A separação entre `InviteRepository` e `DietaryCategoryRepository` segue a seção 5.2 do Guia da Arquitetura: operações que não filtram por `inviteId` ficam fora do repositório da raiz de agregação.

### 1.6 Tier Banco

| Componente | Responsabilidade | O que encapsula |
|---|---|---|
| `invite_app` | Guardar o estado do sistema | Tabelas, índices, o `JSONB` das cores e a carga inicial de categorias |

O rótulo é o mesmo que o diagrama de camadas do Guia da Arquitetura já usa, e é o nome do banco, não o nome do serviço no compose. O roteiro do T1 chama o serviço de `db`, e qual nome fica é assunto do arquivo de compose e do diagrama de implantação. Está na seção 10.2.

O banco é tier, e a alocação dele em nó é assunto do item #60. Ele aparece aqui apenas como quem provê a interface que a camada de Dados requer, porque um componente com interface requerida pendurada no vazio esconde metade do desenho.

---

## 2. Passo 2, interfaces providas e requeridas

As assinaturas abaixo vêm das tabelas 4.1, 4.2 e 4.3 do Guia da Arquitetura e mantêm todos os parâmetros definidos nelas. Os nomes criados durante esta modelagem estão marcados como decisões novas.

Como convenção, o nome da interface usa o substantivo do serviço em inglês, sem prefixo de letra. Contratos HTTP terminam em `Http`, operações de negócio em `Operations` e persistência em `Store`. O Guia de Estilo define o idioma, mas não esse formato, então a convenção ainda precisa ser aprovada pelo time.

### 2.1 Interfaces providas pelo tier Front

| Interface | Provida por | Operações | Consumida por |
|---|---|---|---|
| `PublicInvitePageHttp` | `PublicInvitePage` | `GET /i/{publicToken}` | Navegador do convidado, fora da figura |
| `HostPanelPageHttp` | `HostPanelPage` | Rotas de tela do painel | Navegador do anfitrião, fora da figura |
| `InviteApi` | `ApiClient` | Uma operação por rota da tabela 4.1 do guia, tipada pelo contrato do ADR-0004 | `PublicInvitePage` e `HostPanelPage` |
| `TemplateAssets` | `TemplateSet` | `templateAssets(templateCode)`, que devolve o HTML, o CSS e a imagem de Open Graph do template | `PublicInvitePage` e `HostPanelPage` |

A operação de `TemplateAssets` é decisão nova. Ela existe para que a interface especifique um serviço em vez de apontar uma pasta, que é o que [Ian04] pede de uma interface provida.

### 2.2 Interfaces providas pela camada de Apresentação

| Interface | Provida por | Operações | Consumida por |
|---|---|---|---|
| `PublicInviteHttp` | `PublicRsvpController` | `GET /public/invites/{publicToken}`, `POST /public/invites/{publicToken}/rsvp` | `ApiClient` |
| `HostInviteHttp` | `InviteController` | `POST /invites/{inviteId}/publish`, `POST /invites/{inviteId}/unpublish`, `GET /invites/{inviteId}/attendance` | `ApiClient` |
| `HostDietaryHttp` | `DietaryController` | `GET /invites/{inviteId}/dietary-summary`, `GET /invites/{inviteId}/dietary-notes.csv` | `ApiClient` |
| `AuthHttp` | `AuthController` | Entrada e cadastro do UC001, sem rota fechada ainda | `ApiClient` |
| `SessionAuth` | `SessionGuard` | `authenticateSession(session)`, que devolve `hostId` | `InviteController` e `DietaryController` |
| `RateLimit` | `RateLimitGuard` | `enforceReadLimit(publicToken)` e `enforceWriteLimit(publicToken, clientIp)` | `PublicRsvpController` |
| `ErrorTranslation` | `HttpExceptionFilter` | `toErrorResponse(error)` | Os quatro controllers |

As duas operações de `RateLimit` foram separadas durante esta modelagem. A seção 3.1 do guia traz apenas `enforceRateLimit(publicToken, clientIp)`, mas a seção 4.1 determina que a leitura seja limitada somente pelo token do convite. Nesse fluxo, a API enxerga o IP do container do Front, e usá-lo no contador poderia bloquear a página para todos. A seção 3.1 do guia precisa receber a assinatura atualizada.

`toErrorResponse(error)` também é decisão nova de nome. A operação é a tradução da tabela 9.1 do guia no formato único da seção 9.3, inclusive para as exceções levantadas pelo próprio framework.

### 2.3 Interfaces providas pela camada de Domínio

| Interface | Provida por | Operações | Consumida por |
|---|---|---|---|
| `RsvpOperations` | `RsvpService` | `getPublishedInvite(publicToken)`, `registerRsvp(publicToken, rsvpCommand)` | `PublicRsvpController` |
| `InviteOperations` | `InviteService` | `publishInvite(inviteId, hostId)`, `unpublishInvite(inviteId, hostId)` | `InviteController` |
| `AttendanceOperations` | `AttendanceService` | `listAttendance(inviteId, hostId)` | `InviteController` |
| `DietaryOperations` | `DietaryService` | `consolidateDietaryNotes(inviteId, hostId)`, `exportDietaryNotes(inviteId, hostId)` | `DietaryController` |
| `HostOperations` | `HostService` | Cadastro e autenticação do anfitrião, sem assinatura fechada ainda | `AuthController` |
| `TemplateRules` | `TemplateCatalog` | `listTemplateCodes()`, `textFieldLimits(templateCode)` | `InviteService` |

As duas operações de `TemplateRules` são decisão nova desta página, porque nenhum artefato as nomeia. Elas existem para que a RN2 do UC003 seja verificável no Domínio.

### 2.4 Interfaces providas pela camada de Dados e pelo tier Banco

| Interface | Provida por | Operações | Consumida por |
|---|---|---|---|
| `InviteStore` | `InviteRepository` | `findById(inviteId)`, `findPublishedByPublicToken(publicToken)`, `publishIfPublishable(inviteId, publicToken)`, `unpublishIfPublished(inviteId)`, `saveRsvpWithinCapacity(invite, guest, dietaryNote, seatsRequested)`, `countGuestsByCategory(inviteId, statuses)`, `findDescriptionsByCategories(inviteId, statuses, categoryCodes)`, `findGuestsForExport(inviteId, statuses)`, `findAttendanceByStatus(inviteId, statuses)` | `InviteService`, `RsvpService`, `DietaryService` e `AttendanceService` |
| `DietaryCategoryStore` | `DietaryCategoryRepository` | `listDietaryCategories()` | `RsvpService` e `DietaryService` |
| `HostStore` | `HostRepository` | Busca do anfitrião por email e gravação da conta, sem assinatura fechada ainda | `HostService` |
| `PostgresWire` | `invite_app` | Protocolo do PostgreSQL na porta padrão, mais o esquema | `InviteRepository`, `DietaryCategoryRepository` e `HostRepository` |

`findAttendanceByStatus(inviteId, statuses)` foi incluída porque as tabelas 4.1 e 4.2 do guia previam a rota e o serviço da lista de presença, mas a tabela 4.3 não oferecia uma consulta correspondente. A operação devolve nome, status e número de acompanhantes para cada convidado, conforme a ED1 do UC007. O parâmetro `statuses` mantém o filtro fora do SQL do repositório. `AttendanceService` calcula o total da RN1 usando as mesmas linhas que serão exibidas. A tabela 4.3 do guia precisa ser atualizada com essa operação.

### 2.5 Elementos que não são interfaces

Três elementos foram mantidos fora da lista de interfaces:

> Tipos representam dados trocados pelas operações. Interfaces representam serviços.

1. **Catálogo de exceções do Domínio.** `ValidationError`, `InvalidInviteForPublication`, `NotInviteOwner`, `CapacityExceededError` e `InviteNotOpenError` são os tipos da seção 9.2 do guia. `HttpExceptionFilter` importa esses tipos para traduzi-los. Como eles não oferecem operações, não são interfaces providas.

2. **Formato de erro da seção 9.3.** Ele é o corpo da resposta enviado pelas quatro interfaces `Http`, não um serviço separado consumido pelo `ApiClient`.

3. **Contrato de tipos compartilhado do ADR-0004.** O contrato tipa `PublicInviteHttp`, `HostInviteHttp`, `HostDietaryHttp`, `AuthHttp` e `InviteApi`, mas não é uma interface separada. O artefato correspondente aparece no passo 4.

---

## 3. Passo 3, dependências entre componentes

Cada dependência é representada pelo encaixe de uma interface requerida em uma interface provida. Não há setas sem identificação entre componentes.

### 3.1 Dentro do tier Front

| Componente | Requer | De |
|---|---|---|
| `PublicInvitePage` | `InviteApi` | `ApiClient` |
| `PublicInvitePage` | `TemplateAssets` | `TemplateSet` |
| `HostPanelPage` | `InviteApi` | `ApiClient` |
| `HostPanelPage` | `TemplateAssets` | `TemplateSet` |
| `ApiClient` | `PublicInviteHttp`, `HostInviteHttp`, `HostDietaryHttp` e `AuthHttp` | Camada de Apresentação |

`HostPanelPage` requer `TemplateAssets` por causa dos passos 1 e 4 do UC003, em que o painel exibe a prévia do convite e a atualiza a cada mudança. É o mesmo ativo que o convite público usa, e é o primeiro caso de reuso do desenho.

`TemplateSet` não requer outra interface, pois contém apenas ativos estáticos, conforme o ADR-0009.

### 3.2 Dentro da Apresentação, e da Apresentação para o Domínio

| Componente | Requer | De |
|---|---|---|
| `PublicRsvpController` | `RateLimit` | `RateLimitGuard` |
| `PublicRsvpController` | `ErrorTranslation` | `HttpExceptionFilter` |
| `PublicRsvpController` | `RsvpOperations` | `RsvpService` |
| `InviteController` | `SessionAuth` | `SessionGuard` |
| `InviteController` | `ErrorTranslation` | `HttpExceptionFilter` |
| `InviteController` | `InviteOperations` | `InviteService` |
| `InviteController` | `AttendanceOperations` | `AttendanceService` |
| `DietaryController` | `SessionAuth` | `SessionGuard` |
| `DietaryController` | `ErrorTranslation` | `HttpExceptionFilter` |
| `DietaryController` | `DietaryOperations` | `DietaryService` |
| `AuthController` | `ErrorTranslation` | `HttpExceptionFilter` |
| `AuthController` | `HostOperations` | `HostService` |

Os quatro controllers usam `ErrorTranslation` porque o filtro gera o corpo das respostas de erro. No NestJS, o filtro é registrado globalmente na inicialização em vez de ser recebido pelo construtor, que é a exceção descrita na seção 4.2. Os quatro encaixes representam o ponto único de tradução exigido pela seção 9.2 do guia.

A ordem de chamada do `PublicRsvpController` está no diagrama de sequência do UC005 e é parte do contrato dele. O limite de taxa primeiro, `parseRequest` depois, e só então o Domínio.

O pacote público mantém apenas os dois serviços de Domínio previstos na seção 5.3 do guia. `PublicRsvpController` requer `RsvpOperations`, que oferece essas duas operações.

### 3.3 Do Domínio para os Dados, e dentro do Domínio

| Componente | Requer | De |
|---|---|---|
| `RsvpService` | `InviteStore` | `InviteRepository` |
| `RsvpService` | `DietaryCategoryStore` | `DietaryCategoryRepository` |
| `InviteService` | `InviteStore` | `InviteRepository` |
| `InviteService` | `TemplateRules` | `TemplateCatalog` |
| `AttendanceService` | `InviteStore` | `InviteRepository` |
| `DietaryService` | `InviteStore` | `InviteRepository` |
| `DietaryService` | `DietaryCategoryStore` | `DietaryCategoryRepository` |
| `HostService` | `HostStore` | `HostRepository` |

### 3.4 Dos Dados para o tier Banco

| Componente | Requer | De |
|---|---|---|
| `InviteRepository` | `PostgresWire` | `invite_app` |
| `DietaryCategoryRepository` | `PostgresWire` | `invite_app` |
| `HostRepository` | `PostgresWire` | `invite_app` |

### 3.5 Verificação da regra do ADR-0001

A regra verificada aqui é que Domínio e Dados não dependem da Apresentação.

São **31 dependências** no desenho, distribuídas assim: 8 dentro do tier Front, 7 dentro da Apresentação, 5 da Apresentação para o Domínio, 1 dentro do Domínio, 7 do Domínio para os Dados e 3 dos Dados para o tier Banco.

Nenhuma dependência aponta para uma camada superior. Os componentes de Domínio usam somente interfaces de Dados ou do próprio Domínio, e os componentes de Dados usam apenas `PostgresWire`. Os controllers não acessam repositórios, conforme a seção 6.2 do guia.

Sete das 31 não cruzam camada, são as de dentro da Apresentação, e as outras 24 descem.

`HttpExceptionFilter` importa os cinco tipos de erro do Domínio citados na seção 2.5 para convertê-los em status HTTP. Essa dependência continua apontando para baixo. Os tipos do Domínio não carregam códigos HTTP, conforme a seção 9.2 do guia.

---

## 4. Passo 4, artefatos por componente

Componentes são unidades de projeto e artefatos são unidades de entrega e podem conter vários componentes.

Conforme o ADR-0002, as três camadas lógicas do back-end fazem parte de um único artefato dentro do container da API.

### 4.1 Inventário de artefatos

A implementação começa na Sprint 3. A coluna Situação diferencia o que já existe do que ainda está previsto.

| Artefato | Tipo | Como nasce | Situação |
|---|---|---|---|
| `invite-app-front:<tag>` | Imagem | Build do `Dockerfile` do front | Prevista |
| `front-server.bundle` | Executável | Saída de servidor do build do Next.js | Prevista |
| `front-client.bundle` | Executável | Saída de cliente do build do Next.js, entregue ao navegador | Prevista |
| `templates/` | Ativo estático | Versionado no repositório, copiado no build | Prevista, ADR-0009 |
| `robots.txt` | Ativo estático | Versionado no repositório, copiado no build | Prevista, seção 9.5 do Guia da Arquitetura |
| `invite-app-api:<tag>` | Imagem | Build do `Dockerfile` da API | Prevista |
| `api.bundle` | Executável | Compilação do TypeScript da API, com as três camadas | Prevista |
| `contract/` | Módulo de fonte compartilhado | Versionado no repositório, compilado para dentro dos dois lados | Prevista, decisão nova desta página |
| `migrations/` | Script | Versionado no repositório, aplicado contra o banco | Diretório criado, os scripts SQL entram com a implementação |
| `postgres:17-alpine` | Imagem | Obtida do registry, não construída pelo time | Definida no Compose |
| `docker-compose.yml` | Especificação de implantação | Versionado no repositório | Concluída na Sprint 2 |
| `.env`, a partir de um `.env.example` versionado | Configuração | Preenchido por quem sobe o ambiente | Concluída na Sprint 2 |

### 4.2 Componente para artefato

| Componente | Artefato que o carrega |
|---|---|
| `PublicInvitePage` | `front-server.bundle` e `front-client.bundle` |
| `HostPanelPage` | `front-client.bundle` |
| `ApiClient` | `front-server.bundle` e `front-client.bundle` |
| `TemplateSet` | `templates/`, com os códigos de template e os limites de texto vindos de `contract/` |
| Nenhum, é ativo servido pelo tier Front | `robots.txt` |
| `PublicRsvpController`, `InviteController`, `DietaryController`, `AuthController` | `api.bundle` |
| `SessionGuard`, `RateLimitGuard`, `HttpExceptionFilter` | `api.bundle` |
| `RsvpService`, `InviteService`, `AttendanceService`, `DietaryService`, `HostService` | `api.bundle` |
| `TemplateCatalog` | `api.bundle`, com o conteúdo do catálogo vindo de `contract/` |
| `InviteRepository`, `DietaryCategoryRepository`, `HostRepository` | `api.bundle` |
| `invite_app` | `postgres:<tag>@<digest>`, com o esquema vindo de `migrations/` |

No código, cada componente da API corresponde a uma pasta de módulo do NestJS, conforme o ADR-0004. As interfaces requeridas aparecem como parâmetros do construtor, com exceção do filtro global citado na seção 3.2.

`PublicInvitePage` aparece em dois artefatos porque a renderização roda no servidor e o formulário roda no navegador, conforme a seção 7.4 do guia. O build do Next.js gera as duas saídas.

`TemplateSet` é o único componente com artefato próprio fora de um bundle. Adicionar um template altera `templates/` e a imagem do Front, sem mudar o artefato da API, conforme o ADR-0009.

### 4.3 Elementos que não são implantados separadamente

O contrato de tipos do ADR-0004 não é implantado como arquivo separado. Os tipos do TypeScript são removidos na compilação, mas continuam definindo as cinco interfaces citadas na seção 2.5. Valores de execução, como o enum `RsvpStatus`, são compilados dentro dos dois bundles e, portanto, aparecem em duas cópias.

O catálogo de templates tem dois consumidores. `TemplateSet`, em `templates/`, contém HTML, CSS e imagens. `TemplateCatalog` contém código, nome de exibição, cores padrão e limites de texto. O módulo `contract/` compartilha os dados necessários entre os dois builds sem fazer a API importar arquivos do Front. Ainda não há uma verificação automática de consistência entre `templates/` e `contract/`, e essa pendência está na seção 10.2.

Os arquivos `Dockerfile` geram as imagens, mas não são implantados. O diagrama de implantação mostra as imagens identificadas por tag e digest.

---

## 5. Passo 5, o diagrama

![Diagrama de Componentes](../../.attachments/diagrama-de-componentes.png)

### Como ler

O diagrama usa quatro elementos:

**Componente:** caixa com duas abas no canto, usada para representar uma unidade que presta serviço.

**Interface provida:** círculo ligado ao componente, com o nome do serviço oferecido.

**Interface requerida:** semicírculo encaixado em uma interface provida, indicando o serviço consumido.

**Pacote:** retângulo com aba no canto superior esquerdo. Os seis pacotes agrupam os três tiers do ADR-0002 e as três camadas do ADR-0001.

As portas não aparecem nesta figura. A fronteira do pacote e as interfaces mostram os pontos de contato necessários para a visão de componentes. Números e mapeamentos de porta fazem parte do diagrama de implantação, item #60. O bloco C do roteiro do T1 usa portas UML no contexto da topologia de execução, que é uma visão diferente.

Por regra do projeto, a explicação dos símbolos fica nesta seção e não dentro da figura. A mesma abordagem foi usada no diagrama de camadas do Guia da Arquitetura.

### Decisões mostradas na figura

Os três agrupamentos externos representam tiers e indicam a origem dos artefatos, não os processos em execução. `front-client.bundle`, por exemplo, sai do tier Front e roda no navegador. O POST do UC005 vai do navegador para a API. Os caminhos de rede estão no diagrama de camadas da seção 2 do guia e serão associados aos nós no item #60.

O navegador não aparece porque não é componente nem tier. As interfaces `PublicInvitePageHttp` e `HostPanelPageHttp` sem um consumidor ligado representam serviços publicados para o ambiente.

`SessionGuard` e `RateLimitGuard` não têm interfaces requeridas porque o armazenamento de estado ainda não havia sido definido. As alternativas que mantêm o desenho atual são validar o cookie na própria guarda e guardar o contador na memória do processo. Uma solução com tabela criaria uma dependência entre Apresentação e Dados, proibida pela seção 6.2 do guia. O diagrama deve ser revisto se essa decisão mudar.

Os quatro encaixes em `ErrorTranslation` representam o ponto único de tradução definido na seção 9.2 do guia.

As dependências entre camadas apontam para baixo: Front, Apresentação, Domínio, Dados e Banco. Nenhuma interface da Apresentação é consumida pelo Domínio ou pelos Dados.

---

## 6. Passo 6, ajustes feitos no diagrama

Depois das tasks #64 a #67, o desenho preliminar recebeu os nove ajustes abaixo:

1. **Remoção de `TokenGenerator`.** `generatePublicToken()` e `generatePersonalToken()` são funções internas de `InviteService` e `RsvpService`, como mostram os diagramas de sequência do UC004 e do UC005. Não justificam um componente separado pelos critérios da seção 1.1.

2. **Remoção de `CsvRenderer`.** `renderCsv(rows)` e `neutralizeFormulaPrefix(field)` tratam da serialização de saída e permanecem em `DietaryController`. Elas não criam uma nova fronteira de dependência.

3. **Criação de `AttendanceService` para `listAttendance`.** `InviteService` já cuida da criação, personalização, publicação e despublicação. A lista de presença muda por motivos ligados ao painel e ao intervalo de consulta do ADR-0007, então ficou em um serviço próprio. A tabela 4.2 do guia deve registrar esse componente como responsável.

4. **Troca do sufixo `View` por `Page` no Front.** Esses componentes incluem tarefas de Controller do MVC, além da exibição. `Page` representa melhor a superfície completa e evita confusão com as linhas de vida dos diagramas de sequência.

5. **Separação de `DietaryCategoryRepository` e `InviteRepository`.** A mudança aplica a regra da seção 5.2 do guia. Os arquivos `diagrama-sequencia-uc005.puml` e `diagrama-sequencia-uc008.puml` foram atualizados para mover `listDietaryCategories()` ao novo repositório.

6. **Uso de agrupamentos para os três tiers.** Front, API e Banco não são componentes. Portas, variáveis de ambiente, nós e links pertencem ao diagrama de implantação. A seção 5 explica a separação entre as duas visões.

7. **Remoção de `DomainErrors` e `ApiErrorFormat` da figura.** Nenhum dos dois possui operações. Eles passaram a ser descritos na seção 2.5, enquanto o filtro fornece `ErrorTranslation` como serviço.

8. **Remoção das portas da figura.** Números e mapeamentos de porta serão tratados no item #60. Mantê-los aqui também fazia componentes do mesmo tipo aparecerem com formas diferentes.

9. **Correção do erro usado no UC004.** O arquivo `diagrama-sequencia-uc004.puml` usava `InviteNotPublished`, que não faz parte do catálogo da seção 9.2 do guia. O nome foi trocado por `InviteNotOpenError`, conforme a tabela 9.1.

---

## 7. Passo 7, revisão por pares

A revisão usa a lista abaixo. Cada item deve ser respondido com sim ou não a partir da figura e das tabelas.

| # | O que verificar | Onde olhar |
|---|---|---|
| 1 | Toda dependência é bolinha encaixada em meio-círculo, sem seta solta | Figura, conferida contra a seção 3 |
| 2 | Toda interface tem nome escrito e tem operação listada, ou a ausência de assinatura está declarada | Figura e seção 2 |
| 3 | Nenhum meio-círculo que cruza camada aponta para cima | Figura e seção 3.5 |
| 4 | Nenhum controller requer interface de Dados | Seção 3.2 |
| 5 | `PublicRsvpController` requer um serviço de Domínio só, com as duas operações da seção 5.3 do guia | Seção 3.2 |
| 6 | Nenhuma caixa é classe do Diagrama de Classes | Seção 1.1 |
| 7 | Nenhuma caixa tem nome de tecnologia | Seção 1 |
| 8 | Toda assinatura confere com as tabelas 4.1, 4.2 e 4.3 do guia, ou está marcada como decisão nova | Seção 2 |
| 9 | Todo componente tem artefato associado | Seção 4.2 |
| 10 | Nada dentro da figura é frase, nota ou legenda | Figura |

Nos trechos mais densos, com quatro encaixes em `ErrorTranslation` e quatro em `InviteStore`, a conferência deve ser feita pelas tabelas das seções 2 e 3.

O time ainda precisa aprovar as decisões da seção 10.1, incluindo a criação de `AttendanceService` e a separação das duas operações de `RateLimit`.

Registro da revisão, a preencher na cerimônia:

| Data | Revisores | Resultado |
|---|---|---|
| a preencher | a preencher | a preencher |

---

## 8. Coesão e acoplamento dos componentes

Em [Ian04], coesão está ligada ao número de responsabilidades de um componente, enquanto acoplamento indica seu grau de dependência em relação aos demais. Esta seção usa as quantidades de responsabilidades e interfaces para avaliar os dois pontos, seguindo a abordagem da seção 5 do Guia da Arquitetura.

### 8.1 Os números

São **21 componentes**, **21 interfaces**, todas com dono único, e **31 dependências**, ou seja, 31 interfaces requeridas encaixadas.

| Faixa | Componentes | Quais |
|---|---|---|
| 0 interfaces requeridas | 6 | `TemplateSet`, `SessionGuard`, `RateLimitGuard`, `HttpExceptionFilter`, `TemplateCatalog`, `invite_app` |
| 1 interface requerida | 5 | `AttendanceService`, `HostService`, `InviteRepository`, `DietaryCategoryRepository`, `HostRepository` |
| 2 interfaces requeridas | 6 | `PublicInvitePage`, `HostPanelPage`, `AuthController`, `RsvpService`, `InviteService`, `DietaryService` |
| 3 interfaces requeridas | 2 | `PublicRsvpController`, `DietaryController` |
| 4 interfaces requeridas | 2 | `ApiClient`, `InviteController` |

As faixas totalizam 21 componentes e 31 interfaces requeridas, os mesmos números da seção 3.5. A média é de 1,5 interface requerida por componente.

`ApiClient` é um dos componentes mais acoplados porque concentra as quatro interfaces HTTP. Com isso, as duas páginas não precisam conhecer rotas nem formatos de erro. Removê-lo apenas distribuiria essas dependências entre as páginas.

### 8.2 Coesão, componente por componente

Cada componente tem uma responsabilidade identificada. Dois deles merecem acompanhamento:

`InviteController` requer quatro interfaces e atende as três rotas de `HostInviteHttp`. Sua responsabilidade é expor o recurso de convite ao anfitrião. Quando forem criadas as rotas do UC002 e do UC003, a coesão deverá ser reavaliada.

`InviteService` cuida de criação, personalização, publicação e despublicação. Essas operações pertencem ao ciclo de vida do convite. Se a personalização ganhar regras próprias, como validação de paleta ou versionamento de template, pode ser necessário separar o componente.

### 8.3 Reuso

Na notação usada, uma interface com mais de um consumidor indica reuso. O diagrama tem sete casos:

| Interface | Consumidores |
|---|---|
| `InviteStore` | 4, `InviteService`, `RsvpService`, `DietaryService` e `AttendanceService` |
| `ErrorTranslation` | 4, os quatro controllers |
| `PostgresWire` | 3, os três repositórios |
| `DietaryCategoryStore` | 2, `RsvpService` e `DietaryService` |
| `SessionAuth` | 2, `InviteController` e `DietaryController` |
| `TemplateAssets` | 2, `PublicInvitePage` e `HostPanelPage` |
| `InviteApi` | 2, `PublicInvitePage` e `HostPanelPage` |

A seção 1.6 do Guia da Arquitetura já registrava o uso de `listDietaryCategories()` e `findById` por mais de um serviço. A figura representa essas relações por meio dos encaixes de interface.

### 8.4 Substituibilidade

Há dois casos a considerar:

Os quatro componentes do tier Front, os quatro controllers, `SessionGuard`, `RateLimitGuard`, `HttpExceptionFilter` e os seis componentes do Domínio podem ser substituídos por implementações compatíveis com as mesmas interfaces.

`InviteRepository` também exige garantias de comportamento. `saveRsvpWithinCapacity` verifica o teto dentro de uma transação com bloqueio de linha, e `publishIfPublishable` inclui a condição no próprio `UPDATE`. Uma implementação substituta precisa manter essas garantias, além da assinatura. A mesma restrição se aplica à substituição de `invite_app`, conforme a seção 1.6 do Guia da Arquitetura.

---

## 9. Rastreabilidade com os outros diagramas

| Artefato | Relação |
|---|---|
| Diagrama de camadas, seção 2 do Guia da Arquitetura | Mesmas camadas, mesmos tiers e o mesmo rótulo de pacote. O que lá é uma caixa por camada, aqui são os componentes dentro dela |
| [Diagrama de Classes](Diagrama-de-Classes.md) | Nenhuma classe virou componente. As classes são os classificadores da coluna "o que encapsula" da seção 1. As três consultas do painel não são operações de `Invite`, e estão alocadas em `AttendanceService` e `DietaryService`, conforme a tabela 4.2 do Guia da Arquitetura |
| [Diagramas de Sequência](Diagramas-de-Sequência.md) | Os participantes de camada dos três `.puml`, que são `PublicRsvpController`, `InviteController`, `DietaryController`, `RsvpService`, `InviteService`, `DietaryService` e `InviteRepository`, são componentes desta figura com os mesmos nomes. `Navegador`, `Front` e `Banco` não são componentes, são lugares de execução, e estão tratados na seção 5 e no item #60 |
| Diagrama de implantação, item #60 | Recebe a seção 4 pronta. Os componentes já estão associados a artefatos, e falta alocar artefato em nó, definir link e número de porta |

---

## 10. Pendências

### 10.1 Decisões que precisam de aprovação do time

1. A convenção de nome de interface da seção 2.
2. `AttendanceService` como dono de `listAttendance`.
3. A operação `templateAssets(templateCode)` de `TemplateAssets`.
4. As duas operações de `RateLimit`, `enforceReadLimit` e `enforceWriteLimit`, que tornam visível a decisão da seção 4.1 do guia.
5. A operação `toErrorResponse(error)` de `ErrorTranslation`.
6. A operação `findAttendanceByStatus(inviteId, statuses)` de `InviteStore`.
7. As duas operações de `TemplateRules`.
8. Os artefatos `contract/` e `migrations/`.

### 10.2 Pendências abertas

1. **Rotas do UC002 e do UC003.** A tabela 4.1 tem sete rotas, mas nenhuma cria o convite ou salva sua personalização. `InviteController` e `InviteService` já assumem essas responsabilidades, e falta definir as rotas.
2. **Pacote do UC001.** `AuthController` não cabe no pacote público, restrito aos dois serviços citados na seção 5.3, nem no autenticado, pois a entrada ocorre antes da criação da sessão. Falta decidir se haverá um terceiro pacote.
3. **Réplicas da API.** O [ADR-0010](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0010-Autenticação-do-anfitrião.md) usa um contador em memória para `RateLimitGuard`. Com mais de uma instância, cada processo manteria seu próprio contador. A hipótese está registrada na seção 9 do [Diagrama de Implantação](Diagrama-de-Implantação.md).
4. **Assinaturas de `HostOperations` e `HostStore`.** Elas ainda não foram definidas porque o UC001 não tem diagrama de sequência.
5. **Consistência entre `templates/` e `contract/`.** Ainda não há verificação no build. Adicionar um template exige alterar os dois locais manualmente, e limites de texto diferentes podem causar erros no UC003.

---

## Fonte do diagrama

Gerado a partir de [`diagrama-de-componentes.puml`](../../.attachments/diagrama-de-componentes.puml), versionado junto com a imagem. Para regerar depois de editar o fonte, com Docker:

    docker run --rm -v "<caminho de docs/.attachments>:/data" plantuml/plantuml -tpng /data/diagrama-de-componentes.puml

## Referência

[Ian04] Ian Sommerville. Engenharia de Software. 6a edição. Addison Wesley, 2004. ISBN 85-88639-07-6.
