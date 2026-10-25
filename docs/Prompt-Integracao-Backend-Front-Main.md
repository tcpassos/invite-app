# Prompt de implementação: integrar o backend atual ao front de `main`

Copie o prompt abaixo para a ferramenta/agente que fará a implementação. O objetivo é
integrar o backend da branch atual ao front da nova versão de `main`, usando o contrato
compartilhado como referência. A implementação deve partir do estado real do repositório
no momento em que o prompt for executado; não presuma que este checklist substitui a
inspeção do código.

---

## Prompt

Implemente e valide a compatibilidade do backend deste repositório com o front da nova
versão de `main` fornecido pelo solicitante.

### Contexto e fontes de verdade

1. Antes de alterar qualquer arquivo, inspecione a branch atual, o estado do worktree,
   os contratos em `contract/`, todas as chamadas HTTP do front-alvo e os controllers,
   serviços, repositórios, migrações e testes correspondentes do backend.
2. Considere o código do front-alvo e os tipos de `@invite-app/contract` como o contrato
   de integração. Mapeie cada chamada real do front para a rota, método, autenticação,
   corpo e resposta correspondentes.
3. O backend atual já contém camadas de Apresentação, Domínio e Dados, regras de
   negócio, sessões, limites de taxa, persistência e fluxos de RSVP. Verifique o que
   existe antes de concluir que algo falta. Preserve e complete essa implementação;
   não a substitua por mocks nem a reescreva apenas para coincidir com este checklist.
4. Preserve todas as alterações preexistentes no worktree. Não reverta, sobrescreva ou
   simplifique código não relacionado. Em caso de conflito entre mudanças locais e a
   implementação, pare e relate o conflito em vez de descartá-las.

### Restrições obrigatórias de implementação

- Não diminua, simplifique, remova ou contorne código e comportamentos existentes, salvo
  quando uma mudança estritamente necessária para a compatibilidade for demonstrada.
- Não deturpe nem relativize a arquitetura: mantenha dependências na direção
  Apresentação → Domínio → Dados, reaproveite serviços e repositórios existentes e
  mantenha regras de negócio fora dos controllers.
- Não introduza endpoints de sucesso simulados, respostas padrão que escondam falhas,
  catches amplos, validação silenciosa ou retornos falsos de sucesso.
- Mantenha TypeScript estrito, tipos compartilhados, validação explícita de entrada,
  tratamento padronizado de erros, logging/correlação, autenticação, autorização,
  limites de taxa e transações.
- Não altere contratos públicos ou esquema/migrações sem necessidade comprovada.
  Quando necessário, mantenha a mudança compatível com o front e atualize os testes e a
  documentação diretamente relacionada.
- Não exponha hashes de senha, tokens pessoais, respostas de outros convidados ou dados
  privados nas respostas públicas.
- Siga os padrões existentes de nomeação, formatação, testes e documentação. Não adicione
  dependências sem necessidade.

### Checklist de compatibilidade por fluxo

Compare cada item com a implementação existente. Marque-o como **já compatível**,
**ajustado** ou **pendente**, com referência a arquivos/testes e evidência; implemente
somente os ajustes necessários.

#### A. Autenticação e sessão do anfitrião (UC001)

- [ ] `POST /auth/sign-up`: recebe `SignUpRequest` (`name`, `email`, `password`),
  valida regras, cria anfitrião, emite cookie de sessão e retorna `HostProfile`
  (`name`, `email`), nunca o hash.
- [ ] `POST /auth/sign-in`: recebe `SignInRequest`, autentica sem revelar se email ou
  senha falhou, aplica rate limit e emite cookie.
- [ ] `POST /auth/sign-out`: apaga o cookie e responde `204 No Content`.
- [ ] `GET /auth/session`: requer sessão válida e retorna `HostProfile`; sessão ausente
  ou inválida responde erro `UNAUTHENTICATED` no formato compartilhado.
- [ ] Verifique atributos do cookie, CORS/origem e `credentials: 'include'` do cliente
  do front em execução local e na configuração de deploy.

#### B. Convites do anfitrião (UC002–UC004)

- [ ] `GET /invites`: retorna somente convites do anfitrião autenticado, no formato
  `InviteSummary[]`.
- [ ] `POST /invites`: aceita `CreateInviteRequest` com `eventName`, `eventDate`,
  `eventTime`, `location`, `peopleLimit` e `companionLimit`; retorna `InviteDetails`.
- [ ] `GET /invites/:inviteId`: retorna detalhes e personalização padrão ou salva,
  sem permitir acesso a convite de outro anfitrião.
- [ ] `PUT /invites/:inviteId`: atualiza apenas rascunho, com os mesmos campos e regras
  de criação; respeita `peopleLimit` e `companionLimit`.
- [ ] `PUT /invites/:inviteId/customization`: aceita `templateCode`, `colorOverrides`,
  `eventName` e `location`; valida catálogo, papéis/cores e limites textuais; retorna
  detalhes atualizados.
- [ ] `POST /invites/:inviteId/publish`: publica um convite válido, emite ou preserva
  `publicToken` e retorna `PublishInviteResponse`.
- [ ] `POST /invites/:inviteId/unpublish`: despublica somente convite do anfitrião e
  retorna `UnpublishInviteResponse`.
- [ ] Para todas as rotas autenticadas, confira método, códigos HTTP, corpo de resposta,
  ownership, estados permitidos e códigos de erro que o front trata.

#### C. Convite público e resposta do convidado (UC005–UC006)

