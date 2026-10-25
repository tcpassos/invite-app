'use client';
// Casca das telas do painel: confere a sessão antes de mostrar qualquer dado e oferece a
// saída. A sessão chega às telas por contexto, para um 401 em qualquer chamada levar de
// volta à entrada (Guia, 4.1).
import { createContext, useContext, type ReactNode } from 'react';
import { useHostSession, type HostSession } from '../controller/host-session';
import { Brand } from './brand';
import { Notice } from './notice';
import { LeaveIcon } from './icons';
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
        <p>
          <button type="button" onClick={session.retry} className="button button--outline">
            Tentar de novo
          </button>
        </p>
      </Notice>
    );
  }

  if (!session.profile) return <p className="loading">Verificando sua sessão…</p>;

  return (
    <SessionContext.Provider value={session}>
      <header className="topbar">
        <div className="topbar__inner">
          <Brand compact />
          <span className="small muted">{session.profile.name}</span>
          <button
            type="button"
            onClick={() => void session.leave()}
            className="button button--outline"
          >
            <LeaveIcon /> Sair
          </button>
        </div>
      </header>
      {children}
    </SessionContext.Provider>
  );
}
