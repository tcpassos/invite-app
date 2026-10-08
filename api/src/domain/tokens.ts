// Gerador dos dois identificadores públicos do sistema, o token do convite (ADR-0005)
// e o token pessoal do convidado (ADR-0011). É um gerador só, como o ADR-0011 pede:
// 128 bits de gerador criptográfico, em base32 Crockford, 26 caracteres.
import { randomBytes } from 'node:crypto';

// Crockford tira I, L, O e U, para reduzir erro de quem digita o link à mão.
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const LENGTH = 26;

function generateToken(): string {
  let value = BigInt('0x' + randomBytes(16).toString('hex'));
  let token = '';
  for (let i = 0; i < LENGTH; i++) {
    token = ALPHABET[Number(value & 31n)] + token;
    value >>= 5n;
  }
  return token;
}

/** Token do link do convite, gerado na primeira publicação (UC004 passo 3). */
export const generatePublicToken = generateToken;

/** Token do link pessoal, gerado no registro da resposta (UC005 ED2). */
export const generatePersonalToken = generateToken;
