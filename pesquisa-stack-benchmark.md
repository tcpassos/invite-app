# Benchmark de stack, plataformas de convite e RSVP

> Levantamento feito em 13/09/2026 sobre 19 produtos equivalentes, em 4 grupos sem sobreposicao:
> consolidados americanos (Paperless Post, Evite, Greenvelope), modernos (Partiful, Luma, RSVPify),
> brasileiros (convite.in, Convitin, FestaLab, iCasei, VouTb, RSVP.com.br) e plataformas de evento
> adjacentes (Eventbrite, Punchbowl, Splash).
> Evidencia de superficie: cabecalho HTTP, HTML bruto, bundle JavaScript, formato de URL, robots.txt.
> Fica so no GitHub, nao vai para a wiki.

# Recomendação final de arquitetura, invite-app

Base: quatro levantamentos independentes, dezenove produtos, quatro conjuntos de concorrentes sem nenhuma sobreposição entre eles (americanos consolidados, americanos modernos, brasileiros, plataformas de evento). Isso importa para ler o resto: quando os quatro chegam à mesma conclusão partindo de produtos diferentes, o achado é forte. Quando só um grupo viu uma coisa, é um dado, não um padrão.

---

## 1. O QUE O MERCADO CONFIRMA

### 1.1 Convite público renderizado no servidor. Confirmação mais forte de todo o levantamento.

Onze dos dezenove produtos tiveram o SSR verificado no HTML bruto ou em cabeçalho HTTP, não inferido de framework. Paperless Post (o `__NEXT_DATA__` de um id inválido já chega com `fetchError` 404 embutido, o que prova fetch no servidor), Evite (template Django), Greenvelope (908 atributos `data-bind` já no HTML antes do Knockout ligar), Partiful e Luma (`x-matched-path`, `__N_SSP`, `gip:true`, `og:title` com o nome real do evento na origem), FestaLab (`h1` com o nome no HTML inicial), convite.in, iCasei, Eventbrite, Splash, Punchbowl.

O que torna isso conclusivo é a diversidade das bases. Esses onze atendem o mesmo requisito com pelo menos oito tecnologias de servidor diferentes: Next.js, Django, ASP.NET, Rails, Java com JSP, PHP com Symfony, Laravel, CodeIgniter. Não é moda de framework, é exigência do produto.

E existe a prova por contraste. O RSVPify é o único que entrega a página pública como SPA (Nuxt com `serverRendered:false`, casca de 13 KB com spinner), e por isso o Laravel dele precisa injetar as metatags Open Graph à parte só para o robô não ver página vazia. Quem tentou não fazer SSR teve que reconstruir o efeito do SSR por outro caminho.

Uma correção no nosso argumento: o mercado faz isso por SEO, prévia de link e velocidade no celular. O nosso convite é privado, então SEO não vale para nós e sobram os outros dois. O ADR precisa dizer isso, senão importamos uma justificativa que não é nossa.

**O que fica confirmado é o requisito (HTML pronto na primeira resposta), não o Next.js.** O Next.js é a resposta moderna mais comum a esse requisito, verificada em cinco produtos, e em dois deles (Eventbrite e Punchbowl) foi exatamente a rota pública de leitura que empresas com monólito antigo migraram para Next, deixando o resto onde estava. Isso é convergência independente sobre a nossa rota mais importante.

### 1.2 Identificador público em coluna separada da chave primária.

Confirmado por padrão e, melhor ainda, por quatro modos de falha documentados de quem não fez.

O desenho que propomos é literalmente o do Luma: id interno prefixado no estilo Stripe (`evt-NxqCyxnwSPwREGa`), gerado por função no Postgres, e o identificador público morando num campo próprio chamado `url` (valor observado `eovuod6f`). É a nossa decisão, vista em produção.

Os contraexemplos valem mais que a confirmação, e devem entrar na defesa:

- **Greenvelope** usa o mesmo valor para as duas coisas, só disfarçado. O `/card/.public-<hex>` tem o id inteiro do evento em hex-ASCII, decodificado em cinco tentativas (`31383831303334` vira 1881034).
- **Punchbowl** expõe ObjectID do MongoDB. Vinte e três deles foram extraídos da própria home e decodificados campo a campo. Três compartilham timestamp e prefixo de processo, variando só o contador. Expor o identificador interno entregou a tecnologia de persistência sem ninguém atacar nada.
- **Partiful** expõe o auto-ID do documento do Firestore direto na URL, o que acopla o endereço público ao banco para sempre.
- **Eventbrite** usa inteiro monotônico de 13 dígitos (12 ids reais coletados, de 1222103026049 a 1999060364363), o que permite medir volume e ordem de criação de eventos.

