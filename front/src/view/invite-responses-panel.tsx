'use client';
// Lista de presença (UC007) e consolidação alimentar (UC008), atualizadas pela consulta
// periódica do ADR-0007. Os totais vêm prontos da API. Os textos do convidado entram como
// texto, nunca como HTML (ADR-0008, medida 4).
import { useCallback, useEffect, useState } from 'react';
import { Download, Loader2, Users } from 'lucide-react';
import {
  RsvpStatus,
  type AttendanceEntry,
  type AttendanceList,
  type DietarySummary,
} from '@invite-app/contract';
import { errorCode } from '../controller/api-errors';
import { downloadDietaryNotes, getAttendance, getDietarySummary } from '../controller/host-panel';
import { usePolling } from '../controller/polling';
import { RSVP_STATUS_LABEL, formatClock } from './format';
import { useSession } from './host-shell';
import { panelFailureText } from './messages';

interface Responses {
  attendance: AttendanceList;
  dietary: DietarySummary;
}

/** UC007 passo 2: confirmados, talvez e recusados, nessa ordem. */
const GROUPS = [
  { status: RsvpStatus.Accepted, title: 'Confirmados' },
  { status: RsvpStatus.Maybe, title: 'Talvez' },
  { status: RsvpStatus.Declined, title: 'Não vão' },
] as const;

export function InviteResponsesPanel({
  inviteId,
  eventName,
}: {
  inviteId: string;
  eventName: string;
}) {
  const { handleUnauthenticated } = useSession();
  const load = useCallback(async (): Promise<Responses> => {
    const [attendance, dietary] = await Promise.all([
      getAttendance(inviteId),
      getDietarySummary(inviteId),
    ]);
    return { attendance, dietary };
  }, [inviteId]);
  const { data, error, updatedAt } = usePolling(load, true);

  useEffect(() => {
    if (error !== undefined) handleUnauthenticated(error);
  }, [error, handleUnauthenticated]);

  return (
    <section className="paper-card p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl">Respostas</h2>
        {updatedAt && (
          <span className="ml-auto text-xs text-muted-foreground">
            Atualizado às {formatClock(updatedAt)}
          </span>
        )}
      </div>

      {/* Guia, 9.4: falha de consulta nunca aparece como lista vazia. */}
      {error !== undefined && (
        <p role="status" className="mt-3 rounded-xl bg-accent/20 px-3 py-2 text-sm">
          {data
            ? `Não conseguimos atualizar. A lista abaixo é de ${updatedAt ? formatClock(updatedAt) : 'antes'} e pode estar desatualizada.`
            : 'Não conseguimos carregar as respostas. Vamos tentar de novo sozinhos.'}
        </p>
      )}

      {!data && error === undefined && (
        <p className="mt-4 text-sm text-muted-foreground">Carregando…</p>
      )}

      {data && (
        <>
          <Attendance list={data.attendance} />
          <Dietary
            summary={data.dietary}
            inviteId={inviteId}
            eventName={eventName}
            // UC008 A2: sem resposta sim ou talvez, não há o que exportar.
            exportable={data.attendance.guests.some(
              (guest) => guest.status !== RsvpStatus.Declined,
            )}
          />
        </>
      )}
    </section>
  );
}

function Attendance({ list }: { list: AttendanceList }) {
  // UC007 A1: só quando a API respondeu com a lista vazia.
  if (list.guests.length === 0) {
    return (
      <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="size-4" /> Nenhum convidado respondeu até o momento.
      </p>
    );
  }

  const byStatus = (status: RsvpStatus) => list.guests.filter((guest) => guest.status === status);

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Confirmados" value={byStatus(RsvpStatus.Accepted).length} tone="bg-sage/20" />
        <Stat label="Talvez" value={byStatus(RsvpStatus.Maybe).length} tone="bg-accent/25" />
        <Stat label="Não vão" value={byStatus(RsvpStatus.Declined).length} tone="bg-primary/10" />
        <Stat label="Total de pessoas" value={list.totalPeople} tone="bg-secondary" />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        O total soma os confirmados e os acompanhantes deles.
      </p>

      <div className="mt-6 space-y-5">
        {GROUPS.map(({ status, title }) => {
          const guests = byStatus(status);
          if (guests.length === 0) return null;
          return (
            <div key={status}>
              <h3 className="font-display text-lg">{title}</h3>
              <ul className="mt-2 space-y-2">
                {guests.map((guest, index) => (
                  <GuestRow key={`${guest.respondedAt}-${index}`} guest={guest} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </>
  );
}

function GuestRow({ guest }: { guest: AttendanceEntry }) {
  return (
    <li className="flex flex-wrap items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm">
      <span className="font-medium break-words">{guest.name}</span>
      {guest.companionCount > 0 && (
        <span className="text-muted-foreground">+{guest.companionCount}</span>
      )}
      <span className="ml-auto rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
        {RSVP_STATUS_LABEL[guest.status]}
      </span>
    </li>
  );
}

function Dietary({
  summary,
  inviteId,
  eventName,
  exportable,
}: {
  summary: DietarySummary;
  inviteId: string;
  eventName: string;
  exportable: boolean;
}) {
  const { handleUnauthenticated } = useSession();
  const [downloading, setDownloading] = useState(false);
  const [failure, setFailure] = useState<unknown>();

  async function exportCsv() {
    setDownloading(true);
    setFailure(undefined);
    try {
      const file = await downloadDietaryNotes(inviteId);
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${eventName.trim() || 'convite'} - lista para o buffet.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      if (!handleUnauthenticated(error)) setFailure(error);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="font-display text-xl">Restrições para o buffet</h3>
        {exportable && (
          <button
            type="button"
            onClick={() => void exportCsv()}
            disabled={downloading}
            className="ml-auto flex items-center gap-2 rounded-xl border border-input px-3 py-2 text-sm hover:bg-secondary disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Exportar CSV
          </button>
        )}
      </div>
      {failure !== undefined && (
        <p role="alert" className="mt-2 text-sm font-medium text-destructive">
          {panelFailureText(errorCode(failure))}
        </p>
      )}

      {/* UC008 A1: sem restrição, o CSV continua útil como lista de presença. */}
      {summary.counts.length === 0 ? (
        <p className="mt-2 text-sm text-muted-foreground">Nenhuma restrição registrada.</p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {summary.counts.map((category) => (
            <span key={category.code} className="rounded-full bg-secondary px-3 py-1.5 text-sm">
              {category.displayName}: <strong>{category.count}</strong>
            </span>
          ))}
        </div>
      )}
      {summary.descriptions.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-xl bg-primary/5 p-3 text-sm">
          {summary.descriptions.map((item, index) => (
            <li key={index} className="break-words">
              <strong>{item.guestName}:</strong> {item.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className={`rounded-2xl ${tone} p-4`}>
      <p className="font-display text-3xl">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
