# Ajustes de Arquitetura para o MVP

A Sprint 5 começou com o front da parte 2 entrando no repositório, e logo depois o backend das partes 3 e 4. Os dois foram escritos fora da arquitetura das Sprints 2 e 3 e, ao encaixá-los nela, alguns pontos precisaram ser repensados. Esta página registra cada um: o que o código pedia, o que a arquitetura dizia, o que foi decidido e o que acontece se o time decidir diferente.

São cinco partes. A seção 1 trata do que mudou em artefato da arquitetura, ou foi decidido onde nenhum artefato decidia, por causa do front. A seção 2 trata do contrário, o que o protótipo do front fazia e a arquitetura não permite. A seção 3 faz o mesmo para o backend. A seção 4 registra as pendências fechadas para o MVP ficar pronto, e a seção 5 o que continua em aberto.

A regra de precedência é a de sempre. Se um ponto daqui divergir de um ADR, o ADR vale. As decisões que nenhum documento cobria entraram como linhas 35 a 40 da seção 11.1 do [Guia da Arquitetura](../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md) e precisam do aval do time.

## 1. O que a arquitetura precisou ajustar

| # | Ajuste | Onde mudou | Registro |
|---|---|---|---|
| 1.1 | A saudação do convite é texto fixo do template, e o convite não tem recado | Nenhum código mudou. Fecha a pendência 1 do Diagrama de Classes | Esta página |
| 1.2 | Os templates têm dois papéis de cor, principal e destaque, e fundo e texto ficam fixos | `contract/src/templates.ts` | Guia 11.1, linha 35 |
| 1.3 | As rotas de tela do front e o nome da rota de não encontrado | `front/src/app` | Guia 11.1, linha 36 |
| 1.4 | O `ApiClient` também baixa arquivo, para o CSV do UC008 | `front/src/controller/api-client.ts` | Esta página |
| 1.5 | As leituras que entraram depois da regra de repetição não repetem | `front/src/controller` | Esta página |
| 1.6 | O front usa só Next.js, React e CSS | `front/package.json` | Guia 11.1, linha 37 |
| 1.7 | O mock da API é um processo separado, fora do Next.js | `front/mock` | Esta página, por ser decisão da parte 2 |
| 1.8 | O comentário do contrato sobre o CSV do UC008 foi alinhado com a linha 31 do Guia | `contract/src/panel.ts` | Esta página |

### 1.1 A saudação e o recado do convite

**O que o protótipo pedia.** Além do nome do evento e do local, o editor tinha dois textos livres. Uma saudação manuscrita no topo do convite, com "você está convidado(a)!" como padrão, e um recado curto, como "Traga sua sobremesa preferida". Os dois eram editados no painel e apareciam para o convidado.

**O que a arquitetura dizia.** Nada, e é por isso que o ponto existe. O passo 3 do UC003 fala em ajustar "as cores e os textos do convite" sem nomear os textos. O Diagrama de Classes registrou a dúvida como pendência 1, e enquanto ela não fosse fechada `InviteCustomization` ficava sem atributo de texto. O contrato seguiu a mesma linha: `CustomizeInviteRequest` carrega só `eventName` e `location`, e o `TemplateDefinition` só tem limite de tamanho para esses dois. A delimitação do ADR-0004 diz que os textos do convite ficam em colunas próprias, porque são dado consultado.

**O que foi decidido para o MVP.** A saudação passa a ser **texto fixo de cada template**, parte do HTML e do CSS do ADR-0009, e o recado sai. O convite continua com a saudação manuscrita, mas quem a escreve é o template, não o anfitrião. Com isso a pendência 1 do Diagrama de Classes fecha no estado em que estava: o UC003 não prevê texto além do nome e do local.

**Por quê.** Os dois campos não são de graça. Cada um atravessaria tudo o que a seção 1.7 do Guia chama de propagação de alterações:

