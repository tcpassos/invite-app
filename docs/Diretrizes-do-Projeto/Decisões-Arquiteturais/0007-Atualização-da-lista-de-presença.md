# ADR-0007, Atualização da lista de presença

**Status:** Aceita
**Data do registro:** 13/09/2026

## Contexto

A H11 pede ver a lista de presença em tempo real, e uma proposta anterior definia Server-Sent Events como transporte, justificada pelo fluxo unidirecional do servidor para o painel.

Ao revisar a especificação, o requisito não se sustenta como está:

- O **UC007** é uma consulta. Não tem pós-condição e não menciona atualização automática em passo nenhum.
- A única menção a tempo real nos artefatos do projeto está na pesquisa de mercado, como padrão de experiência observado em concorrentes, e nunca virou requisito especificado.
- O volume real é de algumas respostas por hora no pico do disparo do convite, não por segundo, e o anfitrião não fica com o painel aberto.

Um levantamento de 19 produtos equivalentes não encontrou Server-Sent Events em nenhum. Os quatro com tempo real confirmado usaram o transporte que já vinha da plataforma deles. Ressalva honesta: essa evidência é de bundle público, e o comportamento do painel autenticado não foi observável em nenhum produto, então ausência de evidência não é evidência de ausência.

## Decisão

**Consulta periódica pelo cliente, com intervalo entre 15 e 30 segundos, enquanto o painel estiver aberto.**

Server-Sent Events fica descartado nesta fase, e não por ser inadequado. O transporte estava certo para um requisito que nunca foi especificado.

## Consequências

**Positivas**
- Remove um componente do sistema e do diagrama sem perder nada que tenha sido pedido.
- Nenhuma conexão de longa duração, o que simplifica o container da API e a ordem de subida.
- Atraso de até 30 segundos numa lista que muda poucas vezes por hora é imperceptível para o uso real.

**Negativas**
- Requisições periódicas de painéis abertos consomem recurso mesmo sem nada novo para mostrar. Irrelevante na escala deste projeto.
- Se um dia o requisito de tempo real existir de fato, esta decisão precisa ser revista.

## Condição para reabrir

Esta decisão se reabre se, e somente se, **o UC007 ganhar um requisito explícito de atualização automática com uma latência máxima aceitável declarada**.

Enquanto isso não acontecer, discutir transporte é responder uma pergunta que ninguém fez. Se acontecer, o SSE volta a ser a resposta provável, porque o fluxo continua unidirecional, o navegador reconecta sozinho e o NestJS suporta nativamente com `@Sse()`.
