# Guia da Arquitetura

Este guia descreve como o invite-app está organizado por dentro e o que cada parte pode e não pode fazer. É o documento que se consulta antes de escrever código, quando a dúvida é "onde isso mora".

A divisão de trabalho entre os documentos do projeto é esta. Os [ADRs](Decisões-Arquiteturais.md) registram decisões pontuais e o porquê de cada uma, em ordem cronológica e imutável. Este guia descreve o resultado combinado delas na forma de regras que valem para todo o código. Se os dois divergirem, o ADR é a fonte da decisão e o guia é que está desatualizado.

Onde nenhum ADR decidiu e o código precisa de uma regra assim mesmo, o guia decide e marca a decisão como nova na seção 11. Decisão nova deste guia não tem o mesmo peso de um ADR aceito e precisa de aval do time.

O guia segue o método de projeto de arquitetura em camadas apresentado na Aula 03 da disciplina, apoiado em [Fowler06]. São seis macro-passos e cada um tem lugar aqui.

| Macro-passo | Onde está neste guia |
|---|---|
| 1. Definir critérios para abstrair as camadas | Seção 1 |
| 2. Identificar o número de níveis de abstração | Seção 1 |
| 3. Nomear as camadas e atribuir suas responsabilidades | Seções 2 e 3 |
| 4. Especificar os serviços de cada camada (interfaces) | Seção 4 |
| 5. Definir os componentes que implementarão cada camada | Seção 8 |
| 6. Definir uma estratégia para tratamento de erros | Seção 9 |

As seções 5, 6, 7, 10 e 11 não estão nessa lista, e cada uma tem motivo próprio. A seção 5 existe porque a Aula 03 abre dizendo que a arquitetura "usa camadas coesas e com fraco acoplamento entre elas", e nenhum dos seis passos manda verificar se isso aconteceu. A seção 6 existe porque a regra de dependência é a única obrigação que o ADR-0001 impõe. A seção 7 existe porque há MVC no front. A seção 10 existe porque há três containers. A seção 11 existe porque o que não está escrito vira interpretação individual na hora de implementar.

## Vocabulário deste documento

Três palavras se repetem e precisam significar sempre a mesma coisa.

**Camada** é divisão lógica, com um nível de abstração próprio. São três, definidas no [ADR-0001](Decisões-Arquiteturais/0001-Estilo-arquitetural.md): Apresentação, Domínio e Dados.

**Tier** é divisão física, ou seja, unidade de implantação. São três, definidas no [ADR-0002](Decisões-Arquiteturais/0002-Empacotamento-em-tiers.md): Front, API e Banco. Camada e tier não são sinônimos e a seção 10 trata disso.

**Camada de Apresentação**, neste guia, é sempre a camada de controllers HTTP que roda no tier API. O código de interface que roda no navegador e no tier Front é chamado de **View** e **Controller do MVC**, nunca de camada de Apresentação. Os dois são código de apresentação no sentido amplo de [Fowler06], mas misturar os nomes torna a seção 10 ilegível.

Vale registrar desde já uma quarta peça que não é nem camada nem tier. **O navegador não é tier.** Ele não é unidade de implantação do sistema, não sobe no `docker compose` e não está no ADR-0002. Mesmo assim é onde a View roda e é de onde parte o POST do UC005. O diagrama da seção 2 o desenha fora dos três tiers por isso.

---

## 1. Estilo arquitetural adotado e por quê

O estilo está decidido no [ADR-0001](Decisões-Arquiteturais/0001-Estilo-arquitetural.md): **MVC no front-end e arquitetura em três camadas no back-end**. Esta seção não reabre a decisão, ela registra o critério que sustenta o desenho e que o ADR não detalha.

### 1.1 Critério para abstrair as camadas

O critério adotado é **por motivo de mudança**. Uma camada existe quando reúne um conjunto de decisões que muda por um motivo próprio, diferente do motivo que faz as vizinhas mudarem, e que pode ser compreendido sem conhecer as outras.

Aplicado ao produto, os três motivos de mudança são estes.

- **Muda porque o jeito de conversar com quem está fora mudou.** Nome de rota, código de status, formato de saída, sessão, limite de tráfego. Nada disso altera o que é um convite. Esta é a camada de **Apresentação**.
- **Muda porque a regra do evento mudou.** Quem pode publicar, quantos acompanhantes cada resposta aceita, quando a observação alimentar exige descrição, quanto vale uma resposta em vagas. Esta é a camada de **Domínio**.
- **Muda porque a forma de guardar ou a garantia sobre a escrita mudou.** Consulta, junção, agregação, transação, bloqueio. Esta é a camada de **Dados**.

O critério tem um teste prático, e o teste é a pergunta que a Aula 03 usa para narrar o defeito histórico das aplicações em duas camadas: **alguma regra de negócio vazou para a tela ou para o banco?** Se a resposta for sim, a abstração falhou, independentemente de quantas pastas existam.

### 1.2 Número de níveis de abstração

**São três.** Não dois e não quatro.

Não são dois porque a alternativa de duas camadas é justamente o antipadrão descrito na Aula 03, em que a lógica de domínio mora dentro da tela e produz duplicação e código não modularizado. O produto tem duas interfaces sobre o mesmo modelo, então esse defeito não seria teórico aqui. A mesma regra de acompanhantes existiria escrita duas vezes.

Não são quatro porque não existe um quarto motivo de mudança com vida própria. O sistema não integra outro sistema, não troca mensagem com terceiro e não tem processo de aplicação separado das regras do evento. Acrescentar uma camada sem motivo próprio cobra o preço sem entregar a separação, e a própria Aula 03 registra que camadas extras prejudicam o desempenho e aumentam a propagação de alterações.

### 1.3 Princípio de projeto

O enunciado é o da Aula 03: **camadas coesas e com fraco acoplamento entre elas**.

As duas palavras têm definição operacional e medida neste guia, e a medida está na seção 5. Aqui fica só o enunciado, porque afirmar coesão e acoplamento sem contar nada é elogio, e elogio não reprova código em revisão.

### 1.4 Por que MVC no front

A Aula 03 lista quatro sintomas do acoplamento entre regras de negócio e interface: **alto grau de instabilidade, baixa coesão, reuso comprometido e dificuldade de alocar equipes**. Os quatro se aplicariam a este projeto sem MVC, e o quarto é o mais concreto.

O Team Charter descreve quatro integrantes com experiência desigual e duas sprints de implementação. Sem separação entre View, Controller e Model, não existe recorte de tarefa que duas pessoas possam pegar sem se atropelar. A separação dá nome ao que cada um leva, que é a mesma justificativa de divisão de tarefas que o ADR-0001 já registra.

O motivo principal, porém, é a forma do produto. O invite-app tem **duas Views sobre o mesmo Model**, o convite público aberto por link sem login e o painel do anfitrião autenticado. É o problema que o padrão foi criado para resolver, e a Aula 03 nomeia essa vantagem de forma direta, suporte a múltiplas interfaces de usuário sobre o mesmo model.

A camada de Apresentação, por consequência, tem **dois pacotes**, um por superfície. A Aula 03 registra que uma única aplicação pode ter múltiplos pacotes de cada uma das três camadas, e usa o exemplo de uma aplicação com linha de comando e interface gráfica. Aqui é a mesma estrutura com outras duas interfaces, uma anônima e uma autenticada. A divisão não é decorativa: ela aparece marcada rota por rota na tabela 4.1, desenhada no diagrama da seção 2, e vira regra de código na seção 5.3, que diz quais serviços de Domínio o pacote público pode chamar.

### 1.5 Os quatro critérios de qualidade