- o UC003, com o tamanho máximo de cada texto pela RN2;
- o Diagrama de Classes, com dois atributos em `InviteCustomization`;
- uma migração nova, com duas colunas;
- o contrato, em `CustomizeInviteRequest`, `InviteDetails`, `PublishedInvite` e nos limites de cada template;
- o Domínio, na validação do `TemplateCatalog`;
- e as duas telas.

E a H03 já está atendida sem eles: o anfitrião escolhe o template, ajusta as cores e os textos, que são o nome e o local, e vê a mudança na hora pela prévia.

**Se o time quiser os campos.** Nada na arquitetura impede, é só custo. O caminho é um PR único que muda o UC003, o Diagrama de Classes, a migração, o contrato e as duas pontas juntos, porque cada metade sozinha quebra o build da outra.

### 1.2 Os papéis de cor dos templates

**O que havia.** O catálogo em `contract/` tinha um template provisório, `classic`, com três papéis de cor: `primary`, `background` e `text`. O próprio comentário dizia que quem fizesse os templates de verdade ajustaria os papéis.

**O que o protótipo trouxe.** Três modelos, Clássico, Jardim e Noite, cada um com duas cores ajustáveis, uma principal e uma de destaque.

**O que foi decidido.** O catálogo passa a ter `classic`, `garden` e `night`, cada um com os papéis `primary` e `accent`. **O fundo e a cor do texto ficam fixos no CSS de cada template.** O código `classic` foi mantido, porque é o `DEFAULT_TEMPLATE_CODE` e já aparece nos testes da camada de Dados.

**Por quê.** Se o anfitrião escolhe o fundo e a cor do texto, ele consegue fazer um convite ilegível, com texto claro sobre fundo claro. Impedir isso exigiria uma regra de contraste, que no front seria regra de negócio na tela, e no Domínio seria regra nova sem caso de uso. Com fundo e texto presos ao template, a legibilidade fica garantida pelo próprio template, que é código revisado. É o que o ADR-0009 já registra como consequência positiva: a qualidade visual fica sob controle do time.

**Impacto nas outras partes.** O `TemplateCatalog` da parte 3 valida `colorOverrides` contra as chaves `primary` e `accent` e usa os limites de texto de cada template, que são 80 caracteres para o nome e 120 para o local nos três.

### 1.3 As rotas de tela e a rota de não encontrado

O ADR-0008 manda o token que não resolve redirecionar para uma "rota de não encontrado", e a seção 9.5 do Guia decide que ela responde 200 e que o redirecionamento é temporário. Nenhum dos dois dá nome à rota. As rotas de tela do painel também não estão em artefato nenhum.

O protótipo usava `/entrar`, `/eventos` e `/convite`, e a página do convite não tinha o token na rota, o que não funciona com o identificador do ADR-0005. As rotas ficaram assim, em inglês pelo Guia de Estilo:

| Rota | O que é |
|---|---|
| `/sign-in` | Entrada e cadastro do anfitrião |
| `/invites` | Lista de convites e criação |
| `/invites/{inviteId}` | O convite no painel: correção, personalização, publicação e respostas |
| `/i/{publicToken}` e `/r/{personalToken}` | As duas rotas de token, que já estavam definidas |
| `/invite-not-found` | A rota de não encontrado do ADR-0008 |

### 1.4 O `ApiClient` baixa arquivo

O DAS dá ao `ApiClient` a chamada HTTP tipada e a leitura do corpo de erro, e o README do front proíbe `fetch` direto em tela. A exportação do UC008 devolve um arquivo CSV, e não JSON, então o `ApiClient` ganhou `download(path)`, com o mesmo tratamento de erro e a mesma regra de repetição das outras chamadas.

A alternativa era um link comum apontando para a API. Ela foi descartada porque não passa pelo `ApiClient`, e quando a sessão expira ou o convite não existe o navegador mostraria o JSON de erro cru, em vez da mensagem da tela.

