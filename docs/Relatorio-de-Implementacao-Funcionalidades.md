# Relatório de análise e implementação das funcionalidades

**Projeto:** invite-app  
**Data:** 20 de outubro de 2026  
**Escopo:** tarefas do quadro da Sprint 4 (H01, H02, H05, H07, H08, H10 e item de fundação #25) e histórias H03, H04, H06, H09, H11 e H12 da imagem anterior, conferidas contra as especificações, decisões arquiteturais e código do repositório.

## 1. Resumo executivo

A imagem atual mostra tarefas da Sprint 4 ainda com estado “To Do”. A inspeção do repositório encontrou a maioria dos fluxos completos no worktree, mas identificou que a rota de API para corrigir rascunhos não tinha uma tela correspondente no painel. Essa lacuna foi implementada nesta revisão. O quadro externo não foi atualizado; seu status visual não representa o estado atual do código.

Nesta revisão foram concluídos a edição de dados do convite enquanto rascunho, a organização dos templates em `front/src/templates`, a correção do contrato do CSV e melhorias na validação de RSVP. A configuração do Vitest passou a descobrir testes TSX, e os testes do front aumentaram para cobrir os templates e a conversão de data e hora no fuso do projeto.

Os fluxos de produto das histórias e cartões do quadro estão implementados no código. O cartão de mock de API #194 não foi reproduzido como uma segunda API de runtime, pois o front já está integrado às rotas reais tipadas pelo contrato; esse mock era um apoio temporário ao desenvolvimento do front antes da integração. A revisão não atualiza o quadro externo, não cria commit e não altera as migrações do banco.

## 2. Plano de implementação aplicado

O trabalho foi organizado em etapas para preservar a divisão entre contrato, Apresentação, Domínio, Dados e Front:

1. **Inventariar o escopo:** identificar H01, H02, H05, H07, H08 e H10 no quadro atual, os cartões de fundação visíveis e as histórias H03, H04, H06, H09, H11 e H12 verificadas anteriormente.
2. **Conferir especificações e arquitetura:** mapear histórias, casos de uso, regras de negócio, contratos HTTP, ADRs e dependências entre os fluxos.
3. **Auditar o estado existente:** localizar rotas, serviços, repositórios, telas, estilos, contratos, documentação e testes já presentes; separar implementação efetiva de estado no quadro.
4. **Fechar os pré-requisitos de ponta a ponta:** garantir conta e sessão do anfitrião, criação do convite e resposta pública para que as histórias da imagem possam ser executadas.
5. **Ajustar as lacunas encontradas:** implementar a edição de dados do rascunho no painel, alinhar a organização dos templates com o pacote arquitetural, remover informação contraditória da documentação do contrato e reforçar a validação tipada de RSVP.
6. **Verificar a entrega:** executar build, lint, verificação de tipos, formatação e testes das workspaces; registrar as limitações de ambiente dos testes de integração.
7. **Documentar o resultado:** manter este relatório com o estado por tarefa, arquivos relevantes, decisões, testes e pendências.

## 3. Análise das tarefas da imagem

O estado “antes” abaixo descreve o que foi encontrado no código antes dos ajustes desta revisão. “Concluída” indica que o comportamento da tarefa estava presente no repositório, mesmo quando o cartão correspondente ainda aparecia como “To Do” na imagem.

| História / cartão | Estado encontrado antes desta revisão | Resultado após a revisão |
|---|---|---|
| **H01 — API de cadastro e entrada do anfitrião (#125)** | Cadastro e autenticação com Argon2id, validação e emissão de sessão já existiam. | Concluída; sem mudança funcional nesta revisão. |
| **H01 — API de saída e sessão atual (#126)** | Rotas de saída e leitura da sessão já existiam. | Concluída; sem mudança funcional nesta revisão. |
| **H01 — tela de entrada e cadastro (#127)** | A página inicial já permitia criar conta e entrar. | Concluída; sem mudança funcional nesta revisão. |
| **H02 — API de lista e criação do convite (#128)** | Listagem e criação de rascunho já existiam. | Concluída; sem mudança funcional nesta revisão. |
| **H02 — API de leitura e correção do rascunho (#129)** | A API já validava e atualizava os dados apenas enquanto rascunho. | Concluída; o fluxo existente passou a ter também formulário no painel. |
| **H02 — tela da lista, criação e correção (#140)** | A lista e o formulário de criação existiam, mas faltava a tela para corrigir os dados básicos de um rascunho. | Concluída nesta revisão: dados do evento, data, hora e limites são editáveis e salvos pela rota autenticada de atualização. |
| **H05 — API da publicação (#145)** | Publicação e despublicação autenticadas já existiam. | Concluída; sem mudança funcional nesta revisão. |
| **H05 — tela de compartilhamento, link e cópia (#146)** | O painel já exibia o link público e permitia copiá-lo quando publicado. | Concluída; sem mudança funcional nesta revisão. |
| **H07 — API da página do convite (#149)** | Leitura pública por token do convite já existia. | Concluída; sem mudança funcional nesta revisão. |
| **H07 — API da resposta do convidado (#150)** | Registro público de RSVP e geração do token pessoal já existiam. | Concluída; entrada agora passa por comando interno validado no Domínio, sem coerção de contrato no controller. |
| **H07 — página com formulário de resposta (#151)** | Formulário público permitia responder sem conta, com confirmação e link pessoal. | Concluída; sem mudança funcional de fluxo nesta revisão. |
| **H08 — limite de acompanhantes e teto de pessoas (#152)** | Validação individual e capacidade transacional já existiam na API/Dados. | Concluída; comportamento preservado. |
| **H08 — campo de acompanhantes e aviso de lotação (#153)** | O formulário já oferecia o número de acompanhantes; erros do domínio eram apresentados sem confirmar resposta falsa. | Concluída; comportamento preservado. |
| **H10 — observação alimentar na resposta (#156)** | Categorias, descrição de alergia e validação já existiam na API e no contrato. | Concluída; agora a validação tipada rejeita status e categorias fora do conjunto permitido. |
| **H10 — campo alimentar no formulário (#157)** | O formulário já permitia categorias opcionais e descrição de alergia. | Concluída; removida a coerção de tipo na lista de categorias da view. |
| **Fundação #25 — mock da API tipado pelo contrato (#194)** | O front já consumia a API implementada por meio do `ApiClient`; testes do `ApiClient` usam respostas mockadas, mas não existe servidor de mock completo por rota. | Considerado superado pela integração real da API e do contrato compartilhado; não foi adicionada uma segunda API de runtime. Caso o time queira mock para desenvolvimento offline, isso deve ser uma entrega explícita separada. |
| **H03 — personalizar convite** | A API já tinha catálogo de templates, validação de cores e limites de texto; o editor permitia seleção de template, alteração de cores e textos, salvamento e prévia ao vivo. | Concluída. O catálogo e editor permanecem; a renderização e CSS foram organizados em `front/src/templates`. |
| **H03 — templates HTML/CSS** | Havia variantes visuais em JSX e CSS global, mas a pasta `front/src/templates` descrita pela arquitetura não existia. | Concluída e alinhada à estrutura: componente `TemplateSet` e CSS estático dedicados, com variantes Clássico, Botânico e Moderno. |
| **H03 — tela do editor** | O painel já oferecia editor e prévia ao vivo, com retorno e salvamento da personalização. | Concluída; sem mudança de fluxo. |
| **H04 — prévia do convite** | A prévia já reutilizava o convite visual e o formulário público em modo demonstrativo/desabilitado; havia ação para retornar à edição. | Concluída; agora a renderização do convite utiliza o pacote comum de templates. |
| **H06 — API de publicação** | Rotas autenticadas de publicação e despublicação, geração/preservação do token público e validação dos dados do convite já existiam. | Concluída; comportamento preservado. |
| **H06 — ação no painel** | O painel já permitia publicar, copiar o link público e despublicar. | Concluída; comportamento preservado. |
| **H09 — API do link pessoal** | A API já criava token pessoal, consultava a resposta pelo token e aceitava atualização até o fim do dia do evento no fuso do projeto. | Concluída; a validação de entrada agora evita coerções de tipos antes da validação no Domínio. |
| **H09 — página do link pessoal** | A rota pessoal já mostrava a resposta, permitia edição dentro do prazo e apresentava o estado de prazo encerrado. | Concluída; comportamento preservado. |
| **H11 — API da lista de presença** | A consulta autenticada já devolvia respostas por status, acompanhantes e total de confirmados mais acompanhantes. | Concluída; comportamento preservado. |
| **H11 — atualização automática da lista** | O painel já consultava a API sem recarregar a página, a cada 15 segundos, com recuo progressivo após falhas. | Concluída; comportamento preservado. |
| **H12 — API da consolidação alimentar** | A API já devolvia contagens por categoria e descrições de alergia para o anfitrião autorizado. | Concluída; comportamento preservado. |
| **H12 — exportação CSV** | A API já exportava convidados “sim” e “talvez”, mesmo sem restrição alimentar; o CSV escapava campos e neutralizava prefixos de fórmula. | Concluída. A descrição do contrato agora corresponde ao comportamento especificado. |
| **H12 — tela de contagem e exportação** | O painel já apresentava contagens, descrições de alergias e botão de exportação quando havia respostas elegíveis. | Concluída; comportamento preservado. |

### 3.1 Pré-requisitos incluídos no fluxo

Além dos cartões da imagem, o fluxo precisava dos seguintes componentes, que também estão no código:

- Cadastro, entrada, saída e consulta de sessão do anfitrião.
- Criação e edição dos dados básicos do convite como rascunho.
- Página pública do convite e envio de RSVP sem conta.
- Acompanhantes, cinco categorias alimentares e texto obrigatório para descrição de alergia.
- Link público único para o convite e link pessoal para a resposta.

## 4. Modificações realizadas

### 4.1 Ajustes feitos nesta revisão

- Criado `front/src/templates/template-set.tsx` para centralizar o HTML/JSX estático dos três layouts de convite.
- Criado `front/src/templates/templates.css` com estilos próprios para Clássico, Botânico e Moderno.
- Atualizado `front/src/view/invite-card.tsx` para delegar a renderização ao `TemplateSet`, mantendo a mesma view compartilhada entre prévia, página pública e resposta pessoal.
- Atualizado `front/src/app/layout.tsx` para carregar os estilos dos templates.
- Removidos de `front/src/app/globals.css` os estilos do convite que passaram a pertencer ao pacote de templates.
- Atualizado `front/README.md` para refletir a organização efetiva dos templates.
- Corrigido o comentário do contrato `DietarySummary`: lista vazia de contagens significa ausência de restrições, mas não impede a exportação da lista de convidados elegíveis.
- Atualizados comentários em `contract/src/templates.ts` que descreviam o catálogo como provisório e apontavam para uma pasta inexistente.
- Introduzido o tipo interno `RsvpCommand`, com campos não confiáveis representados como texto até a validação do Domínio.
- Removidas coerções de tipo em `api/src/presentation/public/public-rsvp.controller.ts` e `front/src/view/guest-rsvp-form.tsx`.
- Eliminada validação de RSVP duplicada e não utilizada em `api/src/domain/rsvp.service.ts`.
- Adicionada ao painel a correção de dados do evento em rascunhos, incluindo nome, local, data, hora, teto de pessoas e limite de acompanhantes.
- Adicionada conversão explícita do instante ISO para os campos de data/hora em `America/Sao_Paulo`, com teste cobrindo a virada de dia.
- Acrescentado teste para rejeição de status e categoria alimentar desconhecidos.
- Acrescentados testes de renderização das três variantes de template.
- Atualizada a configuração do Vitest do Front para também descobrir arquivos `*.spec.tsx`; sem isso, o teste de template recém-adicionado não era executado.

### 4.2 Implementação funcional já presente no worktree

**API e persistência**

- `api/src/presentation/auth/`: endpoints de autenticação e gerenciamento da sessão.
- `api/src/presentation/authenticated/`: rotas autenticadas de convites, presença, consolidação e CSV.
- `api/src/presentation/public/`: leitura do convite e leitura/registro/alteração de RSVP.
- `api/src/domain/host.service.ts`: cadastro, autenticação e perfil do anfitrião.
- `api/src/domain/invite.service.ts`: validação e operações de criação, edição, personalização e publicação.
- `api/src/domain/rsvp.service.ts`: validação, prazo, tokens pessoais e respostas públicas.
- `api/src/domain/panel.service.ts`: lista de presença e consolidação alimentar.
- `api/src/data/host.repository.ts` e `api/src/data/dietary-category.repository.ts`: persistência de anfitriões e consulta do catálogo alimentar.
- `api/src/data/invite.repository.ts`: persistência de convites e transações de resposta, capacidade, presença e exportação.
- `api/src/presentation/authenticated/render-csv.ts`: serialização e proteção do conteúdo CSV.

**Front-end e contratos**

- `front/src/app/page.tsx`: entrada e cadastro do anfitrião.
- `front/src/app/dashboard/page.tsx`: criação, edição, personalização, prévia, compartilhamento, presença e consolidação.
- `front/src/app/i/[publicToken]/page.tsx`: página pública do convite.
- `front/src/app/r/[personalToken]/page.tsx`: consulta e edição da resposta pessoal.
- `front/src/view/guest-rsvp-form.tsx`: formulário de resposta e resumo pessoal.
- `front/src/templates/`: variantes visuais estáticas reutilizadas pelas páginas.
- `contract/src/templates.ts`, `contract/src/panel.ts` e `contract/src/errors.ts`: catálogo de templates, contratos do painel e regra de validação de máximo.

**Dependência**

- `argon2` foi adicionada a `api/package.json` e ao `package-lock.json` para armazenar senhas com Argon2id, conforme o ADR de autenticação.

### 4.3 Documentação atualizada na implementação anterior

- `README.md`: inicialização local, fluxo principal e estrutura do projeto.
- `api/README.md`: rotas, camadas, autenticação, limites e testes do banco.
- `front/README.md`: rotas, fluxo do painel, comunicação com a API e organização dos templates.

## 5. Regras de negócio e decisões preservadas

- Senhas são armazenadas com Argon2id; a sessão usa o cookie assinado existente.
- A validação de propriedade impede acesso do anfitrião a convites alheios.
- A personalização aceita somente template conhecido, papéis de cor previstos e cores no formato hexadecimal de seis dígitos.
- A recusa (`DECLINED`) é armazenada com zero acompanhantes e sem observação alimentar.
- A resposta pessoal pode ser consultada após a despublicação; novas respostas só podem ser criadas com convite publicado.
- O prazo de alteração considera o fim do dia do evento em `America/Sao_Paulo`.
- A capacidade de respostas “sim” é conferida em transação com bloqueio do convite; respostas “talvez” não ocupam capacidade conforme a regra documentada.
- A lista do painel agrupa “sim”, “talvez” e “não”; o total soma somente confirmados e seus acompanhantes.
- A consolidação alimentar considera respostas elegíveis e mantém descrições de alergia associadas ao nome do convidado.
- O CSV inclui convidados “sim” e “talvez” mesmo quando não informaram categorias; campos são escapados e valores que possam ser interpretados como fórmulas são neutralizados.
- Não foram alteradas as migrações nem removidas funcionalidades existentes.

## 6. Testes e validações

Executados no repositório:

| Verificação | Resultado |
|---|---|
| `npm run build` | Aprovado para `contract`, API e Front. |
| `npm run lint` | Aprovado. |
| `npm run typecheck` | Aprovado nas três workspaces. |
| `npm run format:check` | Aprovado. |
| `npm test` — API | 50 testes aprovados; 10 ignorados por dependerem de banco de integração. |
| `npm test` — Front, após ampliar o padrão de descoberta | 10 testes aprovados, incluindo as três variantes de template e a conversão de data/hora. |
| `git diff --check` | Aprovado, sem erros de whitespace no diff. |

Os testes novos cobrem rejeição de status/categorias não reconhecidos, renderização de cada variante do convite e conversão do instante do evento para os campos de edição no fuso do projeto. Os testes já existentes cobrem regras de RSVP, prazo de edição e escape/neutralização do CSV.

## 7. Limitações e itens fora do escopo executado

- **Banco de integração:** 10 testes da API foram ignorados porque `TEST_DATABASE_URL` não estava configurada e o Docker CLI não estava disponível. A persistência transacional precisa ser validada também contra PostgreSQL antes de uma entrega que exija certificação de banco.
- **Versão do Node:** o projeto declara Node `>=24 <25`; o ambiente de execução usava Node `22.19.0`. Os comandos passaram, mas a validação final de release deve ser repetida com Node 24.
- **Imagens Open Graph:** o ADR-0009 prevê imagem estática específica por template. Não foram encontrados esses arquivos nem metadados `og:image` na página pública durante a auditoria. Isso não impede os fluxos dos cartões da imagem, mas continua sendo uma pendência de aderência ao ADR para a prévia visual em mensageiros.
- **Quadro de tarefas:** a imagem apresenta cartões como “To Do”; o quadro externo não foi alterado nesta sessão. O estado deste relatório se refere ao código local.
- **Dependências:** uma instalação anterior reportou quatro vulnerabilidades altas. Não foi executado `npm audit fix` nem atualização não solicitada de dependências.
- **Entrega Git:** não foi criado commit.

## 8. Estado final

As funcionalidades do quadro atual H01, H02, H05, H07 e H08 e H10, além de H03, H04, H06, H09, H11 e H12 previamente analisadas, estão implementadas no código. Esta revisão fechou a lacuna de interface para correção de rascunho, alinhou o pacote dos templates à arquitetura, corrigiu a documentação contraditória do contrato, reforçou a validação tipada do RSVP e adicionou cobertura de testes para os novos elementos. O mock de runtime da tarefa #194 foi considerado substituído pelo backend real integrado.

As verificações de build, lint, tipos, formatação e testes unitários passaram. Permanecem as limitações de testes de banco, versão do Node e imagens Open Graph descritas acima.

## 9. Prompt de integração backend–front da nova versão

Em 24 de outubro de 2026, foi criado [`Prompt-Integracao-Backend-Front-Main.md`](Prompt-Integracao-Backend-Front-Main.md) para orientar a implementação da API consumida pelo front da nova versão de `main`. O prompt reúne um checklist verificável por fluxo, rotas, método HTTP, contrato, autenticação, resposta, regra de negócio, segurança e validação.

O checklist cobre:

- autenticação e ciclo de sessão do anfitrião;
- criação, leitura, edição, personalização, publicação e despublicação de convites;
- leitura pública do convite, registro de RSVP e consulta/edição por token pessoal;
- lista de presença, consolidação alimentar e exportação CSV;
- compatibilidade entre chamadas do front, `@invite-app/contract`, erros, datas, cookies, CORS e política de repetição;
- testes de domínio e integração, build, lint, typecheck e registro explícito de limitações.

O prompt estabelece como restrições preservar o código e as alterações locais existentes, não reduzir ou simplificar funcionalidades sem necessidade demonstrada, manter as camadas e boas práticas, e inspecionar a implementação atual antes de marcar qualquer item como ausente. A execução e o resultado da comparação estão registrados na seção seguinte.

## 10. Compatibilidade com o front da nova versão de `main`

### Resultado da comparação

As chamadas de rede efetivamente encontradas no front-alvo foram comparadas com os controllers e contratos do backend. Os métodos e caminhos de autenticação, painel, RSVP público, resposta pessoal, presença e consolidação alimentar já coincidiam. Os formatos principais dos DTOs e do envelope de erro também são compatíveis; não foi necessário criar rotas, mocks ou alterar o esquema do banco.

Foi identificada uma incompatibilidade real no catálogo de personalização: o front-alvo envia os templates `classic`, `garden` e `night`, com papéis de cor `primary` e `accent`, enquanto o catálogo da versão atual do contrato oferece `classic`, `botanical` e `modern`, com papéis `primary`, `background` e `text`. Além disso, o front-alvo permite nome de evento com até 80 caracteres na criação, mas a validação da API limitava a 60. O ajuste preserva ambos os conjuntos: a API aceita os códigos e papéis antigos além dos atuais, mantém os limites de 60 caracteres dos templates atuais na personalização e aplica o teto geral compartilhado de 80 caracteres na criação e nos templates antigos.

### Checklist por fluxo

| Fluxo | Status | Evidência |
|---|---|---|
| Autenticação e sessão do anfitrião | Já compatível | Rotas em `api/src/presentation/auth/auth.controller.ts`; cookie, sessão, CORS e erros em `api/src/presentation/common/`; formato de resposta e credenciais coincidem com `contract/src/auth.ts` e com o cliente do front-alvo. |
| Convites do anfitrião | Ajustado | Rotas e ownership já coincidiam em `api/src/presentation/authenticated/invite.controller.ts` e `api/src/domain/invite.service.ts`. O limite de criação agora usa o teto compartilhado de 80; a validação de templates foi ampliada em `api/src/domain/template-catalog.ts`. |
| Convite público e RSVP | Já compatível | Rotas em `api/src/presentation/public/public-rsvp.controller.ts`; regras de RSVP, capacidade transacional, prazo, resposta pessoal e privacidade em `api/src/domain/rsvp.service.ts` e `api/src/data/invite.repository.ts`. |
| Presença, consolidação e CSV | Já compatível | Consultas autenticadas em `api/src/presentation/authenticated/invite.controller.ts` e `dietary.controller.ts`; ownership em `api/src/domain/panel.service.ts`; escape e neutralização de fórmulas em `api/src/presentation/authenticated/render-csv.ts`. |
| Contratos e cliente HTTP | Ajustado | Corpos e respostas de API mantêm os campos consumidos pelo front. A validação de personalização agora aceita ambos os catálogos; as diferenças aditivas locais em `DietaryExportRow` e `ValidationRule.MaxValue` não removem campos usados pelo front-alvo. |

### Arquivos alterados nesta implementação

- `api/src/domain/invite.service.ts`: alinha o teto de nome de evento na criação ao limite compartilhado de 80 caracteres e consulta o catálogo compatível ao validar personalização.
- `api/src/domain/template-catalog.ts`: acrescenta suporte no domínio aos templates `garden` e `night` e aos papéis legados de cor de `classic`, sem retirar os templates atuais.
- `api/src/domain/invite.service.spec.ts`: cobre limite de 80 caracteres, os cinco templates atualmente/legadamente aceitos, os papéis de cor e a rejeição de templates/papéis desconhecidos.
- `api/README.md`: documenta o suporte aos catálogos e limites.
- `README.md`: informa a compatibilidade e aponta para a documentação da API.
- `docs/Relatorio-de-Implementacao-Funcionalidades.md`: registra a comparação, mudanças e validação.

### Validação executada

| Comando/checagem | Resultado |
|---|---|
| `npm test --workspace api` | Aprovado: 57 testes; 10 ignorados por dependerem de PostgreSQL. |
| `npm test` | Aprovado na execução sem concorrência: API 57 aprovados e 10 ignorados; Front 10 aprovados. Uma execução simultânea ao build teve timeout transitório em `tokens.spec.ts`; a repetição completa passou. |
| `npm run build --workspace api` | Aprovado. |
| `npm run build` | Aprovado na segunda execução; contract, API e front compilados. A primeira execução foi interrompida pelo aviso de segurança do Next.js. |
| `npm run typecheck` | Aprovado nas workspaces contract, API e front. |
| `npm run lint` | Aprovado. |
| `npm run format:check` | Aprovado. |
| `git diff --check` | Aprovado, sem erros de whitespace. |

### Limitações e acompanhamento

- Os 10 testes de integração PostgreSQL não executaram: `TEST_DATABASE_URL` não estava definida e, embora o Docker CLI esteja instalado, o daemon não estava disponível. As regras transacionais foram inspecionadas e os testes existentes permanecem pendentes de execução contra PostgreSQL real.
- O ambiente usa Node `22.19.0`, mas o projeto declara Node `>=24 <25`; recomenda-se repetir build e testes de release com Node 24.
- O build inicial reportou que Next.js 16.4.0 estava afetado por uma vulnerabilidade conhecida. A pedido do usuário, a versão de segurança já adotada em `origin/main` (16.4.3, commit `5efb3bf`) foi incorporada cirurgicamente ao manifesto e lockfile deste checkout; não foram mescladas as demais mudanças de interface do commit. A opção de configuração `experimental.agentUpgrade` não existe no Next.js 16.4.3 instalado e foi omitida. O build da versão atualizada passou.

## 11. Incorporação da atualização de segurança do Next.js

Em 25 de outubro de 2026, foram atualizados `front/package.json` e `package-lock.json` para Next.js `16.4.3` e `@next/eslint-plugin-next` `16.4.3`, alinhando este checkout à atualização já presente em `origin/main` no commit `5efb3bf`. A atualização foi feita sem cherry-pick/merge desse commit, pois ele também inclui alterações independentes de front que não fazem parte do pedido. `README.md` e este relatório foram atualizados para registrar a versão.

O parâmetro de configuração `experimental.agentUpgrade: "security"` solicitado pelo fluxo automatizado de upgrade não foi configurado: a opção não aparece na configuração/tipos da versão 16.4.3 e a build aprovada confirma que o arquivo existente segue aceito sem ela.

| Validação após a atualização | Resultado |
|---|---|
| `npm ls next @next/eslint-plugin-next --workspace @invite-app/front` | `next@16.4.3` e `@next/eslint-plugin-next@16.4.3`. |
| `npm run build` | Aprovado; contract, API e front compilados com Next.js 16.4.3. |
| `npm test` | Aprovado; API 57 testes aprovados/10 ignorados (PostgreSQL); Front 10 aprovados. |
| `npm run typecheck` | Aprovado nas workspaces contract, API e front. |
| `npm run lint` | Aprovado. |
| `npm run format:check` | Aprovado. |

O daemon do Docker e `TEST_DATABASE_URL` continuam indisponíveis neste ambiente, portanto os testes de integração com PostgreSQL permanecem pendentes. O Node usado foi `22.19.0`, enquanto o repositório recomenda Node 24. A instalação de dependências reportou duas vulnerabilidades moderadas restantes; esta alteração tratou somente a atualização crítica do Next.js e não executou `npm audit fix` para evitar mudanças fora de escopo.

## 12. Validação no Node 24

Em 26 de outubro de 2026, foi instalado o Node.js `24.22.1` LTS pelo WinGet oficial do projeto Node.js. O npm ativo é `11.19.1`, e o executável está em `C:\Program Files\nodejs\node.exe`, atendendo ao intervalo `>=24 <25` declarado pelo repositório. A atualização do ambiente não alterou dependências nem código da aplicação.

| Validação no Node 24 | Resultado |
|---|---|
| `node --version` / `npm --version` | `v24.22.1` / `11.19.1`. |
| `npm run build` | Aprovado; contract, API e front compilados. |
| `npm run typecheck` | Aprovado nas workspaces contract, API e front. |
| `npm run lint` | Aprovado. |
| `npm run format:check` | Aprovado. |
| `npm test` | Aprovado; API: 57 testes aprovados e 10 ignorados; Front: 10 aprovados. |
| `git diff --check` | Aprovado; sem erros de whitespace no diff. |

Os 10 testes ignorados continuam sendo testes de integração com PostgreSQL: não havia `TEST_DATABASE_URL` configurada e o daemon Docker não estava disponível. As declarações anteriores desta seção 11 registram corretamente o ambiente usado naquela validação; foram superadas pela execução acima no Node 24. Nenhuma inconsistência que exigisse mudança adicional de código foi revelada por build, testes, lint, tipos ou formatação.
