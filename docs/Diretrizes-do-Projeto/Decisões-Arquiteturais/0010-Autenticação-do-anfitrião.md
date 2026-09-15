# ADR-0010, Autenticação do anfitrião e estado das guardas

**Status:** Aceita
**Data do registro:** 15/09/2026

## Contexto

O UC001 especifica entrada e cadastro do anfitrião com email e senha, senha de no mínimo oito caracteres (RN1), sessão que expira por inatividade (RN2) e email único (RN3). O fluxo A2 manda informar que email ou senha estão incorretos **sem dizer qual**.

Nada disso tinha ADR. A operação `authenticateSession(session)` aparece em quatro pontos dos diagramas de sequência do UC004 e do UC008, o Diagrama de Componentes a publica como interface `SessionAuth` do `SessionGuard`, e a pendência 4 dos Diagramas de Sequência registra que ela nunca foi decidida.

Junto com ela ficou aberta uma segunda pergunta, e as duas têm a mesma restrição. O Diagrama de Componentes desenhou `SessionGuard` e `RateLimitGuard` **sem nenhuma interface requerida**, e declarou por escrito que isso não é esquecimento: onde as duas guardas guardam estado não foi decidido, e a figura não desenha dependência que ninguém decidiu.

A restrição que amarra as duas é a seção 6.2 do [Guia da Arquitetura](../Guia-da-Arquitetura.md). O projeto adota a leitura estrita, em que a camada de Apresentação **nunca** chama a camada de Dados. Tabela de sessão ou tabela de contador no banco principal faria a Apresentação falar com o banco, que a seção 6.3 lista como violação e a segunda busca da 6.4 encontra em revisão. Qualquer alternativa com tabela acrescenta um soquete às duas guardas e muda a figura de componentes.

O [ADR-0003](0003-Ambiente-de-execução.md) fecha a execução num host só, e o [ADR-0002](0002-Empacotamento-em-tiers.md) decidiu um container por serviço, então hoje existe **uma instância da API**, não várias.

## Decisão

**A senha é guardada com Argon2id.** Os parâmetros ficam nos padrões correntes da biblioteca e não são fixados aqui, porque fixar custo de memória e de tempo sem medir nas máquinas do time seria transformar palpite em requisito. A ED1 do UC001 diz "armazenada de forma segura" e é isso que a frase significa em código.

**A sessão é um cookie assinado, e não há tabela de sessão.** O cookie carrega o `hostId` e o instante de expiração, assinados com um segredo que chega por variável de ambiente. O `SessionGuard` valida a assinatura e devolve o `hostId`, e é só isso que `authenticateSession(session)` faz. O cookie vai com `HttpOnly` e `SameSite=Lax`.

**A expiração por inatividade da RN2 é de 30 minutos, deslizante.** Cada requisição autenticada renova a janela.

**O `RateLimitGuard` conta na memória do processo**, em janela deslizante por chave, com as duas chaves que a seção 4.1 do guia definiu, token de convite na leitura e token mais endereço de origem na escrita.

**As duas guardas continuam sem interface requerida.** Nenhuma das duas fala com a camada de Dados, nenhuma fala com o banco, e a figura do Diagrama de Componentes permanece válida como está.

**O A2 do UC001 responde igual para email inexistente e para senha errada**, e gasta o mesmo tempo nos dois caminhos. Quando o email não existe, o sistema calcula o hash mesmo assim antes de recusar. Sem isso, a diferença de tempo entre os dois ramos diz a quem sonda quais emails estão cadastrados, e o "sem dizer qual" da especificação valeria só para o texto da mensagem. É o mesmo raciocínio da seção 9.5 do guia sobre os ramos que terminam em 404 não ganharem trabalho extra em um deles.

## Consequências

**Positivas**
- As duas guardas ficam sem dependência nova, então a regra da seção 6 do guia continua valendo sem exceção e o Diagrama de Componentes não precisa ser redesenhado.
- Nenhum container novo e nenhum nó novo. O Diagrama de Implantação não muda.
- Sem consulta ao banco para validar sessão, a rota mais frequente do painel, a consulta periódica do [ADR-0007](0007-Atualização-da-lista-de-presença.md), não gera carga de leitura extra a cada 15 a 30 segundos.
- A escolha do Argon2id e a do tempo constante no A2 cobrem as duas formas de descobrir conta cadastrada, que são o vazamento por mensagem e o vazamento por tempo.

**Negativas**
- **Cookie assinado não é revogável do lado do servidor.** Não há como encerrar uma sessão antes da expiração sem guardar estado, que é exatamente o que esta decisão evita. Sair do sistema apaga o cookie no navegador e o token continua válido até expirar se alguém o tiver copiado.
- **O contador de taxa morre quando o container reinicia**, e a janela zera junto. Numa reinicialização, quem estava perto do limite volta a ter a janela cheia disponível.
- **A decisão do contador deixa de valer se a API ganhar réplica**, porque cada instância contaria a própria janela e o limite efetivo viraria o dobro ou o triplo do que o [ADR-0008](0008-Confiança-na-fronteira-pública.md) pede. A hipótese de réplica está registrada como aberta na seção 9 do Diagrama de Implantação.
- **O cookie não leva o atributo `Secure`** enquanto o ADR-0003 valer, porque o ambiente roda em `127.0.0.1` sem TLS e um cookie `Secure` não seria enviado. No dia em que existir alvo de publicação, o atributo entra junto e não é opcional.
- A sessão deslizante combinada com a consulta periódica do ADR-0007 tem um efeito que vale dizer: **enquanto o painel estiver aberto a sessão nunca expira**, porque a consulta a cada 15 a 30 segundos renova a janela. A RN2 passa a valer na prática a partir do momento em que o anfitrião fecha a aba.

## Condição para reabrir

Esta decisão se reabre se **a API ganhar mais de uma instância**, o que derruba o contador em memória, ou se **surgir requisito de encerrar sessão remotamente**, por exemplo sair de todos os dispositivos, o que exige estado do lado do servidor e traz de volta a pergunta da tabela.

O ADR-0003 ser substituído por um que preveja publicação também reabre, porque acrescenta o atributo `Secure` e muda a exposição do cookie.

## O que esta decisão fecha

- A pendência 4 dos [Diagramas de Sequência](../../Sprints/Sprint-2/Diagramas-de-Sequência.md), sobre `authenticateSession` não ter ADR.
- As pendências 4 e 5 da seção 10.2 do [Diagrama de Componentes](../../Sprints/Sprint-2/Diagrama-de-Componentes.md), sobre onde as duas guardas guardam estado.
- O item correspondente da seção 11.4 do Guia da Arquitetura.
