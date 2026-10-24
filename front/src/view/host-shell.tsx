'use client';
// Casca das telas do painel: confere a sessão antes de mostrar qualquer dado e oferece a
// saída. A sessão chega às telas por contexto, para um 401 em qualquer chamada levar de
// volta à entrada (Guia, 4.1).
import { createContext, useContext, type ReactNode } from 'react';
import { LogOut } from 'lucide-react';
import { useHostSession, type HostSession } from '../controller/host-session';
import { Brand, Notice } from './brand';
import { UNAVAILABLE_MESSAGE } from './messages';

const SessionContext = createContext<HostSession | undefined>(undefined);

export function useSession(): HostSession {
  const session = useContext(SessionContext);
  if (!session) throw new Error('useSession fora do HostShell');
  return session;
}

export function HostShell({ children }: { children: ReactNode }) {
  const session = useHostSession();

  if (session.failed) {
    return (
      <Notice title="Painel indisponível">
        <p>{UNAVAILABLE_MESSAGE}</p>
        <button
          type="button"
          onClick={session.retry}
          className="mt-4 rounded-xl border border-input px-3 py-2 text-sm hover:bg-secondary"
        >
          Tentar de novo
        </button>
      </Notice>
    );
  }

  if (!session.profile) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted-foreground">
        Verificando sua sessão…
      </div>
    );
  }

  return (
    <SessionContext.Provider value={session}>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
          <Brand compact />
          <span className="ml-auto hidden text-sm text-muted-foreground sm:inline">
            {session.profile.name}
          </span>
          <button
            type="button"
            onClick={() => void session.leave()}
            className="ml-auto flex items-center gap-2 rounded-xl border border-input px-3 py-2 text-sm hover:bg-secondary sm:ml-0"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      </header>
      {children}
    </SessionContext.Provider>
  );
}
