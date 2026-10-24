import Link from 'next/link';
import { PartyPopper, Share2, Utensils } from 'lucide-react';
import { Brand } from '../view/brand';

const FEATURES = [
  {
    icon: PartyPopper,
    title: 'Convite personalizado',
    text: 'Escolha o modelo, ajuste cores e textos e veja tudo mudando na hora.',
  },
  {
    icon: Share2,
    title: 'Um link, zero cadastro',
    text: 'O convidado responde pelo celular e recebe um link pessoal para mudar depois.',
  },
  {
    icon: Utensils,
    title: 'Restrições prontas para o buffet',
    text: 'Contagem por categoria, descrições de alergia e exportação em CSV.',
  },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-12 flex flex-wrap items-center justify-between gap-4">
        <Brand />
        <Link
          href="/sign-in"
          className="rounded-2xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background"
        >
          Entrar
        </Link>
      </header>

      <section className="grid items-center gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <span className="inline-flex items-center rounded-full bg-accent/25 px-3 py-1 text-xs font-semibold">
            Para quem organiza festa em casa
          </span>
          <h1 className="mt-4 font-display text-4xl leading-tight text-balance sm:text-5xl">
            A festa organizada, do convite ao prato de cada um.
          </h1>
          <p className="mt-4 max-w-[52ch] text-pretty text-foreground/70">
            Monte o convite, mande o link pelo WhatsApp e acompanhe quem vem, quantas pessoas ao
            todo e quais restrições alimentares precisam chegar ao buffet.
          </p>
          <Link
            href="/sign-in"
            className="mt-7 inline-block rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Criar meu convite
          </Link>
        </div>

        <ul className="space-y-3 lg:col-span-6">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="paper-card flex gap-4 p-5">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent/25">
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
