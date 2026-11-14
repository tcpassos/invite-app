# Gera o slides.json do Pitch Final. O texto de cada slide e a fala (notas) ficam aqui.
import json, io

A, T, GA, GU = 'Produto e backlog, Andreas', 'Arquitetura, Tiago', 'Arquitetura e código, Gabriel', 'Demonstração e reflexão, Guilherme'
S = []
def add(**s):
    s['n'] = len(S) + 1
    S.append(s)

add(modelo='capaPitch', bloco='', cartola='Pitch Final, Time 04',
    titulo='App de gerenciamento<br>de convites', tam=56,
    sub='Problema, arquitetura, implementação e resultado do projeto',
    equipe='Andreas Grings, Gabriel Tomasi,<br>Guilherme Toebe e Tiago Passos',
    disciplina='Arquitetura de Software<br>Prof. Kleinner Farias', data='17/11/2026',
    captura='c03-capa.png',
    notas='Andreas. Boa noite. Somos o Time 04. O nosso projeto é um app para gerenciar convites de festa. O anfitrião cria o convite e acompanha quem vai. O convidado responde pelo link. Vamos mostrar o produto, a arquitetura planejada e a implementada, a aplicação funcionando e o que aprendemos.')

add(modelo='divisor', bloco='Produto e backlog', num='01', titulo='O produto e o backlog',
    notas='Andreas. Eu começo pelo problema, por quem usa o produto e pelo backlog.')

add(modelo='problema', bloco=A, titulo='O problema que o app resolve',
    linhas=[
        dict(icone='conversa', t='Confirmações espalhadas', d='Quem organiza uma festa junta as respostas em conversas de WhatsApp, uma por convidado.'),
        dict(icone='pessoas', t='Ninguém sabe quantas pessoas vêm', d='Cada convidado pode levar acompanhantes, e o total fica incerto.'),
        dict(icone='prato', t='A restrição alimentar se perde', d='O aviso de alergia fica numa mensagem e não chega ao buffet.'),
    ],
    cartao=dict(rotulo='Objetivo do projeto', icone='alvo',
                texto='Um convite com link, que o convidado responde sem criar conta, e um painel para o anfitrião.',
                itens=['O anfitrião sabe quem vai e quantos são', 'O convidado responde em poucos toques', 'O buffet recebe a lista de restrições']),
    notas='Andreas. Quem organiza uma festa recebe as confirmações em conversas separadas no WhatsApp. Com os acompanhantes, fica difícil saber quantas pessoas vêm. E o aviso de alergia de um convidado fica numa mensagem e não chega ao buffet. O objetivo do projeto é um convite com link. O convidado responde sem criar conta. O anfitrião acompanha as respostas num painel e baixa a lista de restrições para o buffet.')

add(modelo='personas', bloco=A, titulo='Para quem é o produto',
    personas=[
        dict(icone='festa', nome='Marina', papel='Anfitriã',
             precisa='Criar um convite bonito em poucos minutos e saber quantas pessoas vão.',
             app='Cria, personaliza e publica o convite, e acompanha a lista no painel.'),
        dict(icone='celular', nome='Rafael', papel='Convidado',
             precisa='Responder pelo celular, sem cadastro, e poder mudar de ideia.',
             app='Responde pelo link, sem conta, e altera pelo link pessoal.'),
        dict(icone='chef', nome='Jorge', papel='Buffet',
             precisa='Saber quantas pessoas vêm e quais restrições alimentares existem.',
             app='Recebe do anfitrião o CSV com as restrições por categoria.'),
    ],
    notas='Andreas. Levantamos três personas na Sprint 1. A Marina é a anfitriã. Ela quer montar um convite bonito em pouco tempo e fica ansiosa enquanto não sabe quantas pessoas vêm. O Rafael é o convidado. Ele abre o convite pelo WhatsApp e desiste se precisar criar conta. O Jorge é o buffet. Ele precisa da quantidade de pessoas e das restrições com antecedência. No próximo slide, cada funcionalidade do MVP está marcada com a persona que ela atende.')

