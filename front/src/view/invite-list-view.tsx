'use client';
// Entrada do painel: a lista de convites do anfitrião e a criação do UC002.
import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Loader2, PartyPopper } from 'lucide-react';
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
import { UNAVAILABLE_MESSAGE, panelFailureText, ruleMessage } from './messages';
import { useSession } from './host-shell';

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
    <main className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="font-display text-3xl">Seus convites</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Crie, publique e acompanhe as confirmações de cada festa.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating((open) => !open)}
          aria-expanded={creating}
          className="ml-auto flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          <CalendarPlus className="size-4" /> Novo convite
        </button>
      </div>

      {creating && <CreateInviteForm />}

      <div className="mt-8 space-y-3">
        {failed && <p className="text-sm text-destructive">{UNAVAILABLE_MESSAGE}</p>}
        {!failed && !invites && <p className="text-sm text-muted-foreground">Carregando…</p>}
        {invites?.length === 0 && (
          <div className="paper-card grid place-items-center gap-2 p-10 text-center">
            <PartyPopper className="size-8 text-primary" />
            <p className="font-display text-xl">Nenhum convite ainda</p>
            <p className="text-sm text-muted-foreground">
              Crie o primeiro e envie o link pelo WhatsApp.
            </p>
          </div>
        )}
        {invites?.map((invite) => (
          <Link
            key={invite.id}
            href={`/invites/${invite.id}`}
            className="paper-card flex flex-wrap items-center gap-3 p-5 transition hover:-translate-y-0.5"
          >
            <div className="min-w-0">
              <p className="font-display text-xl break-words">{invite.eventName}</p>
              <p className="text-sm text-muted-foreground">
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
    <span
      className={`ml-auto rounded-full px-3 py-1 text-xs font-semibold ${
        status === InviteStatus.Published ? 'bg-sage/20' : 'bg-secondary text-muted-foreground'
      }`}
    >
      {INVITE_STATUS_LABEL[status]}
    </span>
  );
}

const defaultTemplate = TEMPLATES.find((template) => template.code === DEFAULT_TEMPLATE_CODE)!;

/** UC002: nome, data, hora e local, e os dois limites opcionais (RN1 e RN2). */
function CreateInviteForm() {
  const router = useRouter();
  const session = useSession();
  const [form, setForm] = useState({
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

  const set = (field: keyof typeof form) => (value: string) =>
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
      if (!session.handleUnauthenticated(error)) setFailure(error);
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="paper-card fade-up mt-6 space-y-4 p-6">
      <InviteDataFields
        values={form}
        onChange={set}
        errors={errors}
        textLimits={defaultTemplate.textLimits}
      />
      {failure !== undefined && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {panelFailureText(errorCode(failure))}
        </p>
      )}
      <button
        type="submit"
        disabled={sending}
        className="flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background disabled:opacity-60"
      >
        {sending && <Loader2 className="size-4 animate-spin" />}
        Salvar rascunho
      </button>
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
      <label htmlFor={`invite-${name}`} className="mb-1.5 block text-sm font-medium">
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
    <div className="grid gap-4 sm:grid-cols-2">
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
