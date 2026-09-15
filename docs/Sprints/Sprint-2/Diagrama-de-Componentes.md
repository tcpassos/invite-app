# Diagrama de Componentes

Visão estática da estrutura modular do invite-app. Mostra as unidades que prestam serviço, as interfaces que cada uma provê e requer, e as dependências entre elas.

A página está organizada pelos sete passos da decomposição sugerida pelo professor, que são também as tasks do item **#59** no Azure Boards. Cada passo tem uma seção e cada seção entrega o resultado que o passo pede.

| Passo | Task | Resultado | Seção |
|---|---|---|---|
| 1. Identificar os principais componentes | #64 | Lista inicial de componentes | 1 |
| 2. Definir as interfaces expostas | #65 | Lista de interfaces e métodos | 2 |
| 3. Identificar as dependências | #66 | Dependências entre componentes | 3 |
| 4. Associar os artefatos | #67 | Componentes associados a artefatos | 4 |
| 5. Desenhar o diagrama | #68 | Diagrama preliminar | 5 |
| 6. Refinar | #69 | Diagrama finalizado | 6 |
| 7. Revisão por pares | #70 | Feedback incorporado | 7 |

As definições de componente, de interface provida e de interface requerida usadas aqui são as de [Ian04], que é a referência única da Aula 05. Componente é unidade de composição com interfaces especificadas e dependências de contexto explícitas, que pode ser implantada de forma independente ou combinada com outras. O comportamento de um componente é definido pelo par de interfaces, a provida e a requerida, e não apenas pela provida.

Nada aqui reabre decisão. O que existe é consequência do [ADR-0001](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0001-Estilo-arquitetural.md), do [ADR-0002](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0002-Empacotamento-em-tiers.md), do [ADR-0004](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0004-Stack-de-implementação.md), do [ADR-0007](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0007-Atualização-da-lista-de-presença.md), do [ADR-0008](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0008-Confiança-na-fronteira-pública.md) e do [ADR-0009](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0009-Personalização-por-template.md), lidos junto com as seções 3 a 9 do [Guia da Arquitetura](../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md). O que é decisão nova desta página está marcado como tal e listado na seção 10.1.

---

## 1. Passo 1, componentes identificados

### 1.1 O teste que uma caixa precisa passar

Antes da lista, o critério. A dificuldade declarada em [Ian04] para este estilo é identificar o nível de detalhe e a responsabilidade de cada componente, e o erro previsível aqui seria reaproveitar as caixas do [Diagrama de Classes](Diagrama-de-Classes.md). Componente é mais abstrato que classe. `Invite`, `Guest` e `DietaryNote` são classificadores encapsulados por componentes, e não componentes.

Três perguntas foram aplicadas a cada candidato, e as três precisam de resposta positiva:

1. **Ela presta um serviço que dá para nomear com um substantivo só?** Se o nome precisa de conjunção, são duas responsabilidades.
2. **Ela encapsula mais de um classificador, ou uma decisão que não cabe em uma função?** Se encapsula uma função, é função.
3. **Ela tem pelo menos uma interface provida ou requerida com nome?** Bolinha sem nome não comunica, e componente sem nenhuma das duas não tem fronteira.

Duas restrições de nome vieram junto. Nome de componente não é nome de tecnologia, porque `Next.js` e `NestJS` são stack e entram no passo 4. E nome genérico como `Core`, `Common` ou `Shared` contradiz a definição de coesão dentro do próprio rótulo, já que coesão é número de responsabilidades.

### 1.2 Tier Front

| Componente | Responsabilidade | O que encapsula |
|---|---|---|
| `PublicInvitePage` | Servir a superfície pública do convite | Rota `/i/{publicToken}`, montagem do convite e o formulário do UC005 com a extensão do UC006 |
| `HostPanelPage` | Servir as telas do painel do anfitrião | Criação, personalização, lista de presença e consolidação, mais a consulta periódica do ADR-0007 |
| `TemplateSet` | Guardar os templates de convite | HTML, CSS e imagem de Open Graph de cada template do ADR-0009 |
| `ApiClient` | Falar com a API por um ponto só | Chamada HTTP tipada pelo contrato compartilhado do ADR-0004 e leitura do corpo de erro |

**O sufixo é `Page` e não `View`, e o motivo é a tabela 7.3 do Guia da Arquitetura.** Ali a View é apenas a peça que exibe, e a resolução de rota, a escolha da View e a consulta periódica são o **Controller do MVC**. Os dois primeiros componentes carregam as duas peças da sua superfície, então chamá-los de View diria menos do que eles fazem e contrariaria o Vocabulário do guia, que reserva a palavra para a peça que roda no navegador. A parte do Controller que traduz evento do usuário em chamada HTTP está em `ApiClient`.