Coluna separada corta os quatro de uma vez, e é o que permite trocar token, revogar link e despublicar sem tocar em chave estrangeira, que é o que o UC004 fluxo alternativo A2 pede.

### 1.3 Descarte do UUIDv7.

Sustentado por dois tipos de evidência independentes. Primeiro, análise estatística de prefixo: 612 tokens do Paperless Post e 519 da Evite mostram faixa de prefixo estática de 2013 a 2026, sem deriva temporal. Os dois players que fazem token aleatório se dão ao trabalho de garantir que o prefixo não avance com o tempo. Segundo, o decode dos ObjectIDs da Punchbowl é a demonstração prática do que um prefixo temporal entrega: data de criação (`5f763265` virou 2020-10-01 19:47:49) e ordem de criação pelo contador. UUIDv7 tem exatamente essa propriedade por desenho.

### 1.4 Separar o convite público do painel do anfitrião.

Todos separam, em caminho, em host ou atrás de login: `/sistema/` no convite.in, `painel.icasei.com.br`, `/log-in/` no Convitin, `pages/manage` no Paperless Post, `app.splashthat.com` na Splash. Isso sustenta o ADR-0001, duas Views sobre o mesmo Model.

Ressalva honesta que muda o nosso vocabulário: **o que se confirma é a separação de responsabilidade, não a separação de processo, e muito menos "painel como SPA pura"**. O Paperless Post entrega `pages/manage` dentro do mesmo Next. A Punchbowl serve `/partypage/`, `/signin`, `/account` e `/dashboard` no mesmo app Next com App Router, confirmado por `X-Powered-By` nas quatro rotas. Como já vamos rodar Next, chamar o painel de SPA é escolha de palavra e não de arquitetura.

### 1.5 Monólito em vez de microsserviços.

Seis de seis back-ends identificados no mercado brasileiro são monólitos com sessão de framework (Rails no FestaLab e iCasei, Java sobre Tomcat no convite.in, WordPress no Convitin, CodeIgniter no VouTb, Laravel no RSVP.com.br). Nenhum sinal de gateway ou de subdomínio de serviço. E não é imaturidade, porque o convite.in mantém a base Java ativa com release datada deste mês. Isso confirma as três camadas lógicas empacotadas em uma imagem de API.

---

## 2. O QUE O MERCADO CONTESTA

### 2.1 Contradição interna do ADR-0002. Lição, e é a mais barata de todas.

Os quatro grupos apontaram isso de forma independente, o que não aconteceu com nenhum outro item. Fui verificar o texto e é real. A tabela do ADR-0002, com status Aceita, diz:

| Tier | Conteúdo |
|---|---|
| Front | Aplicação de interface servida estaticamente |

Next.js com SSR não é conteúdo estático. É um processo Node vivo respondendo requisição a requisição, com variável de ambiente apontando para o serviço da API na rede do compose, healthcheck próprio e ordem de subida. Nenhum dos dezenove produtos serve página de convite como arquivo em disco. A Eventbrite roda OpenNext (`x-opennext: 1`), a Punchbowl roda Node atrás de nginx, os dois com resposta gerada por servidor.

Isso não é divergência de mercado, é erro nosso, e ele aparece direto no diagrama de implantação, que é artefato avaliado. Pior: o próprio ADR-0002 registra no contexto que confundir camada com tier foi um erro corrigido antes. Deixar este passar custa credibilidade no resto.

**Correção:** trocar a linha para "Servidor de renderização (processo Node) e ativos estáticos", e acrescentar nas consequências negativas que agora existem dois saltos de rede no caminho do convite, e não um.

### 2.2 Server-Sent Events. Lição, mas a lição é sobre o requisito, não sobre o transporte.

Nenhum dos dezenove usa SSE. Zero. E a busca foi feita com cuidado: varredura de bundles do Paperless Post e da Evite deu zero em `ws://`, `wss://`, Pusher, socket.io, ActionCable e EventSource, com dois falsos positivos derrubados honestamente (a string `ably` era a palavra "probably" num texto de exemplo, e `EventSource` aparecia numa lista de globais do DOM carregada pelo Sentry). Nos 698 KB de bundle Rails da Punchbowl, zero em todos os termos. No FestaLab existe cliente ActionCable, mas vem de fábrica com o Turbo e `/cable` responde 404, o que indica que não está montado.