add(modelo='grade', bloco=A, titulo='Funcionalidades do MVP', colunas=2, tamCorpo=15, tamTitulo=19, icone=48, gapY=16, imagem='c03-capa.png', altImagem=420, legendaImagem='O convite publicado',
    celulas=[
        dict(icone='chave', t='Conta do anfitrião', d='Cadastro e entrada com e-mail e senha.', etiqueta='Marina'),
        dict(icone='paleta', t='Criação do convite', d='Dados da festa, teto de pessoas, template, cores e prévia.', etiqueta='Marina'),
        dict(icone='compartilhar', t='Compartilhamento', d='Publicar, copiar o link para o WhatsApp e despublicar.', etiqueta='Marina'),
        dict(icone='calendario', t='Confirmação de presença', d='Responder sem conta, com acompanhantes até o limite, e alterar depois.', etiqueta='Rafael'),
        dict(icone='prato', t='Restrições alimentares', d='Informar a restrição. Alergia pede descrição.', etiqueta=['Rafael', 'Jorge']),
        dict(icone='prancheta', t='Painel e CSV', d='Lista de presença que se atualiza sozinha e restrições em CSV.', etiqueta=['Marina', 'Jorge']),
    ],
    notas='Andreas. O MVP tem seis grupos de funcionalidades e doze histórias de usuário. As doze estão implementadas. A Marina cria a conta, monta o convite e compartilha o link. O Rafael confirma presença sem conta, informa acompanhantes e restrição alimentar, e pode alterar a resposta depois. O painel mostra a lista de presença e as restrições, e o anfitrião baixa as restrições em CSV para o Jorge. Vamos mostrar isso funcionando na demonstração.')

add(modelo='numeros', bloco=A, titulo='Como o backlog foi organizado',
    numeros=[dict(v='6', r='sprints de duas semanas no Azure Boards'), dict(v='12', r='histórias de usuário, todas entregues', destaque=True),
             dict(v='115', r='tarefas distribuídas nas sprints'), dict(v='3', r='personas marcadas nas histórias')],
    fluxo=dict(titulo='Da sprint à tarefa', passos=[
        dict(icone='calendario', t='Sprint', d='Duas semanas, com objetivo e os itens do backlog daquele período.'),
        dict(icone='lista', t='Item do backlog', d='Uma história para uma persona ou um artefato, como um diagrama.'),
        dict(icone='kanban', t='Tarefas', d='O trabalho do item dividido, cada tarefa com responsável.'),
    ]),
    notas='Andreas. O backlog fica no Azure Boards e foi organizado por sprints de duas semanas. Cada sprint tem um objetivo e os itens daquele período. Nas três primeiras, os itens são os artefatos de requisitos e de arquitetura. Nas três últimas, são as doze histórias, cada uma escrita para uma persona, com a tag dela e um critério de aceitação. Cada item foi dividido em tarefas com responsável. Nas histórias, uma tarefa de tela e uma de API. Acompanhamos o andamento no quadro Kanban.')

add(modelo='refino', bloco=A, titulo='Como o backlog foi refinado',
    marcos=[dict(s='Sprint 1', t='Requisitos e casos de uso'), dict(s='Sprint 2', t='Arquitetura e decisões'),
            dict(s='Sprint 3', t='Documento de arquitetura'), dict(s='Sprint 4', t='Base do código', codigo=True),
            dict(s='Sprint 5', t='MVP de ponta a ponta', codigo=True), dict(s='Sprint 6', t='Publicação e consolidação', codigo=True)],
    tituloCartoes='O que mudou no backlog durante as sprints',
    cartoes=[
        dict(t='Lista de presença', antes='atualização em tempo real.', depois='Atualiza sozinha a cada 20 segundos, decidido no Grau A. A história pedia a lista atualizada, sem exigir tempo real.'),
        dict(t='Texto do convite', antes='saudação e recado livres.', depois='Saudação fixa do template. O recado saiu do MVP.'),
        dict(t='Ordem das entregas', antes='seis histórias na Sprint 4.', depois='A Sprint 4 ficou com a base do código, e as doze histórias foram entregues na Sprint 5.'),
    ],
    notas='Andreas. As três primeiras sprints foram de requisitos e arquitetura. As três últimas foram de implementação. Nesse tempo o backlog mudou em três pontos. A lista de presença estava prevista em tempo real e ficou com atualização a cada 20 segundos. Decidimos isso ainda no Grau A, porque a história pedia a lista atualizada e não falava em tempo real. O recado livre do convite saiu do MVP. E a ordem das entregas mudou. Seis histórias estavam planejadas para a Sprint 4. Usamos a Sprint 4 para montar a base do código, e as doze histórias foram entregues na Sprint 5. Agora o Tiago apresenta a arquitetura.')

add(modelo='divisor', bloco='Arquitetura', num='02', titulo='Arquitetura',
    notas='Tiago. Nesta parte mostramos a arquitetura que planejamos no Grau A, a que está no código e a comparação entre as duas.')

