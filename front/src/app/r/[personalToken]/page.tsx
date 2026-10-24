// O link pessoal do convidado (UC005 ED2). A leitura é feita no servidor, como a do convite,
// e a alteração sai do navegador direto para a API (Guia, 4.1).
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { readPublic } from '../../../controller/api-errors';
import { getGuestResponsePage } from '../../../controller/public-invite';
import { serverApi } from '../../../controller/server-api';
import { GuestResponsePageView } from '../../../view/guest-response-view';
import { InviteBusy, InviteUnavailable } from '../../../view/invite-unavailable';

export const metadata: Metadata = {
  title: 'Sua resposta',
  robots: { index: false, follow: false },
};

export default async function PersonalResponsePage({
  params,
}: {
  params: Promise<{ personalToken: string }>;
}) {
  const { personalToken } = await params;
  const outcome = await readPublic(getGuestResponsePage(serverApi(), personalToken));
  if (outcome.kind === 'notFound') redirect('/invite-not-found');
  if (outcome.kind === 'busy') return <InviteBusy />;
  if (outcome.kind === 'unavailable') return <InviteUnavailable />;
  return <GuestResponsePageView personalToken={personalToken} page={outcome.data} />;
}