Quatro produtos têm tempo real confirmado, e os quatro compraram pronto do que já usavam: Greenvelope com SignalR sobre WebSocket (`/signalr/negotiate` devolvendo `TryWebSockets: true`), Luma com Centrifugo (`wss://cent.luma.com`), RSVPify com Laravel Echo sobre Ably e Reverb, Partiful com o transporte do Firestore (que, vale a precisão, é streaming sobre HTTP, mais parente do SSE que do WebSocket). Ninguém implementou transporte próprio.

**Onde nós erramos:** respondemos a segunda pergunta sem responder a primeira. O UC007, Visualizar lista de presença, é uma consulta. Não tem pós-condição e não menciona atualização automática em lugar nenhum. A única menção a tempo real nos nossos artefatos está na pesquisa de mercado, como padrão de UX, e nunca virou caso de uso. RSVP chega alguns por hora no pico do disparo, não alguns por segundo, e o anfitrião não fica olhando o painel.

**O que é ruído aqui:** a briga SSE contra WebSocket. Os quatro produtos com tempo real escolheram o caminho nativo da plataforma deles, o que não diz nada sobre a nossa. Se mantivermos SSE, a defesa é técnica e própria (fluxo unidirecional do servidor para o painel, reconexão automática pelo navegador, sem upgrade de protocolo, e o Nest suporta nativamente com `@Sse()` retornando Observable). Não é gambiarra. Só não pode ser vestida de alinhamento com o mercado, porque não é.

### 2.3 Link único por convite. Lição direta, e a mais cara do levantamento.

Três dos quatro grupos levantaram isso, e é a única contestação que quebra um requisito que nós mesmos já escrevemos.

O mercado que promete algo por convidado emite identidade por convidado. Paperless Post acrescenta um segundo segmento, `/go/<token>/pp_g/<40 hex>`, e 353 de 354 tokens de convidado têm exatamente 40 hex. Isso permite sub-rotas como `/rsvp?response=attending`, ou seja, RSVP em um clique, sem formulário e sem login. O convite.in emite `/{slug-evento}/{slug-convidado}/{token7}` e reusa o mesmo token no QR de check-in, em caixa alta. Partiful pede nome e telefone e confirma por código SMS, ou seja, "sem cadastro" nunca significou "sem identificação". RSVPify anexa `securityToken` de 32 caracteres.

Quem usa link único (FestaLab, iCasei, Luma) não promete consolidação por convidado. O modelo deles é coerente com o que vendem. O nosso não é.

Três coisas que prometemos e que não fecham hoje:

1. **RN3 do UC005 / H09**, o convidado altera a resposta enquanto o evento não ocorreu. Não existe mecanismo. O sistema não sabe quem voltou. Cookie resolve mal e quebra quando a pessoa abre no celular e depois no computador, que é o caso comum de quem recebe link por WhatsApp.
2. **ED2 do UC008**, uma linha por convidado para o buffet. Vale o que valem nomes autodeclarados, sem deduplicação possível.
3. **A observação alimentar por convidado**, que é o diferencial central segundo a Visão do Produto, pendurada numa string de nome livre.

O custo de adotar é uma tabela de convidado com token próprio, gerada quando o anfitrião cadastra a lista. Não é caro, mas muda o modelo de domínio e por isso precisa ser decidido agora.

### 2.4 Front e API como tiers separados, com SSR atravessando a rede. Metade lição, metade ruído.

Dois grupos contestam, um apoia. Precisa de leitura cuidadosa porque os dois lados estão falando de coisas diferentes.

O que **apoia**: Luma, Partiful e RSVPify têm host de API separado (`api.luma.com`, `api.partiful.com`, `api.rsvpify.com`). Três de três.

O que **contesta**: no Rails do FestaLab e do iCasei, no Java do convite.in, no Django da Evite e no ASP.NET do Greenvelope, quem renderiza o HTML é o mesmo processo que fala com o banco. Colocamos um salto de rede a mais no caminho crítico da página mais lida do sistema.