- [ ] `GET /public/invites/:publicToken`: retorna apenas convite publicado como
  `PublishedInvite`, incluindo `eventName`, `eventStartsAt`, `location`,
  `companionLimit`, `customization` e `dietaryCategories`; token inválido, convite em
  rascunho ou despublicado não deve revelar estados diferentes.
- [ ] `POST /public/invites/:publicToken/rsvp`: aceita `RsvpRequest`, valida nome,
  situação, acompanhantes, categorias e descrição de alergia; responde com
  `RsvpResult` contendo `personalToken` e status HTTP coerente com o cliente.
- [ ] `GET /public/responses/:personalToken`: retorna `GuestResponsePage`, incluindo
  resposta e campo `editable`, sem expor respostas alheias.
- [ ] `PUT /public/responses/:personalToken`: permite alterar somente a resposta
  vinculada ao token pessoal e somente até o prazo definido pelo contrato/regra do
  projeto; retorna `GuestResponsePage` atualizado.
- [ ] Confirme que `DECLINED` persiste zero acompanhantes e remove observações; que a
  capacidade é aplicada de forma atômica; e que `MAYBE` segue a regra de lotação
  documentada.
- [ ] Preserve rate limits, ordem de verificação que não permita inferir existência de
  tokens e cabeçalhos de cache privados nas leituras que contêm dados pessoais.

#### D. Painel de presença e consolidação alimentar (UC007–UC008)

- [ ] `GET /invites/:inviteId/attendance`: retorna `AttendanceList` (`guests`,
  `totalPeople`) somente ao anfitrião dono do convite, respeitando ordenação e regra de
  total de pessoas.
- [ ] `GET /invites/:inviteId/dietary-summary`: retorna `DietarySummary` (`counts`,
  `descriptions`) de acordo com as situações elegíveis e sem descrições inventadas.
- [ ] `GET /invites/:inviteId/dietary-notes.csv`: entrega CSV baixável com cabeçalhos e
  colunas esperados pelo front, escape correto de CSV, neutralização de fórmulas,
  `Content-Disposition` e `Cache-Control` privados.
- [ ] Confirme autorização de ownership nas duas consultas e na exportação; respostas
  vazias devem ter formato válido, sem esconder falhas de persistência.

#### E. Compatibilidade do contrato e do cliente HTTP

- [ ] Compare estruturas e nomes de todos os DTOs consumidos pelo front com
  `contract/src/`, incluindo `HostProfile`, `CreateInviteRequest`,
  `CustomizeInviteRequest`, `InviteDetails`, `PublishedInvite`, `RsvpRequest`,
  `GuestResponsePage`, `AttendanceList`, `DietarySummary` e erros.
- [ ] Confira enums/status, nulabilidade, datas ISO 8601, campos opcionais e valores
  nulos; não use `any` nem casts que ocultem incompatibilidades.
- [ ] Garanta o envelope de erro `{ code, message, traceId, details? }`, os códigos
  esperados pelo cliente e seus status HTTP; mensagens não devem carregar dados
  sensíveis.
- [ ] Confira que retries do cliente não podem duplicar RSVP, atualização ou operações
  não idempotentes; preserve a política de repetição já definida pelo front.
- [ ] Verifique prefixo global, URL base, `Content-Type`, `Accept`, cookies, CORS e
  `X-Request-Id` quando aplicável, sem criar caminhos paralelos à API existente.

### Testes e critérios de conclusão

- [ ] Acrescente/ajuste testes unitários para cada regra de domínio alterada e testes de
  controller/contrato para rotas, métodos, códigos HTTP e formatos de resposta.
- [ ] Cubra pelo menos: autenticação ausente, convite de outro anfitrião, estados de
  publicação, entrada inválida, alergia sem descrição, recusa com acompanhantes,
  limite de acompanhantes, concorrência/capacidade, prazo do token pessoal, resumo
  vazio e exportação CSV com conteúdo potencialmente interpretado como fórmula.
- [ ] Rode os comandos de build, lint, typecheck e testes definidos pelo repositório.
  Rode os testes de integração com PostgreSQL se disponíveis; se não forem executáveis,
  registre precisamente a limitação sem alegar aprovação.
- [ ] Verifique o diff para confirmar que alterações preexistentes foram preservadas,
  que nenhuma simplificação não solicitada ocorreu e que a documentação acompanha as
  mudanças.
- [ ] Atualize `README.md` com as instruções ou informações de uso que realmente
  mudarem, mantendo-o conciso e sem documentar como concluído o que não foi validado.
- [ ] Atualize `docs/Relatorio-de-Implementacao-Funcionalidades.md` com o resultado desta
  integração: arquivos alterados e a finalidade de cada alteração, decisões, itens do
  checklist concluídos/pendentes e resultados reais dos testes. Preserve as seções e o
  histórico já existentes no relatório.
- [ ] Ao concluir, entregue: resumo dos ajustes efetivamente necessários; tabela do
  checklist com status e referências; arquivos alterados; comandos executados e
  resultados; limitações restantes. Não marque como implementado um item apenas por
  estar descrito aqui.

---

## Resultado a preencher após a implementação

Este espaço é intencionalmente um modelo. O agente que executar o prompt deve registrar
os resultados observados e não preencher status por suposição.

| Fluxo | Status (já compatível / ajustado / pendente) | Evidência (arquivos e testes) |
|---|---|---|
| Autenticação e sessão | A preencher | A preencher |
| Convites do anfitrião | A preencher | A preencher |
| Convite público e RSVP | A preencher | A preencher |
| Presença e consolidação alimentar | A preencher | A preencher |
| Contrato e cliente HTTP | A preencher | A preencher |
