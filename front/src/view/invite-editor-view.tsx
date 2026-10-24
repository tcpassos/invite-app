'use client';
// A tela de um convite no painel: correção do rascunho (UC002 A2), personalização com
// prévia ao vivo (UC003), publicação e link (UC004) e as respostas (UC007 e UC008).
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Copy, Loader2, X } from 'lucide-react';
import {
  ErrorCode,
  InviteStatus,
  TEMPLATES,
  type HexColor,
  type InviteDetails,
  type ValidationRule,
} from '@invite-app/contract';
import { errorCode, fieldErrors } from '../controller/api-errors';
import {
  customizeInvite,
  getInvite,
  publishInvite,
  unpublishInvite,
  updateInvite,
} from '../controller/host-panel';
import { FieldError } from './brand';
import { formatDateInput, formatTimeInput, toDateAndTime } from './format';
import { useSession } from './host-shell';
import { InviteCard, templateFor } from './invite-card';
import {
  InviteDataFields,
  StatusBadge,
  optionalNumber,
  type InviteDataValues,
} from './invite-list-view';
import { InviteResponsesPanel } from './invite-responses-panel';
import { UNAVAILABLE_MESSAGE, panelFailureText, ruleMessage } from './messages';

/** Nome de cada papel de cor dos templates do contract, para o editor. */
const COLOR_ROLE_LABEL: Record<string, string> = {
  primary: 'Cor principal',
  accent: 'Cor de destaque',
};

/** Rótulo de cada campo que a publicação pode cobrar (UC004 RN1). */
const FIELD_LABEL: Record<string, string> = {
  eventName: 'nome da festa',
  eventDate: 'data',
  eventTime: 'hora',
  location: 'local',
};

interface Draft {
  data: InviteDataValues;
  templateCode: string;
  /** Todas as cores do template, já com as do anfitrião por cima. */
  colors: Record<string, HexColor>;
}

function draftFrom(invite: InviteDetails): Draft {
  const template = templateFor(invite.customization.templateCode);
  return {
    data: {
      eventName: invite.eventName,
      location: invite.location,
      ...toDateAndTime(invite.eventStartsAt),
      peopleLimit: invite.peopleLimit === null ? '' : String(invite.peopleLimit),
      companionLimit: invite.companionLimit === null ? '' : String(invite.companionLimit),
    },
    templateCode: template.code,
    colors: { ...template.defaultColors, ...invite.customization.colorOverrides },
  };
}

/** O contrato pede só as cores que mudam em relação ao padrão do template. */
function colorOverrides(templateCode: string, colors: Record<string, HexColor>) {
  const defaults = templateFor(templateCode).defaultColors;
  return Object.fromEntries(
    Object.entries(colors).filter(([role, color]) => defaults[role]?.toLowerCase() !== color),
  );
}

type LoadState = { kind: 'loading' } | { kind: 'notFound' } | { kind: 'failed' };

