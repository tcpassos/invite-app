'use client';
// Formulário do UC005 com a extensão do UC006, usado na resposta nova e na alteração pelo
// link pessoal. Ele esconde e mostra campo e não decide validade: os atributos dos campos
// são conforto, e quem recusa é a API (Guia, 7.3). As categorias vêm da API (Guia, 7.2).
import { useState, type FormEvent } from 'react';
import {
  ErrorCode,
  RsvpStatus,
  TEXT_LIMITS,
  type DietaryCategoryCode,
  type GuestResponseView,
  type PublishedInvite,
  type RsvpRequest,
  type ValidationRule,
} from '@invite-app/contract';
import { errorCode, fieldErrors, isUncertainFailure } from '../controller/api-errors';
import { FieldError } from './field-error';
import { RSVP_STATUS_LABEL } from './format';
import { CheckIcon, Spinner } from './icons';
import { RATE_LIMITED_MESSAGE, ruleMessage } from './messages';

export type RsvpFormMode = 'create' | 'update';

interface RsvpFormProps {
  invite: PublishedInvite;
  mode: RsvpFormMode;
  initial?: GuestResponseView;
  onSubmit: (body: RsvpRequest) => Promise<void>;
}

const STATUS_OPTIONS = [RsvpStatus.Accepted, RsvpStatus.Maybe, RsvpStatus.Declined] as const;

export function RsvpForm({ invite, mode, initial, onSubmit }: RsvpFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [status, setStatus] = useState<RsvpStatus | undefined>(initial?.status);
  const [companionCount, setCompanionCount] = useState(String(initial?.companionCount ?? 0));
  const [categories, setCategories] = useState<DietaryCategoryCode[]>(
    initial?.dietaryNote?.categories ?? [],
  );
  const [freeText, setFreeText] = useState(initial?.dietaryNote?.freeText ?? '');
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<unknown>();

  const declined = status === RsvpStatus.Declined;
  const needsDescription = invite.dietaryCategories.some(
    (category) => category.requiresDescription && categories.includes(category.code),
  );
  const errors: Partial<Record<string, ValidationRule>> = fieldErrors(failure);
  const uncertain = failure !== undefined && isUncertainFailure(failure);

  function toggle(code: DietaryCategoryCode) {
    setCategories((current) =>
      current.includes(code) ? current.filter((value) => value !== code) : [...current, code],
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!status) return;
    setSending(true);
    setFailure(undefined);
    const body: RsvpRequest = declined
      ? { name: name.trim(), status }
      : {
          name: name.trim(),
          status,
          companionCount: Number(companionCount),
          dietaryNote: {
            categories,
            ...(needsDescription ? { freeText: freeText.trim() } : {}),
          },
        };
    try {
      await onSubmit(body);
    } catch (error) {
      setFailure(error);
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form">
      <fieldset>
        <legend className="label">Você vai?</legend>
        <div className="choices">
          {STATUS_OPTIONS.map((value) => (
            <label key={value} className={status === value ? 'choice choice--selected' : 'choice'}>
              <input
                type="radio"
                name="status"
                value={value}
                checked={status === value}
                onChange={() => setStatus(value)}
                required
                className="visually-hidden"
              />
              {RSVP_STATUS_LABEL[value]}
            </label>
          ))}
        </div>
        <FieldError id="status-error" message={ruleMessage(errors.status)} />
      </fieldset>

      <div>
        <label htmlFor="rsvp-name" className="label">
          Seu nome
        </label>
        <input
          id="rsvp-name"
          value={name}
          required
          maxLength={TEXT_LIMITS.guestName}
          autoComplete="name"
          onChange={(event) => setName(event.target.value)}
          placeholder="Como o anfitrião te conhece"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby="rsvp-name-error"
          className="field"
        />
        <FieldError id="rsvp-name-error" message={ruleMessage(errors.name)} />
      </div>

      {/* UC005 A1: quem não vai não informa acompanhantes nem restrição alimentar. */}
      {status && !declined && (
        <>
          <div>
            <label htmlFor="rsvp-companions" className="label">
              Acompanhantes
            </label>
            <p className="hint">
              {invite.companionLimit === null
                ? 'Quantas pessoas vão com você.'
                : `Até ${invite.companionLimit} por convidado.`}
            </p>
            <input
              id="rsvp-companions"
              type="number"
              inputMode="numeric"
              min={0}
              max={invite.companionLimit ?? undefined}
              step={1}
              required
              value={companionCount}
              onChange={(event) => setCompanionCount(event.target.value)}
              aria-invalid={errors.companionCount ? true : undefined}
              aria-describedby="rsvp-companions-error"
              className="field field--short"
            />
            <FieldError id="rsvp-companions-error" message={ruleMessage(errors.companionCount)} />
          </div>

          <fieldset>
            <legend className="label">Restrições alimentares</legend>
            <div className="chips">
              {invite.dietaryCategories.map((category) => {
                const active = categories.includes(category.code);
                return (
                  <label key={category.code} className={active ? 'chip chip--selected' : 'chip'}>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggle(category.code)}
                      className="visually-hidden"
                    />
                    {category.displayName}
                  </label>
                );
              })}
            </div>
            <p className="hint hint--after">Deixe em branco se não tiver restrição.</p>
            <FieldError
              id="rsvp-categories-error"
              message={ruleMessage(errors['dietaryNote.categories'])}
            />
          </fieldset>

          {/* UC006 RN2: a categoria que exige descrição pede o texto livre. */}
          {needsDescription && (
            <div className="fade-up">
              <label htmlFor="rsvp-free-text" className="label">
                Descreva a restrição
              </label>
              <textarea
                id="rsvp-free-text"
                value={freeText}
                required
                rows={2}
                maxLength={TEXT_LIMITS.dietaryFreeText}
                onChange={(event) => setFreeText(event.target.value)}
                placeholder="Ex.: alergia a amendoim e a frutos do mar"
                aria-invalid={errors['dietaryNote.freeText'] ? true : undefined}
                aria-describedby="rsvp-free-text-error"
                className="field"
              />
              <FieldError
                id="rsvp-free-text-error"
                message={ruleMessage(errors['dietaryNote.freeText'])}
              />
            </div>
          )}
        </>
      )}

      {failure !== undefined && <FailureMessage failure={failure} mode={mode} />}

      <button type="submit" disabled={sending} className="button button--dark button--block">
        {sending ? <Spinner /> : <CheckIcon />}
        {submitLabel(mode, uncertain)}
      </button>
      {mode === 'create' && (
        <p className="tiny muted center">
          Sem cadastro. Você recebe um link pessoal para alterar depois.
        </p>
      )}
    </form>
  );
}

