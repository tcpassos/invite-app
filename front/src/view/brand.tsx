import Link from 'next/link';
import type { ReactNode } from 'react';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className={compact ? 'brand brand--compact' : 'brand'}>
      <span className="brand__mark" aria-hidden>
        i
      </span>
      <span className="brand__name">invite-app</span>
    </Link>
  );
}

/** Caixa centralizada das páginas de aviso, como convite indisponível ou não encontrado. */
export function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main className="notice">
      <div className="card">
        <h1 className="title-md">{title}</h1>
        {children && <div className="small muted">{children}</div>}
      </div>
    </main>
  );
}

export function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="field-error">
      {message}
    </p>
  );
}