**Ruído que precisa ser descartado:** o Paperless Post separa, mas é uma camada GraphQL em Node sobre um monólito Rails que continua vivo, com Envoy de service mesh e Fastly na frente. Isso é escala e tamanho de time. E a separação da Eventbrite e da Splash não é desenho de partida, é cicatriz de migração. Os dois estrangularam um monólito antigo migrando primeiro a rota de leitura pública. Citar isso como prova de que público e painel devem ser tiers distintos é ler a evidência ao contrário. A Punchbowl, que fez a migração mais recente, unificou tudo num app Next só.

**Decisão:** manter a separação, porque o motivo dela é nosso e não do mercado. Separar Front e API torna os tiers do ADR-0002 visíveis e o diagrama de implantação real, e o compose vira a forma executável do diagrama, que é exatamente o que o ADR já argumenta. Isso se defende sozinho. O que não se pode dizer é que é o padrão do segmento. Não é. E a consequência assumida precisa estar escrita: se o Next decide layout e renderiza, a camada de Apresentação ficou partida em dois containers.

### 2.5 NestJS. Lição limitada, o resto é ruído.

Zero dos dezenove usa NestJS. Node aparece no back-end de negócio em apenas dois (Luma com Koa, Partiful com Cloud Functions), e o cofundador do Luma explicou a escolha do Koa por ser o framework mais enxuto possível. Nos outros, Node aparece exclusivamente como processo que serve Next.js. A Eventbrite está migrando para Kotlin, que é sinal na direção contrária.

**Ruído:** a linguagem dessas empresas é dependência de caminho, dez anos ou mais de código, não julgamento técnico contra Node. Três empresas não são o mercado, e a amostra não condena o Nest.

**Lição que sobra, e é suficiente para mudar o texto do ADR:** a justificativa do NestJS não pode se apoiar em popularidade no segmento, porque nele ele não aparece. A justificativa boa é interna e existe: quatro integrantes com experiência desigual em duas sprints, e o Nest impõe por estrutura de pastas e por injeção de dependência a separação em três camadas que o ADR-0001 declara inegociável. Com Koa ou Express a mesma separação existiria só no papel e dependeria de disciplina de time, que o Team Charter já lista como risco. Esse argumento é mais forte que qualquer apelo a mercado.

### 2.6 Token de 128 bits em base64url. Duas contestações, nenhuma de segurança.

**O alfabeto é lição, e é de graça.** O Paperless Post usa base62 sem o O maiúsculo, e o O não aparece uma única vez em 12.721 caracteres analisados, o que é conclusivo. O encurtador evite.me não mostra 0, O, I nem l. Base64url inclui todos esses, mais hífen e underscore. É o pior alfabeto possível para algo que vai ser ditado por voz, digitado à mão e colado em mensagem que o aplicativo pode quebrar em linha. Trocar por base32 Crockford ou base58 resolve sem custo.

**O tamanho é lição parcial.** Os nossos 128 bits ficam acima de quase tudo verificado: Partiful ~119, Paperless Post ~125, Luma ~41, convite.in ~36, evite.me ~58. Só o RSVPify passa, com ~190. Mais importante que o número é a filosofia: os dois maiores brasileiros não usam token nenhum, usam slug legível escolhido pelo organizador (`festalab.com.br/joao`, `sites.icasei.com.br/camilawilton`), e a central de ajuda do FestaLab ensina o organizador a editar o final da URL. O convite.in escolheu 7 caracteres de propósito, porque token curto cabe em QR de baixa densidade e dá para digitar na portaria quando a câmera falha.

A defesa honesta não é "seguimos o mercado", é "trocamos link ditável e QR simples por não precisar de limite de taxa contra enumeração". O ADR precisa registrar o que se perdeu.

**O descarte do UUIDv4 por segurança está errado e precisa mudar.** Três dos quatro grupos apontaram. UUIDv4 tem 122 bits de fonte criptográfica contra os nossos 128. Seis bits de diferença, nenhuma diferença prática. Se o ADR disser que o v4 foi descartado por ser adivinhável, qualquer avaliador derruba em trinta segundos e leva junto a credibilidade do descarte do v7, que está certo. Os motivos que se sustentam são de ergonomia: 36 caracteres com hífens contra 22, e aparência de identificador interno de banco em vez de link de convite.

### 2.7 Cache da página pública. A evidência contesta a nossa intuição, não a nossa stack.

