# Histórias de Usuário

Estas histórias foram escritas a partir das [Personas](Personas.md) e da [Jornada de Usuário](Jornada-de-Usuário.md). O formato usado é: "Como [papel], quero [funcionalidade] para [valor]". Os critérios de aceitação serão usados nos testes e nos work items do Boards.

## Cenário do problema

[Marina](https://dev.azure.com/GUITOEBE/invite-people/_apps/hub/agile-extensions.personas.hub?persona=%40MarinaAnfitriaPersona) organiza festas da família e tem dificuldade para controlar quem vai e o que cada pessoa pode comer. Os avisos de restrição chegam pelo WhatsApp e podem se perder antes de serem repassados ao buffet. [Rafael](https://dev.azure.com/GUITOEBE/invite-people/_apps/hub/agile-extensions.personas.hub?persona=%40RafaelConvidadoPersona) quer confirmar pelo celular, sem instalar outro aplicativo, e registrar que é vegetariano no mesmo formulário. [Jorge](https://dev.azure.com/GUITOEBE/invite-people/_apps/hub/agile-extensions.personas.hub?persona=%40JorgeBuffetPersona), responsável pelo buffet, precisa de quantidades confiáveis para planejar a comida.

## Épico 1: Conta e acesso do anfitrião

### H01
Como anfitrião, quero criar uma conta e entrar para salvar meus eventos e controlar quem pode editá-los.
Critérios de aceitação:
- Consigo me cadastrar com email e senha.
- Consigo entrar e sair da conta.
- Sem estar logado, não consigo criar nem editar eventos.

## Épico 2: Criação e personalização do convite

### H02
Como anfitrião, quero criar um convite com os dados do evento para informar aos convidados quando e onde ele será realizado.
Critérios de aceitação:
- Informo nome, data, hora e local.
- O sistema não deixa salvar com data no passado ou campo obrigatório em branco.
- Opcionalmente defino um teto de pessoas para o evento.
- O convite fica salvo como rascunho.

### H03
Como anfitrião, quero personalizar o convite para que ele combine com a festa.
Critérios de aceitação:
- Escolho um template pronto.
- Ajusto as cores e os textos do convite.
- Vejo as mudanças na hora.

### H04
Como anfitrião, quero visualizar o convite antes de publicar para conferir como ele será exibido aos convidados.
Critérios de aceitação:
- Abro uma prévia igual à que o convidado vai ver.
- Volto para a edição a partir da prévia.

## Épico 3: Compartilhamento

### H05
Como anfitrião, quero gerar um link do convite para enviá-lo pelo WhatsApp.
Critérios de aceitação:
- Gero um link único do convite.
- O link abre o convite sem pedir login ao convidado.

### H06
Como anfitrião, quero publicar e despublicar o convite para controlar quando ele fica acessível.
Critérios de aceitação:
- Enquanto rascunho, o link não abre para os convidados.
- Ao publicar, o link passa a funcionar.
- Consigo despublicar para encerrar as respostas.

## Épico 4: Confirmação de presença

### H07
Como convidado, quero confirmar presença sem criar conta para responder rapidamente pelo celular.
Critérios de aceitação:
- Respondo sim, não ou talvez.
- Não preciso de login nem de instalar app.
- Vejo uma confirmação depois de enviar.
- Recebo um link pessoal para alterar minha resposta depois.

### H08
Como convidado, quero informar quantos acompanhantes levarei para que o anfitrião saiba o total de pessoas.
Critérios de aceitação:
- Informo o número de acompanhantes ao responder sim ou talvez.
- O sistema respeita o limite de acompanhantes definido pelo anfitrião, quando houver.
- Se o evento tiver teto de pessoas e ele já estiver atingido, o sistema me informa que está lotado.

### H09
Como convidado, quero alterar minha resposta caso meus planos mudem.
Critérios de aceitação:
- Reabro o meu link pessoal e mudo a resposta enquanto o evento não ocorreu.
- O painel do anfitrião reflete a mudança.

## Épico 5: Observações alimentares

### H10
Como convidado, quero informar minha restrição alimentar para que o anfitrião saiba o que posso comer.
Critérios de aceitação:
- Marco entre as cinco categorias: vegetariano, vegano, sem glúten, sem lactose e alergia.
- Ao marcar alergia, descrevo a alergia num campo de texto.
- Posso deixar em branco quando não tenho restrição.

## Épico 6: Painel e consolidação

### H11
Como anfitrião, quero acompanhar a lista de presença para saber quantas pessoas irão ao evento.
Critérios de aceitação:
- Vejo os confirmados, os que responderam talvez e os que recusaram.
- Vejo o total de pessoas somando os acompanhantes.
- O painel se atualiza sozinho enquanto fica aberto, sem precisar recarregar a página.

### H12
Como anfitrião, quero reunir as restrições alimentares para repassá-las ao buffet sem retrabalho.
Critérios de aceitação:
- Vejo a contagem por categoria, por exemplo quantos vegetarianos e quantos alérgicos.
- Vejo as descrições de alergia informadas.
- Exporto a lista e as restrições em CSV.
