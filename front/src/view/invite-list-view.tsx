'use client';
// Entrada do painel: a lista de convites do anfitrião e a criação do UC002.
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  DEFAULT_TEMPLATE_CODE,
  InviteStatus,
  TEMPLATES,
  type InviteSummary,
  type ValidationRule,
} from '@invite-app/contract';
import { errorCode, fieldErrors } from '../controller/api-errors';
import { createInvite, listInvites } from '../controller/host-panel';
import { FieldError } from './brand';
import { INVITE_STATUS_LABEL, formatEventDate, formatEventTime } from './format';
import { useSession } from './host-shell';
import { PlusIcon, Spinner, StarIcon } from './icons';
import { UNAVAILABLE_MESSAGE, panelFailureText, ruleMessage } from './messages';

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

export function StatusBadge({ status }: { status: InviteStatus }) {
  return (
    <span className={status === InviteStatus.Published ? 'badge badge--published' : 'badge'}>
      {INVITE_STATUS_LABEL[status]}
    </span>
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

/** Campo numérico opcional: vazio é sem limite (UC002 RN2). */
export function optionalNumber(value: string): number | null {
  return value.trim() === '' ? null : Number(value);
}

export interface InviteDataValues {
  eventName: string;
  eventDate: string;
  eventTime: string;
  location: string;
  peopleLimit: string;
  companionLimit: string;
}

/**
 * Os campos do UC002, divididos entre a criação e o editor. Data, hora e limites ficam
 * travados fora do rascunho (UC002 RN3), e a API recusa com 409 se vierem mesmo assim.
 */
export function InviteDataFields({
  values,
  onChange,
  errors,
  textLimits,
  scheduleLocked = false,
}: {
  values: InviteDataValues;
  onChange: (field: keyof InviteDataValues) => (value: string) => void;
  errors: Partial<Record<string, ValidationRule>>;
  textLimits: { eventName: number; location: number };
  scheduleLocked?: boolean;
}) {
  const field = (
    name: keyof InviteDataValues,
    label: string,
    input: { type?: string; min?: number; maxLength?: number; placeholder?: string },
    options: { required?: boolean; locked?: boolean } = {},
  ) => (
    <div>
      <label htmlFor={`invite-${name}`} className="label">
        {label}
      </label>
      <input
        id={`invite-${name}`}
        value={values[name]}
        onChange={(event) => onChange(name)(event.target.value)}
        required={options.required}
        disabled={options.locked}
        aria-invalid={errors[name] ? true : undefined}
        className="field"
        {...input}
      />
      <FieldError id={`invite-${name}-error`} message={ruleMessage(errors[name])} />
    </div>
  );

  return (
    <div className="form-grid">
      {field(
        'eventName',
        'Nome da festa',
        { maxLength: textLimits.eventName, placeholder: 'Aniversário da vovó Marina' },
        { required: true },
      )}
      {field(
        'location',
        'Local',
        { maxLength: textLimits.location, placeholder: 'Chácara da família, Cotia' },
        { required: true },
      )}
      {field('eventDate', 'Data', { type: 'date' }, { required: true, locked: scheduleLocked })}
      {field('eventTime', 'Hora', { type: 'time' }, { required: true, locked: scheduleLocked })}
      {field(
        'peopleLimit',
        'Máximo de pessoas (opcional)',
        { type: 'number', min: 1, placeholder: 'Sem limite' },
        { locked: scheduleLocked },
      )}
      {field(
        'companionLimit',
        'Acompanhantes por convidado (opcional)',
        { type: 'number', min: 0, placeholder: 'Sem limite' },
        { locked: scheduleLocked },
      )}
    </div>
  );
}