`PublicInvitePage` roda partido entre dois lugares, conforme a seção 7.4 do guia. A metade de leitura roda no servidor do tier Front e a metade de escrita roda no navegador. É um componente só porque é uma responsabilidade só, e a divisão física aparece no passo 4, em dois artefatos.

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

`SessionGuard` e `RateLimitGuard` estão aqui por determinação escrita. A seção 8 do Guia da Arquitetura registra que a sessão do anfitrião e o contador de limite de taxa do ADR-0008 são infraestrutura, ficaram fora do Diagrama de Classes de propósito e **seriam nomeados no diagrama de componentes**. Esta página cumpre o que foi pedido, que é nomear. Onde cada um guarda estado é decisão de ADR e está na seção 10.2.

### 1.4 Tier API, camada de Domínio

| Componente | Responsabilidade | O que encapsula |
|---|---|---|
| `RsvpService` | Registrar a resposta do convidado | `Guest`, `DietaryNote`, `RsvpStatus`, `checkCompanionLimit`, `validateDietaryNote`, `seatsRequested` e `generatePersonalToken` |
| `InviteService` | Conduzir o ciclo de vida do convite | `Invite`, `InviteCustomization`, `InviteStatus`, `validateForPublication`, `validateOwnership` e `generatePublicToken` |
| `AttendanceService` | Devolver a lista de presença | Projeção de `Guest` por status e o total de pessoas do UC007 |
| `DietaryService` | Consolidar e exportar observação alimentar | A ordem das três consultas do UC008 e as projeções de contagem e de exportação |
| `HostService` | Responder pela conta do anfitrião | `Host`, conferência de credencial e unicidade de email do UC001 |
| `TemplateCatalog` | Guardar as regras de template que o Domínio precisa | `Template`, `ColorSetting` e `TextFieldLimit`, que sustentam a RN2 do UC003 |

`TemplateCatalog` existe porque a página do Diagrama de Classes já apontou o problema. O ADR-0009 coloca os templates no tier Front, o fluxo alternativo do passo 3 do UC003 exige recusar texto acima do limite, e a tabela 9.1 do guia aloca essa validação no Domínio. Sem um componente de Domínio que conheça os limites, ou a validação sobe para a Apresentação, ou o tier API passa a importar do tier Front. As duas saídas são proibidas. De onde vem o dado que ele carrega está no passo 4, na seção 4.3.

### 1.5 Tier API, camada de Dados

| Componente | Responsabilidade | O que encapsula |
|---|---|---|
| `InviteRepository` | Persistir e consultar o agregado do convite | `Invite`, `InviteCustomization`, `Guest`, `DietaryNote`, as transações e as projeções do painel |
| `DietaryCategoryRepository` | Servir o dado de referência alimentar | `DietaryCategory` |
| `HostRepository` | Persistir e consultar a conta do anfitrião | `Host` |

A separação entre os dois primeiros não é escolha desta página. É a regra da seção 5.2 do Guia da Arquitetura, que diz que operação que não filtra por `inviteId` não pertence ao repositório da raiz de agregação.

### 1.6 Tier Banco

| Componente | Responsabilidade | O que encapsula |
|---|---|---|
| `invite_app` | Guardar o estado do sistema | Tabelas, índices, o `JSONB` das cores e a carga inicial de categorias |

O rótulo é o mesmo que o diagrama de camadas do Guia da Arquitetura já usa, e é o nome do banco, não o nome do serviço no compose. O roteiro do T1 chama o serviço de `db`, e qual nome fica é assunto do arquivo de compose e do diagrama de implantação. Está na seção 10.2.

O banco é tier, e a alocação dele em nó é assunto do item #60. Ele aparece aqui apenas como quem provê a interface que a camada de Dados requer, porque um componente com interface requerida pendurada no vazio esconde metade do desenho.

---

## 2. Passo 2, interfaces providas e requeridas

O passo pede lista de interfaces **e dos métodos expostos**. As assinaturas abaixo foram copiadas das tabelas 4.1, 4.2 e 4.3 do Guia da Arquitetura sem simplificar, porque o próprio guia registra que parâmetro omitido em tabela vira parâmetro ausente em código. O que não vem de lá está marcado como decisão nova.

Convenção adotada, e ela é decisão nova desta página. **Nome de interface é o substantivo do serviço, em inglês, sem prefixo de letra.** Interface de contrato HTTP termina em `Http`, interface de operação de negócio termina em `Operations`, interface de persistência termina em `Store`. O Guia de Estilo fixa o idioma e não fixa a forma, então esta convenção precisa de aval do time.

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

**As duas operações de `RateLimit` são decisão nova, e elas existem para não apagar uma decisão do guia.** A seção 3.1 traz a assinatura única `enforceRateLimit(publicToken, clientIp)`, mas a seção 4.1 decidiu depois que **no caminho de leitura o limite conta por token de convite apenas**, porque ali o endereço de origem que a API enxerga é o do container do tier Front e contar por ele derrubaria a página do convite para todos ao mesmo tempo. Uma assinatura só esconderia essa decisão. Duas a deixam visível, e a seção 3.1 do guia precisa receber a correção.

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

