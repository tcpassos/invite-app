import Link from 'next/link';
import { Brand } from '../view/brand';
import { ForkIcon, ShareIcon, StarIcon } from '../view/icons';

const FEATURES = [
  {
    icon: StarIcon,
    title: 'Convite personalizado',
    text: 'Escolha o modelo, ajuste cores e textos e veja tudo mudando na hora.',
  },
  {
    icon: ShareIcon,
    title: 'Um link, zero cadastro',
    text: 'O convidado responde pelo celular e recebe um link pessoal para mudar depois.',
  },
  {
    icon: ForkIcon,
    title: 'Restrições prontas para o buffet',
    text: 'Contagem por categoria, descrições de alergia e exportação em CSV.',
  },
];

export default function HomePage() {
  return (
    <main className="page-wide">
      <header className="landing-head">
        <Brand />
        <Link href="/sign-in" className="button button--dark">
          Entrar
        </Link>
      </header>

      <section className="hero">
        <div>
          <span className="pill">Para quem organiza festa em casa</span>
          <h1>A festa organizada, do convite ao prato de cada um.</h1>
          <p>
            Monte o convite, mande o link pelo WhatsApp e acompanhe quem vem, quantas pessoas ao
            todo e quais restrições alimentares precisam chegar ao buffet.
          </p>
          <Link href="/sign-in" className="button button--primary">
            Criar meu convite
          </Link>
        </div>

        <ul className="features">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <li key={title} className="card feature">
              <span className="feature__icon">
                <Icon />
              </span>
              <div>
                <p>
                  <strong>{title}</strong>
                </p>
                <p className="small muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
