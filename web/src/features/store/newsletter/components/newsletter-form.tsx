'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { ArrowRightIcon, CheckIcon, CircleAlertIcon, MailIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import type { ActionResult } from '@/lib/action-result';

type NewsletterFormProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  result: ActionResult | null;
  privacyHref: Route;
};

// O formulário some no sucesso, e o foco iria junto para o <body>: a confirmação o recebe ao entrar na tela.
function focusOnMount(node: HTMLElement | null) {
  node?.focus();
}

export function NewsletterForm({ action, pending, result, privacyHref }: NewsletterFormProps) {
  if (result?.ok) {
    return (
      <p
        ref={focusOnMount}
        tabIndex={-1}
        className="flex items-center gap-3 rounded-xl border border-on-ink-line bg-ink-soft p-4 text-body-lg font-semibold text-gray-0 outline-none"
      >
        <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-pill bg-brand">
          <CheckIcon className="size-4" />
        </span>
        Pronto! O próximo drop chega primeiro no seu e-mail.
      </p>
    );
  }

  // O alerta sai durante o envio e volta depois: assim o leitor de tela anuncia de novo um erro repetido.
  const failure = result?.ok === false && !pending ? result : undefined;

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col gap-2">
          <div className="relative">
            <label htmlFor="newsletter-email" className="sr-only">
              Seu e-mail
            </label>
            <MailIcon
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-on-ink-subtle"
            />
            <Input
              id="newsletter-email"
              name="email"
              type="email"
              variant="ink"
              autoComplete="email"
              placeholder="Seu e-mail"
              required
              defaultValue={failure?.values?.email}
              aria-invalid={failure ? true : undefined}
              aria-describedby={failure ? 'newsletter-error newsletter-terms' : 'newsletter-terms'}
              className="pl-11"
            />
          </div>
          {failure
            ? (
                <p id="newsletter-error" role="alert" className="flex items-center gap-2 text-body-sm font-medium text-danger-50">
                  <CircleAlertIcon aria-hidden className="size-4 shrink-0 text-danger-500" />
                  {failure.error}
                </p>
              )
            : null}
        </div>
        {/* aria-disabled, e não disabled: o botão desabilitado perde o foco no meio do envio. */}
        <button
          type="submit"
          aria-disabled={pending || undefined}
          onClick={pending ? (event) => event.preventDefault() : undefined}
          className="group flex h-field shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-body-lg font-bold text-gray-0 transition-colors duration-base hover:bg-brand-600 aria-disabled:cursor-wait aria-disabled:opacity-70"
        >
          {pending ? 'Assinando…' : 'Assinar'}
          <ArrowRightIcon aria-hidden className="size-4 transition-transform duration-slow ease-out group-hover:translate-x-0.5" />
        </button>
      </div>
      <p id="newsletter-terms" className="text-caption text-pretty text-on-ink-subtle">
        Um e-mail por semana, sem spam. Pra sair, é só clicar no link no fim de qualquer e-mail. Veja como usamos seus
        dados na
        {' '}
        <Link href={privacyHref} className="underline underline-offset-2 transition-colors duration-base hover:text-gray-0">
          Política de privacidade
        </Link>
        .
      </p>
    </form>
  );
}