**`findAttendanceByStatus(inviteId, statuses)` é decisão nova, e ela fecha um buraco.** A rota da lista de presença está na tabela 4.1 do guia e o serviço está na 4.2, mas a tabela 4.3 não tem consulta que os sustente, ou seja, `AttendanceService` requeria um contrato que não entregava o que ele precisa. A operação devolve uma linha por convidado com nome, status e número de acompanhantes, que é a ED1 do UC007, e recebe `statuses` de fora pelo mesmo motivo escrito na 4.3, que é não deixar o filtro virar SQL escrito dentro do repositório. O total de pessoas da RN1 é somado por `AttendanceService` sobre as linhas que já vieram para a tela, o que não contraria a regra do guia contra agregar em memória, porque aquela regra evita carregar linhas só para contá-las, e aqui elas são a própria resposta. A tabela 4.3 do guia precisa receber a mesma linha.

### 2.5 O que não é interface nesta página

Vale escrever a regra, porque ela explica três ausências que um revisor procura.

> **Tipo que atravessa a fronteira não é interface.** Interface especifica serviço, e serviço tem operação. Tipo é dado que viaja pelas operações que já existem.

São três os casos.

**O catálogo de exceções do Domínio.** `ValidationError`, `InvalidInviteForPublication`, `NotInviteOwner`, `CapacityExceededError` e `InviteNotOpenError` são os cinco tipos da seção 9.2 do guia. `HttpExceptionFilter` os importa para traduzi-los, o que é dependência para baixo, de tipo e não de serviço. Desenhá-los como interface provida criaria uma bolinha sem operação e sem componente que a realize, que é notação inválida.

**O formato único de erro da seção 9.3.** Ele é o corpo da resposta e viaja pelas quatro interfaces `Http` que os controllers publicam. Não é um quinto serviço que o `ApiClient` consuma à parte.

**O contrato de tipos compartilhado do ADR-0004.** A consequência positiva registrada lá é que o contrato aparece no diagrama de componentes como interface real, e é o que acontece. Ele não é uma interface própria, ele é **o que tipa as interfaces `PublicInviteHttp`, `HostInviteHttp`, `HostDietaryHttp`, `AuthHttp` e `InviteApi`**. O que o ADR promete é que a fronteira entre os tiers é tipo e não convenção documentada, e cinco interfaces tipadas cumprem isso. O passo 4 trata do artefato.

---

## 3. Passo 3, dependências entre componentes

Toda dependência do desenho é uma interface requerida encaixada numa interface provida. Não existe seta solta entre duas caixas, porque em [Ian04] o comportamento do componente é definido pelas duas interfaces, e duas caixas ligadas por uma seta sem nome não dizem o que uma pede à outra.

### 3.1 Dentro do tier Front

| Componente | Requer | De |
|---|---|---|
| `PublicInvitePage` | `InviteApi` | `ApiClient` |
| `PublicInvitePage` | `TemplateAssets` | `TemplateSet` |
| `HostPanelPage` | `InviteApi` | `ApiClient` |
| `HostPanelPage` | `TemplateAssets` | `TemplateSet` |
| `ApiClient` | `PublicInviteHttp`, `HostInviteHttp`, `HostDietaryHttp` e `AuthHttp` | Camada de Apresentação |

`HostPanelPage` requer `TemplateAssets` por causa dos passos 1 e 4 do UC003, em que o painel exibe a prévia do convite e a atualiza a cada mudança. É o mesmo ativo que o convite público usa, e é o primeiro caso de reuso do desenho.

`TemplateSet` não requer nada. Ele é ativo estático e é isso que o ADR-0009 quis dizer ao tirar o upload do sistema.

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

**Os quatro controllers requerem `ErrorTranslation` porque o corpo de erro que sai pelas rotas deles é escrito pelo filtro.** No NestJS o encaixe é registro global no arranque da aplicação e não parâmetro de construtor, que é a única exceção à regra escrita na seção 4.2. O desenho com quatro soquetes numa bolinha só é a forma de dizer que existe um ponto único de tradução, que é o que a seção 9.2 do guia exige, e é coerente com a seção 5.3, que registra o filtro como a única coisa compartilhada entre o pacote público e o pacote autenticado.

A ordem de chamada do `PublicRsvpController` está no diagrama de sequência do UC005 e é parte do contrato dele. O limite de taxa primeiro, `parseRequest` depois, e só então o Domínio.

**O pacote público continua com dois serviços de Domínio e nada mais.** `PublicRsvpController` requer `RsvpOperations` e ponto, e aquela interface tem exatamente as duas operações que a seção 5.3 do guia autoriza. A regra vira, no desenho, contagem de soquetes.

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

A regra é uma só. Domínio e Dados nunca dependem da Apresentação.

