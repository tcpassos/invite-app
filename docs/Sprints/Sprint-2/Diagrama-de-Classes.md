# Diagrama de Classes

Visão estática do domínio. Apresenta as classes significativas do ponto de vista do modelo, os atributos e as relações entre elas.

Todo atributo tem origem rastreável numa Estrutura de Dados ou Regra de Negócio da [Especificação de Casos de Uso](../Sprint-1/Especificação-de-Casos-de-Uso.md), ou numa [Decisão Arquitetural](../../Diretrizes-do-Projeto/Decisões-Arquiteturais.md). Identificadores em inglês, conforme o [Guia de Estilo](../../Diretrizes-do-Projeto/Guia-de-Estilo.md).

![Diagrama de Classes](/.attachments/diagrama-de-classes.png)

## Descrição das classes

### Classe Host

**Descrição:** o anfitrião autenticado, dono dos convites que cria.

**Responsabilidades:** guardar a credencial de acesso ao painel e ser o proprietário dos convites.

**Relações:** um Host possui de zero a muitos Invite.

**Origem:** UC001 ED1.

### Classe Invite

**Descrição:** o convite de um evento. É a raiz do modelo, e tudo que diz respeito a um evento pende dela.

**Responsabilidades:** guardar os dados do evento, controlar a situação de publicação, carregar o identificador público do link, e definir os dois limites opcionais do evento.

**Relações:** pertence a um Host, tem no máximo uma InviteCustomization e agrega de zero a muitos Guest.

**Sobre os atributos:**

- `publicToken` é opcional porque nasce apenas na transição para publicado (UC004 passo 3). Enquanto o convite é rascunho, ele não existe. É o token de 128 bits do [ADR-0005](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0005-Identificador-público-do-convite.md), em coluna separada da chave primária.
- A situação ativo ou inativo do link, citada na ED1 do UC004, é derivada de `status` e não vira uma segunda coluna.
- `capacityLimit` e `maxCompanionsPerGuest` são **limites diferentes e independentes** (UC002 RN2). O primeiro é o teto do evento inteiro, o segundo restringe cada resposta.
- `/totalPeople` é derivado, indicado pela barra. Não é coluna.
- **As três consultas do painel não são operações desta classe.** A Lista de presença do UC007 é projeção de Guest, a Consolidação do UC008 é agregação por categoria, e a exportação é junção gerada sob demanda. **Nenhuma delas vira tabela**, e nenhuma é método da entidade. Elas são serviços do Domínio, `listAttendance` em `AttendanceService` e as outras duas em `DietaryService`, conforme a seção 11.3 do [Guia da Arquitetura](../../Diretrizes-do-Projeto/Guia-da-Arquitetura.md). A assinatura das três recebe `inviteId` e `hostId`, que não é forma de método de instância de um `Invite` já carregado.
- `/totalPeople` continua sendo atributo derivado desta classe. Quem o calcula em execução é `AttendanceService`, somando os acompanhantes sobre as linhas que `findAttendanceByStatus` já devolveu. É a RN1 do UC007.

**Origem:** UC002 ED1 e RN2, UC004 ED1, ADR-0005 e ADR-0008.

### Classe InviteCustomization

**Descrição:** as escolhas visuais aplicadas a um convite.

**Responsabilidades:** apontar o template escolhido e guardar os ajustes de cor que sobrescrevem o padrão.

**Relações:** pertence a um Invite, referencia um Template e possui de zero a muitas ColorSetting.

**Por que a multiplicidade é 0..1:** o UC002 salva o rascunho no passo 5, e o UC003 só grava as escolhas no passo 6. Existe portanto uma janela em que o convite existe sem personalização, e nela ele renderiza com o template inicial e as cores padrão (UC003 passo 1).

A classe não tem atributos próprios porque os únicos textos nomeados na especificação são o nome do evento e o local, que já são atributos de Invite e ficam em colunas próprias, conforme o [ADR-0004](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0004-Stack-de-implementação.md). As cores são o único conteúdo semiestruturado do modelo. Não há mídia, por decisão do [ADR-0009](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0009-Personalização-por-template.md).

**Origem:** UC003 ED1.

### Classe Template

**Descrição:** um layout de convite em HTML e CSS. Marcada com o estereótipo `<<static asset>>` porque **não é tabela**: é catálogo versionado junto com o código.

**Responsabilidades:** definir o layout, as cores padrão, os limites de tamanho dos campos de texto e a imagem de prévia do link.

**Relações:** referenciado por muitas InviteCustomization, possui suas ColorSetting padrão e suas TextFieldLimit.

**Um ponto de atenção arquitetural:** o [ADR-0009](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0009-Personalização-por-template.md) coloca os templates no tier Front, mas o fluxo A1 do UC003 exige recusar texto acima do limite. Se a única fonte do limite morar no Front, quem valida é a camada de Apresentação, e o [ADR-0001](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0001-Estilo-arquitetural.md) proíbe isso. **O catálogo precisa estar disponível também no tier API**, o que o contrato de tipos compartilhado do ADR-0004 já permite.