### 1.5 A repetição nas leituras que entraram depois

A seção 9.4 do Guia lista quem pode repetir automaticamente: as quatro leituras da tabela 4.1 da época e o `publish`. As leituras que a seção 11.1 acrescentou depois, que são a lista de convites, o convite no painel, a conferência da sessão e o link pessoal, passam nos dois testes da 9.4 mas não estão na lista.

O front aplica a leitura literal e **não repete nenhuma delas**. Não repetir é sempre seguro, e repetir é que precisa de licença. Se o time quiser dar a licença, a mudança é uma opção na chamada de cada uma e uma frase na 9.4.

### 1.6 O que o front usa além do Next.js

O ADR-0004 escolheu Next.js no front, e a seção 8 do Guia diz que a View e o Controller são Next.js sobre React, com os templates em HTML e CSS. O protótipo tinha sido gerado por uma ferramenta de prototipação e trazia muito mais que isso:

- **Estilo e componentes:** Tailwind, shadcn/ui, com cerca de 50 componentes sobre Radix, e uma biblioteca de ícones.
- **Dados e formulários:** TanStack Query, react-hook-form, zod, date-fns, recharts e sonner.
- **Restos de outras plataformas:** Supabase, TanStack Start e o relatório de erro da ferramenta.

A maior parte não era usada por tela nenhuma.

**O que foi decidido.** O front usa só Next.js, React e CSS. O visual do protótipo foi mantido e reescrito em CSS puro, em `src/app/globals.css` para o painel e em `src/templates` para o convite. Os ícones são SVG escritos no próprio código, em `src/view/icons.tsx`. As fontes entram pelo `next/font`, que faz parte do Next.js e embute os arquivos no build. Com isso nenhum pedido sai para terceiro quando o convidado abre o link. O build, por outro lado, precisa de rede para baixar as fontes.

**Por quê.** As consequências negativas do ADR-0004 registram que só um integrante tem experiência com a stack. Cada biblioteca a mais é mais uma coisa para o time aprender e manter, e o que estas resolviam cabe em CSS e em React. A consulta periódica, por exemplo, tem regra própria de recuo na seção 9.4, que não é o comportamento padrão do TanStack Query.

**Manutenção junto com isso.** O Next.js subiu de 16.4.0 para 16.4.3, porque a 16.4.0 tem um alerta de segurança crítico no `npm audit` e o build dela para com erro. A versão é de correção e não muda a stack.

### 1.7 O mock da API

As Instruções de Implementação deixam o jeito de fazer o mock com a parte 2, e pedem só que ele responda com os tipos de `contract/` e com o formato de erro. O protótipo fazia o mock com rotas de API dentro do próprio Next.js, em `app/auth/*/route.ts`, devolvendo um token JWT fora do contrato. Rota de API no Next.js é exatamente o que o ADR-0004 proíbe e o que a terceira busca da seção 6.4 procura.

O mock passou a ser um processo Node separado, em `front/mock/mock-api.ts`, fora do `src` e fora da imagem. Ele sobe na porta 3001, a mesma da API, e responde as 18 rotas da tabela 4.1 com os tipos do contrato e com as recusas, para as telas de erro existirem antes da integração. Quando a API ficar pronta, basta não subir o mock. O README do front explica como usar.

### 1.8 O CSV do UC008 sem restrição registrada

O comentário de `DietarySummary` em `contract/src/panel.ts` dizia que, sem restrição registrada, a tela não oferece o CSV. Isso contradiz o A1 do UC008 e a linha 31 da seção 11.1 do Guia, que mandam oferecer o CSV sempre que houver resposta sim ou talvez, porque ele é a lista que o buffet usa. O comentário foi corrigido. Só o texto mudou, e nenhum tipo.

## 2. O que o protótipo fazia e a arquitetura não permite

Nestes pontos a arquitetura ficou como estava e foi o front que mudou. Ficam registrados porque são a forma concreta das violações que o Guia previa, e são o que a revisão de código deve continuar procurando.