add(modelo='conteudoImagem', bloco=T, titulo='A arquitetura prescritiva, planejada no Grau A', largTexto=600,
    itens=['<strong>Casos de uso</strong> a partir das histórias, ao lado, e depois classes, sequência, componentes e implantação',
           '<strong>MVC no front-end</strong> e <strong>três camadas na API</strong> (Apresentação, Domínio e Dados)',
           '<strong>Três tiers</strong>, cada um num container: front-end, API e banco',
           '<strong>Regra de dependência</strong>, em que cada camada só conhece a de baixo',
           '<strong>Quinze decisões</strong> registradas em ADRs, cada uma com o motivo'],
    imagem='diagrama-casos-de-uso.png', legendaImagem='Diagrama de casos de uso do Grau A', altImagem=470, topoImagem=150,
    notas='Tiago. Eu sou o Tiago. Montei a base do projeto, a orquestração com Docker e a integração. A arquitetura prescritiva é a que planejamos no Grau A. Começamos pelos casos de uso, que saíram das histórias. Depois fizemos os diagramas de classes, sequência, componentes e implantação. Está tudo no documento de arquitetura. As decisões principais foram MVC no front-end, três camadas na API e três tiers em containers. A regra é que cada camada só conhece a de baixo. O diagrama de sequência da confirmação de presença descreve o mesmo caminho que o Gabriel vai mostrar no código.')

add(modelo='conteudoImagem', bloco=T, titulo='O diagrama de camadas do Grau A', largTexto=600,
    itens=['O navegador escreve direto na API, no painel e na resposta do convidado',
           'A página do convite é lida pelo servidor do front-end, para a prévia do link no WhatsApp',
           'Na API, cada camada só conhece a de baixo, e erros e log atravessam as três',
           'Camada é divisão lógica e tier é processo separado. As três camadas ficam no container da API'],
    imagem='diagrama-de-camadas-grau-a-slide.png', legendaImagem='Diagrama de camadas, como foi entregue no Grau A', altImagem=490, topoImagem=144,
    notas='Tiago. Este é o diagrama de camadas como entregamos no Grau A. Para escrever, o navegador fala direto com a API. Isso vale para o painel e para a resposta do convidado. A leitura do convite passa pelo servidor do front-end, porque a prévia do link no WhatsApp precisa das metatags prontas. Dentro da API, cada camada só conhece a de baixo. Camada é uma divisão lógica e tier é um processo separado. Por isso as três camadas ficam no mesmo container da API.')

add(modelo='capturas', bloco=T, titulo='Classes e sequência da confirmação de presença', alt=440, topo=160,
    imagens=[dict(arq='diagrama-de-classes.png', t='Diagrama de classes'), dict(arq='diagrama-sequencia-uc005-trecho.png', t='Trecho da sequência da confirmação')],
    notas='Tiago. À esquerda, o diagrama de classes do Grau A: o anfitrião, o convite, a personalização, o convidado e a observação alimentar. A nota marca o teto de pessoas como invariante do convite. À direita, um trecho do diagrama de sequência da confirmação de presença: a Apresentação confere o limite e o formato, o Domínio registra a resposta e consulta os repositórios. É esse caminho que o Gabriel mostra no código.')

add(modelo='mapa', bloco=T, titulo='A arquitetura descritiva, que está no código',
    colunas=[
        dict(icone='monitor', t='Front-end', tec='Next.js, MVC', pastas=[('app/', 'rotas das telas'), ('view/', 'componentes de tela'), ('controller/', 'chamadas tipadas à API'), ('templates/', 'CSS de cada template')]),
        dict(icone='servidor', t='API', tec='NestJS, três camadas', pastas=[('presentation/', 'rotas, sessão e limites'), ('domain/', 'regras do convite e da resposta'), ('data/', 'consultas e transações'), ('model/', 'classes do modelo, sem dependência')]),
        dict(icone='banco', t='Banco', tec='PostgreSQL', pastas=[('migrations/', 'esquema e categorias'), ('transação', 'trava no convite para o teto')]),
    ],
    base=dict(icone='contrato', t='contract/', d='Tipos compartilhados. O Model do MVC fica na API, e o navegador recebe a projeção dele por esses tipos.'),
    notas='Tiago. A arquitetura descritiva é a que está no código, e ela tem a mesma estrutura da planejada. O front-end é em Next.js e as pastas seguem o MVC. A pasta app tem as rotas, view tem as telas, controller tem as chamadas à API e templates tem o CSS. A API é em NestJS e tem uma pasta por camada. Tem também a pasta model, com as classes usadas pelas três camadas. O lint impede que essas classes importem de qualquer camada. O Model do MVC fica na API, no Domínio e nos Dados. O navegador recebe só a projeção dele, pelos tipos do pacote contract. O front-end e a API importam esses tipos do mesmo lugar.')

