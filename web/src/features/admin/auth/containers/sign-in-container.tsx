'use client';

import { useActionState } from 'react';

import { SignInForm } from '@/features/admin/auth/components/sign-in-form';
import type { ActionResult } from '@/lib/action-result';

type SignInContainerProps = {
  // A Server Action vem da página: uma feature não importa outra, e o login mora no features/shared/auth.
  action: (state: ActionResult | null, formData: FormData) => Promise<ActionResult>;
};

export function SignInContainer({ action }: SignInContainerProps) {
  const [result, formAction, pending] = useActionState<ActionResult | null, FormData>(action, null);

  return <SignInForm action={formAction} pending={pending} result={result} />;
}
