# Guia da Arquitetura

> **A detalhar** (item do backlog). Padrão escolhido: **MVC no front-end e arquitetura em 3 camadas no back-end** (Apresentação e API, Domínio, Dados), com uma regra principal: o domínio e os dados nunca dependem da apresentação.

Justificativa resumida: o produto tem duas telas sobre o mesmo Model, o convite público do convidado (sem login) e o painel do anfitrião. Isso segue a ideia central do MVC, manter várias interfaces sobre o mesmo Model, e mantém a camada de apresentação isolada nas 3 camadas.

Conteúdo a produzir: diagrama de camadas, responsabilidades por camada, regras de dependência, mapeamento entre MVC e camadas, stack e estratégia de tratamento de erros.