function submitLabel(mode: RsvpFormMode, uncertain: boolean): string {
  if (uncertain) return mode === 'create' ? 'Reenviar resposta' : 'Salvar de novo';
  return mode === 'create' ? 'Enviar resposta' : 'Salvar alteração';
}

function FailureMessage({ failure, mode }: { failure: unknown; mode: RsvpFormMode }) {
  // Guia, 9.4: sem saber se a escrita entrou, a decisão de reenviar fica com a pessoa.
  if (isUncertainFailure(failure)) {
    return (
      <p role="alert" className="alert alert--warning">
        {mode === 'create'
          ? 'Não conseguimos confirmar se sua resposta foi registrada. Se você reenviar, o anfitrião pode ver seu nome duas vezes na lista.'
          : 'Não conseguimos confirmar se a alteração foi salva. Você pode salvar de novo.'}
      </p>
    );
  }
  return (
    <p role="alert" className="alert alert--error">
      {failureText(errorCode(failure), mode)}
    </p>
  );
}

function failureText(code: ErrorCode | undefined, mode: RsvpFormMode): string {
  switch (code) {
    case ErrorCode.ValidationFailed:
      return 'Confira os campos destacados.';
    // UC005 A4: lotou, mas a resposta "não" continua disponível. Sem números (Guia, 9.5).
    case ErrorCode.CapacityExceeded:
      return 'O evento está lotado. Você ainda pode responder que não vai.';
    case ErrorCode.InviteNotOpen:
      return mode === 'create'
        ? 'Este convite não está mais aceitando respostas.'
        : 'Não dá mais para alterar a resposta: o dia do evento já passou.';
    case ErrorCode.NotFound:
      return mode === 'create'
        ? 'Este convite não está mais aceitando respostas.'
        : 'Este link não abre mais.';
    case ErrorCode.RateLimited:
      return RATE_LIMITED_MESSAGE;
    default:
      return 'Não foi possível enviar. Confira os dados e tente de novo.';
  }
}