export function InviteEditorView({ inviteId }: { inviteId: string }) {
  const { handleUnauthenticated } = useSession();
  const [invite, setInvite] = useState<InviteDetails>();
  const [load, setLoad] = useState<LoadState>({ kind: 'loading' });
  const [draft, setDraft] = useState<Draft>();
  const [saving, setSaving] = useState(false);
  const [saveFailure, setSaveFailure] = useState<unknown>();
  const [savedOnce, setSavedOnce] = useState(false);

  const accept = useCallback((details: InviteDetails) => {
    setInvite(details);
    setDraft(draftFrom(details));
  }, []);

  const reload = useCallback(() => {
    getInvite(inviteId)
      .then(accept)
      .catch((error: unknown) => {
        if (handleUnauthenticated(error)) return;
        setLoad({ kind: errorCode(error) === ErrorCode.NotFound ? 'notFound' : 'failed' });
      });
  }, [inviteId, accept, handleUnauthenticated]);

  useEffect(reload, [reload]);

  if (!invite || !draft) {
    if (load.kind === 'notFound') return <InviteNotFound />;
    return (
      <p className="grid min-h-[50vh] place-items-center text-sm text-muted-foreground">
        {load.kind === 'failed' ? UNAVAILABLE_MESSAGE : 'Carregando…'}
      </p>
    );
  }

  const isDraft = invite.status === InviteStatus.Draft;
  const template = templateFor(draft.templateCode);
  const dirty = JSON.stringify(draft) !== JSON.stringify(draftFrom(invite));
  const errors: Partial<Record<string, ValidationRule>> = fieldErrors(saveFailure);

  const setData = (field: keyof InviteDataValues) => (value: string) =>
    setDraft((current) => current && { ...current, data: { ...current.data, [field]: value } });

  async function save() {
    if (!draft) return;
    setSaving(true);
    setSaveFailure(undefined);
    setSavedOnce(false);
    const { data } = draft;
    try {
      // Data, hora e limites só mudam no rascunho (UC002 RN3). Nome e local mudam sempre,
      // pela personalização (UC003).
      if (isDraft) {
        await updateInvite(inviteId, {
          eventName: data.eventName.trim(),
          eventDate: data.eventDate,
          eventTime: data.eventTime,
          location: data.location.trim(),
          peopleLimit: optionalNumber(data.peopleLimit),
          companionLimit: optionalNumber(data.companionLimit),
        });
      }
      accept(
        await customizeInvite(inviteId, {
          templateCode: draft.templateCode,
          colorOverrides: colorOverrides(draft.templateCode, draft.colors),
          eventName: data.eventName.trim(),
          location: data.location.trim(),
        }),
      );
      setSavedOnce(true);
    } catch (error) {
      if (!handleUnauthenticated(error)) setSaveFailure(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
          <Link href="/invites" className="flex items-center gap-2 text-sm hover:underline">
            <ArrowLeft className="size-4" /> Meus convites
          </Link>
          <StatusBadge status={invite.status} />
        </div>
      </div>

      <main className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <section className="paper-card p-6">
            <h2 className="font-display text-2xl">Dados da festa</h2>
            {!isDraft && (
              <p className="mt-1 text-sm text-muted-foreground">
                Depois de publicado, só o nome e o local mudam.
              </p>
            )}
            <div className="mt-4">
              <InviteDataFields
                values={draft.data}
                onChange={setData}
                errors={errors}
                textLimits={template.textLimits}
                scheduleLocked={!isDraft}
              />
            </div>

            <h3 className="mt-6 font-display text-xl">Modelo e cores</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {TEMPLATES.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  aria-pressed={draft.templateCode === option.code}
                  onClick={() =>
                    setDraft({
                      ...draft,
                      templateCode: option.code,
                      colors: { ...option.defaultColors },
                    })
                  }
                  className={`rounded-2xl border p-3 text-left transition ${
                    draft.templateCode === option.code
                      ? 'border-primary ring-2 ring-primary'
                      : 'border-input'
                  }`}
                >
                  <span className="flex gap-1.5">
                    {Object.entries(option.defaultColors).map(([role, color]) => (
                      <span
                        key={role}
                        className="size-5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                  <span className="mt-2 block font-semibold">{option.displayName}</span>
                </button>
              ))}
            </div>
            <FieldError id="template-error" message={ruleMessage(errors.templateCode)} />
            <div className="mt-4 flex flex-wrap gap-4">
              {Object.keys(template.defaultColors).map((role) => (
                <div key={role}>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="color"
                      value={draft.colors[role] ?? template.defaultColors[role]}
                      onChange={(event) =>
                        setDraft({
                          ...draft,
                          colors: { ...draft.colors, [role]: event.target.value },
                        })
                      }
                      className="size-9 cursor-pointer rounded-lg border border-input bg-transparent"
                    />
                    {COLOR_ROLE_LABEL[role] ?? role}
                  </label>
                  <FieldError
                    id={`color-${role}-error`}
                    message={ruleMessage(errors[`colorOverrides.${role}`])}
                  />
                </div>
              ))}
            </div>

            {saveFailure !== undefined && (
              <p role="alert" className="mt-4 text-sm font-medium text-destructive">
                {panelFailureText(errorCode(saveFailure))}
              </p>
            )}
            {savedOnce && !dirty && (
              <p role="status" className="mt-4 text-sm text-muted-foreground">
                Alterações salvas.
              </p>
            )}
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || !dirty}
              className="mt-5 flex items-center gap-2 rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background disabled:opacity-60"
            >
              {saving && <Loader2 className="size-4 animate-spin" />} Salvar alterações
            </button>
          </section>

          <PublishSection invite={invite} dirty={dirty} onChange={reload} />

          {invite.publicToken !== null && (
            <InviteResponsesPanel inviteId={inviteId} eventName={invite.eventName} />
          )}
        </div>

        <aside className="lg:sticky lg:top-8 lg:h-fit">
          <p className="mb-3 text-sm text-muted-foreground">Prévia ao vivo</p>
          <InviteCard
            invite={{
              eventName: draft.data.eventName,
              dateLabel: formatDateInput(draft.data.eventDate),
              timeLabel: formatTimeInput(draft.data.eventTime),
              location: draft.data.location,
              templateCode: draft.templateCode,
              colorOverrides: draft.colors,
            }}
          />
        </aside>
      </main>
    </div>
  );
}

/** UC004: publicar gera o link, despublicar o desativa sem apagar nada (A2). */
function PublishSection({
  invite,
  dirty,
  onChange,
}: {
  invite: InviteDetails;
  dirty: boolean;
  onChange: () => void;
}) {
  const { handleUnauthenticated } = useSession();
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<unknown>();
  const [copied, setCopied] = useState(false);

  const published = invite.status === InviteStatus.Published;
  const url = invite.publicToken ? `${window.location.origin}/i/${invite.publicToken}` : '';
  const missing = Object.keys(fieldErrors(failure)).map((field) => FIELD_LABEL[field] ?? field);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setFailure(undefined);
    try {
      await action();
    } catch (error) {
      if (handleUnauthenticated(error)) return;
      setFailure(error);
    } finally {
      setBusy(false);
      // 409 no despublicar quer dizer que outra aba chegou primeiro: relê o convite.
      onChange();
    }
  }

  return (
    <section className="paper-card p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-2xl">Link do convite</h2>
        <button
          type="button"
          disabled={busy || (!published && dirty)}
          onClick={() =>
            void run(() => (published ? unpublishInvite(invite.id) : publishInvite(invite.id)))
          }
          className={`ml-auto flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-60 ${
            published
              ? 'border border-input hover:bg-secondary'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : published ? (
            <X className="size-4" />
          ) : (
            <Check className="size-4" />
          )}
          {published ? 'Despublicar' : 'Publicar'}
        </button>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        {published
          ? 'Envie pelo WhatsApp. Abre sem login e sem instalar nada.'
          : invite.status === InviteStatus.Unpublished
            ? 'O link está desativado. Publicar de novo reativa o mesmo link.'
            : 'Publique o convite para gerar o link.'}
        {!published && dirty && ' Salve as alterações antes de publicar.'}
      </p>

      {failure !== undefined && (
        <p role="alert" className="mt-3 text-sm font-medium text-destructive">
          {errorCode(failure) === ErrorCode.InviteNotPublishable
            ? `Falta preencher: ${missing.join(', ')}.`
            : panelFailureText(errorCode(failure))}
        </p>
      )}

      {published && url && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-input p-2">
          <input
            readOnly
            value={url}
            aria-label="Link do convite"
            className="min-w-0 flex-1 bg-transparent px-2 text-xs outline-none"
          />
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(url).then(() => setCopied(true))}
            className="flex items-center gap-1 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background"
          >
            <Copy className="size-3.5" /> {copied ? 'Copiado' : 'Copiar'}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${invite.eventName}: confirme sua presença em ${url}`)}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-sage/30 px-3 py-2 text-xs font-semibold"
          >
            Enviar no WhatsApp
          </a>
        </div>
      )}
    </section>
  );
}

function InviteNotFound() {
  // Guia, 9.5: o mesmo texto para convite inexistente e de outra conta, com a volta à lista.
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="font-display text-2xl">Convite não encontrado</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Confira se você entrou com a conta certa.
      </p>
      <Link href="/invites" className="mt-4 inline-block text-sm underline underline-offset-4">
        Voltar para meus convites
      </Link>
    </div>
  );
}
