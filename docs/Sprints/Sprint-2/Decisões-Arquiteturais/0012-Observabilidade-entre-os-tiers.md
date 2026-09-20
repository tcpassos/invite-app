# ADR-0012, Observabilidade entre os tiers

**Status:** Aceita
**Data do registro:** 15/09/2026

## Contexto

O [ADR-0002](0002-Empacotamento-em-tiers.md) assumiu por escrito uma consequência negativa que nenhum artefato tratou depois: com a camada de Apresentação partida entre dois containers, **um erro passa a ter dois lados e nada correlaciona os dois sozinho**. Quem lê o registro do tier Front e quem lê o da API não tem como saber que as duas linhas são a mesma falha.

O diagrama de camadas desenha "Erros e log" como interesse transversal ligado às três camadas, e a seção 9.4 do [Guia da Arquitetura](../../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md) registra que **não existe nenhuma regra de log escrita em artefato nenhum do projeto**.

Duas decisões recentes cercaram o assunto sem fechá-lo. A seção 9.3 do guia criou o `traceId`, de 64 bits em hexadecimal, sorteado pelo filtro de exceção e escrito no corpo do erro e na linha de log da mesma resposta. Ele nasce dentro da API, então **não cobre o salto do tier Front para a API**, que é justamente onde o erro tem dois lados. A seção 9.5 decidiu o que nunca pode entrar em log, que é o token do convite, o token pessoal e o texto livre da observação alimentar.

O [ADR-0003](0003-Ambiente-de-execução.md) fecha a execução no host de desenvolvimento, sem alvo de publicação e sem ambiente compartilhado.

## Decisão

**O log vai para a saída padrão, uma linha por requisição, sem arquivo e sem rotação.** O Docker já coleta a saída padrão de cada container, e `docker compose logs` é o leitor. Escrever arquivo dentro do container acrescentaria volume e rotação para um ambiente que o ADR-0003 fecha numa máquina só.

**Os campos da linha são fixos:** instante, tier, nível, método, rota, status, duração em milissegundos e o identificador de correlação.

**A rota registrada é o molde da rota, nunca o caminho concreto.** Registra-se `/public/invites/{publicToken}`, e jamais o caminho com o token dentro. Sem essa regra, a proibição da seção 9.5 do guia seria contrariada pelo campo mais óbvio da linha, porque o token do convite mora dentro da própria rota.

**O identificador de correlação passa a nascer no tier Front, e não na API.** No caminho de leitura do convite público, o tier Front gera o identificador e o envia à API no cabeçalho `X-Request-Id`. A API **reaproveita** o valor recebido quando ele existe, e gera um quando não existe. O `traceId` que a seção 9.3 do guia põe no corpo do erro é esse mesmo valor.

Com isso a linha do tier Front e a linha da API carregam o mesmo identificador, e a consequência negativa do ADR-0002 deixa de valer no caminho em que ela aparecia. No caminho de escrita, em que o navegador chama a API direto, existe um lado só e o identificador nasce na API, como a seção 9.3 já descrevia.

**Nunca entram na linha de log:** o `publicToken`, o `personalToken`, o texto livre da observação alimentar, a senha, o hash da senha, o segredo de sessão e o corpo das requisições.

**Não há ferramenta de observabilidade.** Sem coletor de métricas, sem painel e sem serviço de rastreamento distribuído. O ADR-0003 fecha no host, não existe ambiente compartilhado e ninguém vai acompanhar painel de métricas de um compose que roda na máquina de um integrante. Acrescentar qualquer um dos três significaria acrescentar container, e o número de containers é decisão do ADR-0002.

## Consequências

**Positivas**
- Fecha a consequência negativa que o ADR-0002 registrou, e fecha com um cabeçalho, sem componente novo, sem container novo e sem nó novo. O Diagrama de Implantação não muda.
- A regra do que não pode entrar em log é verificável por busca, e a seção 9.5 do guia já a prescreve como uma das quatro conferências de revisão de código.
- A regra do molde da rota transforma numa linha o que seria a forma mais provável de vazar o token sem ninguém perceber.

**Negativas**
- **A correlação só existe onde o tier Front está no caminho**, que é uma rota das sete da tabela 4.1. Nas outras seis o identificador nasce na API e não há segundo lado para correlacionar, o que não é defeito, é o desenho.
- **Confiar num cabeçalho de entrada é confiar em quem chama.** Na leitura pública quem chama é o tier Front, que é do projeto. Se algum dia o navegador puder enviar o cabeçalho direto, ele passa a poder escolher o próprio identificador e poluir o log de outra requisição. Enquanto só o tier Front enviar, o risco não existe.
- **O log morre com o container.** `docker compose down` leva junto, e não há retenção. Para o ambiente do ADR-0003 isso é aceitável e para qualquer outro não é.
- **Sem métricas, não há resposta para quanto tempo alguma coisa leva** sem medir à mão. A duração na linha de log é o único número disponível, e ele não agrega.
- Esta decisão **corrige a seção 9.3 do guia**, que diz que o filtro sorteia o `traceId`. O filtro passa a sortear apenas quando não recebeu o cabeçalho.

## Condição para reabrir

Esta decisão se reabre se o **ADR-0003 for substituído por um que preveja publicação**, porque aí passa a existir ambiente que ninguém acompanha olhando o terminal, e retenção de log deixa de ser opcional. Reabre também se **a API ganhar réplica**, porque o log passa a estar espalhado por instâncias e ler a saída padrão de cada uma deixa de servir.

## O que esta decisão fecha

- A consequência negativa do ADR-0002 sobre o erro com dois lados.
- O item da seção 9.4 do Guia da Arquitetura sobre o identificador de correlação entre os dois lados do erro.
- A ausência de regra de log, que o interesse transversal do diagrama de camadas mostrava sem definir.
