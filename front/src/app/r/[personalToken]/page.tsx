import { ErrorCode, type GuestResponsePage } from '@invite-app/contract';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiRequestError, ApiUnavailableError } from '../../../controller/api-client';
import { serverApi } from '../../../controller/server-api';
import {
  GuestResponseSummary,
  GuestRsvpForm,
  PersonalResponseLink,
} from '../../../view/guest-rsvp-form';
import { InviteCard } from '../../../view/invite-card';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PersonalResponsePage({
  params,
}: {
  params: Promise<{ personalToken: string }>;
}) {
  const { personalToken } = await params;
  try {
    const page = await serverApi().request<GuestResponsePage>(
      'GET',
      `/public/responses/${personalToken}`,
      { retry: 'once' },
    );
    return (
      <main className="narrow stack">
        <InviteCard
          eventName={page.invite.eventName}
          eventStartsAt={page.invite.eventStartsAt}
          location={page.invite.location}
          customization={page.invite.customization}
        />
        <GuestResponseSummary response={page.response} />
        <PersonalResponseLink personalToken={personalToken} />
        {page.editable ? (
          <GuestRsvpForm
            invite={page.invite}
            personalToken={personalToken}
            initialResponse={page.response}
          />
        ) : (
          <p className="card muted">O prazo para alterar sua resposta terminou.</p>
        )}
      </main>
    );
  } catch (error) {
    if (error instanceof ApiRequestError && error.code === ErrorCode.NotFound) notFound();
    if (error instanceof ApiUnavailableError || error instanceof ApiRequestError) {
      return (
        <main className="narrow">
          <section className="card stack">
            <h1>Resposta temporariamente indisponível</h1>
            <p>Não foi possível carregar sua resposta agora. Tente novamente em alguns minutos.</p>
          </section>
        </main>
      );
    }
    throw error;
  }
}