Dois grupos assumiram que faltava cache e dois mostraram que a evidência aponta para o contrário no nosso caso. O Partiful, com toda a Vercel e CDN disponíveis, manda `Cache-Control: private, no-cache, no-store` na página do evento. A Punchbowl manda exatamente o mesmo em `/partypage/`. A Eventbrite cacheia na borda com `s-maxage=300, stale-while-revalidate=43200`, mas os eventos dela são públicos.

Somos a Punchbowl, não a Eventbrite. O nosso convite é privado e protegido apenas pelo link, e um convite que vaza para cache de intermediário destrói a única proteção do produto. A decisão defensável é **não cachear o HTML e cachear a mídia com força, com hash no nome do arquivo**. Registrar um "não" também é decisão arquitetural, e nesse caso é a decisão que a evidência sustenta. Isso também resolve a tensão que um grupo levantou entre cache e atualização ao vivo, porque ela deixa de existir.

Efeito colateral que precisa estar no ADR: se a página pública não é cacheável, o ganho do SSR deixa de ser custo de origem e passa a ser tempo até o primeiro conteúdo e prévia de link. Isso muda o argumento que justifica o SSR.

### 2.8 Chamar o front de MVC (ADR-0001). Coerência interna, não mercado.

A evidência não diz nada sobre isto, e fingerprint de bundle não revela padrão de projeto. Mas um Next.js com página pública SSR mais painel SPA não é MVC em nenhuma leitura tradicional. Não há Controller, o roteamento é por arquivo e o estado vive em componente e em cache de dados do cliente. O argumento real do ADR-0001, duas interfaces sobre o mesmo Model, continua verdadeiro, mas o que o sustenta é o Domínio compartilhado no back-end. Se mantivermos o rótulo, a primeira pergunta vai ser onde está o Controller.

### 2.9 Ruído explícito, coisas que não devemos copiar nem citar como padrão aplicável

Tudo isto apareceu na pesquisa e nada disto vale para três containers rodando localmente: Fastly, Cloudflare, CloudFront, Varnish, DataDome, Auth0 com PKCE, Kong com plugin Lua de JWT, Envoy de service mesh, Kafka, ElasticSearch, Sidekiq, imgix, Sentry, Honeycomb, Amplitude, Mixpanel, host dedicado só para og:image (`og.luma.com`), e site institucional em Framer, Webflow, WordPress ou Builder.io separado do produto (padrão unânime nos três grupos que olharam, e irrelevante porque não temos landing page no escopo).

Vale guardar uma lição de método desse último ponto, que é mais útil que o achado: inspecionar só a home de um concorrente engana completamente sobre a stack dele, e a pesquisa quase caiu nisso em vários casos. Se perguntarem como chegamos às conclusões de mercado, essa é a resposta que mostra rigor.

---

## 3. O QUE NÃO ESTAMOS ENDEREÇANDO

Priorizado por quanto importa para o nosso escopo, não pelo que é impressionante.

### P1. Identidade do convidado (ver 2.3)

Custo: uma tabela e um token. Prazo: precisa ser decidido antes da modelagem, não na implementação. É o único item da lista que quebra requisito escrito e ataca o diferencial declarado do produto. Se a decisão for não fazer, o painel precisa assumir que a consolidação alimentar é contagem de respostas anônimas, e a Visão do Produto precisa parar de prometer "12 confirmados, 3 vegetarianos, 1 alérgico a amendoim" por convidado.

### P2. Onde mora a imagem de fundo enviada pelo anfitrião

Os quatro grupos levantaram, e é o item mais concreto. O UC003 fluxo alternativo A1 e a RN2 aceitam upload de JPG e PNG, e os três tiers propostos não têm onde pôr esse arquivo. As saídas improvisadas são todas ruins: `bytea` no Postgres infla banco e dump e faz toda abertura do convite passar pelo banco para devolver bytes, base64 dentro do JSONB é pior ainda porque põe binário na linha lida na rota mais quente do sistema, e disco do container some no próximo `docker compose down`.

Todos os produtos com mídia observável tiram o arquivo do banco e usam nome não sequencial: FestaLab em Cloudflare R2 com `website_13852271_jZkAxVOlQNLyt6Ru0QlbNw.jpg`, iCasei com nomes aleatórios de 16 caracteres, convite.in com diretório `{slug}_{16 hex}`, Paperless Post com domínio dedicado à arte do convite, Partiful no Firebase Storage com imgix na frente.

