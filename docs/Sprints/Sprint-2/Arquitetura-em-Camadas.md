# Arquitetura em Camadas

A estrutura lógica do sistema, com o que cada camada contém e a regra que decide em qual delas uma responsabilidade nova mora.

O estilo vem do [ADR-0001](Decisões-Arquiteturais/0001-Estilo-arquitetural.md): MVC no front e três camadas no back.

## 1. O diagrama

![Arquitetura em camadas](../../.attachments/diagrama-de-camadas.png)

### Como ler

A figura usa quatro tipos de ligação, e eles não significam a mesma coisa. Confundi-los num símbolo só torna a direção da dependência ilegível, que é justamente o assunto do documento.

| Traço | O que significa |
|---|---|
| Linha cheia com ponta | Dependência em tempo de compilação. Quem está na origem conhece o tipo do destino e não compila sem ele |
| Linha tracejada com ponta | Chamada em tempo de execução que cruza a rede |
| Linha pontilhada com ponta | Evento do usuário, que não cria dependência de código nenhuma |
| Linha sem ponta | Liga um interesse transversal à camada que ele atravessa |

**A dependência só desce, e só a linha cheia responde por ela.** A Apresentação conhece o Domínio, o Domínio conhece os Dados, e o Model do front conhece os tipos que a API publica. Não existe linha cheia subindo. O que sobe é retorno, e retorno não é dependência.

## 2. As três camadas

### 2.1 Apresentação

Trata da interação com quem está fora do sistema. No invite-app ela é a fronteira HTTP da API.

**O que faz.** Recebe a requisição e devolve a resposta, e é a única camada que conhece rota, método, cabeçalho e código de status. Autentica a sessão do anfitrião e traduz o cabeçalho em `hostId`. Controla tráfego na fronteira pública. Confere se o corpo chegou na forma declarada. Traduz o resultado do Domínio em protocolo, transformando uma exceção em 404, 409 ou 422. Serializa a saída, incluindo o CSV da exportação.

**O que não faz.** Não cria identificador, porque a geração dos dois tokens públicos é do Domínio. Não decide regra de negócio. Não verifica o teto de capacidade. Não decide autorização, porque comparar o anfitrião com o dono do convite é do Domínio. E **não fala com o banco**, o que os três diagramas de sequência confirmam sem uma única seta.

### 2.2 Domínio

Possui as regras, as validações e os cálculos. É a camada que sabe o que é um convite e o que é uma resposta.

**O que faz.** Valida o que dá para decidir com o que já está em mãos, como o limite de acompanhantes e a coerência da observação alimentar. Gera os identificadores públicos. Compara o dono do convite. Conduz a ordem das chamadas de um caso de uso.

**O que não faz.** Não conhece rota nem código de status. Uma exceção que sai daqui não carrega número de status dentro.

### 2.3 Dados

Responde pelo acesso ao PostgreSQL.

**O que faz.** As consultas e as projeções do painel, com agregação feita no banco e não em memória. As transições de estado atômicas, pelo predicado do `WHERE`. E a escrita transacional que garante o teto de capacidade.

**O que não faz.** Não decide quem pode o quê, porque devolve o convite sem filtrar por anfitrião. Não checa o limite de acompanhantes. Não gera o token que persiste, que chega por parâmetro. Não formata saída, então o texto que o convidado escreveu fica gravado como ele escreveu. E não conduz o caso de uso, porque a ordem das chamadas vem do Domínio.

## 3. A regra de dependência

O ADR-0001 define uma regra e apenas uma como obrigatória:

> **O Domínio e a camada de Dados nunca dependem da Apresentação. As dependências apontam sempre para dentro.**

Ela pode ser enunciada de três formas, e as três importam porque cada uma pega um tipo diferente de violação:

| Forma | O caso que ela pega |
|---|---|
| A camada inferior ignora a superior | O repositório que importa um tipo de requisição HTTP para facilitar |
| O Domínio esconde os Dados da Apresentação | O controller que chama o repositório direto para pular uma chamada |
| As camadas de baixo não dependem da de cima | O serviço que lança um erro já com código de status dentro |

O benefício é o mesmo nas três: permite trocar a camada de Apresentação sem impacto nas de baixo. Aqui isso não é hipótese de futuro, é o que faz duas superfícies funcionarem sobre um modelo só.

### 3.1 A leitura adotada sobre o acesso aos Dados

O material da disciplina admite duas leituras. Numa, a Apresentação traduz comandos em ações sobre o Domínio **e** sobre os Dados. Noutra, o Domínio esconde os Dados da Apresentação.

**Este projeto adota a leitura estrita: a Apresentação nunca chama a camada de Dados.**

A razão é concreta e não é de princípio. Se a Apresentação pudesse ler o convite por conta própria, alguém acabaria verificando o teto de capacidade ali. Com duas respostas simultâneas num evento que está em 49 de 50, uma validação na Apresentação deixa as duas passarem e o evento fecha em 51. A invariante **não pode** ser garantida fora de uma transação, e por isso ela mora nos Dados, conforme o [ADR-0008](Decisões-Arquiteturais/0008-Confiança-na-fronteira-pública.md).

### 3.2 O que o projeto não adota

**Não há inversão de dependência entre Domínio e Dados.** O Domínio depende da interface da camada de Dados, que é dependência para baixo e é o que a arquitetura em três camadas prevê. A regra registrada é uma só, a de cima, e é essa que os diagramas provam.

## 4. Camada e tier não são a mesma coisa

As três camadas são divisão **lógica** e vivem dentro do mesmo processo da API. A separação **física** é outra: são três containers, Front, API e Banco, pelo [ADR-0002](Decisões-Arquiteturais/0002-Empacotamento-em-tiers.md).

A consequência é que a camada de Apresentação fica partida entre dois processos. O tier Front atende a leitura do convite público, e o navegador manda a escrita direto para a API. É isso que faz um erro ter dois lados, que o [ADR-0012](Decisões-Arquiteturais/0012-Observabilidade-entre-os-tiers.md) resolve com o cabeçalho de correlação.

O [Diagrama de Implantação](Diagrama-de-Implantação.md) mostra a separação física, e o [Diagrama de Componentes](Diagrama-de-Componentes.md) mostra quais componentes moram em cada camada.

## Fonte do diagrama

Gerado a partir de [`diagrama-de-camadas.puml`](../../.attachments/diagrama-de-camadas.puml), versionado junto com a imagem. Para regerar depois de editar o fonte, com Docker:

    docker run --rm -v "<caminho de docs/.attachments>:/data" plantuml/plantuml -tpng /data/diagrama-de-camadas.puml
