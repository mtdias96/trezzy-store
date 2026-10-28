'use client';

import { useState } from 'react';
import { ArrowRightIcon, TruckIcon } from 'lucide-react';

import { Input } from '@/components/ui/input';
import type { ActionResult } from '@/lib/action-result';
import { formatCep } from '@/lib/cep';
import { formatPrice } from '@/lib/money';

export type ShippingQuote = {
  id: string;
  name: string;
  deadline: string;
  priceInCents: number;
};

type ShippingEstimatorProps = {
  action: (formData: FormData) => void;
  pending: boolean;
  result: ActionResult<ShippingQuote[]> | null;
};

const CORREIOS_CEP_SEARCH = 'https://buscacepinternet.correios.com.br/app/endereco/index.php';

export function ShippingEstimator({ action, pending, result }: ShippingEstimatorProps) {
  const [cep, setCep] = useState('');

  return (
    <form action={action} className="flex flex-col gap-2">
      <label htmlFor="shipping-cep" className="text-body font-bold text-ink">
        Calcular frete e prazo
      </label>
      <div className="relative flex items-center">
        <TruckIcon aria-hidden className="pointer-events-none absolute left-4 size-4.5 text-gray-700" />
        <Input
          id="shipping-cep"
          name="cep"
          variant="pill"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="00000-000"
          value={cep}
          onChange={(event) => setCep(formatCep(event.target.value))}
          aria-describedby={result && !result.ok ? 'shipping-error' : undefined}
          className="pr-12 pl-11"
        />
        <button
          type="submit"
          aria-label="Calcular frete"
          disabled={pending}
          className="absolute right-1 flex size-8 items-center justify-center rounded-pill bg-ink text-gray-0 transition-colors duration-base hover:bg-ink-soft disabled:opacity-50"
        >
          <ArrowRightIcon aria-hidden className="size-4" />
        </button>
      </div>
      <a
        href={CORREIOS_CEP_SEARCH}
        target="_blank"
        rel="noopener noreferrer"
        className="self-start text-caption font-semibold text-gray-700 underline underline-offset-2 hover:text-ink"
      >
        Não sei meu CEP
      </a>
      {result && !result.ok
        ? (
            <p id="shipping-error" role="alert" className="text-body-sm text-danger-700">
              {result.error}
            </p>
          )
        : null}
      {result?.ok
        ? (
            <ul aria-label="Opções de frete" className="divide-y divide-paper-line rounded-2xl border border-paper-line">
              {result.data.map((quote) => (
                <li key={quote.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="text-body font-semibold text-ink">{quote.name}</p>
                    <p className="text-caption text-gray-700">{quote.deadline}</p>
                  </div>
                  <p className="text-body font-bold text-ink">
                    {quote.priceInCents === 0 ? 'Grátis' : formatPrice(quote.priceInCents)}
                  </p>
                </li>
              ))}
            </ul>
          )
        : null}
    </form>
  );
}