A Aula 03 avalia uma arquitetura em camadas por quatro critérios. A seguir, o que cada um significa neste projeto.

**Reusabilidade.** A camada de Domínio é reutilizada por duas superfícies diferentes sem uma linha duplicada. A validação da observação alimentar do UC006 é a mesma para o convidado anônimo e para qualquer tela futura do anfitrião, porque mora num serviço e não no formulário.

**Modularidade.** A separação é estrutural e não convencional. O [ADR-0004](Decisões-Arquiteturais/0004-Stack-de-implementação.md) escolheu NestJS exatamente por isso, porque módulos e injeção de dependência tornam a fronteira visível em revisão de código, e não apenas em diagrama.

**Compreensibilidade.** Um integrante que abre um arquivo de repository sabe que ali só existe consulta e transação, sem precisar ler os outros dois.

**Extensibilidade.** Acrescentar a tela de alteração da resposta, que hoje é a pendência 3 dos [Diagramas de Sequência](../Sprints/Sprint-2/Diagramas-de-Sequência.md), é acrescentar rota e View. A regra de vaga e o teto já estão no lugar certo e não mudam.

### 1.6 Como saber se uma camada está bem desenhada

A Aula 03 deriva do modelo OSI cinco propriedades de uma boa camada. Elas funcionam como lista de verificação e são usadas aqui nesse papel. Cada linha cita a evidência que a sustenta, porque marcar o próprio trabalho como atendido sem apontar onde não verifica nada.

| Propriedade | Situação | Evidência |
|---|---|---|
| Dá para compreender a camada como um todo coerente sem conhecer as outras | Atendida | A camada de Dados recebe `seatsRequested` já calculado e compara com a coluna `capacity_limit`. Ela não precisa saber que uma resposta "talvez" vale zero vaga, que é a medida 1 do [ADR-0008](Decisões-Arquiteturais/0008-Confiança-na-fronteira-pública.md). Ver o passo `saveRsvpWithinCapacity` no diagrama do UC005 |
| Dá para substituir a camada por outra implementação dos mesmos serviços | Parcial | A View, o Controller do MVC e a camada de Apresentação são substituíveis. A camada de Dados não é. A garantia transacional do teto é serviço dela, e uma substituta precisa oferecer a mesma garantia, não apenas a mesma assinatura |
| As dependências entre camadas são minimizadas | Atendida, com número | Sete serviços do Domínio oferecidos à Apresentação e nove operações de Dados oferecidas ao Domínio, contados um a um na seção 4 e medidos na seção 5 |
| Camadas são bons lugares para padronização | Atendida | O filtro de exceção único da seção 9.2 e o formato único de erro da seção 9.3, os dois na Apresentação. Nenhum controller escreve corpo de erro por conta própria |
| Uma vez projetada, a camada pode ser usada por vários serviços de nível mais alto | Atendida | `listDietaryCategories()` é consumida por `RsvpService` no UC005 e por `DietaryService` no UC008. `findById` é consumida por `InviteService` no UC004 e por `DietaryService` no UC008 |

Sobre a segunda linha, vale dizer o que ela não significa. A camada de Dados não ser substituível não a torna incompreensível de forma isolada, que é a primeira linha. São propriedades diferentes. O que o teto de capacidade tira da camada de Dados é a liberdade de trocar de implementação sem reler a regra, não a possibilidade de entender o que ela faz lendo só ela.

### 1.7 Desvantagens assumidas

A Aula 03 fecha lembrando que usar um estilo exige entender benefícios e desvantagens. As deste desenho são quatro e estão aceitas.

**Propagação de alterações.** Acrescentar um campo ao convite toca as três camadas e o front. É o preço da separação e ele é cobrado toda vez.

**Custo de desempenho.** Cada requisição atravessa três camadas e um mapeamento em cada fronteira. Na escala deste projeto, algumas respostas por hora no pico do disparo do convite, o custo é irrelevante.

**Estrutura acima do necessário para o tamanho do CRUD.** O ADR-0001 já registra isso e nomeia o risco de excesso de projeto que o Team Charter atribui ao time. A mitigação é a mesma que ele adota: a regra de dependência da seção 6 é a única obrigatória, o resto se resolve caso a caso.

**A ida e a volta ao servidor.** A Aula 03 marca esse ponto como crítico de desempenho, e no caminho do convite público ele acontece duas vezes, não uma, por causa do [ADR-0002](Decisões-Arquiteturais/0002-Empacotamento-em-tiers.md). A seção 10 trata do assunto e a seção 9.4 trata do que fazer quando um dos dois saltos falha.

---

## 2. Diagrama de camadas

![Diagrama de camadas](/.attachments/diagrama-de-camadas.png)

### Como ler

**O diagrama usa quatro tipos de ligação, e eles não são a mesma coisa.** Linha cheia com ponta é dependência em tempo de compilação, ou seja, quem está na origem conhece o tipo ou a interface do destino e não compila sem ele. Linha tracejada com ponta é chamada em tempo de execução que cruza a rede. Linha pontilhada com ponta é evento do usuário, que não cria dependência de código nenhuma. Linha sem ponta liga um interesse transversal à camada que ele atravessa. Confundir os quatro num símbolo só torna a direção da dependência ilegível na figura, e a direção da dependência é o assunto do documento.

**A dependência só desce, e só a linha cheia responde por ela.** A Apresentação conhece o Domínio, o Domínio conhece os Dados, e o Model do front conhece os tipos que a API publica. Não existe linha cheia subindo. O que sobe é retorno, e retorno não é dependência.

**O navegador está fora dos três tiers.** Ele não é unidade de implantação do sistema. A View roda ali, e o Controller de escrita também, que é o que torna visível a assimetria da seção 10.2.

**São dois caminhos até a camada de Apresentação, não um.** O caminho de leitura sai do tier Front, que renderiza no servidor e chama a API. O caminho de escrita sai do navegador direto para a API, sem tocar o tier Front. Os dois são tracejados porque os dois cruzam a rede. Desenhar um só esconderia o POST do UC005, que é o fluxo mais importante do sistema.

**Não há atalho.** Não existe linha do navegador nem do tier Front para o Domínio ou para os Dados. A camada de Apresentação é a única porta de entrada do back-end, e é isso que torna verificável a frase do ADR-0001 de que trocar ou reescrever o front não afeta o Domínio.

**A camada de Apresentação aparece dividida em dois pacotes.** O público, com o `PublicRsvpController`, e o autenticado, com o `InviteController` e o `DietaryController`, conforme a seção 1.4. A autenticação de sessão pertence ao pacote autenticado e não aos interesses transversais, porque autenticação é responsabilidade da Apresentação e o Domínio nunca vê sessão. As seções 3.1 e 3.2 dizem o mesmo.

**Os interesses transversais são dois, não três.** Tratamento de erros e registro de log atravessam as três camadas e por isso aparecem ligados às três por linha sem ponta. Eles não são uma quarta camada. A Aula 03 traz um exemplo de diagrama em camadas com interesses transversais, e é essa a forma usada aqui.

**As caixas externas são os tiers.** Elas marcam fronteira de container, não fronteira de camada. As três camadas lógicas moram no mesmo container, que é o que a seção 10 detalha.

### Fonte do diagrama

Gerado a partir de [`diagrama-de-camadas.puml`](/.attachments/diagrama-de-camadas.puml), versionado junto com a imagem. Para regerar depois de editar o fonte, com Docker:

    docker run --rm -v "<caminho de docs/.attachments>:/data" plantuml/plantuml -tpng /data/diagrama-de-camadas.puml

---

## 3. Responsabilidades por camada

