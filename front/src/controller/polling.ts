'use client';
// Consulta periódica do painel, o substituto do projeto para a notificação do MVC
// (ADR-0007 e Guia, 7.5), com o recuo da seção 9.4 do Guia quando a API não responde.
import { useEffect, useRef, useState } from 'react';

/** ADR-0007: entre 15 e 30 segundos enquanto o painel estiver aberto. */
export const POLL_INTERVAL_MS = 20_000;
/** Guia, 9.4: o recuo dobra até o teto de dois minutos e não para sozinho. */
export const POLL_MAX_INTERVAL_MS = 120_000;

/**
 * Espera até a próxima consulta. A primeira falha mantém o intervalo e só marca a lista
 * como desatualizada. A partir da segunda falha seguida, o intervalo dobra a cada falha.
 */
export function nextPollDelay(consecutiveFailures: number): number {
  if (consecutiveFailures < 2) return POLL_INTERVAL_MS;
  return Math.min(POLL_INTERVAL_MS * 2 ** (consecutiveFailures - 1), POLL_MAX_INTERVAL_MS);
}

export interface PollingState<T> {
  /** A última resposta que chegou. Continua na tela quando uma consulta falha. */
  data: T | undefined;
  /** Erro da consulta mais recente, ou undefined se ela deu certo. */
  error: unknown;
  /** Quando chegou a última resposta, para a tela mostrar o horário (Guia, 9.4). */
  updatedAt: Date | undefined;
  /** Consulta agora, fora do ciclo, como depois de publicar. */
  refresh: () => void;
}

/**
 * Consulta `load` agora e de novo a cada intervalo, enquanto `enabled` for verdadeiro.
 * Falha nunca vira dado vazio: a tela recebe o dado anterior e o erro separados.
 */
export function usePolling<T>(load: () => Promise<T>, enabled: boolean): PollingState<T> {
  const [data, setData] = useState<T>();
  const [error, setError] = useState<unknown>();
  const [updatedAt, setUpdatedAt] = useState<Date>();
  const [cycle, setCycle] = useState(0);
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  }, [load]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let failures = 0;

    const tick = async () => {
      try {
        const result = await loadRef.current();
        if (cancelled) return;
        failures = 0;
        setData(result);
        setError(undefined);
        setUpdatedAt(new Date());
      } catch (failure) {
        if (cancelled) return;
        failures += 1;
        setError(failure);
      }
      timer = setTimeout(tick, nextPollDelay(failures));
    };

    void tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, cycle]);

  return { data, error, updatedAt, refresh: () => setCycle((n) => n + 1) };
}