add(modelo='capturas', bloco=T, titulo='Implantação no ambiente local e no Railway', alt=440, topo=164,
    imagens=[dict(arq='diagrama-de-implantacao-slide.png', t='')],
    legenda='À esquerda, o ambiente local com o compose. À direita, a publicação no Railway, um serviço por tier.',
    notas='Tiago. Este é o diagrama de implantação atual. À esquerda está o ambiente local. O compose sobe os três containers, e o banco não publica porta. À direita está a publicação no Railway, que entrou nesta sprint. São as mesmas imagens, uma por serviço. O servidor do front-end chama a API pela rede privada, e o banco fica só nessa rede. As migrations rodam no pré-deploy da API. No Grau A, o ambiente era só local. A decisão de publicar está no ADR-0015, que substituiu o ADR-0003.')

add(modelo='grade', bloco=T, titulo='Princípios de projeto na implementação', colunas=3, tamCorpo=17, tamTitulo=21, icone=60, gapY=56,
    celulas=[
        dict(icone='camadas', t='Separação de interesses', d='A Apresentação traduz HTTP, o Domínio aplica as regras e os Dados gravam.', destaque=True),
        dict(icone='seta_baixo', t='Regra de dependência', d='O lint recusa import da camada de cima, em todo PR.'),
        dict(icone='contrato', t='Interface explícita', d='Front-end e API compartilham os tipos e conversam só por HTTP.'),
        dict(icone='desacoplar', t='Ocultação de informação', d='O Domínio não conhece HTTP, cookie nem SQL.'),
        dict(icone='caixa', t='Alta coesão', d='Um service por assunto: convite, resposta, presença, dieta e conta.'),
        dict(icone='escudo', t='Baixo acoplamento', d='Cada tier é um processo, e trocar o front-end não muda o Domínio.'),
    ],
    notas='Tiago. Estes são os princípios de projeto que aparecem no código. Na separação de interesses, a Apresentação traduz HTTP, o Domínio aplica as regras e os Dados gravam. A dependência vai num sentido só, e o lint recusa o import errado. A interface entre o front-end e a API é explícita, pelos tipos compartilhados. O Domínio não conhece HTTP, cookie nem SQL. Isso é ocultação de informação. Tem um service por assunto, o que dá coesão. Os tiers são processos separados, então trocar o front-end não mexe no Domínio.')

add(modelo='grade', bloco=T, titulo='Decisões arquiteturais e o motivo de cada uma', colunas=2, icone=50, tamTitulo=18, tamCorpo=16, gapY=24, etiquetaDireita=True,
    celulas=[
        dict(icone='camadas', t='MVC e três camadas', d='Tela, regra e armazenamento mudam por motivos diferentes.', etiqueta='ADR-0001'),
        dict(icone='container', t='Três tiers em containers', d='Front-end, API e banco como processos separados.', etiqueta='ADR-0002'),
        dict(icone='link', t='Link com token aleatório', d='O link não pode ser adivinhado e não expõe o identificador.', etiqueta='ADR-0005'),
        dict(icone='celular', t='Convidado sem conta', d='A identidade é criada na resposta, e o link pessoal permite voltar.', etiqueta='ADR-0006'),
        dict(icone='atualizar', t='Consulta periódica', d='A lista se atualiza a cada 20 segundos, sem tempo real.', etiqueta='ADR-0007'),
        dict(icone='escudo', t='Fronteira pública', d='Teto de vagas, limite de tráfego e o mesmo 404 para quem não tem acesso.', etiqueta='ADR-0008'),
        dict(icone='cookie', t='Sessão em cookie assinado', d='Sem tabela de sessão, a guarda não depende do banco.', etiqueta='ADR-0010'),
        dict(icone='relogio', t='Tempo do evento', d='Um instante único e o fuso do projeto, comparando por dia.', etiqueta='ADR-0013'),
    ],
    notas='Tiago. Aqui estão oito das quinze decisões, com o motivo de cada uma. Escolhemos MVC e três camadas porque tela, regra e armazenamento mudam por motivos diferentes. Os tiers rodam em containers separados. O link do convite usa um token aleatório, para não ser adivinhado. O convidado não tem conta e volta à resposta pelo link pessoal. A lista usa consulta periódica. A fronteira pública tem o teto de vagas e devolve o mesmo 404 para quem não tem acesso. A sessão fica num cookie assinado. O tempo do evento usa o fuso do projeto. As tecnologias também são decisões, e o Guilherme apresenta mais adiante. Agora o Gabriel compara o planejado com o implementado.')