As responsabilidades abaixo foram derivadas dos três [Diagramas de Sequência](../Sprints/Sprint-2/Diagramas-de-Sequência.md) da Sprint 2, que cobrem o UC004, o UC005 com a extensão do UC006, e o UC008. Onde uma responsabilidade não tem passo de diagrama que a sustente, isso está dito.

### 3.1 Camada de Apresentação

Trata da interação com quem está fora do sistema. Exibe informação e traduz comando em ação sobre a camada de Domínio. No invite-app ela é a fronteira HTTP da API.

**O que faz**

- **Recebe a requisição e devolve a resposta.** É a única camada que conhece rota, método, cabeçalho e código de status. `POST /invites/{inviteId}/publish` no UC004, `POST /public/invites/{publicToken}/rsvp` no UC005, `GET /invites/{inviteId}/dietary-summary` no UC008.
- **Autentica a sessão do anfitrião.** `authenticateSession(session)` é a primeira chamada nos fluxos autenticados e traduz o cabeçalho de sessão em `hostId`. Para por aí. Não decide se aquele anfitrião pode agir sobre aquele convite.
- **Controla tráfego na fronteira pública.** `enforceRateLimit(publicToken, clientIp)` roda antes de qualquer outra coisa nas duas rotas públicas, conforme a medida 2 do [ADR-0008](Decisões-Arquiteturais/0008-Confiança-na-fronteira-pública.md). É controle de tráfego, não regra do caso de uso. A tabela 4.1 registra por que a leitura entra no limite junto com a escrita.
- **Desserializa e confere forma.** `parseRequest(dto)` verifica se o corpo é JSON legível e se cada campo chegou no tipo declarado pela rota, por exemplo `companionCount` como inteiro. Verifica forma, e só. **Se `status` chegou como texto mas com um valor fora de sim, não ou talvez, isso não é forma, é a RN1 do UC005 e quem recusa é o Domínio.** O conjunto de valores aceitos é o enum `RsvpStatus` do Domínio, não uma lista escrita dentro do controller.
- **Traduz o resultado do Domínio em protocolo.** `InvalidInviteForPublication` vira 422, `NotInviteOwner` vira 404, `CapacityExceededError` vira 409, e a ausência de valor vira 404. O Domínio não conhece nenhum desses números.
- **Decide o que o mundo lê quando não há recurso.** Token inexistente, convite em rascunho e convite despublicado chegam do Domínio como ausência de valor, e é aqui que os três viram o mesmo 404 com o mesmo corpo. A política está na seção 9.5 e a razão de ela ser da Apresentação está na 9.2.
- **Serializa a saída.** `renderCsv(rows)` no UC008, incluindo o `neutralizeFormulaPrefix(field)` que prefixa com aspa simples todo campo começado por `=`, `+`, `-` ou `@`, conforme a medida 5 do ADR-0008.

**O que não faz**

- **Não cria identificador.** `generatePublicToken()` e `generatePersonalToken()` são do Domínio. A Apresentação nunca gera identificador.
- **Não decide regra de negócio.** Ela tem o `companionCount` em mãos depois de `parseRequest` e não o julga. Quem julga é `checkCompanionLimit` no Domínio.
- **Não verifica o teto de capacidade.** Validar aqui deixaria duas respostas simultâneas ultrapassarem o limite. Ver a seção 3.4.
- **Não decide autorização.** Ela autentica e obtém `hostId`. Quem compara `hostId` com o dono do convite é `validateOwnership` no Domínio.
- **Não fala com o banco.** Nos três diagramas de sequência não existe uma única seta da Apresentação para o banco.

**De que depende e o que depende dela**

Depende do Domínio e da infraestrutura de sessão e de contagem de tráfego. Dependem dela o navegador, que faz os POST direto, e o tier Front, que faz a leitura do convite público. Dentro da API, nada depende dela.

### 3.2 Camada de Domínio

Também chamada de lógica de negócio. Possui as regras, as validações e os cálculos. Valida os dados que vêm da Apresentação. É a camada que sabe o que é um convite e o que é uma resposta.

**O que faz**

- **Conduz o caso de uso.** No UC008, `consolidateDietaryNotes` chama a camada de Dados três vezes em ordem, `countGuestsByCategory`, depois `listDietaryCategories`, depois `findDescriptionsByCategories`, e só então monta o resultado. Essa ordem é o caso de uso, não é consulta.
- **Decide autorização.** `validateForPublication(invite, hostId)` no UC004 e `validateOwnership(invite, hostId)` no UC004 e no UC008.
- **Aplica as regras que se decidem com o que já está em mãos.** `checkCompanionLimit(invite, companionCount)` para a RN2 do UC005, `validateDietaryNote(dietaryNote, categories)` para a RN2 do UC006 e para o limite de tamanho do texto livre da medida 3 do ADR-0008, a conferência de que o `status` recebido é um dos três valores da RN1 do UC005, e a checagem de nome, data, hora e local da RN1 do UC004.
- **Gera identificador.** `generatePublicToken()` produz os 128 bits em base32 Crockford do [ADR-0005](Decisões-Arquiteturais/0005-Identificador-público-do-convite.md). `generatePersonalToken()` produz a credencial de edição da ED2 do UC005.
- **Decide quando não gerar.** No UC004 a geração do token está dentro de um `opt`, porque republicar um convite despublicado reaproveita o link que o anfitrião já colou no grupo. Isso é decisão de negócio e está no lugar certo.
- **Deriva valor que não é coluna.** `seatsRequested(status, companionCount)` transforma a resposta em número de vagas, porque uma confirmação ocupa e um talvez não ocupa, conforme a medida 1 do ADR-0008.
- **Nomeia os erros no vocabulário do negócio.** Inclusive traduzindo o que sobe dos Dados, como `CapacityExceeded` virando `CapacityExceededError`.
- **Devolve ausência quando não há recurso.** `getPublishedInvite(publicToken)` devolve o convite publicado ou vazio. O Domínio não lança um erro chamado "não encontrado" e não sabe que aquilo vira 404.

**O que não faz**

- **Não verifica o teto de capacidade.** Ele calcula `seatsRequested` e entrega como parâmetro. Quem compara com `capacityLimit` é a camada de Dados, dentro da transação.
- **Não agrega em memória.** `countGuestsByCategory` devolve a contagem já agrupada, porque o `GROUP BY` roda no banco. O Domínio não percorre convidados contando.
- **Não conhece SQL nem o banco.** Todo pedido que ele faz tem nome de negócio.
- **Não conhece HTTP nem formato de saída.** No UC008 ele devolve as linhas da exportação e sai. Quem monta o CSV, escolhe o separador e define o `Content-Type` é a Apresentação.
- **Não vê sessão.** Ele recebe `hostId` já resolvido e nunca um cabeçalho.
- **Não controla tráfego.** `enforceRateLimit` não toca a linha de vida do Domínio em passo nenhum.

**De que depende e o que depende dela**

Depende da camada de Dados, e só dela. Toda leitura e toda escrita passam por ali, inclusive o dado de referência. Depende dele somente a camada de Apresentação.

Vale registrar com honestidade: o Domínio depende da interface da camada de Dados, o que é dependência para baixo e é o que a arquitetura em três camadas prevê. **O projeto não adota inversão de dependência entre Domínio e Dados**, e o ADR-0001 não pede uma. A regra registrada é uma só, Domínio e Dados não dependem da Apresentação, e é essa que os diagramas provam.

### 3.3 Camada de Dados

Trata da persistência e da comunicação com o que executa tarefas no interesse da aplicação. Neste projeto isso é o PostgreSQL do [ADR-0004](Decisões-Arquiteturais/0004-Stack-de-implementação.md) e nada mais.

**O que faz**