Detalhe de segurança que passa despercebido e que vale citar: **o nome do arquivo de mídia é um segundo identificador público**. Se a imagem for servida como `/uploads/1.jpg`, um raspador enumera todos os convites pela mídia e o token de 128 bits não protege nada.

Decisão mínima: volume nomeado dedicado, rota própria da API servindo o arquivo, nome derivado de aleatório, limite de tamanho, lista de tipos aceitos, redimensionamento e recusa de SVG. Isso muda o compose e o diagrama de implantação, então vira ADR e não detalhe de implementação.

### P3. Abuso do POST público de RSVP

O único endpoint de escrita aberto e sem autenticação, e a arquitetura não diz uma palavra sobre ele. Aqui há um buraco lógico no nosso raciocínio de segurança que precisa ser dito em voz alta: **o token de 128 bits protege contra enumeração, mas o modelo de distribuição do produto é colar o link num grupo de WhatsApp, o que garante que o segredo vaza para todo mundo do grupo e para quem repassar.** Depois disso o token não protege mais nada.

Quatro coisas caem num ADR só, de "confiança na fronteira pública", e todas cabem numa sprint:

- Limite de taxa por token de convite e por IP, mais teto de respostas por convite.
- Limite de tamanho no texto livre da observação alimentar.
- Escape na renderização do painel. O texto vem de um anônimo e é renderizado na tela de um usuário autenticado, o que é XSS armazenado de manual.
- Prefixo de aspa simples na exportação CSV. Campo começando com `=`, `+`, `-` ou `@` executa quando o buffet abre no Excel. O caminho vai de um formulário sem login até uma planilha aberta na cozinha, e nenhum ponto do meio autentica nada.

Captcha está fora, e o mercado aliás não mostrou captcha em formulário nenhum. O que ele mostra é borda gerenciada (Cloudflare, Fastly, DataDome), que nós não temos e não vamos ter.

### P4. Imagem da prévia do link (og:image)

Escolhemos SSR para o link ficar bom no WhatsApp e paramos no título. A prévia mostra título, descrição e imagem. Sem og:image o convite chega como card de texto cinza e metade do valor do SSR se perde. E o produto é sobre personalização visual, então em tese a imagem deveria refletir a personalização de cada convite.

São três respostas possíveis e qualquer uma serve, desde que escrita: reusar a imagem de fundo enviada pelo anfitrião (mais simples, e depende de P2 estar resolvido), gerar na publicação e guardar, ou gerar sob demanda e cachear. **Recomendo a primeira.** Gerar imagem no servidor a partir do JSONB é um componente que ninguém previu e não cabe em duas sprints. Lembrar que o robô da Meta busca essa imagem sem sessão e com timeout curto.

### P5. Política de cabeçalho, indexação e o que entra na meta tag

Três decisões pequenas que cabem num parágrafo e que a Punchbowl implementa inteiras, todas observadas direto:

- `Cache-Control: private, no-cache, no-store` na página do convite.
- `robots.txt` bloqueando as rotas de convite. Token de 128 bits protege contra adivinhação e não protege contra indexação. Basta um convidado colar o link num fórum ou numa planilha compartilhada para o convite virar resultado de busca com nome do evento, data, endereço e lista de quem confirmou.
- Id inválido redireciona para uma rota de "não encontrado" em vez de devolver 404, o que reduz o sinal para quem sonda.

Junto com isso, decidir o que entra nas metatags Open Graph. Prévia de link obriga a expor parte do conteúdo de um convite que chamamos de privado a um terceiro. Isso é aceitável, mas precisa ser escolha consciente e limitada. Endereço exato do evento, por exemplo, não deveria entrar.

### P6. Autenticação do anfitrião

A stack não tem uma linha sobre isso, e a nossa forma torna a decisão mais difícil que o normal. Com convite SSR e painel no mesmo app Next, o painel renderizado no servidor precisa ler a sessão no servidor e o painel no navegador precisa chamar a API. Isso empurra para cookie HttpOnly compartilhado entre os dois caminhos, e não para token em localStorage, que é o que quatro pessoas escolhem sozinhas quando ninguém decidiu antes. Vale notar também que a nossa API valida dois modelos de autorização completamente diferentes convivendo na mesma camada: sessão de anfitrião e token de convite.

### P7. E-mail e recuperação de conta

