import type { Metadata } from 'next';

import { SignInContainer } from '@/features/admin/auth/containers/sign-in-container';
import { signInToPanel } from '@/features/shared/auth/data/actions';

export const metadata: Metadata = {
  title: 'Entrar no painel',
};

export default function Page() {
  return <SignInContainer action={signInToPanel} />;
}