São **31 dependências** no desenho, distribuídas assim: 8 dentro do tier Front, 7 dentro da Apresentação, 5 da Apresentação para o Domínio, 1 dentro do Domínio, 7 do Domínio para os Dados e 3 dos Dados para o tier Banco.

**Nenhuma sobe.** Todo componente de Domínio tem soquete apenas para interface de Dados ou de Domínio, e todo componente de Dados tem soquete apenas para `PostgresWire`. Nenhum controller conhece repositório, o que é a leitura estrita da seção 6.2 do guia virando contagem de linha de tabela.

Sete das 31 não cruzam camada, são as de dentro da Apresentação, e as outras 24 descem.

O ponto que mais parece exceção não está desenhado, e por isso fica dito aqui. **`HttpExceptionFilter` conhece os cinco tipos de erro do Domínio**, conforme a seção 2.5. Essa dependência desce, porque ele importa os tipos para traduzi-los em status. O que subiria seria um tipo de erro do Domínio carregando número de status dentro, e a seção 9.2 do guia proíbe isso.

---

## 4. Passo 4, artefatos por componente

Artefato é o que de fato é implantado. Componente é unidade de projeto, artefato é unidade de entrega, e um artefato costuma carregar vários componentes.

A distinção do ADR-0002 vale inteira aqui. **As três camadas lógicas do back-end são um artefato só.** Desenhar três artefatos dentro do container da API repetiria o erro que o ADR-0002 foi escrito para evitar.

### 4.1 Inventário de artefatos

A implementação começa na Sprint 3, então **nenhum destes artefatos existe hoje no repositório**. A coluna de situação diz de onde cada um virá, para a página não apresentar plano como fato.

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
| `migrations/` | Script | Versionado no repositório, aplicado contra o banco | Prevista, decisão nova desta página |
| `postgres:<tag>@<digest>` | Imagem | Obtida do registry, não construída pelo time | Prevista |
| `docker-compose.yml` | Especificação de implantação | Versionado no repositório | Prevista, o Sprint-2.md a registra como entrega desta sprint, ainda não concluída |
| `.env`, a partir de um `.env.example` versionado | Configuração | Preenchido por quem sobe o ambiente | Prevista, hoje só aparece no material do T1 como exemplo de segredo vazando em camada de imagem |

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

No nível de arquivo de código, cada componente da API é uma pasta de módulo do NestJS, que é a forma concreta que o ADR-0004 escolheu para tornar a fronteira visível em revisão de código. O soquete do desenho é o parâmetro declarado no construtor, com a exceção do filtro global registrada na seção 3.2.

**`PublicInvitePage` aparece em dois artefatos e isso não é erro de tabela.** A parte que renderiza o convite roda no servidor e a parte do formulário roda no navegador, que é a assimetria descrita na seção 7.4 do guia. O build do Next.js separa as duas saídas.

**`TemplateSet` é o único componente com artefato próprio fora de um bundle.** Acrescentar um template muda `templates/`, muda a imagem do front e não toca o artefato da API, que é exatamente o que o ADR-0009 pediu ao chamar os templates de ativo versionado.

### 4.3 O que não é artefato implantado

**O contrato de tipos do ADR-0004 não é artefato de implantação, e mesmo assim é interface.** As duas coisas convivem. Tipo de TypeScript é apagado na compilação, então não existe arquivo dele rodando em lugar nenhum e ele não aparece no diagrama de implantação. O que aparece nesta página são as cinco interfaces que ele tipa, conforme a seção 2.5, e é assim que a consequência positiva declarada no ADR-0004 se cumpre. A exceção é o trecho que carrega valor de execução, como o enum `RsvpStatus`, que é compilado para dentro dos dois bundles e passa a existir em duas cópias. Isso não é duplicação a corrigir, é o efeito de empacotar dois tiers a partir de uma fonte só.

**O catálogo de templates tem dois consumidores, e é por isso que `contract/` existe.** `TemplateSet` carrega HTML, CSS e imagem, e mora em `templates/`. `TemplateCatalog` carrega código, nome de exibição, cores padrão e limites de texto por campo. Os dois precisam concordar sobre quais templates existem e qual é o limite de cada campo, e o único lugar que os dois builds podem ler sem que a API importe do front é o módulo compartilhado. É a resposta concreta ao ponto de atenção que o Diagrama de Classes levantou, que diz que o catálogo precisa estar disponível também no tier API. **Nada verifica que `templates/` e `contract/` continuem coerentes**, e isso está na seção 10.2.

**Os `Dockerfile` não são artefatos implantados.** Eles produzem as imagens, e a imagem é que entra no diagrama de implantação, fixada por tag e por digest.

---

## 5. Passo 5, o diagrama

![Diagrama de Componentes](/.attachments/diagrama-de-componentes.png)

### Como ler

**A figura usa quatro elementos, e apenas quatro.**