**Origem:** UC003 passo 2 e RN1, ADR-0009.

### Classes ColorSetting e TextFieldLimit

**Descrição:** objetos de valor. ColorSetting associa um papel de cor a um valor, e TextFieldLimit associa um campo de texto ao seu tamanho máximo.

**Responsabilidades:** ColorSetting carrega tanto a paleta padrão do template quanto as sobrescritas do convite. TextFieldLimit sustenta a regra RN2 do UC003.

**Relações:** ambas compõem Template. ColorSetting também compõe InviteCustomization.

**Origem:** UC003 ED1 e RN2.

### Classe Guest

**Descrição:** um convidado que respondeu ao convite. **A identidade nasce no ato da resposta**, e não num cadastro prévio feito pelo anfitrião, conforme o [ADR-0006](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0006-Identidade-do-convidado.md).

**Responsabilidades:** registrar quem respondeu, o que respondeu, quantas pessoas leva, e carregar a credencial que permite editar a resposta depois.

**Relações:** pertence a um Invite e possui no máximo uma DietaryNote.

**Sobre os atributos:**

- `respondedAt` é obrigatório justamente porque o registro nasce na resposta. Se o time voltar a ter lista prévia de convidados, este atributo passa a ser opcional, e o ADR-0006 já registra que a entidade é a mesma nos dois modelos.
- `personalToken` é a credencial de edição da resposta (UC005 ED2 e RN3), e é o **segundo identificador público do sistema**. O formato e a revogação dele ainda não têm ADR.
- `companionCount` respeita `maxCompanionsPerGuest` do convite, quando definido (UC005 RN2).
- Não há chave única por nome. **Dois convidados com o mesmo nome são dois registros**, que é uma consequência assumida no ADR-0006.

**Origem:** UC005 ED1 e ED2, ADR-0006.

### Classe DietaryNote

**Descrição:** a observação alimentar de um convidado, que é o diferencial declarado do produto.

**Responsabilidades:** ligar um convidado às categorias de restrição que ele marcou e ao texto livre que escreveu.

**Relações:** pertence a um Guest e associa-se a muitas DietaryCategory.

A nota só existe quando o status é ACCEPTED ou MAYBE, pela pré-condição do UC006. Nota sem categoria marcada significa sem restrição (UC006 A1), e ausência de nota significa que o convidado não passou pelo UC006.

**Origem:** UC006 ED1.

### Classe DietaryCategory

**Descrição:** a categoria de restrição alimentar. Marcada como `<<reference data>>` porque é dado de referência com carga inicial.

**Responsabilidades:** nomear a categoria e declarar se ela exige descrição adicional.

**Relações:** associa-se a muitas DietaryNote.

**Por que é classe e não enumeração:** `requiresDescription` é dado da categoria, e a RN2 do UC006 depende dele para exigir a descrição quando a categoria é alergia. Enumeração não carrega atributo.

Um convidado com mais de uma categoria conta em cada uma na consolidação do UC008, que é o comportamento natural do agrupamento.

**Origem:** UC006 passo 1 e RN2, H10.

## Fora deste diagrama, de propósito

- **Chave primária e chave estrangeira** são modelo físico. O ADR-0005 trata da separação entre chave primária e identificador público.
- **A tabela de ligação** entre DietaryNote e DietaryCategory é implementação da associação muitos para muitos.
- **Sessão do anfitrião** e o **contador de limite de taxa** do ADR-0008 são infraestrutura e aparecem no diagrama de componentes.
- **O painel não tem entidade de assinatura**, porque o [ADR-0007](../../Diretrizes-do-Projeto/Decisões-Arquiteturais/0007-Atualização-da-lista-de-presença.md) escolheu consulta periódica.

## Pendências que este diagrama expôs

A modelagem revelou lacunas na especificação que ainda precisam de decisão do time:

1. **Os textos da personalização nunca foram nomeados.** Se o UC003 prevê textos próprios além do nome do evento e do local, eles precisam de nome, de passo e de coluna. Enquanto isso não for decidido, InviteCustomization fica sem atributos de texto.
2. **O `personalToken` do convidado não tem ADR.** Falta decidir entropia, alfabeto, revogação, e o que acontece com ele quando o convite é despublicado.
3. **As cinco categorias alimentares não estão congeladas por regra.** Elas aparecem no passo 1 do UC006 e na H10, as duas com a palavra "como", que sugere lista aberta. A RN2 do UC006 depende de a categoria alergia existir.
4. **Fuso horário e fim do evento.** Três regras dependem de tempo, e o Invite tem data e hora separadas, sem duração e sem fuso. No próprio dia da festa a regra fica sem definição.

## Fonte do diagrama

Gerado a partir de [`diagrama-de-classes.puml`](/.attachments/diagrama-de-classes.puml), versionado junto com a imagem. Para regerar depois de editar o fonte, com Docker:

    docker run --rm -v "<caminho de docs/.attachments>:/data" plantuml/plantuml -tpng /data/diagrama-de-classes.puml
