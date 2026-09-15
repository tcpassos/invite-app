# ADR-0011, Identificador pessoal do convidado

**Status:** Aceita
**Data do registro:** 15/09/2026

## Contexto

O passo 8 do UC005 entrega ao convidado um link pessoal para alterar a resposta depois, registrado na ED2. A RN3 do mesmo caso de uso permite alterar a resposta enquanto o evento não tiver ocorrido, usando aquele link, e o critério de aceitação da H09 repete a mesma condição.

O Diagrama de Classes registra `personalToken` como `String [1] {unique}` em `Guest` e o chama de **segundo identificador público do sistema**. A pendência 2 daquela página diz que ele não tem ADR e que faltam entropia, alfabeto e revogação.

A falta ficou mais cara do que parecia quando a seção 9.5 do [Guia da Arquitetura](../Guia-da-Arquitetura.md) decidiu a política de exposição do link pessoal. Aquela seção escreve, com todas as letras, que a política **supõe** que o `personalToken` tenha pelo menos a entropia do `publicToken`, e que sem essa decisão o colapso das respostas de não encontrado naquela rota não se sustenta. A política de lá depende desta decisão para valer.

O [ADR-0005](0005-Identificador-público-do-convite.md) já resolveu o problema equivalente para o convite: 128 bits de gerador criptográfico, base32 Crockford, 26 caracteres, em coluna separada da chave primária.

Os dois identificadores não protegem a mesma coisa, e a diferença importa. O token do convite é feito para circular: o [ADR-0006](0006-Identidade-do-convidado.md) escolheu link único colado num grupo, e o ADR-0005 registra que ele deixa de ser segredo depois de distribuído. O token pessoal é o contrário, **ele nunca foi feito para ser repassado**, e quem o tem pode alterar a resposta de outra pessoa.

## Decisão

**O `personalToken` usa exatamente a mesma geração do `publicToken`**: 128 bits de gerador criptograficamente seguro, codificados em base32 Crockford, 26 caracteres, em coluna própria separada da chave primária.

A razão de repetir em vez de escolher outra coisa é dupla. A ameaça é a mesma, que é adivinhação por tentativa, e o alfabeto do Crockford já foi escolhido no ADR-0005 por tirar I, L, O e U para reduzir erro de quem digita à mão. Repetir também significa **um gerador e um alfabeto no código**, em vez de dois que podem divergir.

**A geração é do Domínio.** `generatePersonalToken()` roda em `RsvpService`, conforme a seção 3.2 do guia já aloca, e a Apresentação nunca gera identificador.

**Não há revogação individual nesta fase.** Nenhum caso de uso pede para invalidar o link de um convidado, e revogar exigiria uma coluna de situação em `Guest` ou uma lista de negados, ou seja, estado novo para um requisito que não existe.

**O token não expira por conta própria.** Ele vale enquanto a RN3 do UC005 permitir alterar a resposta, que é até o evento ocorrer. Esse limite depende de saber quando o evento termina, e isso **não está decidido**: a pendência 4 do Diagrama de Classes registra que `Invite` tem data e hora separadas, sem duração e sem fuso. Enquanto essa pendência não fechar, a fronteira da RN3 não é implementável, e este ADR não a inventa.

**Despublicar o convite não invalida o token pessoal.** A RN3 do UC004 diz que convite despublicado não aceita **novas respostas**, e alterar resposta existente não é resposta nova. A seção 9.5 do guia decidiu que o link pessoal continua abrindo nesse caso, com o argumento de exposição de que quem apresenta um token pessoal válido já respondeu e portanto já sabe que o convite existe.

**O token não entra em log**, conforme a seção 9.5 do guia, e não aparece em corpo de erro, conforme a seção 9.3.

## Consequências

**Positivas**
- A política de exposição da seção 9.5 do guia passa a ter fundamento e deixa de ser suposição escrita.
- Um gerador, um alfabeto e uma função de validação no código, compartilhados pelos dois identificadores.
- Quem perde o link pessoal responde de novo, que é a consequência que o ADR-0006 já aceitou por escrito ao registrar que dois convidados de mesmo nome são dois registros. Nada de novo é introduzido.

**Negativas**
- **Sem revogação, um link pessoal repassado dá a outra pessoa o poder de alterar aquela resposta.** É o espelho do risco do ADR-0006, aplicado a uma pessoa em vez do convite inteiro, e não há mitigação nesta fase.
- **A fronteira "enquanto o evento não tiver ocorrido" continua indefinida**, e essa é a única regra do sistema que depende de tempo sem ter definição. Até a pendência de fuso e fim do evento fechar, a implementação precisa escolher alguma coisa, e o que ela escolher não terá artefato atrás.
- Uma segunda coluna com índice único, com o custo de escrita que todo índice único cobra. Irrelevante na escala do projeto.
- O token é o segundo segredo que trafega em rota pública, então tudo que a seção 9.5 do guia decidiu sobre cache, indexação e log passa a valer em dobro, e a rota `/r/{personalToken}` ainda **não existe em artefato nenhum**, conforme aquela mesma seção registra.

## Condição para reabrir

Esta decisão se reabre se **surgir requisito de invalidar a resposta ou o link de um convidado**, por exemplo o anfitrião removendo alguém da lista, ou se **o fim do evento for definido de forma que exija expiração ativa** em vez de uma comparação de data na leitura.

## O que esta decisão fecha

- A pendência 2 do [Diagrama de Classes](../../Sprints/Sprint-2/Diagrama-de-Classes.md), sobre entropia, alfabeto e revogação.
- O item correspondente da seção 11.2 do Guia da Arquitetura.
- A suposição declarada na seção 9.5 do guia, que passa a ser decisão registrada.
