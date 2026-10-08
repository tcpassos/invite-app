// Corpos das rotas de entrada do anfitrião (UC001). A sessão vai no cookie do
// ADR-0010, que o navegador guarda e manda sozinho. Nenhum corpo carrega token.

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

/** Quem está com a sessão aberta. Nunca carrega o hash da senha. */
export interface HostProfile {
  name: string;
  email: string;
}
