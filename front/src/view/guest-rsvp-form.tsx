'use client';

import {
  DietaryCategoryCode,
  RsvpStatus,
  type DietaryCategoryCode as DietaryCategoryCodeType,
  type GuestResponsePage,
  type PublishedInvite,
  type RsvpRequest,
} from '@invite-app/contract';
import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ApiRequestError, ApiUnavailableError } from '../controller/api-client';
import { browserApi } from '../controller/browser-api';
import { InviteCard } from './invite-card';

interface GuestRsvpFormProps {
  invite: PublishedInvite;
  personalToken?: string;
  publicToken?: string;
  initialResponse?: GuestResponsePage['response'];
  editable?: boolean;
  previewMode?: boolean;
}

function messageFor(error: unknown): string {
  if (error instanceof ApiRequestError) return error.body.message;
  if (error instanceof ApiUnavailableError) {
    return 'Não foi possível conectar. Sua resposta pode não ter sido registrada; confira o link antes de tentar novamente.';
  }
  return 'Não foi possível concluir a resposta.';
}

function statusLabel(status: RsvpStatus): string {
  if (status === RsvpStatus.Accepted) return 'Sim, estarei lá';
  if (status === RsvpStatus.Maybe) return 'Talvez';
  return 'Não poderei ir';
}

export function GuestRsvpForm({
  invite,
  personalToken,
  publicToken,
  initialResponse,
  editable = true,
  previewMode = false,
}: GuestRsvpFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialResponse?.name ?? '');
  const [status, setStatus] = useState<RsvpStatus>(initialResponse?.status ?? RsvpStatus.Accepted);
  const [companions, setCompanions] = useState(String(initialResponse?.companionCount ?? 0));
  const [categories, setCategories] = useState<DietaryCategoryCodeType[]>(
    initialResponse?.dietaryNote?.categories ?? [],
  );
  const [freeText, setFreeText] = useState(initialResponse?.dietaryNote?.freeText ?? '');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  function toggleCategory(code: DietaryCategoryCodeType) {
    setCategories((current) =>
      current.includes(code) ? current.filter((item) => item !== code) : [...current, code],
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (previewMode) return;
    setBusy(true);
    setError('');
    setSaved(false);
    const request: RsvpRequest = {
      name,
      status,
      ...(status === RsvpStatus.Declined
        ? {}
        : {
            companionCount: Number(companions),
            dietaryNote: { categories, freeText },
          }),
    };
    try {
      if (personalToken) {
        const updated = await browserApi.request<GuestResponsePage>(
          'PUT',
          `/public/responses/${personalToken}`,
          { body: request },
        );
        setSaved(true);
        setName(updated.response.name);
      } else {
        const result = await browserApi.request<{ personalToken: string }>(
          'POST',
          `/public/invites/${publicToken}/rsvp`,
          { body: request },
        );
        router.push(`/r/${result.personalToken}`);
      }
    } catch (cause) {
      setError(messageFor(cause));
    } finally {
      setBusy(false);
    }
  }

  if (!editable) {
    return (
      <section className="card stack">
        <h2>Resposta registrada</h2>
        <p>
          {initialResponse?.name}: {initialResponse ? statusLabel(initialResponse.status) : ''}
        </p>
        <p className="muted">O prazo para alterar a resposta terminou.</p>
      </section>
    );
  }

  return (
    <form className="card stack" onSubmit={submit}>
      <h2>{personalToken ? 'Altere sua resposta' : 'Confirme sua presença'}</h2>
      <label>
        Seu nome
        <input
          required
          maxLength={80}
          disabled={previewMode}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>
      <fieldset className="stack" disabled={previewMode}>
        <legend>Você vai ao evento?</legend>
        {Object.values(RsvpStatus).map((option) => (
          <label key={option} className="row">
            <input
              style={{ width: 'auto' }}
              type="radio"
              name="status"
              value={option}
              checked={status === option}
              onChange={() => setStatus(option)}
            />
            {statusLabel(option)}
          </label>
        ))}
      </fieldset>
      {status !== RsvpStatus.Declined && (
        <>
          <label>
            Número de acompanhantes
            <input
              type="number"
              min={0}
              max={invite.companionLimit ?? undefined}
              required
              disabled={previewMode}
              value={companions}
              onChange={(event) => setCompanions(event.target.value)}
            />
          </label>
          <fieldset className="stack">
            <legend>Restrições ou preferências alimentares</legend>
            {invite.dietaryCategories.map((category) => (
              <label key={category.code} className="row">
                <input
                  style={{ width: 'auto' }}
                  type="checkbox"
                  disabled={previewMode}
                  checked={categories.includes(category.code)}
                  onChange={() => toggleCategory(category.code)}
                />
                {category.displayName}
              </label>
            ))}
          </fieldset>
          {categories.includes(DietaryCategoryCode.Allergy) && (
            <label>
              Descreva a alergia
              <textarea
                required
                maxLength={500}
                disabled={previewMode}
                value={freeText}
                onChange={(event) => setFreeText(event.target.value)}
              />
            </label>
          )}
        </>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="success">
          Sua resposta foi atualizada.
        </p>
      )}
      <button disabled={busy || previewMode}>
        {previewMode
          ? 'Confirmação de presença'
          : busy
            ? 'Enviando…'
            : personalToken
              ? 'Salvar resposta'
              : 'Confirmar presença'}
      </button>
    </form>
  );
}

export function GuestResponseSummary({ response }: { response: GuestResponsePage['response'] }) {
  return (
    <section className="card stack">
      <h2>Resposta atual</h2>
      <p>
        <strong>{response.name}</strong> — {statusLabel(response.status)}
      </p>
      {response.status !== RsvpStatus.Declined && (
        <>
          <p>Acompanhantes: {response.companionCount}</p>
          {response.dietaryNote && (
            <>
              <p>Restrições: {response.dietaryNote.categories.join(', ')}</p>
              {response.dietaryNote.freeText && <p>Observação: {response.dietaryNote.freeText}</p>}
            </>
          )}
        </>
      )}
    </section>
  );
}

export function GuestFormPreview({ invite }: { invite: PublishedInvite }) {
  return <GuestRsvpForm invite={invite} previewMode />;
}

export function PersonalResponseLink({ personalToken }: { personalToken: string }) {
  const [link, setLink] = useState(`/r/${personalToken}`);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLink(`${window.location.origin}/r/${personalToken}`);
  }, [personalToken]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setError('');
    } catch {
      setError('Não foi possível copiar automaticamente. Selecione e copie o link.');
    }
  }

  return (
    <section className="card stack">
      <h2>Seu link pessoal</h2>
      <p>Guarde este link para alterar sua resposta até o fim do dia do evento.</p>
      <label>
        Link para alterar resposta
        <input readOnly value={link} />
      </label>
      <button type="button" onClick={() => void copyLink()}>
        Copiar link pessoal
      </button>
      {copied && (
        <p role="status" className="success">
          Link copiado.
        </p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </section>
  );
}

export function PublicInviteContent({
  invite,
  publicToken,
}: {
  invite: PublishedInvite;
  publicToken: string;
}) {
  return (
    <main className="narrow stack">
      <InviteCard
        eventName={invite.eventName}
        eventStartsAt={invite.eventStartsAt}
        location={invite.location}
        customization={invite.customization}
      />
      <GuestRsvpForm key={publicToken} invite={invite} publicToken={publicToken} />
    </main>
  );
}