- **Traduz intenção de negócio em SQL e devolve objeto do modelo.** `findPublishedByPublicToken(publicToken)` vira um `SELECT` com junção e devolve `Invite` com `InviteCustomization`. Quem chamou não sabe que existe uma junção ali.
- **Garante, dentro de transação, a invariante que depende do estado do banco.** `saveRsvpWithinCapacity` executa `BEGIN`, `SELECT status, capacity_limit FROM invite WHERE id = ? FOR UPDATE`, a soma das vagas ocupadas, a comparação, o `INSERT` e o `COMMIT`. Nos ramos de recusa, `ROLLBACK`.
- **Torna atômica a transição de situação já decidida acima.** `publishIfPublishable` carrega a condição no `WHERE` do próprio `UPDATE`. Sem isso, dois cliques em compartilhar geram dois tokens e o segundo sobrescreve o primeiro. O predicado não decide se pode publicar, quem decidiu foi `validateForPublication` no Domínio. Ver a seção 3.5.
- **Agrega e junta no banco.** O `count(DISTINCT guest.id)` com `GROUP BY category_code` é o que faz a RN1 do UC008 sair certa, com um convidado de duas categorias contando nas duas. O `string_agg` com junção à esquerda é o que faz a exportação sair com uma linha por convidado mesmo sem nota.
- **Serve o dado de referência.** `listDietaryCategories()` devolve as categorias alimentares. A seção 5.2 explica por que essa operação não pertence ao repositório do convite.
- **Escreve junto o conjunto relacionado.** O convidado, a nota alimentar e as categorias marcadas entram todos entre o `BEGIN` e o `COMMIT`, porque a nota não existe sem o convidado.

**O que não faz**

- **Não decide quem pode o quê.** `findById(inviteId)` devolve o convite sem filtrar por anfitrião, e `countGuestsByCategory` nem recebe `hostId`.
- **Não checa o limite de acompanhantes.** `maxCompanionsPerGuest` não aparece em SQL nenhum. `saveRsvpWithinCapacity` recebe `seatsRequested` já calculado.
- **Não gera o token que persiste.** Ele chega por parâmetro.
- **Não formata saída.** Se o convidado digitou `=SOMA(A1:A9)` no texto livre, é isso que fica gravado. A aspa simples entra depois, na Apresentação, e a linha no banco continua íntegra.
- **Não conduz o caso de uso.** No UC008 as três consultas em sequência são três chamadas separadas vindas do Domínio, e não um método que já sabe a ordem.

**De que depende e o que depende dela**

Depende do tier Banco e das classes do [Diagrama de Classes](../Sprints/Sprint-2/Diagrama-de-Classes.md) que devolve. Não depende de nada acima dela. Depende dela somente o Domínio.

### 3.4 O critério de alocação

Quando surgir uma regra nova e o time não souber onde ela mora, é esta a pergunta a fazer.

> **Se a regra pode ser decidida com o que já está em memória, é Domínio. Se decidir exige o estado do banco no instante da escrita, e a resposta pode mudar entre ler e gravar, é Dados.**

O melhor exemplo do projeto está dentro de um único envio, o POST do passo 7 do UC005. Dois limites, os dois do mesmo formulário, os dois vindos da RN2 do UC002 e do ADR-0008, caindo em camadas diferentes.

`checkCompanionLimit(invite, companionCount)` é função de dois valores que já estão em mãos, o `maxCompanionsPerGuest` do convite já lido e o número que o convidado digitou. Duas requisições simultâneas não interferem uma na outra e rodar duas vezes dá o mesmo resultado. É Domínio.

O teto depende da soma das linhas de todos os outros convidados no instante da escrita, e a resposta muda entre a leitura e a gravação. Precisa do bloqueio e da escrita na mesma transação. É Dados. Sem isso, **duas respostas simultâneas num evento em 49 de 50 leem as duas 49, as duas passam, e a festa fecha em 51**.

Isso é o que tira a separação de camadas do terreno da afirmação de diagrama. Não é que as camadas existam separadas porque o desenho diz. É que juntá-las produz um número errado que dá para nomear.

Dois critérios auxiliares saem dos mesmos diagramas.

> **Se é forma de saída e não verdade do dado, é Apresentação.** O tratamento de fórmula no CSV prova. O mesmo texto vai para a tela do painel sem aspa simples e para o CSV com aspa simples. Muda a serialização, não o dado.

> **Autenticação é Apresentação, autorização é Domínio.** `authenticateSession` fica na Apresentação nos quatro pontos em que aparece, dois no diagrama do UC004 e dois no do UC008. O diagrama do UC005 não tem nenhum, porque é a fronteira pública. `validateOwnership` fica no Domínio nos três pontos em que aparece.

### 3.5 O limite do critério

O argumento do teto abre um precedente, e sem limite escrito ele vira porta para empurrar qualquer regra para baixo em nome de transação ou de desempenho. Então o limite fica escrito, e ele tem dois casos, não um.

> **Caso 1, invariante que exige transação.** A camada de Dados relata resultado de negócio porque só ela pode verificar, já que a resposta depende do estado do banco no instante da escrita e muda entre ler e gravar. É `saveRsvpWithinCapacity`, que devolve `CapacityExceeded` ou `InviteNotOpen`.
>
> **Caso 2, transição de situação protegida por predicado.** A decisão já foi tomada acima. `publishIfPublishable` só é chamado depois de `validateForPublication` aprovar no Domínio, e `unpublishIfPublished` depois de `validateOwnership`. O predicado no `WHERE` não decide nada novo, ele impede que duas requisições simultâneas escrevam uma por cima da outra. O desfecho "zero linhas" não é regra sendo aplicada em Dados, é o relato de que outra requisição chegou primeiro.
>
> **Em nenhum outro caso.**

O caso 2 é o que mais se parece com abuso, então ele tem teste próprio:

> **Tire o predicado do `WHERE` e rode de novo com uma requisição só.** Se o sistema continuar recusando o pedido errado, o predicado era defesa contra corrida e o caso 2 se aplica. Se o pedido errado passar, a regra estava morando na camada de Dados, e isso é violação da seção 6.

---

## 4. Os serviços de cada camada

Esta seção cumpre o macro-passo 4 da Aula 03, especificar os serviços que cada camada oferece à camada acima. Ela existe porque é a superfície que as seções 5 e 6 governam. Sem lista de serviços, "fraco acoplamento" é elogio e não medida.

As assinaturas abaixo são as dos três `.puml` da Sprint 2, copiadas sem simplificar, porque parâmetro omitido em tabela vira parâmetro ausente em código e o efeito disso aparece na tabela 4.3.

Três regras valem para todos eles.

1. **O nome do serviço usa o vocabulário de quem chama, não de quem implementa.** `findPublishedByPublicToken`, não `selectInviteJoinCustomization`.
2. **Nenhuma camada expõe tipo da camada de baixo, e nenhuma recebe tipo da camada de cima.** A Apresentação não devolve linha de banco e o Domínio não recebe objeto de requisição HTTP. É por isso que o parâmetro de `registerRsvp` se chama `rsvpCommand` e não `dto`. `dto` é palavra da Apresentação.
3. **Identificadores em inglês**, conforme o [Guia de Estilo](Guia-de-Estilo.md).

### 4.1 Serviços da camada de Apresentação, oferecidos ao front

