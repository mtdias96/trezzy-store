import type { Metadata } from 'next';

import { SignInForm } from '@/features/admin/auth/components/sign-in-form';

export const metadata: Metadata = {
  title: 'Entrar no painel',
};

export default function Page() {
  return <SignInForm />;
}
