export interface Host {
  id: string;
  name: string;
  email: string;
  /** Hash Argon2id (ADR-0010). Nunca sai da API. */
  passwordHash: string;
}
