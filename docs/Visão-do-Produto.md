# Visão do Produto

## O Problema
Organizar um evento social exige três coisas que hoje ficam em ferramentas separadas. Um convite bonito, normalmente feito no Canva ou em apps de design. O controle de presença, que acaba em planilhas e respostas soltas no WhatsApp. E as restrições alimentares dos convidados, avisadas de boca e que se perdem antes de chegar ao buffet. O mercado se divide entre apps bonitos, mas sem gestão, e apps de gestão forte, mas com design secundário. O cuidado com restrições alimentares só aparece bem resolvido no nicho de casamento.

## A Solução
Um app web que junta, de forma simples, a criação e a personalização visual do convite, a confirmação de presença em poucos toques (o convidado responde sem baixar app nem criar conta) e a gestão das observações alimentares por convidado, pronta para repassar ao buffet.

## Público-alvo
- O anfitrião organiza festas e eventos sociais. Quer um convite bonito feito rápido e visão de quem vai comparecer.
- O convidado recebe o convite pelo celular. Quer confirmar em segundos e informar sua restrição alimentar.
- O buffet ou cerimonialista é um stakeholder secundário. Usa a consolidação de restrições e o número de confirmados.

Detalhamento em [Personas](Sprints/Sprint-1/Personas.md).

## Diferencial
Tratar a observação alimentar como recurso principal do app. Ela é capturada por convidado (categoria mais texto livre) e reunida de forma automática para o anfitrião, por exemplo "12 confirmados, 3 vegetarianos, 1 alérgico a amendoim", com exportação. É justamente o que os concorrentes generalistas não cobrem.

## Escopo do MVP
1. Cadastro e login do anfitrião.
2. Criar convite e personalizar o visual (tema, cores, imagem, textos do evento).
3. Gerar link de compartilhamento.
4. Confirmação de presença pública (sim, não ou talvez, mais número de acompanhantes), sem login do convidado.
5. Observação alimentar por convidado (categorias como vegetariano, vegano, sem glúten ou alergia, mais texto livre).
6. Painel de presença e consolidação alimentar com exportação (CSV).

### Fora do escopo (MVP)
Lembretes automáticos, check-in por QR code, geração de arte ou texto por IA, lista de presentes e pagamentos. Ficam como candidatos a sprints futuras.
