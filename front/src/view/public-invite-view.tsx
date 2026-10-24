'use client';
// A metade de navegador de PublicInvitePage (DAS, 5.2): recebe o convite já lido no
// servidor e faz o POST do UC005 direto para a API (Guia, 10.2).
import { useState } from 'react';
import { Copy, PartyPopper } from 'lucide-react';
import type { PublishedInvite } from '@invite-app/contract';
import { submitRsvp } from '../controller/public-invite';
import { InviteCard, cardContent } from './invite-card';
import { RsvpForm } from './rsvp-form';

export function PublicInviteView({
  publicToken,
  invite,
}: {
  publicToken: string;
  invite: PublishedInvite;
}) {
  const [personalToken, setPersonalToken] = useState<string>();

  return (
    <main className="mx-auto max-w-lg space-y-6 px-4 py-10">
      <InviteCard invite={cardContent(invite)} />

      <section className="paper-card p-6 sm:p-7">
        {personalToken ? (
          <PersonalLink personalToken={personalToken} />
        ) : (
          <>
            <h2 className="mb-4 font-display text-2xl">Confirme sua presença</h2>
            <RsvpForm
              invite={invite}
              mode="create"
              onSubmit={async (body) => {
                const result = await submitRsvp(publicToken, body);
                setPersonalToken(result.personalToken);
              }}
            />
          </>
        )}
      </section>

      <p className="text-center text-xs text-muted-foreground">Feito com Convite de família</p>
    </main>
  );
}

/** UC005 passo 8: a mensagem de sucesso entrega o link pessoal (ED2). */
function PersonalLink({ personalToken }: { personalToken: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/r/${personalToken}`;
  const url = `${window.location.origin}${path}`;

  return (
    <div className="text-center">
      <PartyPopper className="mx-auto size-10 text-primary" />
      <h2 className="mt-3 font-display text-3xl">Resposta enviada!</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Guarde seu link pessoal. É por ele que você muda a resposta depois.
      </p>
      <div className="mt-5 flex items-center gap-2 rounded-xl border border-input p-2">
        <input
          readOnly
          value={url}
          aria-label="Seu link pessoal"
          className="w-full bg-transparent px-2 text-xs outline-none"
        />
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(url).then(() => setCopied(true));
          }}
          className="flex shrink-0 items-center gap-1 rounded-lg bg-foreground px-3 py-2 text-xs font-semibold text-background"
        >
          <Copy className="size-3.5" /> {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <a href={path} className="mt-4 inline-block text-sm underline underline-offset-4">
        Abrir minha resposta
      </a>
    </div>
  );
}
