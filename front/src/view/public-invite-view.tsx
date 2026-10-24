'use client';
// A metade de navegador de PublicInvitePage (DAS, 5.2): recebe o convite já lido no
// servidor e faz o POST do UC005 direto para a API (Guia, 10.2).
import { useState } from 'react';
import type { PublishedInvite } from '@invite-app/contract';
import { submitRsvp } from '../controller/public-invite';
import { CopyIcon, StarIcon } from './icons';
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
    <main className="page-narrow">
      <InviteCard invite={cardContent(invite)} />

      <section className="card">
        {personalToken ? (
          <PersonalLink personalToken={personalToken} />
        ) : (
          <>
            <h2 className="title-md card-title">Confirme sua presença</h2>
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

      <p className="tiny muted center">Feito com invite-app</p>
    </main>
  );
}

/** UC005 passo 8: a mensagem de sucesso entrega o link pessoal (ED2). */
function PersonalLink({ personalToken }: { personalToken: string }) {
  const [copied, setCopied] = useState(false);
  const path = `/r/${personalToken}`;
  const url = `${window.location.origin}${path}`;

  return (
    <div className="success">
      <StarIcon className="icon icon--large" />
      <h2 className="title-lg">Resposta enviada!</h2>
      <p className="small muted">
        Guarde seu link pessoal. É por ele que você muda a resposta depois.
      </p>
      <div className="copy-box">
        <input readOnly value={url} aria-label="Seu link pessoal" />
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(url).then(() => setCopied(true));
          }}
          className="button button--dark button--small"
        >
          <CopyIcon /> {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <p>
        <a href={path} className="link">
          Abrir minha resposta
        </a>
      </p>
    </div>
  );
}
