# Sprint 2: arquitetura e modelagem estrutural

## Objetivos da Sprint

- Definir a arquitetura inicial da aplicação a partir dos requisitos e atributos de qualidade.
- Organizar os principais componentes, módulos e responsabilidades.
- Modelar a estrutura do sistema e as entidades do domínio.
- Registrar as decisões que serão usadas na implementação.

## Questões Norteadoras

- Qual estilo arquitetural é mais adequado para a aplicação?
- Como a aplicação será organizada em componentes, módulos e camadas?
- Quais são as principais entidades do domínio e como elas se relacionam?
- Como representar a estrutura estática usando modelos UML?
- Como os componentes serão distribuídos e implantados no ambiente de execução?
- Quais decisões afetam manutenção, desempenho, segurança e escalabilidade?

## Itens de Backlog

Work items no Azure Boards da org `GUITOEBE`, projeto `invite-people`, iteration Sprint 2.

- **#58** Definir a arquitetura em camadas
- **#59** Modelar o diagrama de componentes (UML)
  - #64 Identificar os principais componentes do sistema
  - #65 Definir as interfaces expostas pelos componentes
  - #66 Definir as dependências entre componentes
  - #67 Detalhar os artefatos associados a cada componente
  - #68 Desenhar o diagrama de componentes
  - #69 Refinar o diagrama de componentes
  - #70 Revisão por pares do diagrama de componentes
- **#60** Modelar o diagrama de implantação (UML)
  - #71 Identificar os nós de implantação
  - #72 Mapear componentes para os nós
  - #73 Definir os dispositivos e artefatos de hardware
  - #74 Desenhar o diagrama de implantação
  - #75 Definir os links de comunicação entre nós
  - #76 Refinar o diagrama de implantação
  - #77 Revisão por pares do diagrama de implantação
- **#61** Modelar o diagrama de classes (UML)
- **#62** Modelar o diagrama de sequência (UML)
- **#63** Escrever o documento de decisões arquiteturais (ADR)

Além dos artefatos de arquitetura, a sprint carrega a entrega do primeiro trabalho da disciplina, que cai dentro deste período:

- **#78** T1, seminário sobre Docker e conteinerização, com as tasks #79 a #86

As tasks dos itens #59 e #60 seguem os sete passos sugeridos pelo professor, da identificação dos elementos à revisão por pares.

O tema do T1 também serve ao item #60. O estudo de conteinerização ajuda a definir em quantos tiers as camadas lógicas serão empacotadas e quais artefatos serão implantados em cada nó.

Nos itens #58, #59 e #60, camada lógica e separação física têm papéis diferentes. As três camadas do back-end ficam na mesma imagem. Os containers separam os tiers Front, API e Banco.

O `docker-compose.yml`, na raiz do repositório, aplica as sete decisões da seção 8 do Diagrama de Implantação. No momento, apenas o serviço `db` pode ser iniciado. Os serviços `front` e `api` já estão declarados, mas dependem do código previsto para a Sprint 3. A página [Configuração de Ambiente](../Começando/Configuração-de-Ambiente.md) traz as instruções de uso.

A ordem prevista é #58, #59 e #60: primeiro as camadas, depois os componentes e, por fim, a alocação nos nós. Os itens #61 e #62 podem avançar em paralelo, pois partem dos casos de uso. O item #63 é atualizado à medida que as decisões são tomadas.

## Scrum Master

- Tiago Passos

## Principais Artefatos

- Arquitetura em Camadas
- [Diagrama de Componentes](Sprint-2/Diagrama-de-Componentes.md) (UML)
- [Diagrama de Implantação](Sprint-2/Diagrama-de-Implantação.md) (UML)
- [Diagrama de Classes](Sprint-2/Diagrama-de-Classes.md) (UML)
- [Diagramas de Sequência](Sprint-2/Diagramas-de-Sequência.md) (UML)
- [Documento de Decisões Arquiteturais](../Diretrizes-do-Projeto/Decisões-Arquiteturais.md) (ADR), com 12 registros

O [Guia da Arquitetura](../Diretrizes-do-Projeto/Guia-da-Arquitetura.md) registra o ponto de partida: MVC no front e três camadas no back. Nesta sprint, essa estrutura foi detalhada nos diagramas e nas decisões arquiteturais.

Os diagramas são gerados com PlantUML. Os arquivos `.puml` e `.png` ficam versionados em `/.attachments`, e a renderização é feita por Docker.

## Cerimônias da Sprint

- Planejamento da Sprint
- Reunião diária
- Revisão da Sprint
- Retrospectiva da Sprint (extensão Team Retrospectives)