| O protótipo fazia | A regra | Como ficou |
|---|---|---|
| Conferia no navegador o limite de acompanhantes e o teto de pessoas antes de enviar | Guia 7.3: a checagem do front é conforto, a do servidor é verdade. Guia 4.1: comparar com `peopleLimit` ou `companionLimit` no front é regra de negócio | O campo usa os atributos `min` e `max` como conforto, e quem recusa é a API, com `companionLimit` ou `CAPACITY_EXCEEDED` |
| Mostrava na página pública quantas vagas restavam e quando o evento lotava | Guia 9.5: a página pública não exibe lista nem contagem, e a lotação não informa números | A página não tem contagem. A lotação aparece só na recusa, com o texto do A4 do UC005, sem números |
| Calculava o total de pessoas e a contagem por restrição na tela | UC007 RN1 e UC008 RN1 são do Domínio, e a agregação roda no banco (Guia 3.2) | Os totais vêm prontos de `attendance` e de `dietary-summary` |
| Montava o CSV no navegador | Medida 5 do ADR-0008 e Guia 3.4: o CSV é forma de saída da Apresentação, com o prefixo contra fórmula | O CSV vem da API pelo `ApiClient.download` |
| Gerava o endereço do convite no navegador com um número aleatório | ADR-0005: o token tem 128 bits de gerador seguro e nasce no Domínio | O link é montado com o `publicToken` que a API devolve |
| Guardava um token no `localStorage` e o mandava no cabeçalho `Authorization` | ADR-0010: sessão em cookie, que o navegador guarda e manda sozinho | O front não guarda token. Um 401 leva de volta à entrada |
| Tinha as categorias alimentares escritas no código | Guia 7.2: as categorias são dado de referência que chega da API | O formulário mostra `dietaryCategories` de `PublishedInvite` |
| Chamava a API com `fetch` direto, com rotas e campos que não existem no contrato | DAS 5.2 e README do front: toda chamada passa pelo `ApiClient`, tipada pelo `contract` | As 18 rotas estão tipadas em `public-invite.ts` e `host-panel.ts` |
| Consultava as respostas a cada 5 segundos, sem tratar falha | ADR-0007: de 15 a 30 segundos. Guia 9.4: recuo até 2 minutos, e falha nunca vira lista vazia | Consulta a cada 20 segundos, com recuo e com o aviso de lista desatualizada |
| Decidia no navegador se o evento já tinha passado, para travar a alteração | ADR-0013: o fim do evento é calculado na API, no fuso do projeto | A tela usa o `editable` que a API devolve |
| Juntava data e hora no navegador | ADR-0013: a junção é da Apresentação da API | O formulário envia `eventDate` e `eventTime` separados. A prévia só formata o que foi digitado |
| Cadastrava sem nome e aceitava senha de 6 caracteres | UC001 RN1 e `SignUpRequest` | O cadastro pede o nome e usa os limites de `TEXT_LIMITS` |
| Não tratava a API fora do ar na página do convite | Guia 9.4: página de convite indisponível, diferente da de não encontrado | `/i` e `/r` mostram a página de indisponível, e o token que não resolve vai para `/invite-not-found` |

## 3. A adequação do backend

O backend chegou na branch `gabriel`, com as rotas da tabela 4.1 escritas e funcionando. A estrutura em pacotes, o limite de taxa na ordem da seção 9.5 e o uso das peças compartilhadas estavam certos. O que precisou mudar foi o lugar de algumas regras e o formato do que cada camada recebe e devolve. O commit original entrou com a autoria do Gabriel e os ajustes vieram em cima dele, para a revisão enxergar a diferença.

### 3.1 O que mudou

