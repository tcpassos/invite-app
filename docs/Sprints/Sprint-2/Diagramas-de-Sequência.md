# Diagramas de Sequência

Visão dinâmica. Mostram como os objetos interagem ao longo do tempo nos fluxos mais relevantes do sistema, e principalmente **em que camada cada passo acontece**.

As linhas de vida não são classes do [Diagrama de Classes](Diagrama-de-Classes.md). São os **papéis de camada** definidos no [ADR-0001](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0001-Estilo-arquitetural.md) e os tiers do [ADR-0002](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0002-Empacotamento-em-tiers.md). `Invite`, `Guest`, `DietaryNote` e `DietaryCategory` são os dados que trafegam entre elas.

A regra que os três diagramas tornam visível: **a seta cheia só desce**. A Apresentação chama o Domínio e o Domínio chama os Dados. O que sobe é retorno, na linha tracejada, porque o Domínio e os Dados não conhecem a Apresentação.

## Diagrama 1, Confirmar presença

![Diagrama de sequência do UC005](/.attachments/diagrama-sequencia-uc005.png)

**Descrição:** o UC005 completo, com a extensão do UC006 no passo 4. É o fluxo mais importante do sistema, porque atravessa a fronteira pública e é o único caminho de escrita sem autenticação.

**O que o diagrama prova:**

**Os dois saltos de rede do ADR-0002 aparecem no caminho de leitura.** O navegador chama o tier Front, que renderiza no servidor e chama o tier API pela rede do compose. Um erro nessa tela tem dois lados, que é exatamente a consequência negativa registrada no ADR-0002.

**A escrita tem um salto só.** O POST parte do código já em execução no navegador direto para a API. O tier Front não repassa comando, porque o [ADR-0004](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0004-Stack-de-implementação.md) mantém o Next.js como front-end apenas.

**O teto de capacidade é verificado dentro da transação.** Este é o ponto central. A sequência é `BEGIN`, depois `SELECT ... FOR UPDATE` no convite, depois a contagem de vagas ocupadas, depois o `INSERT` e o `COMMIT`. No ramo de evento lotado, `ROLLBACK`.

Se essa checagem morasse na Apresentação, duas respostas simultâneas em 49 de 50 passariam as duas e o evento fecharia em 51. **É a demonstração concreta de por que a camada de Dados existe separada**, e não uma afirmação de diagrama.

**Alocação por camada, ponto a ponto:**

| Passo | Camada | Por quê |
|---|---|---|
| Limite de taxa | Apresentação | Controle de tráfego, não regra do caso de uso (ADR-0008) |
| Desserialização e tipos | Apresentação | Só forma. O conjunto de valores válidos é o `RsvpStatus` do Domínio |
| Limite de acompanhantes por resposta (RN2) | Domínio | Regra de negócio |
| Validação da observação alimentar (UC006 RN2) | Domínio | Depende de `requiresDescription` da categoria |
| Geração do `personalToken` | Domínio | A Apresentação nunca cria identificador |
| Teto de capacidade (RN4) | Dados | Invariante que depende do estado do banco e exige transação |

**Fluxos alternativos representados:** A1 recusa, que segue para o passo 5 porque a recusa também precisa de nome. A2 dados inválidos. A3 extensão do UC006, dentro de `opt` porque a observação é opcional. A4 evento lotado, com `ROLLBACK`.

## Diagrama 2, Publicar convite e gerar link

![Diagrama de sequência do UC004](/.attachments/diagrama-sequencia-uc004.png)

**Descrição:** o UC004, incluindo a extensão A2 de despublicar.

**O que o diagrama prova:**

**O `publicToken` nasce no Domínio.** São 128 bits de CSPRNG em base32 Crockford, 26 caracteres, conforme o [ADR-0005](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0005-Identificador-público-do-convite.md). A Apresentação nunca gera identificador.

**A geração está dentro de um `opt`.** O token só é criado se ainda não existir. Republicar um convite que estava despublicado **reaproveita o link já distribuído**, porque despublicar desativa sem apagar. Sem esse `opt`, republicar mataria um link que o anfitrião já tinha colado no grupo.

**A transição de situação é atômica sem transação explícita.** O `UPDATE` carrega a condição no `WHERE`, checando a situação e escrevendo no mesmo comando. É o mesmo raciocínio do teto, aplicado na camada de Dados. Sem o predicado, dois cliques em compartilhar gerariam dois tokens e o segundo sobrescreveria o primeiro.

**O `publicToken` do Diagrama de Classes é `[0..1]` por causa deste fluxo.** Antes daqui ele não existe.

**Uma escolha de segurança visível:** convite de outro anfitrião responde **404 e não 403**, para não confirmar a existência do recurso. É a mesma linha do ADR-0008 sobre reduzir sinal para quem sonda.

## Diagrama 3, Consolidar e exportar observações alimentares

![Diagrama de sequência do UC008](/.attachments/diagrama-sequencia-uc008.png)

**Descrição:** o UC008, a consolidação por categoria e a exportação em CSV. É o fluxo que entrega o diferencial declarado do produto.

**O que o diagrama prova:**

**A agregação acontece como consulta no banco, não como laço na aplicação.** O `GROUP BY` por categoria roda na camada de Dados. Trazer todas as linhas para o Domínio e contar em memória seria mover trabalho de agregação para o lugar errado.

**A consolidação e a lista não são entidades.** São consultas sobre `Invite` e `Guest`, coerente com o que o Diagrama de Classes já registra. Nenhum passo do diagrama grava tabela de consolidação.

**O tratamento de injeção de fórmula está na Apresentação.** Campo que comece com `=`, `+`, `-` ou `@` recebe prefixo de aspa simples (ADR-0008). Fica na Apresentação porque é **formato de saída**, não regra de domínio. O dado no banco continua íntegro, e quem decide como serializar é quem serializa.

Vale registrar o caminho completo: o texto sai de um formulário anônimo, passa pela API, é gravado, é exportado e termina numa planilha aberta na cozinha do buffet. **Nenhum ponto do meio autentica alguém.**

## O que a modelagem expôs

Pontos que a especificação não resolve e que os diagramas deixaram visíveis:

1. **A pré-condição do UC008 bloqueia a exportação quando ninguém tem restrição.** O A1 não oferece a exportação, então numa festa sem nenhuma restrição o anfitrião não consegue exportar a lista de presença, que é metade do que a H12 pede.
2. **A ED2 do UC008 não tem coluna de acompanhantes.** São quatro colunas e nenhuma diz para quantas pessoas cozinhar, que é a dor declarada da persona do buffet.
3. **Não há fluxo especificado para alterar a resposta.** A H09 virou apenas a RN3 do UC005, sem passo próprio.
4. **A autenticação do anfitrião aparece nos três diagramas como `authenticateSession`** e ainda não tem ADR.

## Fontes dos diagramas

Gerados a partir dos arquivos `.puml` versionados em `/.attachments`, ao lado dos PNG. Para regerar:

    docker run --rm -e PLANTUML_LIMIT_SIZE=16384 -v "<caminho de docs/.attachments>:/data" plantuml/plantuml -tpng /data/diagrama-sequencia-uc005.puml

A variável `PLANTUML_LIMIT_SIZE` é necessária porque os diagramas passam do teto padrão de 4096 pixels. Sem ela o PNG sai cortado no rodapé.
