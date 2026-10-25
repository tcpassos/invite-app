'use client';
// A tela de um convite no painel: correção do rascunho (UC002 A2), personalização com
// prévia ao vivo (UC003), publicação e link (UC004) e as respostas (UC007 e UC008).
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
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
import { FieldError } from './field-error';
import { BackIcon, CheckIcon, CloseIcon, CopyIcon, Spinner } from './icons';
import { formatDateInput, formatTimeInput, toDateAndTime } from './format';
import { useSession } from './host-shell';
import { InviteCard, templateFor } from './invite-card';
import { InviteDataFields, optionalNumber, type InviteDataValues } from './invite-fields';
import { InviteResponsesPanel } from './invite-responses-panel';
import { UNAVAILABLE_MESSAGE, panelFailureText, ruleMessage } from './messages';
import { StatusBadge } from './status-badge';

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
      <p className="loading">{load.kind === 'failed' ? UNAVAILABLE_MESSAGE : 'Carregando…'}</p>
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
      <div className="topbar topbar--sub">
        <div className="topbar__inner">
          <Link href="/invites" className="back-link">
            <BackIcon /> Meus convites
          </Link>
          <StatusBadge status={invite.status} />
        </div>
      </div>

      <main className="page-wide editor">
        <div className="editor__main">
          <section className="card form">
            <div>
              <h2 className="title-md">Dados da festa</h2>
              {!isDraft && (
                <p className="small muted">Depois de publicado, só o nome e o local mudam.</p>
              )}
            </div>
            <InviteDataFields
              values={draft.data}
              onChange={setData}
              errors={errors}
              textLimits={template.textLimits}
              scheduleLocked={!isDraft}
            />

            <div>
              <h3 className="title-sm">Modelo e cores</h3>
              <div className="template-options">
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
                    className="template-option"
                  >
                    <span className="swatches">
                      {Object.entries(option.defaultColors).map(([role, color]) => (
                        <span key={role} className="swatch" style={{ backgroundColor: color }} />
                      ))}
                    </span>
                    {option.displayName}
                  </button>
                ))}
              </div>
              <FieldError id="template-error" message={ruleMessage(errors.templateCode)} />
              <div className="color-fields">
                {Object.keys(template.defaultColors).map((role) => (
                  <div key={role}>
                    <label className="color-field">
                      <input
                        type="color"
                        value={draft.colors[role] ?? template.defaultColors[role]}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            colors: { ...draft.colors, [role]: event.target.value },
                          })
                        }
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
            </div>

            {saveFailure !== undefined && (
              <p role="alert" className="error-text">
                {panelFailureText(errorCode(saveFailure))}
              </p>
            )}
            {savedOnce && !dirty && (
              <p role="status" className="small muted">
                Alterações salvas.
              </p>
            )}
            <div>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving || !dirty}
                className="button button--dark"
              >
                {saving && <Spinner />} Salvar alterações
              </button>
            </div>
          </section>

          <PublishSection invite={invite} dirty={dirty} onChange={reload} />

          {invite.publicToken !== null && (
            <InviteResponsesPanel inviteId={inviteId} eventName={invite.eventName} />
          )}
        </div>

        <aside className="editor__aside">
          <p className="small muted card-title">Prévia ao vivo</p>
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
      // Relê o convite depois de toda ação: com sucesso, para mostrar a situação nova, e com
      // 409, porque outra aba chegou primeiro.
      onChange();
    }
  }

  return (
    <section className="card">
      <div className="section-head">
        <h2 className="title-md">Link do convite</h2>
        <button
          type="button"
          disabled={busy || (!published && dirty)}
          onClick={() =>
            void run(() => (published ? unpublishInvite(invite.id) : publishInvite(invite.id)))
          }
          className={published ? 'button button--outline' : 'button button--primary'}
        >
          {busy ? <Spinner /> : published ? <CloseIcon /> : <CheckIcon />}
          {published ? 'Despublicar' : 'Publicar'}
        </button>
      </div>

      <p className="small muted">
        {published
          ? 'Envie pelo WhatsApp. Abre sem login e sem instalar nada.'
          : invite.status === InviteStatus.Unpublished
            ? 'O link está desativado. Publicar de novo reativa o mesmo link.'
            : 'Publique o convite para gerar o link.'}
        {!published && dirty && ' Salve as alterações antes de publicar.'}
      </p>

      {failure !== undefined && (
        <p role="alert" className="error-text">
          {errorCode(failure) === ErrorCode.InviteNotPublishable
            ? `Falta preencher: ${missing.join(', ')}.`
            : panelFailureText(errorCode(failure))}
        </p>
      )}

      {published && url && (
        <div className="copy-box">
          <input readOnly value={url} aria-label="Link do convite" />
          <button
            type="button"
            onClick={() => void navigator.clipboard.writeText(url).then(() => setCopied(true))}
            className="button button--dark button--small"
          >
            <CopyIcon /> {copied ? 'Copiado' : 'Copiar'}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${invite.eventName}: confirme sua presença em ${url}`)}`}
            target="_blank"
            rel="noreferrer"
            className="button button--soft button--small"
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
    <main className="page-narrow center">
      <h1 className="title-md">Convite não encontrado</h1>
      <p className="small muted">Confira se você entrou com a conta certa.</p>
      <p>
        <Link href="/invites" className="link">
          Voltar para meus convites
        </Link>
      </p>
    </main>
  );
}
