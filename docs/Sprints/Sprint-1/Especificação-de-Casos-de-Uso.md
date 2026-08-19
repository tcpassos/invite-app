# Especificação de Casos de Uso

Formato detalhado: `UCxxx - <verbo + objeto>`, com Nome, Descrição, Atores, Pré-condições, Pós-condições, Fluxo Básico (passos numerados), Fluxos Alternativos (A1, A2 e assim por diante, ligados ao número do passo), Estruturas de Dados (ED1 em diante) e Regras de Negócio (RN1 em diante).

## Atores
- Anfitrião (ator primário do painel)
- Convidado (ator primário do convite público)

## Casos de uso candidatos
| ID | Caso de uso | Ator |
|---|---|---|
| UC001 | Autenticar anfitrião | Anfitrião |
| UC002 | Criar convite | Anfitrião |
| UC003 | Personalizar visual do convite | Anfitrião |
| UC004 | Compartilhar convite (gerar link) | Anfitrião |
| UC005 | Confirmar presença (RSVP) | Convidado |
| UC006 | Registrar observação alimentar | Convidado |
| UC007 | Visualizar lista de presença | Anfitrião |
| UC008 | Consolidar e exportar observações alimentares | Anfitrião |

## Especificações detalhadas

Abaixo estão detalhados os casos de uso centrais do MVP. UC001, UC003, UC004, UC007 e UC008 seguem o mesmo formato e serão completados na sequência.

### UC002 - Criar convite

**Descrição:** o anfitrião cria um novo convite com os dados do evento.

**Atores:** Anfitrião

**Pré-condições:** o anfitrião está autenticado (UC001).

**Pós-condições:** o convite fica salvo como rascunho, pronto para personalização e publicação.

**Fluxo Básico:**
1. O anfitrião seleciona a opção de criar convite.
2. O sistema exibe o formulário do evento.
3. O anfitrião informa nome do evento, data, hora e local (RN1).
4. O anfitrião confirma a criação.
5. O sistema valida os dados (RN1) e salva o convite como rascunho (ED1).
6. O sistema abre a tela de personalização (UC003).
7. O caso de uso é encerrado.

**Fluxos Alternativos:**
(A1) Fluxo Alternativo ao Passo 5, dados obrigatórios ausentes ou data no passado:
1.1. O sistema indica os campos com problema e mantém o que já foi preenchido.
1.2. O sistema retorna ao Passo 3.

**Estruturas de Dados:**
(ED1) Convite: nome do evento, data, hora, local, situação (rascunho ou publicado) e anfitrião responsável.

**Regras de Negócio:**
(RN1) Nome, data, hora e local são obrigatórios. A data deve ser igual ou posterior ao dia atual.

### UC005 - Confirmar presença

**Descrição:** o convidado registra se vai comparecer ao evento e quantas pessoas leva.

**Atores:** Convidado

**Pré-condições:** o convite existe e está publicado. O convidado acessou o link do convite.

**Pós-condições:** a resposta do convidado fica registrada e aparece no painel do anfitrião.

**Fluxo Básico:**
1. O convidado abre o link do convite.
2. O sistema exibe os dados do evento e o formulário de confirmação.
3. O convidado escolhe uma opção de presença: sim, não ou talvez (RN1).
4. Se a resposta for sim ou talvez, o convidado informa o número de acompanhantes (RN2).
5. O convidado informa o nome para identificação.
6. O convidado envia a resposta.
7. O sistema valida os dados (RN2) e registra a confirmação (ED1).
8. O sistema exibe uma mensagem de sucesso e a opção de alterar a resposta depois.
9. O caso de uso é encerrado.

**Fluxos Alternativos:**
(A1) Fluxo Alternativo ao Passo 3, o convidado responde que não vai:
1.1. O sistema registra a ausência e não pede acompanhantes nem restrição.
1.2. O sistema segue para o Passo 6.
(A2) Fluxo Alternativo ao Passo 7, dados inválidos:
2.1. O sistema aponta o campo com problema e mantém o que já foi preenchido.
2.2. O sistema retorna ao Passo 3.
(A3) Extensão no Passo 4, o convidado quer registrar restrição alimentar:
3.1. O sistema executa o caso de uso Registrar observação alimentar (UC006).

**Estruturas de Dados:**
(ED1) Confirmação de presença: nome do convidado, status (sim, não ou talvez), número de acompanhantes e data da resposta.

**Regras de Negócio:**
(RN1) A resposta deve ser uma entre sim, não ou talvez.
(RN2) O número de acompanhantes é um inteiro maior ou igual a zero e respeita o limite definido pelo anfitrião, quando houver.
(RN3) O convidado pode alterar a resposta enquanto o evento não tiver ocorrido.

### UC006 - Registrar observação alimentar

**Descrição:** o convidado informa restrições ou preferências alimentares ao confirmar presença.

**Atores:** Convidado

**Pré-condições:** o convidado está confirmando presença (UC005) com resposta sim ou talvez.

**Pós-condições:** a observação alimentar fica ligada ao convidado e entra na consolidação do anfitrião.

**Fluxo Básico:**
1. O sistema exibe as categorias de restrição (vegetariano, vegano, sem glúten, sem lactose, alergia) e um campo de texto livre.
2. O convidado marca uma ou mais categorias (RN1).
3. Se marcar alergia, o convidado descreve a alergia no campo de texto (RN2).
4. O convidado confirma.
5. O sistema salva a observação ligada à confirmação do convidado (ED1).
6. O caso de uso é encerrado.

**Fluxos Alternativos:**
(A1) Fluxo Alternativo ao Passo 2, o convidado não tem restrição:
1.1. O convidado deixa as categorias em branco e confirma.
1.2. O sistema registra "sem restrição" e segue para o Passo 5.

**Estruturas de Dados:**
(ED1) Observação alimentar: convidado, categorias marcadas e texto livre.

**Regras de Negócio:**
(RN1) O convidado pode marcar mais de uma categoria.
(RN2) Se a categoria alergia for marcada, a descrição no texto livre é obrigatória.
