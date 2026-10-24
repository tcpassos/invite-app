import type { Metadata } from 'next';
import { Caveat, DM_Sans, Fraunces } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import '../templates/invite-templates.css';

// As fontes vão embutidas no build, sem chamada a terceiro quando o convidado abre o link.
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const heading = Fraunces({ subsets: ['latin'], variable: '--font-heading' });
const handwritten = Caveat({ subsets: ['latin'], variable: '--font-handwritten' });

export const metadata: Metadata = {
  title: 'invite-app',
  description:
    'Convites de festa com confirmação de presença, acompanhantes e restrições alimentares prontas para o buffet.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${body.variable} ${heading.variable} ${handwritten.variable}`}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