**Componente** é a caixa com o ícone de retângulo com duas abas no canto. É a unidade que presta serviço. As 21 caixas têm a mesma forma, porque todas são a mesma coisa.

**Interface provida** é a bolinha ligada ao componente por uma linha. Ela declara o serviço que aquele componente oferece. O nome sempre está escrito, porque bolinha sem nome não diz o que foi oferecido.

**Interface requerida** é o meio-círculo encaixando na bolinha. Ele declara o serviço que aquele componente consome. Toda dependência do desenho está nesse par, e não existe uma única seta ligando caixa em caixa.

**Pacote** é o retângulo com aba no canto superior esquerdo. Ele agrupa e não presta serviço, então não tem interface própria. São seis, três para os tiers do ADR-0002 e três para as camadas do ADR-0001.

**Não há porta na figura, e a ausência é escolha.** Porta marca o ponto em que o ambiente toca a parte interna de um componente, e o que ela acrescentaria aqui já está dito por outro elemento, que é a fronteira do pacote de tier com as interfaces que a atravessam. Porta com número e com mapeamento para o host é assunto do diagrama de implantação, item #60. Vale registrar que o bloco C do roteiro do T1 apresenta a porta da UML como a porta publicada do container, e as duas leituras convivem porque tratam de diagramas diferentes, uma da visão estática de módulos e outra da topologia de execução.

**A figura não tem legenda, e isso é regra do projeto.** Toda explicação de símbolo fica nesta seção, fora da imagem, como já foi feito no diagrama de camadas do Guia da Arquitetura. A notação é UML padrão, definida na própria Aula 05, e não depende de legenda para ser lida.

### O que a figura afirma

**Os três agrupamentos externos são tiers, e eles marcam origem de entrega, não processo em execução.** Isso precisa ficar dito porque `front-client.bundle` sai do tier Front e roda no navegador, conforme a seção 4.2, e o POST do UC005 parte dali direto para a API sem tocar o tier Front. O navegador não é tier, conforme o Vocabulário do guia, e os dois caminhos de rede estão desenhados no diagrama de camadas da seção 2 do guia e serão alocados em nó no item #60.

**O navegador não aparece.** Ele não é componente e não é tier. `PublicInvitePageHttp` e `HostPanelPageHttp` são bolinhas sem ninguém encaixado nelas, e é assim que se lê um serviço publicado para o ambiente.

**As duas guardas aparecem sem nenhuma interface requerida, e isso é declaração e não esquecimento.** Onde `SessionGuard` e `RateLimitGuard` guardam estado ainda não foi decidido, conforme os itens da seção 10.2. A figura não desenha dependência que ninguém decidiu. Fica registrado que as duas alternativas sem soquete novo são cookie assinado validado na própria guarda e contador na memória do processo, e que qualquer alternativa com tabela acrescentaria à Apresentação uma dependência de Dados, que é o que a seção 6.2 do guia proíbe. Quando o ADR sair, a figura é revista.

**`ErrorTranslation` recebe quatro soquetes.** É o ponto único de tradução da seção 9.2 do guia aparecendo como encaixe em vez de afirmação.

**A dependência só desce.** A figura foi montada com o Front em cima, Apresentação, Domínio, Dados e Banco embaixo, e todo meio-círculo que cruza camada aponta para baixo. Não existe bolinha da Apresentação encaixada em soquete de Domínio ou de Dados.

---

## 6. Passo 6, refinamento, o que mudou e por quê

O desenho preliminar saiu das tasks #64 a #67 e foi mexido em oito pontos antes de fechar. Cada mudança abaixo tem o motivo e o que ela obriga a corrigir em outro artefato.

**1. `TokenGenerator` foi descartado como componente.** `generatePublicToken()` e `generatePersonalToken()` aparecem como autochamada dentro do service nos diagramas de sequência do UC004 e do UC005. Pelo teste da seção 1.1, elas reprovam na segunda pergunta, porque encapsulam função e não decisão. Elas continuam sendo responsabilidade do Domínio, dentro de `InviteService` e de `RsvpService`, como os diagramas de sequência já mostram.

**2. `CsvRenderer` foi descartado pelo mesmo teste.** `renderCsv(rows)` e `neutralizeFormulaPrefix(field)` são serialização de saída, ficam dentro de `DietaryController` e não criam fronteira de dependência nova. Descartar um e manter o outro seria aplicar o critério de forma desigual, e o critério é o que sustenta a granularidade da entrega inteira.

**3. `listAttendance` ganhou `AttendanceService` em vez de ficar em `InviteService`.** A tabela 4.2 do guia lista a operação sem dono, e o candidato natural era `InviteService`, que já carrega criação, personalização, publicação e despublicação. Juntar a leitura do painel àquilo daria cinco responsabilidades a um componente, o que contradiz a definição de coesão, que é contável e ligada ao princípio da responsabilidade única. A lista de presença muda por motivo próprio, que é o painel e o intervalo de consulta do ADR-0007, e não pelo ciclo de vida do convite. A consequência é que a tabela 4.2 do guia deve registrar `AttendanceService` como dono.

