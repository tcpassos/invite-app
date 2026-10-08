// Tamanhos dos textos que não dependem de template. A API recusa acima deles com
// `maxLength` ou `minLength`, e o front usa os mesmos números no atributo dos campos
// para o usuário não digitar além. Quem decide continua sendo a API.
export const TEXT_LIMITS = {
  hostName: 80,
  email: 254,
  passwordMin: 8,
  // Teto da senha, para o Argon2id não receber um texto enorme de propósito.
  passwordMax: 128,
  guestName: 80,
  // Medida 3 do ADR-0008: texto livre escrito por anônimo tem tamanho máximo.
  dietaryFreeText: 500,
} as const;
