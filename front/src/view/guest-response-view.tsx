'use client';
// A página do link pessoal (UC005 ED2 e RN3). Mostra a resposta do próprio convidado e,
// enquanto a API disser que ela é editável, o formulário para alterá-la. Quem decide o
// prazo é a API, pelo `editable` (ADR-0013).
import { useState } from 'react';
import type { GuestResponsePage } from '@invite-app/contract';
import { updateGuestResponse } from '../controller/public-invite';
import { RSVP_STATUS_LABEL } from './format';
import { InviteCard, cardContent } from './invite-card';
import { RsvpForm } from './rsvp-form';

export function GuestResponsePageView({
  personalToken,
  page: initialPage,
}: {
  personalToken: string;
  page: GuestResponsePage;
}) {
  const [page, setPage] = useState(initialPage);
  const [saved, setSaved] = useState(0);

  return (
    <main className="page-narrow">
      <InviteCard invite={cardContent(page.invite)} />

      <section className="card form">
        <h2 className="title-md">Sua resposta</h2>
        {page.editable ? (
          <>
            <p className="small muted">Você pode mudar até o fim do dia do evento.</p>
            {saved > 0 && (
              <p role="status" className="alert alert--success">
                Resposta atualizada.
              </p>
            )}
            <RsvpForm
              // Remonta o formulário com o que a API gravou depois de salvar.
              key={saved}
              invite={page.invite}
              mode="update"
              initial={page.response}
              onSubmit={async (body) => {
                setPage(await updateGuestResponse(personalToken, body));
                setSaved((n) => n + 1);
              }}
            />
          </>
        ) : (
          <>
            <p className="small">
              {page.response.name}: <strong>{RSVP_STATUS_LABEL[page.response.status]}</strong>
              {page.response.companionCount > 0 &&
                `, com ${page.response.companionCount} acompanhante(s)`}
            </p>
            <p className="alert alert--neutral">
              O dia do evento já passou, então a resposta não pode mais ser alterada.
            </p>
          </>
        )}
      </section>
    </main>
  );
}