| Rota | Caso de uso | Pacote | Autenticação e tráfego |
|---|---|---|---|
| `GET /public/invites/{publicToken}` | UC005 passos 1 e 2 | Público | Nenhuma, com limite de taxa |
| `POST /public/invites/{publicToken}/rsvp` | UC005 passo 7, com a extensão do UC006 | Público | Nenhuma, com limite de taxa |
| `POST /invites/{inviteId}/publish` | UC004 passo 1 | Autenticado | Sessão do anfitrião |
| `POST /invites/{inviteId}/unpublish` | UC004 A2 | Autenticado | Sessão do anfitrião |
| `GET /invites/{inviteId}/dietary-summary` | UC008 passo 1 | Autenticado | Sessão do anfitrião |
| `GET /invites/{inviteId}/dietary-notes.csv` | UC008 passo 4 | Autenticado | Sessão do anfitrião |
| `GET /invites/{inviteId}/attendance` | UC007, consulta periódica do [ADR-0007](Decisões-Arquiteturais/0007-Atualização-da-lista-de-presença.md) | Autenticado | Sessão do anfitrião |

As seis primeiras saem dos diagramas de sequência. A última é derivada do ADR-0007 e do UC007, que não têm diagrama de sequência.

**Por que a leitura pública também entra no limite de taxa.** A medida 2 do ADR-0008 não restringe o limite à escrita. Ela diz "por token de convite e por endereço de origem" e justifica por repasse abusivo do link, que é comportamento de leitura: um link colado num grupo grande gera GET em massa, não POST em massa. Restringir o limite ao POST seria estreitar o ADR, e o guia não faz isso em silêncio.

Essa escolha traz uma consequência que nenhum artefato do projeto tinha notado. **No caminho de leitura, o endereço de origem que a API enxerga é o do container do tier Front, não o do convidado**, porque quem chama a API ali é a renderização no servidor. Contar por endereço de origem nesse caminho contaria todos os convidados como um só e derrubaria a página do convite para todo mundo ao mesmo tempo. Então, até o time decidir se o tier Front repassa o endereço original, **o limite da rota de leitura conta por token de convite apenas**. O da rota de escrita conta pelos dois, porque ali o POST chega direto do navegador. Está registrado na seção 11.

### 4.2 Serviços da camada de Domínio, oferecidos à Apresentação

| Serviço | O que faz | Caso de uso |
|---|---|---|
| `getPublishedInvite(publicToken)` | Devolve o convite publicado, ou vazio | UC005 |
| `registerRsvp(publicToken, rsvpCommand)` | Valida, deriva as vagas e registra a resposta | UC005 e UC006 |
| `publishInvite(inviteId, hostId)` | Valida, gera o token se ainda não houver e publica | UC004 |
| `unpublishInvite(inviteId, hostId)` | Desativa o link sem apagar nada | UC004 A2 |
| `consolidateDietaryNotes(inviteId, hostId)` | Monta a contagem por categoria e as descrições | UC008 |
| `exportDietaryNotes(inviteId, hostId)` | Devolve as linhas da exportação, sem formatá-las | UC008 |
| `listAttendance(inviteId, hostId)` | Devolve a lista de presença por status e o total de pessoas | UC007 |

As seis primeiras saem dos diagramas de sequência. `listAttendance` é derivada do UC007 e do ADR-0007 e existe aqui porque a rota correspondente já estava na tabela 4.1 sem serviço por trás.

**Estes são serviços, não métodos da entidade.** O [Diagrama de Classes](../Sprints/Sprint-2/Diagrama-de-Classes.md) coloca `listAttendance()`, `consolidateDietaryNotes()` e `exportDietaryNotes()` como operações de `Invite`. Este guia adota a outra leitura, por três razões. A assinatura recebe `inviteId` e `hostId`, o que não é forma de método de instância de um `Invite` já carregado. As três conduzem o caso de uso chamando a camada de Dados mais de uma vez em ordem, e conduzir caso de uso não é trabalho da entidade, conforme a seção 3.3. E o diagrama do UC008 já as coloca em `DietaryService`. A divergência com o Diagrama de Classes está registrada na seção 11 com a correção exata.

Os serviços do UC001, do UC002 e do UC003 seguem a mesma forma e ainda não têm diagrama de sequência que os aloque passo a passo. Eles estão na seção 11.

### 4.3 Serviços da camada de Dados, oferecidos ao Domínio

| Serviço | O que garante | Caso de uso |
|---|---|---|
| `findById(inviteId)` | Leitura simples, sem filtro de dono | UC004 e UC008 |
| `findPublishedByPublicToken(publicToken)` | Devolve só o que está publicado | UC005 |
| `publishIfPublishable(inviteId, publicToken)` | Transição atômica pelo predicado do `WHERE` | UC004 |
| `unpublishIfPublished(inviteId)` | Transição atômica pelo predicado do `WHERE` | UC004 A2 |
| `saveRsvpWithinCapacity(invite, guest, dietaryNote, seatsRequested)` | Teto de capacidade dentro de transação, com `SELECT ... FOR UPDATE` | UC005 RN4 |
| `countGuestsByCategory(inviteId, statuses)` | Agregação no banco, não em memória | UC008 RN1 |
| `findDescriptionsByCategories(inviteId, statuses, categoryCodes)` | Textos livres das categorias que exigem descrição, só de quem conta | UC008 |
| `findGuestsForExport(inviteId, statuses)` | Uma linha por convidado, mesmo sem nota | UC008 ED2 |
| `listDietaryCategories()` | Dado de referência | UC005, UC006 e UC008 |

**O parâmetro `statuses` não é detalhe de assinatura.** A RN2 do UC008 manda exportar e consolidar apenas quem respondeu sim ou talvez. Se o filtro `[ACCEPTED, MAYBE]` não vier do Domínio como parâmetro, ele acaba escrito dentro do SQL do repositório, e aí uma regra de negócio passa a morar na camada de Dados sem nenhum dos dois casos da seção 3.5 a justificar. As três operações do painel recebem os status de fora por isso.

---

## 5. Coesão e acoplamento, com número

A Aula 03 abre dizendo que a arquitetura em camadas "usa camadas coesas e com fraco acoplamento entre elas", e o deck de MVC lista "baixa coesão" entre os quatro sintomas do acoplamento entre regra e interface. Nenhum dos seis macro-passos manda verificar se isso de fato aconteceu. Esta seção verifica.

### 5.1 O que se mede

**Coesão** se mede contando motivos de mudança dentro de um mesmo arquivo ou pacote. Um motivo, coeso. Dois motivos que não se falam, não coeso.

**Acoplamento entre camadas** se mede na superfície da seção 4. Duas perguntas: quantas operações a camada de cima precisa conhecer, e de quem são os tipos que atravessam a fronteira.

Pelos dois números, o desenho passa. A Apresentação precisa conhecer sete serviços de Domínio. O Domínio precisa conhecer nove operações de Dados. Nenhum tipo da Apresentação desce e nenhum tipo de banco sobe. O que atravessa cada fronteira são classes do Diagrama de Classes e projeções nomeadas.

### 5.2 Onde a medida falha, o `InviteRepository`

Os três diagramas de sequência colocam nove operações num único `InviteRepository`. Os números são estes: **nove operações, três consumidores e quatro tipos de retorno que não são o agregado**.

Os três consumidores são `InviteService` no UC004, `RsvpService` no UC005 e `DietaryService` no UC008. Os quatro tipos que não são `Invite` são `CategoryCount`, `AllergyDescription`, `ExportRow` e `DietaryCategory`.

Aplicando a definição de coesão da 5.1, há três motivos de mudança dentro do mesmo arquivo.

