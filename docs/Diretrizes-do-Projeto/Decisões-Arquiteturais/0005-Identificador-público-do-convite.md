# ADR-0005, Identificador público do convite

**Status:** Aceita
**Data do registro:** 13/09/2026

## Contexto

O UC004 define que o Link do convite tem identificador único e situação, ativo ou inativo. O convite abre **sem login**, então esse identificador é a única coisa entre um estranho e os dados do evento, incluindo local, data e a lista de quem confirmou.

O identificador também é ditado por voz, digitado à mão e colado em aplicativo de mensagem que pode quebrar a linha.

## Decisão

**Token aleatório de 128 bits gerado por CSPRNG, em coluna separada da chave primária, codificado em base32 Crockford.**

A chave primária da tabela é assunto de banco e otimiza localidade de índice. O identificador público é outra coluna, com outra finalidade. As duas nunca são o mesmo valor.

Despublicar o convite desativa o token sem apagar nada, atendendo o UC004.

## Consequências

**Positivas**
- Coluna separada permite trocar o token, revogar o link e despublicar sem tocar em chave estrangeira.
- 128 bits de fonte criptográfica tornam a enumeração inviável, o que dispensa limite de taxa só para essa finalidade.
- Base32 Crockford não tem os caracteres ambíguos. O alfabeto exclui I, L, O e U, o que evita erro ao ditar e ao digitar.
- O identificador público não revela nada sobre a tecnologia de persistência nem sobre o volume de eventos do sistema.

**Negativas**
- **Perde-se o link legível.** Os dois maiores players brasileiros do segmento usam slug escolhido pelo organizador, do tipo `festalab.com.br/joao`, e um deles tem artigo de ajuda ensinando a editar o final da URL. Token aleatório não permite isso.
- Token de 22 caracteres não cabe em QR de baixa densidade tão bem quanto os 7 caracteres que um concorrente escolheu de propósito para permitir digitação manual na portaria. Como check-in por QR está fora do MVP, o custo não incide agora.
- **O token não é segredo depois de distribuído.** O modelo de distribuição do produto é colar o link num grupo de WhatsApp, o que garante o vazamento por desenho. Ele protege contra descoberta, não contra repasse. As consequências disso são tratadas no [ADR-0008](0008-Confiança-na-fronteira-pública.md).

## Alternativas consideradas

- **UUIDv7: descartado.** Os primeiros 48 bits são timestamp, então o identificador vaza a data de criação do convite. O levantamento de mercado demonstrou isso na prática: 23 ObjectIDs do MongoDB expostos por um concorrente foram decodificados campo a campo, revelando data e ordem de criação.
- **UUIDv4: descartado por ergonomia, não por segurança.** UUIDv4 tem 122 bits de fonte criptográfica contra os 128 daqui, e essa diferença não tem efeito prático. O motivo do descarte é a forma: 36 caracteres com hífens contra 22, e aparência de identificador interno de banco em vez de link de convite.
- **Identificador sequencial: descartado.** O levantamento encontrou quatro produtos expondo identificador interno, um deles com inteiro monotônico de 13 dígitos que permite medir volume e ordem de criação de eventos, e outro com o id do evento apenas codificado em hexadecimal, decodificado em cinco tentativas.
- **Base64url: descartado.** Inclui O maiúsculo, zero, I, l, hífen e underscore, o pior alfabeto possível para algo ditado e digitado. Um concorrente removeu o O maiúsculo do alfabeto de propósito, e ele não aparece uma única vez em 12.721 caracteres de token analisados.
