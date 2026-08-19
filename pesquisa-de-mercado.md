# Pesquisa de Mercado, Apps de Convite Digital

Documento interno de apoio ao produto. Serve de base para a [Visão do Produto](docs/Visão-do-Produto.md), as personas e o escopo do MVP.

## 1. Players analisados
- Global: Paperless Post, Evite, Greenvelope, Partiful, Punchbowl, Canva, RSVPify, Apple Invites (fev/2025) e Lemonvite (IA).
- Brasil: convite.in, Convitin e FestaLab.

## 2. Matriz comparativa

| App | Design e Personalização | RSVP e Gestão | Restrição alimentar | Preço | Foco |
|---|---|---|---|---|---|
| Paperless Post | Alto (coleções de designers) | Sólido, com perguntas custom | Via pergunta custom | Créditos ("coins"), pouco claro | Papelaria premium |
| Evite | Médio | Simples, com lembretes | Fraco | Grátis com ads ou pago | Casual, pioneiro |
| Greenvelope | Alto (envelope animado) | Forte (refeição, acompanhante, lembretes) | Sim (refeição e restrição) | Valor fixo por faixa, sem ads | Premium e formal |
| Partiful | Mobile-first, casual | Nativo e ágil | Não | Grátis | Público jovem |
| Punchbowl | Personagens (infantil) | RSVP e potluck | Potluck, não restrição | Assinatura, com ads | Festas infantis |
| Canva | Altíssimo (editor livre) | Nenhum | Não | Freemium | Só design |
| RSVPify | Secundário | Nível registro (ingresso, check-in, mesas) | Referência (por convidado, categorias e texto, exporta para o buffet) | Freemium e pago | Eventos complexos |
| Apple Invites | Casual, com IA | Básico | Não | Exige iCloud+ | Restrito ao mundo Apple |
| Lemonvite | Gerado por IA | Link ou texto | Não | US$5 por evento | Simples, com IA |
| convite.in | Temas por ocasião, álbum e música | RSVP em 1 clique sem app, grupos e mesas | Via perguntas custom | Grátis até 50, ou R$99,90 ilimitado | Brasil, mobile-first |
| Convitin | Templates, com IA de texto | Painel e link | Não nativo | Freemium | Brasil, casamento |
| FestaLab | Templates grátis | RSVP básico | Não | Grátis | Brasil, grátis |

## 3. As três funcionalidades principais

### Personalização visual
Vai do editor livre (Canva) aos templates temáticos por ocasião (Greenvelope, convite.in). O recurso que mais impressiona é o envelope que abre com animação. A tendência atual é gerar arte e texto por IA. Para o nosso escopo, o caminho realista é oferecer templates com customização de cores, imagem e texto.

### Confirmação de presença (RSVP)
O que funciona é confirmar em um clique, sem login e sem app (convite.in, Partiful). Vale registrar acompanhantes com nome (RSVPify), mostrar um painel em tempo real com os números e enviar lembretes automáticos.

### Observações alimentares, o nosso diferencial
Pouco explorado fora do nicho de casamento. A referência é o RSVPify, que captura a informação por convidado (escolha de refeição, categorias em caixas de seleção e texto livre), usa lógica condicional e gera uma consolidação exportável para o buffet.

## 4. Padrões de UX que valem copiar
1. Confirmação simples, em um clique e sem cadastro do convidado.
2. Feito para o celular, já que a maioria abre pelo WhatsApp.
3. Animação de abertura do convite, que dá um ar mais caprichado.
4. Restrição alimentar por convidado, com consolidação para o anfitrião.
5. Painel com números claros (confirmados, pendentes, recusados) e exportação.
6. Lembretes automáticos e check-in por QR code, muito comuns no Brasil.
7. Separar os dois públicos, ou seja, a página pública do convidado e o painel do anfitrião.

## 5. Modelos de preço
Freemium com ads. Valor fixo por faixa de convidados, que é o mais transparente. Créditos, que confundem e é melhor evitar. Valor fixo por evento.

## 6. O que falta no mercado e nossa oportunidade
O mercado se divide entre "bonito, mas sem gestão" (Canva) e "gestão forte, mas design secundário" (RSVPify). Poucos tratam a observação alimentar como recurso central fora de casamento. Nossa ideia é juntar convite bonito, confirmação simples e gestão consolidada de restrições em um app só.

## 7. Implicações para o planejamento
As personas confirmam o anfitrião e o convidado, com o buffet como stakeholder secundário. O escopo do MVP cobre login, criação e personalização do convite, geração de link, confirmação pública, observação alimentar e o painel com consolidação e exportação. A arquitetura se justifica pelas duas telas, o convite público sem login e o painel do anfitrião, que pedem MVC com 3 camadas.

## Fontes
- Poply, 7 Best Online Invitation Makers 2025: https://blog.poply.com/the-7-best-online-invitation-tools-in-2025-ranked/
- Greenvelope, Best Digital Invitation Platforms: https://www.greenvelope.com/resources/best-digital-invitation-platforms
- Invyt, Best RSVP App: https://invyt.io/best-rsvp-app
- Newlywords, Evite vs Paperless vs Punchbowl vs Greenvelope: https://blog.newlywords.com/evite-vs-paperless-vs-punchbowl/
- RSVPify, Meal Preferences and Menu Options: https://rsvpify.com/menu-options/
- RSVPify, Best way to ask dietary restrictions: https://help.rsvpify.com/en/articles/5511915-what-is-the-best-way-to-ask-guests-about-dietary-restrictions
- The Knot, Meal choice on RSVP: https://www.theknot.com/content/reception-entree-options-on-invites
- convite.in: https://convite.in/ , Convitin: https://convitin.com.br/ , FestaLab: https://festalab.com.br/