add(modelo='comparacao', bloco=GA, titulo='Prescritiva e descritiva, lado a lado',
    linhas=[
        dict(aspecto='Camadas da API', plano='Apresentação, Domínio e Dados', feito='As mesmas três, com um pacote de autenticação a mais', status='Igual ao plano'),
        dict(aspecto='Componentes', plano='Os componentes do diagrama', feito='Mesmos nomes. Os templates viraram arquivos e o limite de tráfego virou serviço', status='Ajustado'),
        dict(aspecto='Rotas de tela', plano='Não detalhadas', feito='Rotas do convite, do link pessoal, do painel e da página de não encontrado', status='Novo'),
        dict(aspecto='Regra das vagas', plano='No Domínio', feito='A primeira versão calculava na consulta. O cálculo foi para o Domínio', status='Corrigido na integração'),
        dict(aspecto='Regras no front-end', plano='Nenhuma. A regra fica na API', feito='O protótipo contava vagas e montava o CSV. Isso foi para a API', status='Corrigido na integração'),
        dict(aspecto='Implantação', plano='Só local, com o compose', feito='Local para desenvolver, e Railway para a demonstração', status='Novo'),
    ],
    legenda='O lint não detectou esses dois casos. Ele acusa import errado, e regra na camada errada depende da revisão.',
    notas='Gabriel. Eu sou o Gabriel. A primeira versão das rotas e das regras do back-end foi minha. Na comparação, as camadas são as do plano, com um pacote de autenticação a mais. Os componentes têm os mesmos nomes, com dois ajustes. As rotas de tela não estavam detalhadas no plano. A implantação passou a ter também o Railway. Duas linhas foram corrigidas na integração. Uma é a regra das vagas, que na minha versão estava na consulta da camada de Dados. A outra são as regras que o protótipo fazia na tela. O lint não pegou nenhuma das duas, porque não eram import errado.')

add(modelo='duasIcones', bloco=GA, titulo='Semelhanças e diferenças entre o plano e o código',
    colunas=[
        dict(icone='check', t='Semelhanças', itens=['Os mesmos três tiers e as mesmas três camadas', 'Os componentes do diagrama existem no código, com o mesmo nome', 'A regra de dependência não tem exceção e é conferida em todo PR', 'As decisões do Grau A continuam valendo']),
        dict(icone='diff', t='Diferenças e motivos', destaque=True, marcador='seta', itens=['O plano não previa o pacote de autenticação nem a página do link pessoal', 'O MVP ficou com a saudação fixa no convite e sem o recado', 'Regras que estavam na camada errada foram movidas na integração', 'A publicação no Railway, para a demonstração não depender de uma máquina']),
    ],
    notas='Gabriel. A estrutura do código é a do plano. Os tiers, as camadas e os componentes são os mesmos, e a regra de dependência não tem exceção. As diferenças são de quatro tipos. Tem detalhes que o plano não previa, como o pacote de autenticação. Tem simplificações do MVP. Tem regras que estavam na camada errada e foram corrigidas. E tem a publicação. Nenhuma decisão do Grau A foi alterada sem registro.')

add(modelo='grade', bloco=GA, titulo='Como a arquitetura ajudou a construir o MVP', colunas=2, icone=60, tamTitulo=21, tamCorpo=17, gapY=48,
    celulas=[
        dict(icone='contrato', t='Trabalho em paralelo', d='Com o pacote de tipos, o front-end foi feito contra um mock e o back-end contra o banco, sem um esperar o outro.', destaque=True),
        dict(icone='lupa', t='Referência na integração', d='Comparando o código com o Guia da Arquitetura, achamos as regras que estavam na camada errada.'),
        dict(icone='pr', t='Regra de dependência automatizada', d='O lint confere a dependência entre camadas em todo PR, além da revisão.'),
        dict(icone='lista', t='Decisões registradas', d='Com o motivo escrito no ADR, consultamos a decisão em vez de discutir de novo.'),
    ],
    notas='Gabriel. A arquitetura ajudou a construir o MVP de quatro formas. Com o pacote de tipos, o front-end e o back-end foram feitos em paralelo. Na integração, comparamos o código com o Guia da Arquitetura e achamos as regras que estavam fora do lugar. O lint confere a regra de dependência em todo PR. E as decisões estavam registradas com o motivo, então a gente consultava em vez de discutir de novo.')

add(modelo='divisor', bloco='Implementação e demonstração', num='03', titulo='Implementação<br>e demonstração',
    notas='Gabriel. Agora mostramos a arquitetura no código e, depois, a aplicação funcionando.')

