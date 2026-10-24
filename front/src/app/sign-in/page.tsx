import type { Metadata } from 'next';
import { SignInView } from '../../view/sign-in-view';

export const metadata: Metadata = { title: 'Entrar' };

export default function SignInPage() {
  return <SignInView />;
}
