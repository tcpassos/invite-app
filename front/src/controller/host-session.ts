'use client';
// A entrada do painel confere a sessão na API (ADR-0010). Sem sessão válida, o 401 leva
// de volta à tela de entrada (Guia, 4.1). O cookie é do navegador e o front não o lê.
import type { HostProfile } from '@invite-app/contract';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isUnauthenticated } from './api-errors';
import { getSession, signOut } from './host-panel';

export const SIGN_IN_PATH = '/sign-in';
export const PANEL_PATH = '/invites';

export interface HostSession {
  profile: HostProfile | undefined;
  /** A API não respondeu à conferência da sessão. A tela oferece tentar de novo. */
  failed: boolean;
  retry: () => void;
  leave: () => Promise<void>;
  /** Para as telas do painel: um 401 em qualquer chamada leva de volta à entrada. */
  handleUnauthenticated: (error: unknown) => boolean;
}

export function useHostSession(): HostSession {
  const router = useRouter();
  const [profile, setProfile] = useState<HostProfile>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getSession()
      .then((result) => {
        if (!cancelled) setProfile(result);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (isUnauthenticated(error)) router.replace(SIGN_IN_PATH);
        else setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [router, attempt]);

  const handleUnauthenticated = useCallback(
    (error: unknown) => {
      if (!isUnauthenticated(error)) return false;
      router.replace(SIGN_IN_PATH);
      return true;
    },
    [router],
  );

  const retry = useCallback(() => {
    setFailed(false);
    setAttempt((n) => n + 1);
  }, []);

  const leave = useCallback(async () => {
    // O sign-out apaga o cookie com ou sem sessão válida, então a falha não prende ninguém.
    await signOut().catch(() => undefined);
    router.replace(SIGN_IN_PATH);
  }, [router]);

  // Objeto estável, para as telas poderem pôr a sessão nas dependências dos efeitos.
  return useMemo(
    () => ({ profile, failed, retry, leave, handleUnauthenticated }),
    [profile, failed, retry, leave, handleUnauthenticated],
  );
}
