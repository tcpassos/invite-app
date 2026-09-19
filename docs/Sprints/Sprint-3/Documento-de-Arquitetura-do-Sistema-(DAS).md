# Documento de Arquitetura de Software

**Projeto:** invite-app
**Versão:** 0.1
**Autores:** Tiago Passos, Guilherme Toebe dos Santos, Andreas Grings, Gabriel Tomasi de Melo

## Histórico de Revisões

| Data | Versão | Descrição | Autor |
|---|---|---|---|
| 19/09/2026 | 0.1 | Estrutura do documento a partir do template da Aula 07 | Tiago Passos |

---

## Como preencher este documento

> **Este bloco sai antes da entrega.** Ele existe só enquanto o documento está sendo escrito, e a task **#108** o remove junto com a revisão final.

A estrutura segue o template do RUP que o professor disponibilizou na Aula 07. Duas escolhas de formato vieram dos dois exemplos preenchidos que ele publicou junto.

A subseção 1.5 Visão Geral foi retirada, porque nenhum dos dois exemplos a tem. A subseção 5.1 se chama Divisão em Pacotes, que é o nome que os dois exemplos usam no lugar de Pacotes de Design Significativos do template.

Seis das oito seções têm conteúdo já escrito em outro artefato. O trabalho nelas é recortar e adaptar, não redigir do zero.

| Seção | Task | De onde vem o conteúdo |
|---|---|---|
| 1. Introdução | #98 | Nada pronto. Texto curto, escrito aqui |
| 2. Representação Arquitetural | #98 | [Guia da Arquitetura](../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md), seções 1 e 2 |
| 3. Metas e Restrições | #98 | Os 12 [ADRs](../../Diretrizes-do-Projeto/Decisões-Arquiteturais.md), em forma de restrições curtas |
| 4. Visão de Casos de Uso | #99 | [Especificação de Casos de Uso](../Sprint-1/Especificação-de-Casos-de-Uso.md) e [Diagrama de Casos de Uso](../Sprint-1/Diagrama-de-Casos-de-Uso.md) |
| 5. Visão Lógica | #100, #101, #102 | [Diagrama de Classes](../Sprint-2/Diagrama-de-Classes.md). Falta o diagrama de pacotes, que é a task #100 |
| 6. Visão de Implantação | #103 | [Diagrama de Implantação](../Sprint-2/Diagrama-de-Implantação.md), pronto |
| 7. Visão da Implementação | #104 | [Diagrama de Componentes](../Sprint-2/Diagrama-de-Componentes.md) e seção 10 do Guia da Arquitetura |
| 8. Visão de Dados | #105, #106, #107 | Nada pronto. É o único conteúdo inteiramente novo |

O formato da tabela de descrição de classe da seção 5 é decidido na task **#97** e vale para todas as classes, sem variação entre quem escreve.

---

## 1. Introdução

### 1.1 Finalidade

### 1.2 Escopo

### 1.3 Definições, Acrônimos e Abreviações

### 1.4 Referências

---

## 2. Representação Arquitetural

---

## 3. Metas e Restrições da Arquitetura

---

## 4. Visão de Casos de Uso

### 4.1 Realizações de Casos de Uso

As realizações ficam em artefato independente, conforme o template determina e conforme o exemplo do professor confirma. Ver [Documento de Realização de Casos de Uso](Documento-de-Realização-de-Casos-de-Uso.md).

---

## 5. Visão Lógica

A decomposição do sistema em pacotes, com as classes significativas de cada um.

A divisão parte das três camadas do [ADR-0001](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0001-Estilo-arquitetural.md) e dos dois pacotes da camada de Apresentação que a seção 5.3 do [Guia da Arquitetura](../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md) define. Pacote aqui é unidade de organização de código, e não componente nem tier, que são assunto das seções 7 e 6.

### 5.1 Divisão em Pacotes

![Diagrama de pacotes](../../.attachments/diagrama-de-pacotes.png)

**Como ler.** Retângulo com aba é pacote. Seta tracejada é dependência, ou seja, o pacote de origem importa alguma coisa do destino. A única seta rotulada é a do `controller` para a `apresentacao`, porque aquela dependência cruza a rede e não é importação de código.

