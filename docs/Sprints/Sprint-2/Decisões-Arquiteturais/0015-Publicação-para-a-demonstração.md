# ADR-0015, Publicação para a demonstração

**Status:** Proposta
**Data do registro:** 27/10/2026

## Contexto

O [ADR-0003](0003-Ambiente-de-execução.md) decidiu execução apenas local. A apresentação intermediária do T3 é remota, pelo Teams, e a demonstração ao vivo depende da máquina de quem compartilha a tela, que é a consequência negativa que o próprio ADR-0003 registrou. Com a aplicação publicada, qualquer integrante conduz a demonstração pelo navegador, e o professor consegue abrir o convite pelo celular.

O ADR-0003 manda não editá-lo: se o time publicar, um novo ADR o substitui.

Publicar no Railway muda três coisas que o ambiente local escondia:

- O front e a API ficam em dois domínios `*.up.railway.app`. Para o navegador são sites diferentes, e um cookie com `SameSite=Lax` não vai na chamada que o front faz para a API. Sem mudança, o anfitrião não consegue entrar.
- A API fica atrás do proxy do Railway. O IP do socket passa a ser o do proxy, e o limite de tráfego por origem do [ADR-0008](0008-Confiança-na-fronteira-pública.md) contaria todos os convidados como um só.
- O banco gerenciado não roda os scripts de `migrations/` na criação, como o volume vazio do compose faz.

## Decisão

**Os dois ambientes valem.** O compose local continua sendo o ambiente de desenvolvimento e o plano B da demonstração. Para a demonstração, os três tiers do [ADR-0002](0002-Empacotamento-em-tiers.md) são publicados no Railway, cada um num serviço, com as mesmas imagens que o compose constrói.

- **Cookie entre sites.** Com `SESSION_COOKIE_CROSS_SITE=true`, a API emite o cookie de sessão com `SameSite=None` e `Secure`. O `Secure` é o que o [ADR-0010](0010-Autenticação-do-anfitrião.md) já pedia para quando houvesse publicação. Sem a variável, o cookie continua como no ambiente local.
- **IP de origem.** Com `TRUST_PROXY=1`, a API lê o IP do convidado no `X-Forwarded-For` que o proxy do Railway preenche. Sem a variável, usa o IP do socket, como no compose.
- **Migrations.** O comando de pré-deploy da API, `node api/dist/migrate.js`, aplica os scripts de `migrations/` quando o banco está vazio, numa transação só, e não faz nada quando já há tabelas. É a mesma regra do volume vazio do compose. O passo a passo está em [Publicação no Railway](../../../Começando/Publicação-no-Railway.md).
- **Rede.** O banco fica só na rede privada do Railway, como no compose ele não publica porta. O servidor do front chama a API pela rede privada, e o navegador chama a API pelo domínio público dela, como na seção 5.3 do Diagrama de Implantação.

## Consequências

**Positivas**
- A demonstração não depende da máquina de quem apresenta, e o professor abre o convite no próprio celular.
- O cookie ganha o `Secure` que o ADR-0010 previa, e o limite de tráfego passa a contar por convidado de verdade.
- O código não muda de comportamento no ambiente local: as duas diferenças só ligam por variável de ambiente.

**Negativas**
- `SameSite=None` tira a proteção contra requisição forjada que o `Lax` dava. O que segura é o CORS, que só aceita a origem do front, e a guarda que só aceita `application/json`, porque um formulário de outro site não consegue mandar esse tipo sem a checagem prévia do navegador.
- O cookie da API é de terceiro para o front. O Chrome, o Edge e o Firefox mandam esse cookie; o Safari e o Brave bloqueiam, e a janela anônima do Chrome também. O anfitrião precisa entrar por um desses três navegadores, numa janela normal. O convidado não usa cookie e não é afetado. Um domínio próprio, com front e API como subdomínios, resolveria isso e fica como alternativa.
- O esquema do banco publicado só é criado em banco vazio, como o do compose. A limitação registrada na seção 8.1 do Diagrama de Implantação continua.
- A imagem da API passa a levar a pasta `migrations/`, que antes só o container do banco montava.
- O plano gratuito do Railway tem limite de uso. A publicação vale para a demonstração, não como ambiente permanente.

## Revisão

Com o aval do time, o ADR-0003 passa para o status Substituída, e o Diagrama de Implantação ganha o nó do Railway ao lado do host de desenvolvimento.