add(modelo='codigoFluxo', bloco='Implementação, Gabriel', titulo='A resposta do convidado nas três camadas do código', tamCodigo=13, larguras=[340, 332, 376],
    paineis=[
        dict(icone='servidor', camada='Apresentação', arquivo='public-rsvp.controller.ts',
             codigo=['enforceOriginLimit(clientIp(req));', 'const cmd = parseRsvpCommand(raw);', 'if (!(await getPublishedInvite(t)))', '  throw new NotFoundException();', 'enforceWriteLimit(t);', 'return rsvps.registerRsvp(t, cmd);'],
             legenda='Confere o formato e os limites de tráfego, e traduz o HTTP num comando.'),
        dict(icone='engrenagem', camada='Domínio', arquivo='rsvp.service.ts', destaque=True,
             codigo=['const valid = validateRsvp(cmd, inv);', '// Sim ocupa 1 + acompanhantes', 'return invites.saveRsvpWithinCapacity(', '  invite.id, guest, note,', '  valid.seatsRequested,', ');'],
             legenda='Aplica as regras da resposta e calcula quantas vagas ela pede.'),
        dict(icone='banco', camada='Dados', arquivo='invite.repository.ts',
             codigo=['db.transaction().execute(async trx => {', '  // SELECT ... FOR UPDATE', '  const inv = await lockInvite(trx, id);', '  if (await exceedsCapacity(trx, ...))', '    return refused("CapacityExceeded");', '  // grava o convidado', '});'],
             legenda='Trava o convite, confere o teto e grava, tudo na mesma transação.'),
    ],
    notas='Gabriel. Este é o caminho de uma resposta do convidado no código. Na Apresentação, o controller confere os limites de tráfego e o formato, e transforma o HTTP num comando. Ele não decide nada. No Domínio, o service aplica as regras e calcula as vagas. O Sim ocupa uma vaga para o convidado e uma para cada acompanhante. Na camada de Dados, o repositório abre uma transação e trava a linha do convite com FOR UPDATE. Depois confere o teto e grava. Temos um teste com quatro respostas simultâneas num convite em que só cabem duas. Passam duas.')

add(modelo='codigoFluxo', bloco='Implementação, Gabriel', titulo='A regra de camadas é verificada em todo PR', tamCodigo=15, larguras=[620, 472],
    paineis=[
        dict(icone='lista', camada='Regra no lint', arquivo='eslint.config.mjs',
             codigo=['{ target: "./api/src/domain",', '  from: "./api/src/presentation",', '  message: "Domínio não importa',
                     '            da Apresentação" },', '{ target: "./api/src/presentation",', '  from: "./api/src/data",',
                     '  message: "A Apresentação não chama', '            a camada de Dados" },'],
             legenda='Uma zona por regra do Guia da Arquitetura, cada uma com a mensagem do motivo.'),
        dict(icone='pr', camada='O que o PR recebe', arquivo='npm run lint, na integração contínua', destaque=True,
             codigo=['domain/teste.ts', '  1:34  error  Unexpected path', '  "../presentation/...invite.controller"', '  imported in restricted zone.', '  Domínio não importa da Apresentação', '', '1 problem (1 error)'],
             legenda='O PR fica vermelho e não entra na main até o import ser corrigido.'),
    ],
    notas='Gabriel. A regra de camadas é conferida pelo lint. No eslint.config.mjs, cada regra do Guia da Arquitetura vira uma zona proibida. Por exemplo, o Domínio não importa da Apresentação, e a Apresentação não chama a camada de Dados. A integração contínua roda o lint em todo PR. Um import errado gera este erro, o PR fica vermelho e não entra na main.')

add(modelo='grade', bloco='Implementação, Gabriel', titulo='Boas práticas de desenvolvimento', colunas=3, icone=56, tamTitulo=19, tamCorpo=16, gapY=40,
    celulas=[
        dict(icone='check', t='Testes do Domínio', d='As regras da resposta, das vagas, da data e da publicação, sem banco.', destaque=True),
        dict(icone='banco', t='Testes contra o banco', d='As consultas rodam num PostgreSQL de verdade, inclusive a concorrência no teto.'),
        dict(icone='fluxo', t='Testes das rotas', d='O fluxo completo pela API e o mesmo 404 para quem não tem acesso.'),
        dict(icone='pr', t='Integração contínua', d='Lint, formatação, tipos, testes e imagens em todo PR.'),
        dict(icone='git', t='Mudança por PR', d='A main só recebe mudança por PR, com a integração contínua verde.'),
        dict(icone='lista', t='Decisões registradas', d='Cada decisão de arquitetura tem um ADR com o contexto e o motivo.'),
    ],
    notas='Gabriel. As práticas de desenvolvimento que seguimos. Os testes têm três níveis. Os do Domínio testam as regras sem banco. Os da camada de Dados rodam num PostgreSQL de verdade, e um deles manda quatro respostas ao mesmo tempo num convite com teto de cinco: passam exatamente duas. Os testes das rotas cobrem o fluxo completo pela API. Tudo isso roda na integração contínua em todo PR, e a main só recebe mudança por PR. As decisões de arquitetura ficam registradas em ADRs. Agora o Guilherme mostra as tecnologias e a aplicação funcionando.')

