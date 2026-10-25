import type { ReactNode } from 'react';

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