1. **O caminho de escrita do convite e suas invariantes.** `findById`, `findPublishedByPublicToken`, `publishIfPublishable`, `unpublishIfPublished` e `saveRsvpWithinCapacity`. Muda quando a regra de publicação ou a invariante do teto muda.
2. **As projeções de leitura do painel.** `countGuestsByCategory`, `findDescriptionsByCategories` e `findGuestsForExport`. Muda quando uma coluna ou um filtro do painel muda. A pendência 2 dos Diagramas de Sequência, acrescentar a coluna de acompanhantes à exportação da ED2 do UC008, é exatamente esse tipo de mudança, e hoje ela tocaria o mesmo arquivo que guarda a transação do teto.
3. **O dado de referência.** `listDietaryCategories`. Muda quando o catálogo de categorias muda, que não tem nada a ver com os outros dois.

A regra que o projeto adota para resolver isso:

> **Uma operação pertence ao repositório da raiz de agregação quando o que ela devolve é o agregado ou uma projeção do agregado, filtrada pelo mesmo `inviteId`. Uma operação que não filtra por convite não pertence a ele.**

Pelo critério, os motivos 1 e 2 ficam juntos. As três projeções do painel filtram por `inviteId`, dependem da mesma fronteira de consistência do agregado, e separá-las num repositório de consulta próprio compraria um conceito novo para três consultas. O motivo 3 sai: `listDietaryCategories()` não recebe `inviteId`, `DietaryCategory` é dado de referência marcado como tal no Diagrama de Classes, e o lugar dela é um `DietaryCategoryRepository` próprio.

**Esta regra é decisão nova deste guia, não algo que outro artefato já tenha registrado.** O Diagrama de Classes registra que `Invite` é a raiz do modelo e que `DietaryCategory` é dado de referência, e não fala em repositório em ponto nenhum. A regra segue daquilo, mas não está escrita lá. Está na seção 11 junto com as outras decisões novas.

Os diagramas de sequência do UC005 e do UC008 ainda mostram `listDietaryCategories()` em `InviteRepository`, em três chamadas ao todo, duas no UC005 e uma no UC008. O diagrama do UC004 não usa a operação e não muda. A correção está na seção 11.

### 5.3 Os dois pacotes da Apresentação, e a regra que faltava

O acoplamento entre o pacote público e o pacote autenticado é zero, e assim deve continuar. Um não chama o outro, e nada é compartilhado entre eles além do filtro de exceção da seção 9.2.

A consequência que a seção 1.4 anunciou e que faltava escrever é esta:

> **O pacote público chama apenas `getPublishedInvite` e `registerRsvp`. Nenhum outro serviço de Domínio.** Os outros cinco serviços da tabela 4.2 são exclusivos do pacote autenticado.

Sem essa regra, a separação por superfície fica decorativa. Com ela, vira verificação de uma linha em revisão de código. O risco que ela cobre é concreto: o pacote público é a única escrita sem autenticação do sistema, e o dia em que alguém acrescentar ali uma rota que chame `consolidateDietaryNotes` para "mostrar as restrições na página do convite", a lista de restrições alimentares de todos os convidados fica pública. Nenhum erro seria levantado, nenhum teste falharia, e o texto exposto é informação de saúde de pessoa identificável.

---

## 6. Regras de dependência

### 6.1 A regra inegociável

O [ADR-0001](Decisões-Arquiteturais/0001-Estilo-arquitetural.md) define uma regra e apenas uma como obrigatória:

> **O Domínio e a camada de Dados nunca dependem da Apresentação. As dependências apontam sempre para dentro.**

A Aula 03 enuncia a mesma ideia de mais duas formas, e as três importam porque cada uma pega um tipo diferente de violação.

**Forma 1, a da camada inferior.** A camada inferior ignora a existência da camada superior. Pega o caso do repository que importa um tipo de requisição HTTP para "facilitar".

**Forma 2, a do escondimento.** A camada de Domínio esconde a camada de Dados da camada de Apresentação. Pega o caso do controller que chama o repository direto para pular uma chamada.

**Forma 3, a da direção.** As camadas de Domínio e de Dados não devem depender da camada de Apresentação. Pega o caso do service que lança um erro já com código de status dentro.

O benefício declarado é o mesmo das três: **flexibiliza a arquitetura ao permitir a troca da camada de Apresentação sem provocar impacto nas camadas inferiores**. Neste projeto isso não é hipótese de futuro, é o que faz duas Views funcionarem sobre um Model só hoje.

### 6.2 Leitura adotada sobre o acesso da Apresentação aos Dados

O material da Aula 03 admite duas leituras em pontos diferentes. Em um deles, a Apresentação traduz comandos em ações sobre a camada de Domínio **e** a camada de Dados. Em outro, o Domínio esconde a camada de Dados da Apresentação.

**Este projeto adota a leitura estrita: a Apresentação nunca chama a camada de Dados.** É a leitura que o ADR-0001 já assumiu e é a que o teto de capacidade obriga. Se a Apresentação pudesse ler o convite por conta própria, alguém acabaria checando o teto ali, e a seção 3.4 explica o que acontece então.

### 6.3 O que violaria a regra na prática

Lista concreta, para revisão de código e não para discussão de princípio.

- Um `service` ou um `repository` importando tipo de requisição, de resposta, de cabeçalho ou de sessão HTTP.
- Um número de status HTTP escrito fora da pasta da Apresentação.
- SQL, nome de tabela ou nome de coluna fora da pasta de Dados.
- Um controller chamando um repository direto, sem passar pelo service.
- Um controller do pacote público chamando serviço de Domínio fora dos dois da seção 5.3.
- O tier Front abrindo conexão com o banco, ou o navegador chamando qualquer coisa que não seja a camada de Apresentação.
- Uma regra de negócio decidida no template, no formulário ou na rota do Next, sem ser revalidada no servidor.
- Um repository recebendo `hostId` para decidir permissão, em vez de devolver o dado e deixar o Domínio decidir.
- O Domínio montando CSV, escolhendo separador, definindo `Content-Type` ou escrevendo texto de tela.
- O Domínio percorrendo uma lista para contar o que um `GROUP BY` resolveria.
- Um repository checando `maxCompanionsPerGuest`, ou escrevendo `[ACCEPTED, MAYBE]` dentro do SQL em vez de receber os status por parâmetro.

### 6.4 Como a revisão de código verifica

São três buscas, e as três juntas levam menos de um minuto. O ADR-0001 registra que a regra exige disciplina de time, e disciplina que depende de boa vontade não sobrevive a uma sprint. Esta é a forma de checar sem depender disso.

**No tier API, procurar por `404`, `409`, `422` e `HttpException`.** Se algum resultado sair de fora da pasta da Apresentação, a regra foi quebrada.

**No tier API, procurar por `SELECT`, `INSERT` e `UPDATE`.** Se algum sair de fora da pasta de Dados, a regra foi quebrada.

**No tier Front, procurar por `use server`, pela pasta `app/api`, e por `capacityLimit` e `maxCompanionsPerGuest`.** Se algum aparecer, a regra foi quebrada. Esta terceira busca cobre a violação mais provável do projeto, que é a regra de negócio decidida no Next, e as duas primeiras não pegam nada dela. É o atalho que aparece quando a sprint aperta e o Next já está ali, e a seção 8 o proíbe em texto.

---

## 7. Mapeamento entre MVC e as três camadas

### 7.1 A equivalência, e onde ela não é exata

A Aula 03 define as três peças do MVC assim: **View** é a interface do usuário, **Controller** é o controle de fluxo da aplicação, e **Model** é a lógica de negócios **e o acesso a dados**. Essa última definição é o ponto que exige cuidado neste projeto.

A tabela abaixo usa a expressão "camada de apresentação no sentido amplo de [Fowler06]", e não "camada de Apresentação", que o Vocabulário reservou para os controllers HTTP do tier API. São coisas diferentes com nome parecido, e a coluna de tier existe para não deixar dúvida.

