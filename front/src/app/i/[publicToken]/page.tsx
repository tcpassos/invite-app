// A metade de servidor de PublicInvitePage (DAS, 5.2): lê o convite na API pelo tier Front e
// escolhe a view. A página é dinâmica, porque lê o token a cada pedido, e por isso sai com
// o Cache-Control privado da seção 9.5 do Guia.
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { readPublic } from '../../../controller/api-errors';
import { getPublishedInvite } from '../../../controller/public-invite';
import { serverApi } from '../../../controller/server-api';
import { formatEventDate } from '../../../view/format';
import { InviteBusy, InviteUnavailable } from '../../../view/invite-unavailable';
import { PublicInviteView } from '../../../view/public-invite-view';

interface Props {
  params: Promise<{ publicToken: string }>;
}

// Uma leitura só por pedido, dividida entre as metatags e a página.
const readInvite = cache((publicToken: string) =>
  readPublic(getPublishedInvite(serverApi(), publicToken)),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const outcome = await readInvite((await params).publicToken);
  const robots = { index: false, follow: false };
  if (outcome.kind !== 'ok') return { title: 'Convite', robots };
  // A prévia do link leva nome e data, e o endereço do evento fica fora (ADR-0008).
  const { eventName, eventStartsAt } = outcome.data;
  const description = `Você está convidado(a)! ${formatEventDate(eventStartsAt)}.`;
  return {
    title: eventName,
    description,
    robots,
    openGraph: { title: eventName, description },
  };
}

export default async function PublicInvitePage({ params }: Props) {
  const { publicToken } = await params;
  const outcome = await readInvite(publicToken);
  // Temporário, nunca permanente: o convite republicado volta a abrir no mesmo link.
  if (outcome.kind === 'notFound') redirect('/invite-not-found');
  if (outcome.kind === 'busy') return <InviteBusy />;
  if (outcome.kind === 'unavailable') return <InviteUnavailable />;
  return <PublicInviteView publicToken={publicToken} invite={outcome.data} />;
}
