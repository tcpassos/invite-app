import { ErrorCode } from '@invite-app/contract';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ApiRequestError, ApiUnavailableError } from '../../../controller/api-client';
import { serverApi } from '../../../controller/server-api';
import { PublicInviteContent } from '../../../view/guest-rsvp-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function PublicInvitePage({
  params,
}: {
  params: Promise<{ publicToken: string }>;
}) {
  const { publicToken } = await params;
  try {
    const invite = await serverApi().request<import('@invite-app/contract').PublishedInvite>(
      'GET',
      `/public/invites/${publicToken}`,
      { retry: 'once' },
    );
    return <PublicInviteContent invite={invite} publicToken={publicToken} />;
  } catch (error) {
    if (error instanceof ApiRequestError && error.code === ErrorCode.NotFound) notFound();
    if (error instanceof ApiUnavailableError || error instanceof ApiRequestError) {
      return (
        <main className="narrow">
          <section className="card stack">
            <h1>Convite temporariamente indisponível</h1>
            <p>Não foi possível carregar este convite agora. Tente novamente em alguns minutos.</p>
          </section>
        </main>
      );
    }
    throw error;
  }
}