| Peça do MVC | Camada de [Fowler06] | Tier onde roda |
|---|---|---|
| View | Apresentação no sentido amplo | Navegador |
| Controller do MVC, caminho de leitura | Apresentação no sentido amplo | Front |
| Controller do MVC, caminho de escrita | Apresentação no sentido amplo | Navegador |
| Camada de Apresentação deste guia, os controllers HTTP | Apresentação | API |
| Model | Domínio e Dados | API |

A separação em três camadas do back-end é, portanto, **um refinamento do Model**, e não uma contradição com o padrão. O Model do padrão cobre duas responsabilidades que mudam por motivos diferentes, regra de negócio e persistência, e o critério da seção 1.1 manda separá-las.

### 7.2 O Model do front não é o Model do padrão

Esta é a confusão mais provável de todo o documento, e ela precisa ficar resolvida em voz alta.

O ADR-0001 diz "MVC no front-end" e o [ADR-0004](Decisões-Arquiteturais/0004-Stack-de-implementação.md) diz que Next.js é front-end apenas. Se alguém chamar de "Model" alguma coisa dentro do tier Front sem qualificar, lê-se como regra de negócio dentro da tela, que é exatamente o antipadrão que a Aula 03 narra como defeito histórico.

> **O Model do MVC deste sistema mora no tier API, distribuído entre Domínio e Dados. O que existe no navegador é a projeção desse Model recebida na resposta HTTP, mais o estado do formulário que o usuário está preenchendo.**

A prova está no UC005. As categorias alimentares chegam junto com a página vinda da API, e o passo 1 do UC006 exibe as categorias recebidas com a página. O front não tem cópia própria da lista, e `DietaryCategory` é dado de referência que mora no banco. `Invite`, `InviteCustomization`, `Guest`, `DietaryNote` e os enums `RsvpStatus` e `InviteStatus` pertencem ao Domínio. O front reflete, não define. O contrato de tipos compartilhado do ADR-0004 torna isso um tipo e não uma convenção.

### 7.3 As três peças neste projeto

| Peça | Onde roda | O que é aqui | Com que camada do back conversa |
|---|---|---|---|
| Model | Não roda no front, chega nele | Projeção do modelo recebida na resposta, mais o estado do formulário | Nenhuma diretamente, chega pela resposta da Apresentação |
| View | Navegador, com o HTML do convite público montado no tier Front | Template do [ADR-0009](Decisões-Arquiteturais/0009-Personalização-por-template.md), formulário do convite, telas do painel, montagem do link a partir do token | Nenhuma, só exibe |
| Controller | Tier Front no caminho de leitura, navegador no caminho de escrita | Resolução de rota e escolha da View no Next.js, tradução de evento do usuário em chamada HTTP, e a consulta periódica do ADR-0007 | Apresentação, e só ela |

**A View faz trabalho de exibição e nada além.** Ela monta o link a partir de um token que o Domínio gerou. Ela esconde e mostra campo, por exemplo ocultando acompanhantes e restrição alimentar quando a resposta é "não", ou cobrando o texto livre depois que uma categoria que exige descrição foi marcada. Ela esconde campo, não decide validade.

**O Controller do front não decide nada.** Todos os passos do UC005 entre o 3 e o 6 acontecem entre o convidado e o navegador, sem uma única seta de rede, e nada disso é confiado. Depois do POST, `checkCompanionLimit` e `validateDietaryNote` rodam de novo no Domínio. **A checagem do front é conforto, a do servidor é verdade.** O motivo está no ADR-0008: a fronteira pública é a única escrita sem autenticação, o POST sai direto do navegador, e qualquer um envia qualquer corpo.

### 7.4 O Controller está partido entre dois lugares

No caminho de leitura, a resolução de rota e a escolha da View acontecem no servidor, dentro do tier Front. Quando o token não resolve, é o servidor que redireciona para a rota de não encontrado. No caminho de escrita, o Controller vive inteiramente no navegador e o POST sai direto para a API, sem passar pelo tier Front.

Isso não é inconsistência. É o efeito combinado do ADR-0002, que separou os tiers, com o ADR-0004, que mantém o Next.js como front-end apenas. Fica escrito aqui porque é melhor estar declarado do que ser perguntado na apresentação.

### 7.5 O que do MVC não foi adotado, e por quê

O MVC original é baseado em notificação. O Model registra as views e os controllers interessados e notifica os registrados quando o estado muda, e o diagrama da Aula 03 separa na legenda a invocação de método do evento.

**Nada disso existe sobre HTTP sem estado.** O servidor não tem lista de views registradas e não tem como avisar ninguém. Então:

- **Adotado:** a separação de responsabilidades entre View, Controller e Model, e a ideia central de múltiplas Views sobre um Model só, que é a razão da escolha no ADR-0001.
- **Não adotado:** o registro de observadores e a notificação de mudança.

O substituto do projeto para a notificação é a **consulta periódica do [ADR-0007](Decisões-Arquiteturais/0007-Atualização-da-lista-de-presença.md)**, com intervalo entre 15 e 30 segundos enquanto o painel estiver aberto. A escolha está justificada lá, e a consequência aqui é que a View do painel pergunta em vez de ser avisada.

**A consequência maior, dita em voz alta.** O diagrama do slide 9 da Aula 03 define a tríade por três relações: a View requisita atualizações ao Model, o Controller mapeia ações do usuário para atualizações do modelo, e o Model notifica a View sobre mudanças. Com o Model fora do navegador, conforme a seção 7.2, **nenhuma das três acontece localmente neste sistema**. As três viram uma chamada HTTP. O que roda no navegador é a metade View e Controller do padrão operando sobre um Model remoto, e essa é a comparação honesta com o diagrama da aula. Dizer isso é mais forte do que deixar implícito, porque quem conhece aquele diagrama vai perguntar onde está a seta de notificação.

---

## 8. Stack por camada

A escolha e a justificativa estão no [ADR-0004](Decisões-Arquiteturais/0004-Stack-de-implementação.md). Esta seção só registra o que implementa cada camada, cumprindo o macro-passo 5 da Aula 03.

A primeira coluna mistura camada com peça do MVC de propósito, e diz qual é qual, porque a View e o Controller do MVC não são camadas do ADR-0001 e não podem aparecer como se fossem.

| Camada ou peça do MVC | Tier | Tecnologia | Forma concreta |
|---|---|---|---|
| View e Controller do MVC, peças do padrão | Navegador e Front | Next.js sobre React | Rotas, componentes e os templates em HTML e CSS do [ADR-0009](Decisões-Arquiteturais/0009-Personalização-por-template.md) |
| Apresentação, camada | API | NestJS | Controllers dos dois pacotes, guards de sessão, pipes de desserialização, contador de limite de taxa e o filtro de exceção da seção 9 |
| Domínio, camada | API | NestJS, TypeScript puro | Providers de serviço, sem dependência de framework web |
| Dados, camada | API | NestJS | Repositories e transações. O banco em si é o tier Banco, não uma quarta camada |
| Nenhuma, é tier | Banco | PostgreSQL | Tabelas, índices e o `JSONB` das cores da personalização |

Três limites vêm do ADR-0004 e valem como regra de código.

**Next.js é front-end apenas.** Nada de API routes nem de server actions com regra de negócio. Se a lógica migrar para o Next, o tier da API perde a razão de existir e o ADR-0002 vira ficção. A terceira busca da seção 6.4 é o que verifica isso.

**O Domínio não importa NestJS além da anotação de injeção.** Ele precisa ser testável sem subir a API nem o banco, que é uma consequência positiva declarada no ADR-0001.

**O `JSONB` guarda apenas as cores e os ajustes livres da personalização.** O template escolhido fica em coluna tipada, e os textos do convite ficam em colunas próprias, porque são dado consultado.

