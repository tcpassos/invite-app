'use client';
// Entrada do painel: a lista de convites do anfitrião e a criação do UC002.
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_TEMPLATE_CODE,
  TEMPLATES,
  type InviteSummary,
  type ValidationRule,
} from '@invite-app/contract';
import { errorCode, fieldErrors } from '../controller/api-errors';
import { createInvite, listInvites } from '../controller/host-panel';
import { formatEventDate, formatEventTime } from './format';
import { useSession } from './host-shell';
import { PlusIcon, Spinner, StarIcon } from './icons';
import { InviteDataFields, optionalNumber, type InviteDataValues } from './invite-fields';
import { UNAVAILABLE_MESSAGE, panelFailureText } from './messages';
import { StatusBadge } from './status-badge';

export function InviteListView() {
  const { handleUnauthenticated } = useSession();
  const [invites, setInvites] = useState<InviteSummary[]>();
  const [failed, setFailed] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    listInvites()
      .then(setInvites)
      .catch((error: unknown) => {
        if (!handleUnauthenticated(error)) setFailed(true);
      });
  }, [handleUnauthenticated]);

  return (
    <main className="page-medium">
      <div className="list-head">
        <div>
          <h1 className="title-lg">Seus convites</h1>
          <p className="small muted">Crie, publique e acompanhe as confirmações de cada festa.</p>
        </div>
        <button
          type="button"
          onClick={() => setCreating((open) => !open)}
          aria-expanded={creating}
          className="button button--primary"
        >
          <PlusIcon /> Novo convite
        </button>
      </div>

      {creating && <CreateInviteForm />}

      <div className="invite-list">
        {failed && <p className="error-text">{UNAVAILABLE_MESSAGE}</p>}
        {!failed && !invites && <p className="small muted">Carregando…</p>}
        {invites?.length === 0 && (
          <div className="card empty">
            <StarIcon className="icon icon--large" />
            <p className="title-sm">Nenhum convite ainda</p>
            <p className="small muted">Crie o primeiro e envie o link pelo WhatsApp.</p>
          </div>
        )}
        {invites?.map((invite) => (
          <Link key={invite.id} href={`/invites/${invite.id}`} className="card invite-row">
            <div className="break">
              <p className="title-sm">{invite.eventName}</p>
              <p className="small muted">
                {formatEventDate(invite.eventStartsAt)} · {formatEventTime(invite.eventStartsAt)}
              </p>
            </div>
            <StatusBadge status={invite.status} />
          </Link>
        ))}
      </div>
    </main>
  );
}

const defaultTemplate = TEMPLATES.find((template) => template.code === DEFAULT_TEMPLATE_CODE)!;

/** UC002: nome, data, hora e local, e os dois limites opcionais (RN1 e RN2). */
function CreateInviteForm() {
  const router = useRouter();
  const { handleUnauthenticated } = useSession();
  const [form, setForm] = useState<InviteDataValues>({
    eventName: '',
    eventDate: '',
    eventTime: '',
    location: '',
    peopleLimit: '',
    companionLimit: '',
  });
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<unknown>();
  const errors: Partial<Record<string, ValidationRule>> = fieldErrors(failure);

  const set = (field: keyof InviteDataValues) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setFailure(undefined);
    try {
      const invite = await createInvite({
        eventName: form.eventName.trim(),
        eventDate: form.eventDate,
        eventTime: form.eventTime,
        location: form.location.trim(),
        peopleLimit: optionalNumber(form.peopleLimit),
        companionLimit: optionalNumber(form.companionLimit),
      });
      // UC002 passo 6: segue para a personalização (UC003).
      router.push(`/invites/${invite.id}`);
    } catch (error) {
      if (!handleUnauthenticated(error)) setFailure(error);
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card form create-form">
      <InviteDataFields
        values={form}
        onChange={set}
        errors={errors}
        textLimits={defaultTemplate.textLimits}
      />
      {failure !== undefined && (
        <p role="alert" className="error-text">
          {panelFailureText(errorCode(failure))}
        </p>
      )}
      <div>
        <button type="submit" disabled={sending} className="button button--dark">
          {sending && <Spinner />}
          Salvar rascunho
        </button>
      </div>
    </form>
  );
}