add(modelo='grade', bloco=GU, titulo='Tecnologias e por que foram escolhidas', colunas=2, icone=52, tamTitulo=19, tamCorpo=17, gapY=28,
    celulas=[
        dict(icone='chaves', t='TypeScript em tudo', d='O mesmo contrato de tipos no front-end e na API.'),
        dict(icone='monitor', t='Next.js', d='Renderiza o convite no servidor, para a prévia do link no WhatsApp.'),
        dict(icone='servidor', t='NestJS', d='Módulos e injeção de dependência organizam o código nas três camadas.'),
        dict(icone='banco', t='PostgreSQL e Kysely', d='Transação com trava para o teto, e SQL tipado na camada de Dados.'),
        dict(icone='container', t='Docker Compose', d='Os três tiers sobem com um comando na máquina de cada um.'),
        dict(icone='pr', t='GitHub Actions', d='Lint, tipos, testes contra o banco e imagens em todo PR.'),
        dict(icone='foguete', t='Railway', d='As mesmas imagens publicadas, uma por serviço, para a demonstração.', destaque=True),
        dict(icone='kanban', t='Azure DevOps', d='Backlog, sprints e quadro Kanban do projeto.'),
    ],
    notas='Guilherme. Eu sou o Guilherme. O protótipo das telas foi meu, e o projeto no Azure DevOps é da minha organização. Escolhemos cada tecnologia por um motivo ligado à arquitetura. Usamos TypeScript em tudo para o front-end e a API compartilharem os tipos. O Next.js renderiza o convite no servidor, e por isso a prévia do link aparece no WhatsApp. No NestJS, os módulos e a injeção de dependência ajudam a organizar o código nas camadas. O PostgreSQL tem a transação com trava, que garante o teto de vagas. O Docker Compose sobe os três tiers na máquina de cada um. O GitHub Actions roda lint, tipos e testes em todo PR. E o Railway é onde a aplicação está publicada.')

add(modelo='demo', bloco=GU, cartola='Aplicação publicada', titulo='Demonstração', url='front-production-5556.up.railway.app',
    nota='Front-end, API e banco no Railway, um serviço por tier.',
    notas='Guilherme compartilha a tela e conduz, no endereço público. Conta de anfitrião já criada e convite de reserva lotado prontos antes da aula. 1. Criar o convite com teto de 4 pessoas e 1 acompanhante, trocar template e cores, mostrar a prévia e publicar. 2. Abrir o link na janela anônima ou no celular: não pede conta; confirmar com 1 acompanhante e alergia. 3. No convite de reserva, tentar confirmar: aparece a lotação. 4. Abrir o link pessoal e trocar para talvez. 5. Voltar ao painel: lista atualizada, restrições, baixar o CSV e mostrar na planilha. 6. Despublicar e abrir o link do convite: página de não encontrado. Se o tempo apertar, o passo 4 fica só dito. Se der tempo, convidar o professor a abrir o link no celular. Plano B: o Tiago com o compose local.')

add(modelo='divisor', bloco='Reflexão', num='04', titulo='Reflexão',
    notas='Guilherme. Na última parte falamos do processo, das dificuldades e do uso de IA.')

add(modelo='conteudoImagem', bloco=GU, titulo='Scrum no Azure DevOps, em seis sprints', largTexto=640,
    itens=['<strong>Sprints de duas semanas</strong>, cada uma com objetivo e entregáveis, do levantamento de requisitos à publicação',
           '<strong>Histórias com persona</strong> e tarefas de tela e de API, cada uma com responsável',
           '<strong>Quadro Kanban</strong> para ver o andamento e o que estava travado',
           '<strong>Desde a base do código, cada mudança por PR</strong>, entrando na main só com a integração contínua verde',
           'Decisões registradas no repositório, com o motivo de cada uma'],
    imagem='c10-kanban-done.png', legendaImagem='Histórias concluídas no quadro Kanban',
    notas='Guilherme. Usamos Scrum em seis sprints. Cada sprint tinha objetivo e entregáveis. As três primeiras fecharam a arquitetura antes do código, e depois conferimos o código contra ela. As histórias tinham persona e tarefas de tela e de API, então o quadro mostrava o que faltava. Cada mudança entrou na main por PR, com a integração contínua verde. Não usamos o Teams. Conversamos pelo WhatsApp e nas aulas, e as decisões ficaram registradas no repositório.')

