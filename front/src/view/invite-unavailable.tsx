// As duas páginas que o tier Front serve no lugar do convite quando a leitura não deu certo.
// Nenhuma das duas é a rota de não encontrado (Guia, 9.4 e 9.5).
import { Notice } from './brand';

/** API fora do ar ou 500. Aparece igual para token válido e inventado (Guia, 9.4). */
export function InviteUnavailable() {
  return (
    <Notice title="Convite indisponível no momento">
      <p>Não conseguimos carregar o convite agora. Tente de novo em alguns minutos.</p>
    </Notice>
  );
}

/** 429 na leitura: muita gente abrindo o mesmo link ao mesmo tempo (Guia, 9.5). */
export function InviteBusy() {
  return (
    <Notice title="Muita gente abrindo o convite">
      <p>Espere alguns instantes e recarregue a página.</p>
    </Notice>
  );
}
