# Sprint 2, Projeto da Arquitetura e Modelagem Estrutural

## Objetivos da Sprint
- Definir a arquitetura inicial da aplicação a partir dos requisitos funcionais e dos atributos de qualidade.
- Especificar a organização estrutural do sistema, com os principais componentes, módulos e responsabilidades.
- Modelar os elementos arquiteturais e as entidades do domínio, estabelecendo a visão estática da solução.
- Documentar as decisões arquiteturais que orientam a implementação nas próximas sprints.

## Questões Norteadoras
- Qual estilo arquitetural é mais adequado para a aplicação?
- Como a aplicação será organizada em componentes, módulos e camadas?
- Quais são as principais entidades do domínio e como elas se relacionam?
- Como representar a estrutura estática usando modelos UML?
- Como os componentes serão distribuídos e implantados no ambiente de execução?
- Quais decisões arquiteturais garantem manutenibilidade, desempenho, segurança e escalabilidade?

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

As tasks dos itens #59 e #60 seguem a decomposição em sete passos sugerida pelo professor, de identificar os elementos até a revisão por pares.

O tema do T1 foi escolhido de propósito para alimentar o #60. Estudar conteinerização define como as camadas são empacotadas, e é isso que transforma os nós do diagrama de implantação em artefatos concretos em vez de caixas genéricas. O `docker-compose` montado para a demonstração fica como artefato do projeto e resolve a página Configuração de Ambiente.

Uma ordem que evita retrabalho: o #58 define as camadas, o #59 detalha os componentes dentro delas, e o #60 aloca esses componentes nos nós. O #61 e o #62 podem correr em paralelo, porque saem dos casos de uso e não dependem dos componentes. O #63 vai sendo escrito conforme as decisões aparecem, não no fim.

## Scrum Master
- _[preencher]_

## Principais Artefatos
- Arquitetura em Camadas
- Diagrama de Componentes (UML)
- Diagrama de Implantação (UML)
- Diagrama de Classes (UML)
- Diagrama de Sequência (UML)
- Documento de Decisões Arquiteturais (ADR)

O ponto de partida já existe no [Guia da Arquitetura](../Diretrizes-do-Projeto/Guia-da-Arquitetura.md), que registra a escolha de MVC no front com três camadas no back. O trabalho da sprint é formalizar essa decisão, diagramar e justificar.

Os diagramas finais são imagens UML feitas no draw.io ou Astah e anexadas em `/.attachments`.

## Cerimônias da Sprint
- Planejamento da Sprint
- Reunião diária
- Revisão da Sprint
- Retrospectiva da Sprint (extensão Team Retrospectives)
