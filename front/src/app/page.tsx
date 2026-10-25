'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiRequestError, ApiUnavailableError } from '../controller/api-client';
import { browserApi } from '../controller/browser-api';

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    if (error.code === 'UNAUTHENTICATED') return 'Email ou senha incorretos.';
    if (error.code === 'RATE_LIMITED')
      return 'Muitas tentativas. Aguarde um pouco e tente novamente.';
    return error.body.message;
  }
  if (error instanceof ApiUnavailableError) return 'Não foi possível conectar à API.';
  return 'Não foi possível concluir a operação.';
}

export default function HomePage() {
  const router = useRouter();
  const [register, setRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await browserApi.request('POST', register ? '/auth/sign-up' : '/auth/sign-in', {
        body: register ? { name, email, password } : { email, password },
      });
      router.push('/dashboard');
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="narrow stack">
      <header>
        <h1>invite-app</h1>
        <p className="muted">
          Crie convites, acompanhe presenças e organize restrições alimentares.
        </p>
      </header>
      <form className="card stack" onSubmit={submit}>
        <h2>{register ? 'Criar conta' : 'Entrar como anfitrião'}</h2>
        {register && (
          <label>
            Seu nome
            <input
              required
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
        )}
        <label>
          Email
          <input
            required
            type="email"
            maxLength={254}
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Senha
          <input
            required
            type="password"
            minLength={register ? 8 : undefined}
            maxLength={128}
            autoComplete={register ? 'new-password' : 'current-password'}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        <button disabled={busy}>{busy ? 'Aguarde…' : register ? 'Criar conta' : 'Entrar'}</button>
        <button
          type="button"
          onClick={() => {
            setRegister(!register);
            setError('');
          }}
        >
          {register ? 'Já tenho uma conta' : 'Criar uma conta'}
        </button>
      </form>
    </main>
  );
}
