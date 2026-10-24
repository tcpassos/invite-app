'use client';
// Entrada e cadastro do anfitrião (UC001). A sessão é o cookie que a API grava, e o front
// não guarda token nenhum (ADR-0010).
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { ErrorCode, TEXT_LIMITS, type ValidationRule } from '@invite-app/contract';
import { errorCode, fieldErrors } from '../controller/api-errors';
import { signIn, signUp } from '../controller/host-panel';
import { PANEL_PATH } from '../controller/host-session';
import { Brand, FieldError } from './brand';
import { RATE_LIMITED_MESSAGE, UNAVAILABLE_MESSAGE, ruleMessage } from './messages';

type Mode = 'signIn' | 'signUp';

export function SignInView() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signIn');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<unknown>();

  const errors: Partial<Record<string, ValidationRule>> = fieldErrors(failure);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setFailure(undefined);
    try {
      if (mode === 'signUp') await signUp({ name: name.trim(), email: email.trim(), password });
      else await signIn({ email: email.trim(), password });
      router.replace(PANEL_PATH);
    } catch (error) {
      setFailure(error);
      setSending(false);
    }
  }

  function switchMode() {
    setMode(mode === 'signIn' ? 'signUp' : 'signIn');
    setFailure(undefined);
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>

        <div className="paper-card p-6 sm:p-7">
          <h1 className="font-display text-2xl">
            {mode === 'signIn' ? 'Entrar na sua conta' : 'Criar sua conta'}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Os convites e as confirmações ficam salvos aqui.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === 'signUp' && (
              <div>
                <label htmlFor="host-name" className="mb-1.5 block text-sm font-medium">
                  Seu nome
                </label>
                <input
                  id="host-name"
                  value={name}
                  required
                  maxLength={TEXT_LIMITS.hostName}
                  autoComplete="name"
                  onChange={(event) => setName(event.target.value)}
                  aria-invalid={errors.name ? true : undefined}
                  className="field"
                />
                <FieldError id="host-name-error" message={ruleMessage(errors.name)} />
              </div>
            )}
            <div>
              <label htmlFor="host-email" className="mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                id="host-email"
                type="email"
                value={email}
                required
                maxLength={TEXT_LIMITS.email}
                autoComplete="email"
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={errors.email ? true : undefined}
                className="field"
              />
              <FieldError id="host-email-error" message={ruleMessage(errors.email)} />
            </div>
            <div>
              <label htmlFor="host-password" className="mb-1.5 block text-sm font-medium">
                Senha
              </label>
              <input
                id="host-password"
                type="password"
                value={password}
                required
                minLength={mode === 'signUp' ? TEXT_LIMITS.passwordMin : undefined}
                maxLength={TEXT_LIMITS.passwordMax}
                autoComplete={mode === 'signIn' ? 'current-password' : 'new-password'}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={errors.password ? true : undefined}
                className="field"
              />
              <FieldError id="host-password-error" message={ruleMessage(errors.password)} />
            </div>

            {failure !== undefined && (
              <p role="alert" className="text-sm font-medium text-destructive">
                {failureText(errorCode(failure))}
              </p>
            )}

            <button
              type="submit"
              disabled={sending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {sending && <Loader2 className="size-4 animate-spin" />}
              {mode === 'signIn' ? 'Entrar' : 'Criar conta'}
            </button>
          </form>

          <button
            type="button"
            onClick={switchMode}
            className="mt-4 w-full text-center text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {mode === 'signIn' ? 'Ainda não tenho conta' : 'Já tenho conta, quero entrar'}
          </button>
        </div>
      </div>
    </main>
  );
}

function failureText(code: ErrorCode | undefined): string {
  switch (code) {
    // UC001 A2: não diz se foi o email ou a senha.
    case ErrorCode.Unauthenticated:
      return 'Email ou senha incorretos.';
    // UC001 A3: não diz se o email tem conta.
    case ErrorCode.RateLimited:
      return RATE_LIMITED_MESSAGE;
    case ErrorCode.ValidationFailed:
      return 'Confira os campos destacados.';
    case undefined:
      return UNAVAILABLE_MESSAGE;
    default:
      return 'Não foi possível continuar. Tente de novo.';
  }
}
