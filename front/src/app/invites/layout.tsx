// HostPanelPage (DAS, 5.2): as telas do painel. Só aparecem depois que a API confirma a
// sessão, e os dados saem do navegador direto para a API (Guia, 9.4, salto 4).
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { HostShell } from '../../view/host-shell';

export const metadata: Metadata = {
  title: 'Meus convites',
  robots: { index: false, follow: false },
};

export default function HostPanelLayout({ children }: { children: ReactNode }) {
  return <HostShell>{children}</HostShell>;
}
