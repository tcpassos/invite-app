import Link from 'next/link';
import type { ReactNode } from 'react';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span
        className={`grid place-items-center rounded-2xl bg-primary font-hand font-bold text-primary-foreground ${
          compact ? 'size-9 text-lg' : 'size-11 text-xl'
        }`}
      >
        C
      </span>
      <span className={`font-hand ${compact ? 'text-xl' : 'text-2xl'}`}>Convite de família</span>
    </Link>
  );
}

/** Caixa centralizada das páginas de aviso, como convite indisponível ou não encontrado. */
export function Notice({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="paper-card max-w-md p-8 text-center">
        <h1 className="font-display text-2xl">{title}</h1>
        {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
      </div>
    </main>
  );
}

export function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs font-medium text-destructive">
      {message}
    </p>
  );
}
