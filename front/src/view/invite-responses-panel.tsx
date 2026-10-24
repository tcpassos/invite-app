'use client';
// Lista de presença (UC007) e consolidação alimentar (UC008), atualizadas pela consulta
// periódica do ADR-0007. Os totais vêm prontos da API. Os textos do convidado entram como
// texto, nunca como HTML (ADR-0008, medida 4).
import { useCallback, useEffect, useState } from 'react';
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
import { DownloadIcon, PeopleIcon, Spinner } from './icons';
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
    <section className="card form">
      <div className="section-head">
        <h2 className="title-md">Respostas</h2>
        {updatedAt && <span className="tiny muted">Atualizado às {formatClock(updatedAt)}</span>}
      </div>

      {/* Guia, 9.4: falha de consulta nunca aparece como lista vazia. */}
      {error !== undefined && (
        <p role="status" className="alert alert--warning">
          {data
            ? `Não conseguimos atualizar. A lista abaixo é de ${updatedAt ? formatClock(updatedAt) : 'antes'} e pode estar desatualizada.`
            : 'Não conseguimos carregar as respostas. Vamos tentar de novo sozinhos.'}
        </p>
      )}

      {!data && error === undefined && <p className="small muted">Carregando…</p>}

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
      <p className="small muted back-link">
        <PeopleIcon /> Nenhum convidado respondeu até o momento.
      </p>
    );
  }

  const byStatus = (status: RsvpStatus) => list.guests.filter((guest) => guest.status === status);

  return (
    <div>
      <div className="stats">
        <Stat label="Confirmados" value={byStatus(RsvpStatus.Accepted).length} tone="accepted" />
        <Stat label="Talvez" value={byStatus(RsvpStatus.Maybe).length} tone="maybe" />
        <Stat label="Não vão" value={byStatus(RsvpStatus.Declined).length} tone="declined" />
        <Stat label="Total de pessoas" value={list.totalPeople} tone="total" />
      </div>
      <p className="hint hint--after">O total soma os confirmados e os acompanhantes deles.</p>

      <div className="guest-groups">
        {GROUPS.map(({ status, title }) => {
          const guests = byStatus(status);
          if (guests.length === 0) return null;
          return (
            <div key={status}>
              <h3 className="title-sm">{title}</h3>
              <ul className="guest-list">
                {guests.map((guest, index) => (
                  <GuestRow key={`${guest.respondedAt}-${index}`} guest={guest} />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function GuestRow({ guest }: { guest: AttendanceEntry }) {
  return (
    <li className="guest-row">
      <strong className="break">{guest.name}</strong>
      {guest.companionCount > 0 && <span className="muted">+{guest.companionCount}</span>}
      <span className="badge">{RSVP_STATUS_LABEL[guest.status]}</span>
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
    <div>
      <div className="section-head">
        <h3 className="title-sm">Restrições para o buffet</h3>
        {exportable && (
          <button
            type="button"
            onClick={() => void exportCsv()}
            disabled={downloading}
            className="button button--outline"
          >
            {downloading ? <Spinner /> : <DownloadIcon />}
            Exportar CSV
          </button>
        )}
      </div>
      {failure !== undefined && (
        <p role="alert" className="error-text">
          {panelFailureText(errorCode(failure))}
        </p>
      )}

      {/* UC008 A1: sem restrição, o CSV continua útil como lista de presença. */}
      {summary.counts.length === 0 ? (
        <p className="small muted">Nenhuma restrição registrada.</p>
      ) : (
        <div className="tags">
          {summary.counts.map((category) => (
            <span key={category.code} className="tag">
              {category.displayName}: <strong>{category.count}</strong>
            </span>
          ))}
        </div>
      )}
      {summary.descriptions.length > 0 && (
        <ul className="descriptions">
          {summary.descriptions.map((item, index) => (
            <li key={index} className="break">
              <strong>{item.guestName}:</strong> {item.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'accepted' | 'maybe' | 'declined' | 'total';
}) {
  return (
    <div className={`stat stat--${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
