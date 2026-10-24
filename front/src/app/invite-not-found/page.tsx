// A rota de não encontrado do ADR-0008. Responde 200, porque é uma página que existe, e
// chega por redirecionamento temporário, que tira o token da barra de endereço (Guia, 9.5).
import type { Metadata } from 'next';
import { Notice } from '../../view/brand';

export const metadata: Metadata = {
  title: 'Convite não encontrado',
  robots: { index: false },
};

export default function InviteNotFoundPage() {
  return (
    <Notice title="Convite não encontrado">
      <p>O link não abre um convite. Confira o endereço com quem te convidou.</p>
    </Notice>
  );
}