add(modelo='cartoes', bloco=GU, titulo='Dificuldades e lições', colunas=2, tamCorpo=17,
    cartoes=[
        dict(k='Integração', t='Front-end e back-end em paralelo', d='Foram juntados só na Sprint 5. <strong>Lição:</strong> integrar cedo, em cima do pacote de tipos, que existia desde o início.'),
        dict(k='Protótipo', t='Regras de negócio na tela', d='O protótipo contava vagas e montava o CSV. <strong>Lição:</strong> ler o protótipo contra o Guia antes de virar código.'),
        dict(k='Back-end', t='Regra na camada errada', d='O cálculo das vagas estava na consulta. <strong>Lição:</strong> o lint acusa import errado, e regra na camada errada depende da revisão.'),
        dict(k='Publicação', t='A configuração da publicação', d='O cookie entre domínios e uma variável sem https derrubaram o login e a página do convite. <strong>Lição:</strong> testar a publicação antes do dia.'),
    ],
    notas='Guilherme. Tivemos quatro dificuldades principais. Front-end e back-end foram feitos em paralelo e só juntamos os dois na Sprint 5, o que foi tarde. O meu protótipo fazia regras de negócio na tela, e isso teve que ir para a API. Na primeira versão do back-end, a regra das vagas estava na camada errada. Na publicação, a configuração derrubou o login e a página do convite. Nos quatro casos, o que aprendemos foi conferir mais cedo, contra a arquitetura, o que cada parte está fazendo.')

add(modelo='duasIcones', bloco=GU, titulo='Assistentes de IA no projeto',
    colunas=[
        dict(icone='robo', t='Onde usamos', marcador='seta', itens=['Uma ferramenta de prototipação gerou o protótipo das telas', 'Um assistente de código escreveu boa parte da integração, dos testes e da documentação', 'O mesmo assistente ajudou na publicação e na revisão dos artefatos']),
        dict(icone='usuario_ok', t='O que foi do time', destaque=True, itens=['Os requisitos, as personas e as histórias', 'As decisões de arquitetura e o que aceitar ou recusar', 'A revisão de cada mudança antes de entrar na main', 'Cada integrante responde pelo que fez e pelo que revisou']),
    ],
    notas='Guilherme. Usamos assistentes de IA, e este slide mostra onde. O protótipo das telas foi gerado numa ferramenta de prototipação. Um assistente de código escreveu boa parte da integração, dos testes e da documentação, e ajudou na publicação. O time fez os requisitos, tomou as decisões de arquitetura, escolheu o que aceitar e revisou cada mudança. Cada integrante responde pelo que fez e pelo que revisou. [Confirmar este texto com o time antes da apresentação.]')

add(modelo='encerramento', bloco='Time 04', titulo='Obrigado',
    linhas=[('link', 'Aplicação publicada', 'front-production-5556.up.railway.app'), ('git', 'Código e documentação', 'github.com/tcpassos/invite-app'),
            ('pessoas', 'Time 04', 'Andreas Grings, Gabriel Tomasi, Guilherme Toebe e Tiago Passos')],
    notas='Guilherme. O MVP tem as doze histórias implementadas e publicadas. A arquitetura planejada no Grau A está no código, e as diferenças estão registradas com o motivo. Obrigado. Ficamos à disposição para perguntas.')

# Apêndice
add(modelo='capturas', bloco='Apêndice', titulo='Telas do anfitrião', imagens=[dict(arq='c02-editor.png', t='Editor com a prévia'), dict(arq='c07-painel.png', t='Painel de respostas')])
add(modelo='capturas', bloco='Apêndice', titulo='Telas do convidado', imagens=[dict(arq='c03-convite.png', t='Convite'), dict(arq='c04-resposta.png', t='Resposta enviada'), dict(arq='c05-lotado.png', t='Convite lotado'), dict(arq='c06-link-pessoal.png', t='Link pessoal')])

io.open('slides.json', 'w', encoding='utf-8').write(json.dumps(S, ensure_ascii=False, indent=2) + '\n')
print(len(S), 'slides')