**4. Os componentes do tier Front ficaram `Page` e não `View`.** O primeiro rascunho usava o sufixo `View`, que é o vocabulário das linhas de vida dos diagramas de sequência. Não serve aqui. A tabela 7.3 do guia classifica a resolução de rota, a escolha da View e a consulta periódica como **Controller do MVC**, e as duas caixas do front carregam isso junto com a exibição. `Page` nomeia a superfície inteira sem prometer que ali existe só uma das peças do padrão, e o Vocabulário do guia avisa que misturar os nomes torna a leitura ilegível.

**5. `DietaryCategoryRepository` entrou separado do `InviteRepository`.** É a aplicação da regra da seção 5.2 do guia. Isso obrigou uma correção nos fontes `diagrama-sequencia-uc005.puml` e `diagrama-sequencia-uc008.puml`, que mostravam `listDietaryCategories()` dentro de `InviteRepository` em três chamadas ao todo. Os três diagramas de sequência ganharam a linha de vida do novo repositório e foram gerados de novo.

**6. Os três tiers ficaram como agrupamento e não viraram caixa de componente.** A primeira versão desenhava Front, API e Banco como componentes com porta publicada e variável de ambiente como interface requerida. Isso é o assunto do diagrama de implantação, onde nó, dispositivo e link de comunicação têm notação própria. Mantidas as duas leituras separadas, as duas entregas não colidem. Essa é também a leitura que o bloco C do roteiro do T1 apresenta, e a seção 5 registra por que as duas convivem.

**7. O catálogo de erros e o formato de erro saíram da figura.** A primeira versão desenhava `DomainErrors` como interface provida pela camada de Domínio e `ApiErrorFormat` como interface provida pelo filtro. Nenhuma das duas tem operação, e a primeira ainda ficava sem componente que a realizasse, porque pacote não realiza interface. As duas viraram prosa na seção 2.5, e o filtro passou a prover `ErrorTranslation`, que é serviço com operação.

**8. As portas saíram da figura.** A primeira versão punha porta nas duas páginas do front, nas quatro rotas da API e no acesso ao banco. Sete componentes ganhavam corpo de caixa grande e os outros catorze ficavam compactos, o que faz o mesmo tipo de elemento aparecer com duas formas e sugere componente composto onde não há. O critério de porta, com número e mapeamento, é do item #60.

**9. O fonte do UC004 usa um nome de erro fora do catálogo.** O `diagrama-sequencia-uc004.puml` escreve `InviteNotPublished ou NotInviteOwner` no ramo de despublicar, e `InviteNotPublished` não está entre os cinco tipos da seção 9.2 do guia. A tabela 9.1 mapeia esse caso para `InviteNotOpenError`. Esta página adota o catálogo do guia, e o fonte foi corrigido junto com os outros dois.

---

## 7. Passo 7, revisão por pares

O passo é do método e não é formalidade. A lista abaixo é o roteiro de revisão, e cada item é uma pergunta que o revisor responde com sim ou não olhando a figura e as tabelas.

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

Os itens 1 e 2 se conferem na figura em quase todos os pontos. Nos dois feixes mais densos, os quatro soquetes de `ErrorTranslation` e os quatro de `InviteStore`, a contagem a olho é difícil, e a conferência vale pelas tabelas das seções 2 e 3.

**Pontos que precisam de decisão do time e não só de leitura**, porque a revisão não resolve sozinha: as decisões novas da seção 10.1, a criação do `AttendanceService` e a separação das duas operações de `RateLimit`.

Registro da revisão, a preencher na cerimônia:

| Data | Revisores | Resultado |
|---|---|---|
| a preencher | a preencher | a preencher |

---

## 8. Coesão e acoplamento dos componentes

Em [Ian04], coesão trata do **número de responsabilidades** de um componente e está ligada ao princípio da responsabilidade única, e acoplamento trata do **grau de dependência** de um componente em relação aos outros. As duas definições são contáveis, então esta seção conta. A seção 5 do Guia da Arquitetura já fez o mesmo para as camadas, e a frase de lá vale aqui inteira: afirmar coesão e acoplamento sem contar nada é elogio, e elogio não reprova código em revisão.

### 8.1 Os números

São **21 componentes**, **21 interfaces**, todas com dono único, e **31 dependências**, ou seja, 31 interfaces requeridas encaixadas.