| Pacote | Camada | O que contém |
|---|---|---|
| `front.view` | Apresentação no sentido amplo, no navegador | Telas do convite público e do painel |
| `front.controller` | Apresentação no sentido amplo, partida entre o tier Front e o navegador | Resolução de rota, chamada à API e a consulta periódica do [ADR-0007](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0007-Atualização-da-lista-de-presença.md) |
| `front.templates` | Nenhuma, é ativo estático | Os templates em HTML e CSS do [ADR-0009](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0009-Personalização-por-template.md) |
| `contract` | Nenhuma, é módulo compartilhado | Os tipos que as duas pontas usam, compilados para dentro dos dois builds |
| `api.apresentacao.publico` | Apresentação | `PublicRsvpController`, a única escrita sem autenticação do sistema |
| `api.apresentacao.autenticado` | Apresentação | `InviteController` e `DietaryController` |
| `api.apresentacao.autenticacao` | Apresentação | `AuthController`, ver a ressalva abaixo |
| `api.apresentacao.transversal` | Apresentação | `SessionGuard`, `RateLimitGuard` e `HttpExceptionFilter` |
| `api.dominio` | Domínio | Os seis serviços, de `RsvpService` a `TemplateCatalog` |
| `api.dados` | Dados | `InviteRepository`, `DietaryCategoryRepository` e `HostRepository` |
| `api.modelo` | Atravessa Domínio e Dados | As classes do [Diagrama de Classes](../Sprint-2/Diagrama-de-Classes.md) e os dois enums |

### Por que `modelo` é pacote irmão e não filho do Domínio

Este ponto só aparece quando se desenha o diagrama de pacotes, e decidi-lo errado produz um ciclo de importação que o compilador aceita e que ninguém percebe até a base crescer.

A seção 3.2 do Guia da Arquitetura registra que o **Domínio depende dos Dados**. A seção 3.3 registra que a camada de Dados **devolve as classes do Diagrama de Classes**, ou seja, depende delas.

Se `Invite`, `Guest` e as outras morarem dentro do pacote de Domínio, o resultado é `dominio` importando `dados` e `dados` importando `dominio`.

> **As classes de modelo ficam em pacote próprio, no mesmo nível de `dominio` e de `dados`.** Nenhum dos dois importa o outro por causa delas, e os dois importam `modelo`.

Isso não contraria o ADR-0001. A regra de lá é que Domínio e Dados não dependem da Apresentação, e ela continua valendo. `modelo` não é uma quarta camada, é onde vivem os classificadores que duas camadas trocam entre si.

### Uma ressalva sobre `autenticacao`

O pacote existe porque `AuthController` precisa morar em algum lugar, e **ele não cabe em nenhum dos dois pacotes que o guia define**. Não é do público, porque a seção 5.3 restringe aquele pacote a dois serviços de Domínio. Não é do autenticado, porque a rota de entrada é anterior à sessão.

A pendência 2 da seção 10.2 do [Diagrama de Componentes](../Sprint-2/Diagrama-de-Componentes.md) registra essa lacuna e diz que falta decidir se entra um terceiro pacote. **Este diagrama adota o terceiro pacote de forma provisória**, porque um diagrama precisa colocar a classe em algum lugar. A decisão continua com o time, e se ela for outra, a figura muda.

### Formato da descrição de classe

Decidido na task #97 e usado em toda a seção 5, sem variação entre quem escreve. O formato vem dos dois exemplos de DAS que o professor publicou, que repetem a mesma tabela 19 e 31 vezes.

| Campo | O que escrever |
|---|---|
| Descrição | Uma frase dizendo o que a classe representa no domínio |
| Responsabilidades | O que ela sabe fazer, em lista curta |
| Relações | Com quais outras classes se associa, com a multiplicidade |
| Atributos | Nome, tipo e multiplicidade, na grafia do Diagrama de Classes |
| Métodos | Assinatura completa, com tipo de parâmetro e de retorno |

Duas regras fecham os casos de dúvida. **Classe sem atributo ou sem método próprio leva a linha assim mesmo, com a palavra Nenhum**, porque célula vazia não distingue ausência de esquecimento. E **o nome dos identificadores fica em inglês**, conforme o [Guia de Estilo](../../Diretrizes-do-Projeto/Guia-de-Estilo.md), enquanto o texto de descrição fica em português.

---

## 6. Visão de Implantação

---

## 7. Visão da Implementação

### 7.1 Camadas

---

## 8. Visão de Dados

### 8.1 Modelo de objetos persistentes

### 8.2 Estratégias

### 8.3 Modelo Relacional
