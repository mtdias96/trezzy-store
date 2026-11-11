'use client';

import { useActionState } from 'react';
import type { Route } from 'next';

import { NewsletterForm } from '@/features/store/newsletter/components/newsletter-form';
import { subscribeToNewsletter } from '@/features/store/newsletter/data/actions';
import type { ActionResult } from '@/lib/action-result';

type NewsletterContainerProps = {
  // Vem da rota: as páginas institucionais são outra feature.
  privacyHref: Route;
};

export function NewsletterContainer({ privacyHref }: NewsletterContainerProps) {
  const [result, action, pending] = useActionState<ActionResult | null, FormData>(subscribeToNewsletter, null);

  return <NewsletterForm action={action} pending={pending} result={result} privacyHref={privacyHref} />;
}