| O código fazia | A regra | Como ficou |
|---|---|---|
| A camada de Dados decidia que só a confirmação ocupa vaga e somava `1 + acompanhantes` da resposta nova | Guia 1.6 e 3.4: os Dados recebem `seatsRequested` calculado e não sabem que o talvez vale zero | O Domínio calcula em `seatsRequested(status, companionCount)` e entrega o número. Os Dados só conferem o teto, com a soma do diagrama do UC005 |
| A camada de Dados zerava os acompanhantes e apagava a observação de quem respondeu não | Guia 4.1: o A1 do UC005 é aplicado no Domínio | O Domínio monta a resposta já com zero acompanhantes e sem observação, e os Dados gravam o que recebem |
| O filtro "sim ou talvez" e a categoria `ALLERGY` estavam escritos no SQL | Guia 4.3 e 6.3: os status chegam por parâmetro, e a categoria que exige descrição vem do catálogo do banco | O `DietaryService` passa `[ACCEPTED, MAYBE]` e os códigos com `requiresDescription` |
| A validação da observação usava as cinco categorias escritas no código | Guia 3.2 e 7.2: `validateDietaryNote` confere contra as categorias do banco | `validateDietaryNote(dietaryNote, categories)` recebe a lista de `listDietaryCategories` |
| A exportação fazia uma consulta por convidado | Guia 3.3: uma linha por convidado, com a agregação no banco | Uma consulta só, com junção à esquerda e `array_agg` das categorias |
| O Domínio recebia e devolvia os tipos HTTP do `contract`, com a data já em texto ISO | Guia 4, regra 2: o Domínio recebe comando e devolve modelo | O Domínio recebe `InviteCommand`, `CustomizationCommand` e `RsvpCommand`, devolve modelo, e a Apresentação traduz para o contrato |
| A data e a hora eram juntas com o fuso `-03:00` fixo, e a data no passado era comparada com o instante atual | ADR-0013: fuso `America/Sao_Paulo` por nome, junção na Apresentação e comparação por dia | `projectInstant` junta na Apresentação, e `projectDate` compara por dia no Domínio. Convite para hoje passa mesmo com a hora já vencida |
| O tamanho do nome e do local estava fixo em 80 e 120 | Guia 4.1: os limites são de cada template | O Domínio usa os limites do template do convite, e o do template padrão na criação |
| Um catálogo de templates "legado" convivia com o do `contract` | Guia 10.3: o catálogo mora num lugar só | O `TemplateCatalog` lê só o `contract`, que já tinha os três templates do front |
| O email repetido virava exceção lançada pela camada de Dados | Guia 9.2: os Dados devolvem valor, e o Domínio dá nome ao erro | `createIfEmailFree` devolve vazio, e o Domínio recusa com `alreadyRegistered` |
| As respostas não traziam os cabeçalhos de cache e de não indexação | Guia 9.5, a tabela por rota | A leitura pública sai com `private, no-cache, no-store` e `X-Robots-Tag: noindex`, a resposta do convidado com `no-store`, e o painel com `private, no-store` |
| Os nomes eram próprios, como `resolveGuestResponse`, `attendance` e `PanelService` | Guia 4.2 e 4.3 e o Diagrama de Componentes | Os nomes das tabelas, como `getGuestResponse`, `findAttendanceByStatus`, `AttendanceService` e `DietaryService` |

### 3.2 O que foi decidido junto

- **Faixa numérica e formato de data são forma.** O Gabriel tinha criado a regra `maxValue` para inteiros grandes demais, o que mudaria o conjunto fechado de regras da seção 9.3. Um inteiro que não cabe na coluna do banco, ou uma data fora de AAAA-MM-DD, passou a ser lido como pedido malformado, com 400. Data ausente continua sendo regra, com 422. É a linha 38 da seção 11.1 do Guia.
- **As operações novas da camada de Dados** ganharam uma segunda tabela na seção 4.3 do Guia, como a 4.2 já tinha para os serviços. É a linha 39.
- **As projeções que atravessam as camadas**, como o convite com a personalização e as linhas do painel, foram para `model/`. A Apresentação precisa lê-las e não pode importar da camada de Dados pela seção 6.2.
- **O total de pessoas do UC007** é somado no Domínio, com `seatsRequested`, sobre as linhas que a lista já traz. Pedir a soma ao banco obrigaria a escrever a regra do talvez no SQL. A seção 6.3 proíbe percorrer uma lista para contar o que um `GROUP BY` resolveria, e aqui o `GROUP BY` só resolveria levando a regra junto.
- **O CSV usa ponto e vírgula**, que é o separador que a planilha em português abre sem perguntar, com BOM para os acentos.

