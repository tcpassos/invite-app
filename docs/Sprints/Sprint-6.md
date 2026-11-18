# Sprint 6: versão final e Pitch Final

## Objetivos da Sprint

- Consolidar a versão final da aplicação.
- Verificar a aderência da solução aos requisitos, aos atributos de qualidade e às decisões arquiteturais.
- Revisar e integrar os artefatos produzidos ao longo das sprints.
- Preparar a demonstração e o Pitch Final.

## Questões Norteadoras

- A solução atende os requisitos?
- A arquitetura foi implementada de forma consistente e justificada?
- Os artefatos estão completos e atualizados?
- Como comunicar o problema, a solução, a arquitetura e os resultados?
- Quais foram os desafios, as decisões e as lições do projeto?

## Itens de Backlog

Work items no Azure Boards da org `GUITOEBE`, projeto `invite-people`, iteration Sprint 6.

A Sprint 6 vai de 03/11 a 16/11 e fecha o projeto para o Pitch Final de 17/11.

- **#173** Correção da página do convite publicado no Railway
- **#176** Consolidação da documentação para a entrega final, com as tasks:
  - **#177** Revisar os artefatos das Sprints 1 a 3 contra o código
  - **#178** Corrigir os diagramas de camadas e de componentes
  - **#179** Desenhar o diagrama de sequência da lista de presença
  - **#180** Completar o Protótipo de Baixa Fidelidade
  - **#181** Atualizar a implantação e aceitar o ADR-0015
  - **#182** Aceitar as decisões novas do Guia da Arquitetura
  - **#183** Página da Sprint 6
  - **#184** PR para a `main`
- **#185** T4, Pitch Final, com as tasks:
  - **#186** Slides do Pitch no roteiro sugerido pelo professor
  - **#187** Roteiro e divisão das falas
  - **#188** Ensaio cronometrado com a demonstração no Railway
  - **#189** Subir os slides no Moodle, se houver tarefa de entrega
- **#87** Ficha do Andreas no Team Charter, que veio pendente das sprints anteriores

## Resultado

A publicação no Railway, feita na Sprint 5 para a apresentação intermediária, virou decisão aceita. O time aceitou o [ADR-0015](Sprint-2/Decisões-Arquiteturais/0015-Publicação-para-a-demonstração.md) em 13/11/2026, o [ADR-0003](Sprint-2/Decisões-Arquiteturais/0003-Ambiente-de-execução.md) passou para Substituída, e o [Diagrama de Implantação](Sprint-2/Diagrama-de-Implantação.md) ganhou o nó do Railway ao lado do host de desenvolvimento, com os três serviços, os domínios públicos, a rede privada e as migrations pelo pré-deploy da API. O compose local continua sendo o ambiente de desenvolvimento e o plano B da demonstração.

A correção do #173 trata a página do convite publicada. O servidor do tier Front deixa de cair no erro genérico do Next.js quando uma variável de endereço está ausente ou fora do formato: registra no log qual variável conferir e, sem `API_URL_INTERNAL` válida, serve a página de convite indisponível. Com `FRONT_ORIGIN` inválida, a página abre sem a base dos endereços da prévia do link.

As linhas 35 a 40 da seção 11.1 do [Guia da Arquitetura](../Diretrizes-do-Projeto/Guia-da-Arquitetura.md), que vieram dos [Ajustes de Arquitetura para o MVP](Sprint-5/Ajustes-de-Arquitetura-para-o-MVP.md), receberam o aval do time, junto com as linhas 1 a 19, que ainda não tinham registro de aval. O Guia passou a descrever os três pacotes da camada de Apresentação, público, autenticado e `auth`, como estão no código, e a citar o ADR-0015 onde dizia que o ambiente era só local. Os diagramas de camadas e de componentes foram corrigidos para os três pacotes, e a lista de presença do UC007 ganhou o diagrama de sequência que faltava.

O [Protótipo de Baixa Fidelidade](Sprint-3/Protótipo-de-Baixa-Fidelidade.md), que não foi entregue no Grau A, foi completado com as telas implementadas, cada uma ligada à história de usuário que atende.

Os artefatos das Sprints 1 a 3 foram revisados contra o código. O que era plano do Grau A ficou como estava, e onde o implementado diverge, o artefato recebeu uma nota "Atualização da Sprint 6" apontando para o ADR ou para os Ajustes de Arquitetura. As divergências são a lista de presença por consulta periódica de 20 segundos no lugar do tempo real, a saudação fixa do template sem recado livre, os templates como um CSS com uma classe por template e uma imagem de prévia por template, o terceiro pacote da Apresentação, as telas do link pessoal e da entrada dentro de `PublicInvitePage` e `HostPanelPage`, e a publicação no Railway.

A apresentação do Pitch Final, feita em 17/11/2026, segue o roteiro sugerido pelo professor: o problema e as personas, as funcionalidades do MVP, a organização e o refinamento do backlog, a arquitetura prescritiva do Grau A com os diagramas de casos de uso, camadas, classes e sequência, a arquitetura descritiva com a implantação, os princípios e as decisões, a comparação entre as duas, o caminho de uma resposta pelas três camadas do código, a regra de camadas no lint, as boas práticas, as tecnologias, a demonstração no Railway e a reflexão sobre o Scrum, as dificuldades e o uso de assistentes de IA. Os slides são gerados pelo código em `trabalhos/deck-pitch`.

O ensaio cronometrado e a entrega dos slides fecharam o #185. Continua em aberto a ficha do #87 no Team Charter.

## Principais Artefatos

- [Apresentação do Pitch Final, em PDF](../../trabalhos/T4-Pitch-Final.pdf) e [em PowerPoint](../../trabalhos/T4-Pitch-Final.pptx), com as falas nas notas do apresentador. Os dois arquivos também estão anexados ao #185 no Azure Boards
- [ADR-0015, Publicação para a demonstração](Sprint-2/Decisões-Arquiteturais/0015-Publicação-para-a-demonstração.md)
- [Diagrama de Implantação](Sprint-2/Diagrama-de-Implantação.md), com o ambiente publicado na seção 11
- [Protótipo de Baixa Fidelidade](Sprint-3/Protótipo-de-Baixa-Fidelidade.md)
- [Guia da Arquitetura](../Diretrizes-do-Projeto/Guia-da-Arquitetura.md)
- [Publicação no Railway](../Começando/Publicação-no-Railway.md)
- Código-fonte, documentação e demais artefatos versionados no GitHub
