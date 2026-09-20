# ADR-0013, Tempo do evento

**Status:** Aceita
**Data do registro:** 19/09/2026

## Contexto

`Invite` tem dois atributos de tempo, `eventDate : Date` e `eventTime : Time`, sem duração e sem fuso. A pendência 4 do [Diagrama de Classes](../Diagrama-de-Classes.md) registra isso, e três regras do sistema dependem de tempo sem ter onde se apoiar.

**A RN1 do UC002** diz que a data deve ser igual ou posterior ao dia atual. Dia atual segundo qual relógio não está escrito em lugar nenhum. Um container rodando em UTC e um anfitrião em Brasília discordam por três horas sobre que dia é hoje, então um convite criado às 22h de sexta já é sábado para o servidor. A mesma regra recusa data válida ou aceita data inválida conforme quem ganha.

**A RN3 do UC005** permite alterar a resposta enquanto o evento não tiver ocorrido. Ocorrido não tem âncora. Uma festa que começa às 20h não terminou às 20h01, e sem duração o único instante calculável é o de início, o que tiraria o link pessoal do convidado na hora em que a festa começa. O [ADR-0011](0011-Identificador-pessoal-do-convidado.md) registrou a lacuna por escrito e declarou que a fronteira da RN3 não é implementável enquanto ela existir.

**A tabela 9.1 do [Guia da Arquitetura](../../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md)** já promete 422 `VALIDATION_FAILED` para data no passado. A API precisa implementar a comparação de qualquer jeito, com definição ou sem ela.

## Decisão

**Um instante no lugar de dois atributos.** `Invite.eventStartsAt : DateTime [1]` substitui `eventDate` e `eventTime`. No banco é `timestamptz`, guardado em UTC. Comparação de tempo passa a ser um valor contra outro, e some a pergunta de qual das duas colunas manda quando as duas discordam.

**O formulário continua com quatro campos, e o contrato de entrada também.** O passo 3 do UC002 pede nome, data, hora e local, e a RN1 do UC004 cobra os quatro na hora de publicar. O corpo da requisição carrega `eventDate` e `eventTime` separados, porque é o que a tela preenche e é o campo que uma recusa precisa apontar. **A junção acontece na camada de Apresentação da API**, que converte os dois no fuso do projeto e entrega um instante ao Domínio. A View não junta nada: juntar no front seria decidir validade no front, e a seção 7 do guia proíbe isso em uma frase. Por isso o exemplo de `details` da seção 9.3, que usa `eventTime` como `field`, continua correto.

**A saída é o contrário da entrada.** A resposta do convite público carrega `eventStartsAt`, um valor só, e a tela formata. Dois campos existem apenas no caminho de escrita.

**Um fuso para o projeto inteiro, `America/Sao_Paulo`**, na configuração da API. Não há fuso por convite, nem coluna, nem seletor na tela. O anfitrião e os convidados estão na mesma festa, e fuso por convite pediria campo novo, conversão em toda exibição e uma decisão de qual fuso vale quando o anfitrião viaja. Isso é funcionalidade, e não está no escopo do MVP da [Visão do Produto](../../Sprint-3/Visão-do-Produto.md).

**A RN1 do UC002 continua comparando por dia**, agora ancorada nesse fuso. Convite para hoje é aceito mesmo quando a hora informada já passou. É o que a regra escrita permite, e é o que serve a quem monta uma festa para daqui a duas horas.

**O fim do evento é o fim do dia do evento.** A RN3 do UC005 vale até 23:59:59 do dia de `eventStartsAt`, no fuso do projeto. É o único limite derivável do que `Invite` já carrega, e é comparação feita na leitura do link pessoal, sem tarefa agendada e sem expiração ativa.

## Consequências

**Positivas**
- Fecha a consequência negativa que o ADR-0011 assumiu por escrito. A fronteira da RN3 passa a ser implementável, e a implementação para de escolher sozinha um comportamento sem artefato atrás.
- A promessa de 422 da tabela 9.1 do guia vira código verificável. Categoria de erro que dava para prometer e não dava para implementar deixa de existir.
- A fronteira erra a favor do convidado. Quem chega atrasado ainda consegue corrigir a resposta, que é para isso que o passo 8 do UC005 entrega o link pessoal.
- A seção 8.3 do DAS ganha o tipo da coluna sem discussão, e a 8.2 ganha uma estratégia de mapeamento concreta para descrever.
- `timestamptz` com nome IANA resolve horário de verão sozinho, se o país voltar a ter.

**Negativas**
- **Evento fora de `America/Sao_Paulo` mostra hora local errada.** O convite de uma festa em Lisboa exibe a hora de Brasília para todo mundo. Não há mitigação nesta fase, e é a limitação mais visível desta decisão.
- **A hora que o anfitrião digita é lida como hora de Brasília**, mesmo quando ele está em outro lugar no momento de criar o convite. É o mesmo problema pelo lado da escrita.
- **O fim do dia não é o fim da festa.** Uma festa que vira a noite deixa de aceitar alteração às 23:59:59, com gente ainda na pista. O limite é derivado, não medido, e é o preço de não ter duração no modelo.
- **A mesma informação tem dois nomes**, `eventDate` com `eventTime` na entrada e `eventStartsAt` no modelo e na saída. A seção 8.2 do DAS precisa registrar a conversão, senão ela vira conhecimento de quem escreveu o controller.
- **O Domínio passa a depender de um fuso vindo de configuração.** É uma constante do projeto e não um valor de requisição, mas ainda é estado externo entrando numa regra de negócio.

## Condição para reabrir

Esta decisão se reabre se **o produto passar a atender evento fora do fuso do projeto**, porque aí a hora exibida fica errada para o usuário final e não só para um caso de borda. Reabre também se **surgir requisito de duração ou de fim explícito do evento**, por exemplo um convite que declara de que hora a que hora a festa vai, porque aí existe fim medido e o fim do dia deixa de ser a melhor aproximação disponível.

Esta decisão **não aciona** a condição de reabertura do ADR-0011, que fala em fim do evento definido de forma a exigir expiração ativa. Aqui o fim é uma comparação de data na leitura, que é exatamente o caminho que aquele ADR previu.

## O que esta decisão fecha

- A pendência 4 do [Diagrama de Classes](../Diagrama-de-Classes.md), sobre fuso horário e fim do evento.
- A consequência negativa do [ADR-0011](0011-Identificador-pessoal-do-convidado.md) sobre a fronteira indefinida da RN3 do UC005.
- O item de fuso horário e fim do evento da seção 11.2 do [Guia da Arquitetura](../../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md).
- A dependência aberta que a task #106 registra para escrever a seção 8 do DAS.
