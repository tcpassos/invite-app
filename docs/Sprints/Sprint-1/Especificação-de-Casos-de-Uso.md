# Especificação de Casos de Uso

Formato detalhado: `UCxxx - <verbo + objeto>`, com Nome, Descrição, Atores, Pré-condições, Pós-condições, Fluxo Básico (passos numerados), Fluxos Alternativos (A1, A2 e assim por diante, ligados ao número do passo), Estruturas de Dados (ED1 em diante) e Regras de Negócio (RN1 em diante).

## Atores
- Anfitrião (ator primário do painel)
- Convidado (ator primário do convite público)

## Casos de uso
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

### UC001 - Autenticar anfitrião

**Descrição:** o anfitrião cria conta e entra no sistema para gerenciar seus convites.

**Atores:** Anfitrião

**Pré-condições:** nenhuma.

**Pós-condições:** o anfitrião fica autenticado e com acesso ao seu painel.

**Fluxo Básico:**
1. O anfitrião acessa a tela de acesso.
2. O sistema exibe as opções de entrar e de criar conta.
3. O anfitrião informa email e senha (RN1).
4. O anfitrião confirma.
5. O sistema valida as credenciais (RN2) e inicia a sessão (ED1).
6. O sistema abre o painel do anfitrião.
7. O caso de uso é encerrado.

**Fluxos Alternativos:**
(A1) Extensão no Passo 2, o anfitrião ainda não tem conta:
1.1. O anfitrião escolhe criar conta.
1.2. O anfitrião informa nome, email e senha (RN1).
1.3. O sistema verifica que o email não está cadastrado (RN3) e cria a conta (ED1).
1.4. O sistema segue para o Passo 5.
(A2) Fluxo Alternativo ao Passo 5, credenciais inválidas:
2.1. O sistema informa que email ou senha estão incorretos, sem dizer qual.
2.2. O sistema retorna ao Passo 3.

**Estruturas de Dados:**
(ED1) Conta do anfitrião: nome, email e senha (armazenada de forma segura).

**Regras de Negócio:**
(RN1) Email e senha são obrigatórios. A senha tem no mínimo 8 caracteres.
(RN2) A sessão expira após um período de inatividade.
(RN3) Não pode haver dois cadastros com o mesmo email.

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

### UC003 - Personalizar visual do convite

**Descrição:** o anfitrião ajusta a aparência do convite.

**Atores:** Anfitrião

**Pré-condições:** existe um convite em rascunho (UC002) e o anfitrião está autenticado.

**Pós-condições:** as escolhas visuais ficam salvas no convite.

**Fluxo Básico:**
1. O sistema exibe o editor com um tema inicial e a prévia do convite.
2. O anfitrião escolhe um tema entre os disponíveis (RN1).
3. O anfitrião ajusta cores, imagem de fundo e os textos do convite.
4. O sistema atualiza a prévia a cada mudança.
5. O anfitrião salva as alterações.
6. O sistema grava as escolhas no convite (ED1).
7. O caso de uso é encerrado.

**Fluxos Alternativos:**
(A1) Fluxo Alternativo ao Passo 3, imagem em formato ou tamanho inválido:
1.1. O sistema recusa a imagem e informa os formatos e o tamanho aceitos (RN2).
1.2. O sistema retorna ao Passo 3.

**Estruturas de Dados:**
(ED1) Personalização: tema, cores, imagem de fundo e textos, ligados ao convite.

**Regras de Negócio:**
(RN1) O anfitrião parte sempre de um tema, que pode ser ajustado.
(RN2) A imagem de fundo aceita os formatos JPG e PNG, com tamanho máximo definido pelo sistema.

### UC004 - Compartilhar convite (gerar link)

**Descrição:** o anfitrião publica o convite e obtém o link para enviar aos convidados.

**Atores:** Anfitrião

**Pré-condições:** existe um convite (UC002) e o anfitrião está autenticado.

**Pós-condições:** o convite fica publicado e acessível por um link.

**Fluxo Básico:**
1. O anfitrião seleciona a opção de compartilhar.
2. O sistema valida que o convite tem os dados obrigatórios (RN1).
3. O sistema publica o convite e gera um link único (RN2, ED1).
4. O sistema exibe o link com a opção de copiar.
5. O anfitrião copia o link e o envia pelo canal que preferir.
6. O caso de uso é encerrado.

**Fluxos Alternativos:**
(A1) Fluxo Alternativo ao Passo 2, faltam dados obrigatórios:
1.1. O sistema informa o que falta e não publica.
1.2. O sistema encerra o caso de uso.
(A2) Extensão no Passo 4, o anfitrião quer encerrar as respostas:
2.1. O anfitrião despublica o convite.
2.2. O sistema desativa o link, que passa a não abrir mais (RN3).

**Estruturas de Dados:**
(ED1) Link do convite: identificador único e situação (ativo ou inativo).

**Regras de Negócio:**
(RN1) Só é possível publicar um convite com nome, data, hora e local preenchidos.
(RN2) O link é único e não permite adivinhar outros convites.
(RN3) Um convite despublicado não aceita novas respostas.

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

### UC007 - Visualizar lista de presença

**Descrição:** o anfitrião acompanha quem confirmou presença.

**Atores:** Anfitrião

**Pré-condições:** o anfitrião está autenticado e o convite existe.

**Pós-condições:** nenhuma. É uma consulta e não altera dados.

**Fluxo Básico:**
1. O anfitrião abre o painel do convite.
2. O sistema exibe os convidados agrupados por status: confirmados, pendentes e recusados (ED1).
3. O sistema mostra o total de pessoas, somando os acompanhantes (RN1).
4. O anfitrião consulta os dados.
5. O caso de uso é encerrado.

**Fluxos Alternativos:**
(A1) Fluxo Alternativo ao Passo 2, ainda não há respostas:
1.1. O sistema informa que nenhum convidado respondeu até o momento.

**Estruturas de Dados:**
(ED1) Lista de presença: por convidado, o nome, o status e o número de acompanhantes.

**Regras de Negócio:**
(RN1) O total de pessoas soma cada convidado confirmado mais os seus acompanhantes.

### UC008 - Consolidar e exportar observações alimentares

**Descrição:** o anfitrião vê a contagem das restrições alimentares e exporta os dados para o buffet.

**Atores:** Anfitrião

**Pré-condições:** o anfitrião está autenticado e há convidados que informaram restrição.

**Pós-condições:** nenhuma. É uma consulta com exportação e não altera dados.

**Fluxo Básico:**
1. O anfitrião abre a consolidação de restrições no painel.
2. O sistema apresenta a contagem por categoria, por exemplo quantos vegetarianos e quantos alérgicos (ED1, RN1).
3. O sistema lista as descrições de alergia informadas.
4. O anfitrião solicita a exportação.
5. O sistema gera um arquivo CSV com os dados (RN2, ED2).
6. O caso de uso é encerrado.

**Fluxos Alternativos:**
(A1) Fluxo Alternativo ao Passo 2, nenhum convidado informou restrição:
1.1. O sistema informa que não há restrições registradas e não oferece a exportação.

**Estruturas de Dados:**
(ED1) Consolidação: por categoria, a contagem de convidados.
(ED2) Arquivo de exportação: uma linha por convidado, com nome, status, categorias e observação.

**Regras de Negócio:**
(RN1) Um convidado com mais de uma categoria conta em cada categoria que marcou.
(RN2) A exportação inclui apenas convidados confirmados ou em talvez.
