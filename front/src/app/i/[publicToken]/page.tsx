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
import { templateFor } from '../../../view/invite-card';
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
  // A prévia do link leva nome, data e a imagem do template, e o endereço do evento fica
  // fora (ADR-0008 e ADR-0009). A imagem é ativo estático em public/templates.
  const { eventName, eventStartsAt, customization } = outcome.data;
  const description = `Você está convidado(a)! ${formatEventDate(eventStartsAt)}.`;
  const image = `/templates/${templateFor(customization.templateCode).code}.png`;
  return {
    metadataBase: new URL(process.env.FRONT_ORIGIN ?? 'http://127.0.0.1:3000'),
    title: eventName,
    description,
    robots,
    openGraph: {
      title: eventName,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: 'Você está convidado(a)!' }],
    },
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