| Faixa | Componentes | Quais |
|---|---|---|
| 0 interfaces requeridas | 6 | `TemplateSet`, `SessionGuard`, `RateLimitGuard`, `HttpExceptionFilter`, `TemplateCatalog`, `invite_app` |
| 1 interface requerida | 5 | `AttendanceService`, `HostService`, `InviteRepository`, `DietaryCategoryRepository`, `HostRepository` |
| 2 interfaces requeridas | 6 | `PublicInvitePage`, `HostPanelPage`, `AuthController`, `RsvpService`, `InviteService`, `DietaryService` |
| 3 interfaces requeridas | 2 | `PublicRsvpController`, `DietaryController` |
| 4 interfaces requeridas | 2 | `ApiClient`, `InviteController` |

A coluna soma 21 componentes e as faixas somam 31 soquetes, que é a mesma conta da seção 3.5. A média é de 1,5 interface requerida por componente. Nenhum componente conhece mais do que os que precisa para o próprio caso de uso.

**`ApiClient` é um dos dois mais acoplados e isso é escolha, não descuido.** Ele concentra as quatro interfaces HTTP para que as duas páginas não conheçam rota nem formato de erro. Tirar o componente não diminui o acoplamento, apenas espalha os quatro soquetes por duas caixas que deveriam cuidar de exibição.

### 8.2 Coesão, componente por componente

Cada rótulo da figura nomeia uma responsabilidade. Dois casos merecem atenção declarada, porque são os que ficam mais perto do limite.

**`InviteController` tem quatro interfaces requeridas** e atende três rotas, que são as três de `HostInviteHttp`. Continua coeso porque a responsabilidade é uma, expor o recurso convite ao anfitrião pela rede, e as três rotas mudam pelo mesmo motivo, que é mudança de contrato HTTP. Quando as rotas do UC002 e do UC003 existirem, ele passa a cinco rotas e o teste precisa ser refeito.

**`InviteService` é o componente a vigiar.** Depois do refinamento ele cuida do ciclo de vida do convite, o que reúne criação, personalização, publicação e despublicação. São quatro operações e um motivo de mudança só, a regra do convite. Se a personalização ganhar regra própria, por exemplo validação de paleta ou versionamento de template, o motivo de mudança se separa e o componente deve ser dividido. O teste é o mesmo do refinamento, perguntar se as operações mudam pelo mesmo motivo.

### 8.3 Reuso, desenhado e não afirmado

A pergunta de motivação do diagrama, na Aula 05, é como representar arquiteturas baseadas em unidades reusáveis. Na notação, reuso é uma bolinha com mais de um meio-círculo encaixado. São sete no desenho.

| Interface | Consumidores |
|---|---|
| `InviteStore` | 4, `InviteService`, `RsvpService`, `DietaryService` e `AttendanceService` |
| `ErrorTranslation` | 4, os quatro controllers |
| `PostgresWire` | 3, os três repositórios |
| `DietaryCategoryStore` | 2, `RsvpService` e `DietaryService` |
| `SessionAuth` | 2, `InviteController` e `DietaryController` |
| `TemplateAssets` | 2, `PublicInvitePage` e `HostPanelPage` |
| `InviteApi` | 2, `PublicInvitePage` e `HostPanelPage` |

As duas linhas de repositório não são novidade desta página. A seção 1.6 do Guia da Arquitetura já registrava `listDietaryCategories()` consumida por dois serviços e `findById` consumida por dois serviços como evidência de que a camada serve a mais de um serviço de nível mais alto. O que a figura acrescenta é mostrar isso como encaixe, e não como afirmação em tabela.

### 8.4 Substituibilidade, com a exceção que já está escrita

A segunda pergunta de motivação da aula é sobre unidades substituíveis, e a resposta honesta tem duas partes.

**São substituíveis, respeitada a compatibilidade da interface:** os quatro componentes do tier Front, os quatro controllers, `SessionGuard`, `RateLimitGuard`, `HttpExceptionFilter` e os seis componentes do Domínio. Uma implementação nova das mesmas operações entrega o mesmo comportamento.

**`InviteRepository` não é substituível apenas pela assinatura.** `saveRsvpWithinCapacity` garante o teto de capacidade dentro de transação, com bloqueio de linha, e `publishIfPublishable` carrega o predicado no próprio `UPDATE`. Uma substituta precisa oferecer a mesma garantia, não apenas a mesma lista de parâmetros. Isso já está registrado como Parcial na seção 1.6 do Guia da Arquitetura, e pelo mesmo motivo `invite_app` não é substituível por qualquer banco.

---

## 9. Rastreabilidade com os outros diagramas