**Sobre os componentes.** As classes que a camada de Dados devolve estão no [Diagrama de Classes](../Sprints/Sprint-2/Diagrama-de-Classes.md) da Sprint 2. A sessão do anfitrião e o contador de limite de taxa do ADR-0008 são infraestrutura, ficaram fora do diagrama de classes de propósito e serão nomeados no diagrama de componentes.

---

## 9. Estratégia de tratamento de erros

Último macro-passo do projeto em camadas, conforme a Aula 03. Sem ele, cada integrante inventa o próprio jeito de sinalizar falha e a regra da seção 6 vaza pela porta dos fundos.

### 9.1 Oito categorias, cada uma com um dono

O dono é a camada que **detecta** o erro. Nenhuma outra decide aquilo por ela. A coluna "o que atravessa" separa o que a camada de baixo devolve do tipo que a de cima cria, porque as duas coisas são diferentes e a seção 9.2 depende disso.

| Categoria | Quem detecta | Exemplos no projeto | O que atravessa | Resposta |
|---|---|---|---|---|
| Forma da requisição | Apresentação | corpo não é JSON, `companionCount` veio como texto onde a rota declara inteiro | não sobe ao Domínio | 400 `MALFORMED_REQUEST` |
| Excesso de tráfego | Apresentação | o limite de taxa da medida 2 do ADR-0008 disparou numa das duas rotas públicas | não sobe ao Domínio | 429 `RATE_LIMITED` |
| Validação e regra de negócio | Domínio | `status` fora de sim, não ou talvez (UC005 RN1), acompanhantes acima do limite (UC005 RN2), alergia sem descrição (UC006 RN2), texto livre da observação alimentar acima do tamanho máximo (ADR-0008 medida 3), data no passado (UC002 RN1), texto do convite acima do limite do campo (UC003 RN2) | `ValidationError(field, rule)` | 422 `VALIDATION_FAILED` |
| Convite incompleto para publicar | Domínio | falta nome, data, hora ou local (UC004 RN1) | `InvalidInviteForPublication(missingFields)` | 422 `INVITE_NOT_PUBLISHABLE` |
| Ausência de recurso | Domínio constata, Apresentação decide | token inexistente, convite em rascunho, convite despublicado | valor vazio, nenhum tipo de erro | 404 `NOT_FOUND` |
| Convite de outro anfitrião | Domínio | `validateOwnership` recusou | `NotInviteOwner` | 404 `NOT_FOUND` |
| Conflito de situação ou de concorrência | Dados detecta, Domínio nomeia | teto de pessoas atingido (UC005 RN4), convite despublicado entre a leitura e a gravação (UC004 RN3), pedido de despublicar um convite que não está publicado (UC004 A2) | Dados devolve `CapacityExceeded` ou `InviteNotOpen`, o Domínio lança `CapacityExceededError` ou `InviteNotOpenError` | 409 `CAPACITY_EXCEEDED` ou `INVITE_NOT_OPEN` |
| Falha de infraestrutura | ninguém | banco fora, tempo esgotado, container não subiu, erro não previsto | nenhum tipo, exceção não tratada | 500 `INTERNAL_ERROR` |

Falha de infraestrutura não tem dono de propósito. Ninguém a converte em conceito de negócio, porque não existe conceito de negócio para o banco não ter respondido. Ela sobe crua até a borda e morre lá.

**O duplo clique em publicar não está nesta tabela, e isso é intencional.** Ele não é erro. Quando duas requisições de publicação chegam juntas, a segunda encontra zero linhas afetadas no `UPDATE` de `publishIfPublishable`, o Domínio relê o convite com `findById` e devolve 200 com o `publicToken` que já existia. A operação é idempotente, é o que o `opt` de zero linhas do diagrama do UC004 mostra, e é coerente com a seção 3.2, que registra que republicar reaproveita o link em vez de recusá-lo.

Lido em conjunto, o critério de código de status é este:

> **400 é não consegui ler o que você mandou. 422 é li, e uma regra recusa, seja pelo conteúdo que veio, seja por dado que falta no recurso que você quer mudar. 409 é a operação depende da situação do convite, e situação muda sozinha. 404 é você não tem por que saber se isso existe. 429 é você mandou demais.**

O critério classifica os oito códigos sem sobra. `INVITE_NOT_PUBLISHABLE` é 422 porque o que falta é dado do convite, e o convidado não tem o que corrigir no corpo mesmo assim. `INVITE_NOT_OPEN` é 409 porque depende da situação de publicação, que outra pessoa pode mudar a qualquer momento. `CAPACITY_EXCEEDED` é 409 pelo mesmo motivo, já que depende das respostas dos outros.

### 9.2 Três pontos de tradução, cada um de mão única

Este é o ponto arquitetural da seção. Um erro atravessa as três camadas mudando de forma três vezes, e em nenhum momento uma camada de baixo aprende o vocabulário de uma camada de cima.

**Dados para Domínio: valor de retorno, nunca exceção de negócio.** `saveRsvpWithinCapacity` devolve o convidado gravado ou uma recusa com um dos dois motivos, `CAPACITY_EXCEEDED` ou `INVITE_NOT_OPEN`. É dado simples, decidido dentro da mesma transação que fez o `SELECT ... FOR UPDATE`. A camada de Dados descobriu a condição porque só ela pode, mas quem dá nome de negócio a ela é o Domínio.

**Domínio para Apresentação: exceção tipada do catálogo do Domínio, ou ausência de valor.** São cinco tipos e não mais que isso: `ValidationError`, `InvalidInviteForPublication`, `NotInviteOwner`, `CapacityExceededError` e `InviteNotOpenError`. Nenhum deles carrega número de status, nome de cabeçalho nem texto de tela. O Domínio afirma o que aconteceu e cala sobre como isso é exposto.

**Não existe um `NotFoundError` neste catálogo, e a ausência é deliberada.** Ausência de recurso não é exceção, é valor vazio. `getPublishedInvite(publicToken)` devolve o convite ou vazio, que é o que a tabela 4.2 diz e o que o diagrama do UC005 mostra, com o Domínio devolvendo "vazio" e a Apresentação escolhendo 404. Um tipo chamado "não encontrado" no Domínio colapsaria quatro situações que o Domínio distingue perfeitamente, token inexistente, convite em rascunho, convite despublicado e convite de outro anfitrião. Um convite em rascunho existe, e o Domínio sabe disso. Fingir o contrário dentro do Domínio é escrever lá a política de exposição da seção 9.5, que é decisão de fronteira.

**Apresentação para cliente: um único filtro traduz tipo em status e em código.** Um filtro de exceção do NestJS, num arquivo só, com a tabela da seção 9.1 dentro. Ele precisa capturar também as exceções que o próprio framework levanta e reescrevê-las no formato da seção 9.3, senão a API passa a devolver dois formatos diferentes de erro sem ninguém perceber.

**Por que isso não é burocracia.** `NotInviteOwner` vira 404 e não 403, para não confirmar que o convite existe. Essa é uma decisão de exposição da fronteira, não de negócio. Se o Domínio lançasse 403, ele teria decidido sozinho uma política que é da Apresentação, e mudar a política obrigaria a mexer no Domínio. O Domínio diz que aquele convite não é daquele anfitrião. A Apresentação escolhe o que o mundo lê. O mesmo argumento vale, palavra por palavra, para o colapso das quatro situações num 404 só: quem colapsa é a Apresentação, e o Domínio nunca perde a informação. É a demonstração mais barata da regra da seção 6 fora do caso do teto, e custa duas linhas de tabela.

### 9.3 Formato único de resposta de erro

Mesma forma em todo endpoint, de erro de campo a falha de banco.

