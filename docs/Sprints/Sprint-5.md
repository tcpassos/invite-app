# Sprint 5: MVP de ponta a ponta

## Objetivos da Sprint

- Completar as histórias do MVP que ficaram fora da Sprint 4.
- Integrar as telas do front com as rotas da API, saindo do mock.
- Registrar os pontos da arquitetura que precisaram ser repensados para o MVP caber no que foi projetado.
- Manter o código coerente com o Guia da Arquitetura, sem tecnologia fora da stack do ADR-0004.

## Questões Norteadoras

- O que a implementação mostrou que a arquitetura não tinha previsto, e o que foi decidido em cada caso?
- O protótipo do front respeita as regras de fronteira, ou alguma regra de negócio foi parar na tela?
- O que cada ajuste custa em propagação de alteração entre as camadas, o contrato e o front?
- O incremento continua consistente com os requisitos e com os atributos de qualidade das sprints anteriores?

## Itens de Backlog

Work items no Azure Boards da org `GUITOEBE`, projeto `invite-people`, iteration Sprint 5. As histórias que completam o MVP:

- **H03** Personalizar o convite
- **H04** Visualizar o convite antes de publicar
- **H06** Publicar e despublicar o convite
- **H09** Alterar a resposta pelo link pessoal
- **H11** Acompanhar a lista de presença
- **H12** Reunir as restrições alimentares para o buffet

## Resultado

O MVP está completo e integrado. O anfitrião cria a conta, cria, corrige, personaliza e publica o convite, e acompanha no painel a lista de presença e as restrições alimentares, com exportação em CSV para o buffet. O convidado abre o link sem conta, responde com acompanhantes e restrição alimentar, e altera a resposta pelo link pessoal até o fim do dia do evento. Tudo roda pelo `docker compose`, como o ADR-0003 decidiu.

O que precisou ser repensado no caminho, e o que continua em aberto, está nos [Ajustes de Arquitetura para o MVP](Sprint-5/Ajustes-de-Arquitetura-para-o-MVP.md).

## Principais Artefatos

- [Ajustes de Arquitetura para o MVP](Sprint-5/Ajustes-de-Arquitetura-para-o-MVP.md)
- Código-fonte, documentação e demais artefatos versionados no GitHub