O UC001 cria conta com e-mail e senha e tem a RN3 dizendo que não pode haver dois cadastros com o mesmo e-mail. Não existe verificação de e-mail nem recuperação de senha em lugar nenhum. Quem esquecer a senha perde a conta e todos os convites, e a RN3 garante unicidade de uma string que nunca foi provada.

A pesquisa não alcançou o provedor de e-mail de nenhum produto, então aqui não há evidência de mercado e é melhor dizer isso. A decisão pode perfeitamente ser "não enviamos e-mail nesta fase, senha é redefinida manualmente, e isso é aceitável porque não há usuários reais". O que não dá é o tema não existir, porque hoje parece esquecimento e não escolha.

Uma regra de sequência vale registrar junto: se envio de e-mail entrar numa sprint futura sem fila, ele entra síncrono dentro do handler do POST de RSVP, e um SMTP lento vira timeout justamente na única tela que precisa ser rápida. Punchbowl usa Sidekiq, Splash trata SMS e push como infraestrutura separada, Eventbrite tem Kafka. Ninguém manda mensagem dentro do ciclo da requisição.

### P8. Observabilidade

O próprio ADR-0002 admite nas consequências negativas que o acoplamento vira latência de rede e falha parcial, e depois não propõe nada para enxergar isso. Com Next chamando Nest pela rede, um erro passa a ter dois lados e nada correlaciona os dois.

Meia página de ADR fecha: id de requisição propagado do front até a API por cabeçalho, log estruturado em JSON no stdout de cada container (que é o que o Docker coleta), formato único de resposta de erro combinado entre as camadas, e um endpoint de saúde que o `HEALTHCHECK` de fato chame, que o ADR-0002 já exige com `condition: service_healthy`. Sem APM, porque não há ambiente compartilhado, e isso também é decisão.

Vale notar que o Rails do FestaLab e do Paperless Post devolvem `x-request-id` e `x-runtime` em toda resposta sem ninguém ter configurado nada. Escolhemos uma stack onde isso não vem de graça.

**Custo dessa lista:** P1 muda o modelo de domínio. P2 muda o compose e o diagrama de implantação. P3 até P8 são escrita, não código.

---

## 4. VEREDITO POR ESCOLHA

**Next.js com SSR no convite público: MANTER.** Onze produtos com SSR verificado em HTML e cabeçalho, sobre oito tecnologias de servidor diferentes, e o único que tentou SPA teve que injetar Open Graph pelo servidor mesmo assim. É a decisão mais bem sustentada da proposta inteira, desde que o ADR-0002 seja corrigido para parar de chamar o tier Front de estático e desde que a justificativa troque SEO por prévia de link, que é o que se aplica a um convite privado.

**NestJS: MANTER COM RESSALVA.** Zero dos dezenove usa Nest e nenhuma evidência de mercado sustenta a escolha, então o ADR precisa se apoiar inteiramente no contexto do time, que é argumento melhor: o Nest impõe por estrutura e injeção de dependência a separação em três camadas que o ADR-0001 declara inegociável, e com Express ela existiria só no papel.

**PostgreSQL com JSONB: MANTER COM RESSALVA, e a ressalva é sobre o JSONB, não sobre o Postgres.** Uma única confirmação direta em dezenove produtos (o post do cofundador do Luma citando Postgres e JSONB, corroborado pelos ids gerados por função do Postgres observados ao vivo), e um contraexemplo explícito (Partiful com Firestore), então a defesa tem que ser técnica e própria. O ajuste obrigatório é delimitar o JSONB: tema e cores são conjunto pequeno e fechado que cabe em coluna tipada, textos do evento já estão definidos na Especificação de Casos de Uso e são dado consultado, imagem de fundo é arquivo e nunca deve entrar ali. Escrito assim vira decisão, escrito como está vira gaveta.

**Server-Sent Events: REVER.** Nenhum dos dezenove usa SSE, os quatro que têm tempo real compraram pronto da plataforma deles, e o nosso UC007 é uma consulta que não menciona atualização automática em lugar nenhum, ou seja, escolhemos bem o transporte de um requisito que nunca justificamos. Recomendo polling de 15 a 30 segundos no MVP e um ADR de SSE com status Proposta registrando que a alternativa simples foi considerada, e se o time quiser manter o SSE assim mesmo, então o UC007 precisa ganhar o requisito de tempo real com um número de latência aceitável antes que o ADR discuta transporte.

