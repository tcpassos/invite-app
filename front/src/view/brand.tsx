import Link from 'next/link';

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
