# Histórias de Usuário

Baseadas nas [Personas](Personas.md) e na [Jornada de Usuário](Jornada-de-Usuário.md). Formato: "Como um [papel], eu quero [funcionalidade], de modo que [valor]." Cada história traz critérios de aceitação, que orientam os testes e viram base para os work items no Boards.

## Cenário do problema

Marina organiza festas da família e sempre se perde no controle de quem vai e do que cada pessoa pode comer. Os avisos de restrição chegam soltos no WhatsApp e às vezes somem antes de chegar ao buffet. Rafael, convidado, quer confirmar rápido pelo celular, sem instalar nada, e avisar que é vegetariano sem precisar mandar uma mensagem à parte. Jorge, do buffet, precisa de números confiáveis para planejar a comida.

## Épico 1: Conta e acesso do anfitrião

### H01
Como um anfitrião, eu quero criar uma conta e entrar, de modo que meus eventos fiquem salvos e só eu possa editá-los.
Critérios de aceitação:
- Consigo me cadastrar com email e senha.
- Consigo entrar e sair da conta.
- Sem estar logado, não consigo criar nem editar eventos.

## Épico 2: Criação e personalização do convite

### H02
Como um anfitrião, eu quero criar um convite com os dados do evento, de modo que os convidados saibam quando e onde será.
Critérios de aceitação:
- Informo nome, data, hora e local.
- O sistema não deixa salvar com data no passado ou campo obrigatório em branco.
- O convite fica salvo como rascunho.

### H03
Como um anfitrião, eu quero personalizar o visual do convite, de modo que ele combine com o clima da festa.
Critérios de aceitação:
- Escolho um tema pronto.
- Ajusto cores, imagem de fundo e os textos do convite.
- Vejo as mudanças na hora.

### H04
Como um anfitrião, eu quero pré-visualizar o convite antes de publicar, de modo que eu veja como ele chega ao convidado.
Critérios de aceitação:
- Abro uma prévia igual à que o convidado vai ver.
- Volto para a edição a partir da prévia.

## Épico 3: Compartilhamento

### H05
Como um anfitrião, eu quero gerar um link do convite, de modo que eu possa enviá-lo pelo WhatsApp.
Critérios de aceitação:
- Gero um link único do convite.
- O link abre o convite sem pedir login ao convidado.

### H06
Como um anfitrião, eu quero publicar e despublicar o convite, de modo que eu controle quando ele fica acessível.
Critérios de aceitação:
- Enquanto rascunho, o link não abre para os convidados.
- Ao publicar, o link passa a funcionar.
- Consigo despublicar para encerrar as respostas.

## Épico 4: Confirmação de presença

### H07
Como um convidado, eu quero confirmar presença sem criar conta, de modo que eu responda em segundos pelo celular.
Critérios de aceitação:
- Respondo sim, não ou talvez.
- Não preciso de login nem de instalar app.
- Vejo uma confirmação depois de enviar.

### H08
Como um convidado, eu quero informar quantas pessoas eu levo, de modo que o anfitrião saiba o total certo.
Critérios de aceitação:
- Informo o número de acompanhantes ao responder sim ou talvez.
- O sistema respeita o limite definido pelo anfitrião, quando houver.

### H09
Como um convidado, eu quero alterar minha resposta depois, de modo que eu ajuste caso meus planos mudem.
Critérios de aceitação:
- Reabro o mesmo link e mudo a resposta enquanto o evento não ocorreu.
- O painel do anfitrião reflete a mudança.

## Épico 5: Observações alimentares

### H10
Como um convidado, eu quero informar minha restrição alimentar, de modo que o anfitrião saiba o que eu posso comer.
Critérios de aceitação:
- Marco categorias como vegetariano, vegano, sem glúten, sem lactose ou alergia.
- Ao marcar alergia, descrevo a alergia num campo de texto.
- Posso deixar em branco quando não tenho restrição.

## Épico 6: Painel e consolidação

### H11
Como um anfitrião, eu quero ver a lista de presença em tempo real, de modo que eu saiba quantos vão comparecer.
Critérios de aceitação:
- Vejo os confirmados, os pendentes e os que recusaram.
- Vejo o total de pessoas somando os acompanhantes.

### H12
Como um anfitrião, eu quero uma consolidação das restrições alimentares, de modo que eu repasse ao buffet sem retrabalho.
Critérios de aceitação:
- Vejo a contagem por categoria, por exemplo quantos vegetarianos e quantos alérgicos.
- Vejo as descrições de alergia informadas.
- Exporto a lista e as restrições em CSV.