**Token CSPRNG de 128 bits: MANTER COM RESSALVA, trocando o alfabeto e a justificativa.** A entropia está certa e dentro da faixa observada, mas base64url é o pior alfabeto possível para um link ditado e digitado (o Paperless Post removeu o O maiúsculo de 12.721 caracteres de propósito), então troque para base32 Crockford ou base58, pare de dizer que UUIDv4 foi descartado por segurança (122 bits contra 128 não é argumento) e registre o que se perdeu em relação ao slug legível que os dois maiores brasileiros usam.

---

## 5. CONFIANÇA DA PESQUISA

**O que foi verificado de verdade, e é bom.** Cabeçalho HTTP, HTML bruto, bundle de JavaScript, formato de URL, `robots.txt`, repositório público e um post de engenharia assinado. Isso é evidência de superfície colhida à mão, e dentro do que ela alcança é confiável. Alguns pontos são melhores que "confiável" e chegam a conclusivos: a análise de 612 mais 519 tokens com distribuição de prefixo por ano, que elimina componente monotônico estatisticamente e não por suposição; a ausência do O maiúsculo em 12.721 caracteres; o decode campo a campo de 23 ObjectIDs extraídos de uma home; a decodificação hex-ASCII do id do Greenvelope em cinco tentativas. Isso não é inferência, é demonstração.

**Sinal de método honesto.** Dois falsos positivos foram encontrados e derrubados pelos próprios pesquisadores (a string `ably` que era a palavra "probably" num texto de exemplo, e o `EventSource` que aparecia só numa lista de globais do DOM carregada pelo Sentry). Um grupo se recusou explicitamente a inferir PostgreSQL para os dois produtos Rails e MySQL para o WordPress, o que foi a atitude correta. Vários marcaram os próprios achados como fracos. Pesquisa que derruba os próprios achados é pesquisa melhor que pesquisa que só confirma.

**O que não foi verificado, e precisa ser dito assim na apresentação.**

*Banco de dados:* um de dezenove, e por post de blog sem data conhecida. Uma menção adicional em requisito de vaga, que é texto sobre candidato e não afirmação de uso em produção. Banco não vaza por HTTP nem por bundle, então o levantamento simplesmente não alcança essa camada. Qualquer frase do tipo "Postgres é o padrão do segmento" é invenção e vai ser derrubada.

*Provedor de e-mail:* zero de dezenove. Nenhum grupo alcançou.

*Topologia interna atrás da borda:* zero. Tudo que temos é a borda dos produtos. Dizer que o Paperless Post "tem uma camada separada" é leitura de superfície, não prova de arquitetura interna.

*Comportamento do painel atrás de login:* zero, e os quatro grupos admitiram isso. Isso enfraquece especificamente a conclusão sobre tempo real. O que se provou foi ausência de transporte de push **nos bundles públicos**, não ausência de polling em código autenticado. Ausência de evidência não é evidência de ausência, e esse ponto precisa ser repetido na defesa em vez de escondido.

*Token da Punchbowl:* nenhum link de convite real e ativo foi obtido, então o formato exato do identificador privado deles segue em aberto. O que a evidência sustenta é a regra (privacidade do recurso dita a opacidade do identificador), não o token específico.

*Intenção por trás dos padrões:* nenhuma dessas empresas, com a única exceção do Luma, tem blog de engenharia ou palestra pública. Tudo que temos é padrão observado, não decisão declarada. "Eles fazem X" é afirmável. "Eles fazem X porque Y" é nossa interpretação e deve ser apresentada como tal.

**Sobre a amostra.** Dezenove produtos em quatro conjuntos sem sobreposição. Isso corta os dois lados. A favor: quando os quatro conjuntos convergem, como no SSR e na mídia fora do banco, o resultado sai do acaso de preferência de framework e vira padrão real. Contra: cada achado individual costuma ser um de três dentro do seu conjunto, e três empresas não são o mercado. Os únicos padrões que chamo de unânimes com tranquilidade são três: renderização no servidor da página pública, mídia servida fora do banco e fora do processo da aplicação, e identificador público desacoplado da chave primária.

**Uma última honestidade.** O levantamento não confirma a nossa stack. Ele confirma dois ou três requisitos e nos obriga a trocar a justificativa de quase todo o resto. Isso é melhor do que parece, porque justificativa de contexto próprio se defende sozinha e apelo a mercado inexistente cai na primeira pergunta.