| Artefato | Relação |
|---|---|
| Diagrama de camadas, seção 2 do Guia da Arquitetura | Mesmas camadas, mesmos tiers e o mesmo rótulo de pacote. O que lá é uma caixa por camada, aqui são os componentes dentro dela |
| [Diagrama de Classes](Diagrama-de-Classes.md) | Nenhuma classe virou componente. As classes são os classificadores da coluna "o que encapsula" da seção 1. As três consultas do painel saíram de `Invite` e estão alocadas em `AttendanceService` e `DietaryService`, conforme a seção 11.3 do Guia da Arquitetura |
| [Diagramas de Sequência](Diagramas-de-Sequência.md) | Os participantes de camada dos três `.puml`, que são `PublicRsvpController`, `InviteController`, `DietaryController`, `RsvpService`, `InviteService`, `DietaryService` e `InviteRepository`, são componentes desta figura com os mesmos nomes. `Navegador`, `Front` e `Banco` não são componentes, são lugares de execução, e estão tratados na seção 5 e no item #60 |
| Diagrama de implantação, item #60 | Recebe a seção 4 pronta. Os componentes já estão associados a artefatos, e falta alocar artefato em nó, definir link e número de porta |

---

## 10. O que ficou em aberto

### 10.1 Decisões novas desta página, que precisam de aval do time

1. A convenção de nome de interface da seção 2.
2. `AttendanceService` como dono de `listAttendance`.
3. A operação `templateAssets(templateCode)` de `TemplateAssets`.
4. As duas operações de `RateLimit`, `enforceReadLimit` e `enforceWriteLimit`, que tornam visível a decisão da seção 4.1 do guia.
5. A operação `toErrorResponse(error)` de `ErrorTranslation`.
6. A operação `findAttendanceByStatus(inviteId, statuses)` de `InviteStore`.
7. As duas operações de `TemplateRules`.
8. Os artefatos `contract/` e `migrations/`.

### 10.2 Pendências abertas

1. **As correções que esta página obrigou no guia já foram aplicadas, e duas delas esta página tinha errado.** O [Guia da Arquitetura](../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md) ganhou as seções 9.3, 9.4, 9.5, 10 e 11, que antes eram citadas pelo nome sem existirem, e a seção 11.2 de lá registra correção por correção. A tabela 4.2 ganhou coluna de componente dono, e a correção era coluna e não linha, porque `listAttendance` já era uma das sete linhas. A tabela 4.3 ganhou a linha de `findAttendanceByStatus` e coluna de repositório. A seção 3.1 ganhou a assinatura dupla do limite de taxa.

   Os dois erros desta página estavam na seção 5.1 do guia. **O "sete serviços de Domínio" não muda**, porque dono é componente e não serviço, e nenhum serviço entrou nem saiu da tabela 4.2. E **a saída de `listDietaryCategories` para `DietaryCategoryStore` não altera contagem nenhuma**, porque o Domínio continua chamando a operação. O que muda o número é só a entrada de `findAttendanceByStatus`, e nove vira dez.
2. **As rotas do UC002 e do UC003 não existem em artefato nenhum.** A tabela 4.1 tem sete rotas e nenhuma cria convite nem salva personalização. `InviteController` e `InviteService` já carregam a responsabilidade nesta página, e a origem precisa ser corrigida.
3. **O UC001 não cabe nos dois pacotes da Apresentação que o guia define.** `AuthController` não é do pacote público, porque a regra da seção 5.3 restringe aquele pacote a dois serviços, e não é do pacote autenticado, porque a rota de entrada é anterior à sessão. Falta decidir se entra um terceiro pacote.
4. **Se a API ganhar réplica, o contador do `RateLimitGuard` deixa de valer.** O [ADR-0010](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0010-Autenticação-do-anfitrião.md) decidiu contador em memória do processo, e com mais de uma instância cada uma contaria a própria janela. A hipótese de réplica vem do bloco C do roteiro do T1 e está registrada na seção 9 do [Diagrama de Implantação](Diagrama-de-Implantação.md). Enquanto houver uma instância só, as duas guardas continuam sem interface requerida e a figura desta página vale como está.
5. **As operações de `HostOperations` e de `HostStore` não têm assinatura fechada**, porque o UC001 não tem diagrama de sequência.
6. **Nada garante que `templates/` e `contract/` continuem coerentes.** Enquanto não houver verificação no build, acrescentar um template exige mexer nos dois lugares na mão, e um limite de texto divergente entre eles só aparece como recusa estranha na tela do UC003.
7. **O nome do serviço do banco no compose não está decidido.** O rótulo da figura é o nome do banco, e o roteiro do T1 usa `db` como nome de serviço. A decisão é do arquivo de compose e do item #60.
8. **Número de porta não existe como decisão em artefato nenhum.** A porta 3000 aparece no material do T1 como exemplo, e o ADR-0003 fecha no host sem chegar em porta. O número é assunto do item #60 e do arquivo de compose.

---

## Fonte do diagrama

Gerado a partir de [`diagrama-de-componentes.puml`](/.attachments/diagrama-de-componentes.puml), versionado junto com a imagem. Para regerar depois de editar o fonte, com Docker:

    docker run --rm -v "<caminho de docs/.attachments>:/data" plantuml/plantuml -tpng /data/diagrama-de-componentes.puml

## Referência

[Ian04] Ian Sommerville. Engenharia de Software. 6a edição. Addison Wesley, 2004. ISBN 85-88639-07-6.