### 3.3 O que não entrou

O commit do Gabriel também trazia um segundo front, com a página `/dashboard`, outro formulário de resposta e os templates Botânico e Moderno. Ele conflitava com o front que já estava na `main` e ficou de fora, assim como os dois documentos que vieram junto: um relatório do processo e um prompt para ferramenta de IA, que não são documentação do projeto. Os testes dele foram reescritos, porque testavam o catálogo legado e as assinaturas antigas.

### 3.4 Como foi conferido

- **Testes unitários do Domínio:** a regra das vagas, o A1, a descrição exigida pelo catálogo, o fuso por dia e a publicação idempotente.
- **Testes de integração contra PostgreSQL:** inclusive quatro respostas simultâneas num teto de cinco vagas, das quais só duas passam.
- **Teste de ponta a ponta das rotas da tabela 4.1:** inclusive o 404 igual, no corpo e no cabeçalho, para token inexistente, token malformado, convite despublicado e convite de outro anfitrião.
- **O front da `main` contra a API de verdade:** cadastro, criação, correção, personalização, publicação, resposta, lotação recusada, link pessoal, painel, CSV e despublicação, num navegador.

## 4. O fechamento do MVP

Com o front e o backend juntos, quatro pendências que impediam chamar o MVP de pronto foram fechadas.

| Pendência | O que foi feito | Registro |
|---|---|---|
| O tempo limite de cada salto, que a seção 9.4 do Guia deixou sem número | O `ApiClient` desiste em 4 segundos por tentativa no servidor do tier Front e em 15 no navegador. A desistência vira `ApiUnavailableError`, que na página do convite já leva à página de convite indisponível | Guia 11.1, linha 40 |
| A imagem de prévia do link de cada template, pedida pelo ADR-0009 | Uma imagem por template em `front/public/templates`, gerada a partir do próprio CSS do template por `npm run og-images`. A página do convite a coloca nas metatags, com o nome e a data, e sem o endereço do evento | ADR-0009, sem decisão nova |
| Os alertas de segurança do `npm audit` | O Next.js já tinha subido para 16.4.3. Os pacotes indiretos `multer`, `body-parser` e `fast-uri` ganharam versão corrigida pelo campo `overrides` do `package.json` da raiz, e o `vitest` subiu de correção. O `npm audit` fecha sem nenhum alerta | Esta página |
| O projeto inteiro pelo `docker compose` | Banco, API e front sobem pelo compose do ADR-0003, e o roteiro do navegador passou contra eles: cadastro, criação, correção, personalização, publicação, resposta, lotação, link pessoal, painel, CSV e despublicação | Esta página |

## 5. O que continua em aberto

- **O Protótipo de Baixa Fidelidade da Sprint 3** segue a preencher. As telas que agora existem podem servir de base.
- **A hipótese de réplica da API.** O contador do limite de taxa fica na memória do processo, pelo ADR-0010, e deixa de valer se a API ganhar uma segunda instância. Não há réplica no ADR-0003, então não é defeito hoje.
- **A assimetria entre `publish` e `unpublish`**, registrada na seção 9.4 do Guia. O `unpublish` continua sem repetição automática.
- **O diagrama de sequência do UC007**, que nunca existiu. A projeção dele já tem nome no código.
- **O aval do time às linhas 35 a 40 da seção 11.1 do Guia.**
