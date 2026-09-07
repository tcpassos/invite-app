# T1, enunciado

Fonte: Plano de Ensino e Orientações Gerais, páginas 5 e 6. Arquitetura de Software, 2026/2,
Prof. Kleinner Silva Farias de Oliveira. Não existe PDF separado para o T1, o enunciado está
dentro do plano de ensino, na seção de avaliação do Grau A.

## Texto literal

> 1º Trabalho (T1) – Seminário sobre Tecnologias Emergentes para Arquitetura de Software
> (Peso: 10% da nota do Grau A)
>
> O Trabalho 1 (T1) consiste na realização de um seminário, em grupo de até quatro integrantes,
> sobre uma tecnologia, ferramenta, framework, plataforma ou paradigma relacionado à área de
> Arquitetura de Software e que possa ser utilizado no desenvolvimento da aplicação escolhida pela
> equipe ao longo da disciplina. O objetivo deste trabalho é ampliar o conhecimento técnico dos
> alunos sobre tecnologias atuais, permitindo que cada equipe avalie criticamente sua aplicabilidade
> no contexto do projeto que será desenvolvido. O tema deverá ser previamente validado pelo
> professor. Como sugestões, destacam-se: Event-Driven Architecture, Microsserviços, Serverless,
> Spring Boot, React, Node.js, Azure DevOps, GitHub Actions, Jenkins, Docker, Kubernetes, Expo Go,
> ChatGPT, LLMs, MLOps, AutoML, Deep Learning, entre outras tecnologias relevantes. Cada equipe tem
> liberdade para propor um tema para o T1.
>
> A apresentação deverá ter duração de 20 a 25 minutos, seguida de 10 a 15 minutos de arguição,
> conduzida pelo professor e pela turma. Espera-se que o grupo apresente os conceitos fundamentais
> da tecnologia, sua arquitetura, vantagens, limitações, aplicações práticas e exemplos de uso,
> estabelecendo uma relação explícita entre a tecnologia apresentada e a aplicação que será
> desenvolvida na disciplina. O formato da apresentação é de livre escolha do grupo. Os slides
> deverão ser disponibilizados no Moodle até a data da apresentação.
>
> A avaliação será individual e considerará tanto o desempenho do estudante durante a apresentação
> quanto sua participação na arguição. A nota será atribuída conforme a seguinte rubrica:
> (i) domínio técnico e profundidade do conteúdo (30%); (ii) capacidade de relacionar a tecnologia
> ao projeto da disciplina e às decisões arquiteturais (25%); (iii) organização, clareza e qualidade
> dos slides e da apresentação (20%); (iv) qualidade das demonstrações, exemplos ou estudos de caso
> apresentados (10%); (v) participação individual, capacidade de comunicação e respostas durante a
> arguição (15%).

## Onde cada exigência aparece no que foi feito

O deck tem 31 slides. Os números abaixo são os do arquivo `T1-Docker-Invite-People.pptx`.

| Exigência do enunciado | Onde está |
|---|---|
| Grupo de até quatro integrantes | Quatro. Capa e divisores de bloco |
| Tema validado pelo professor | Postado no fórum de escolha de tema. Confirmar a resposta dele |
| Conceitos fundamentais | Slides 5 e 6, linha do tempo e as duas definições |
| Arquitetura da tecnologia | Slides 6 a 11, namespaces, cgroups, camadas da imagem, pilha de execução |
| Vantagens | Slide 22 |
| Limitações | Slides 23, 24 e 26, com a comparação de superfície de ataque e quando não compensa |
| Aplicações práticas e exemplos de uso | Slides 13 a 18, o mapeamento para os itens #59 e #60 |
| Exemplo de uso e estudo de caso | Slide 21, remoção do dockershim no Kubernetes 1.24 |
| Demonstração | Slide 20, roteiro de 90 segundos com volume nomeado |
| Relação explícita com a aplicação da disciplina | Bloco C inteiro, mais os slides 28, 29 e 30 |
| Duração de 20 a 25 minutos | Roteiro fecha em 23, com um minuto de folga para as trocas |
| Slides no Moodle até a data | **Pendente.** Ninguém subiu ainda |

## Pontos que o enunciado cobra e ainda dependem do time

1. Subir o `.pptx` no Moodle antes da apresentação. É exigência escrita, não recomendação.
2. Confirmar no fórum que o professor validou o tema Docker.
3. A avaliação é individual e 15% vem da arguição. Cada um responde pelo próprio bloco, e essa
   divisão é falada na abertura porque o slide de agenda foi retirado.
4. A rubrica dá 10% para demonstração. A do slide 20 ainda precisa ser ensaiada de verdade numa
   máquina do time, porque hoje o slide descreve uma saída que ninguém capturou.
