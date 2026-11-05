'use client';

import { type ReactNode, startTransition, type SubmitEvent, useRef, useState } from 'react';

import { FavoriteButton } from '@/components/store/data-display/favorite-button';
import { initialColorId, isSoldOut, sizeOptions } from '@/features/store/catalog/model/product-detail';
import type { ColorSwatch, ProductDetail } from '@/features/store/catalog/model/types';
import type { ActionResult } from '@/lib/action-result';

import { SizeChartDialog } from './size-chart-dialog';

type PurchaseFormProps = {
  product: ProductDetail;
  sizeChart: ReactNode;
  action: (formData: FormData) => void;
  pending: boolean;
  result: ActionResult | null;
};

const swatchClass = {
  black: 'bg-ink',
  white: 'border border-gray-300 bg-gray-0',
  'off-white': 'border border-gray-300 bg-paper',
  'heather-gray': 'bg-gray-400',
  green: 'bg-success-700',
} satisfies Record<ColorSwatch, string>;

// Classes inteiras por estado, sem cn: ele descartaria o text-body ao lado da cor do texto.
const submitClass = {
  ready: 'flex h-cta flex-1 items-center justify-center rounded-pill bg-brand px-6 text-body font-extrabold text-gray-0 uppercase transition-colors duration-base hover:bg-brand-600 disabled:opacity-60',
  pick: 'flex h-cta flex-1 items-center justify-center rounded-pill bg-paper-stone px-6 text-body font-extrabold text-gray-700 uppercase transition-colors duration-base hover:bg-paper-sand',
  soldOut: 'flex h-cta flex-1 items-center justify-center rounded-pill bg-paper-stone px-6 text-body font-extrabold text-gray-600 uppercase',
} satisfies Record<'ready' | 'pick' | 'soldOut', string>;

// Sem tamanho, o botão continua clicável e leva o foco ao primeiro disponível: um botão desabilitado o leitor de
// tela nem alcança. Envio pelo onSubmit, e não pelo <form action>: depois da action o React reseta o form, e os
// radios voltavam à seleção inicial no DOM enquanto o estado guardava a escolha.
export function PurchaseForm({ product, sizeChart, action, pending, result }: PurchaseFormProps) {
  const [colorId, setColorId] = useState(() => initialColorId(product));
  const [size, setSize] = useState<string | null>(null);
  const [sizeMissing, setSizeMissing] = useState(false);
  const firstSizeRef = useRef<HTMLInputElement>(null);

  const options = sizeOptions(product, colorId);
  const variantId = options.find((option) => option.size === size)?.variantId ?? null;
  const firstAvailable = options.find(({ variantId: id }) => id !== null)?.size;
  const color = product.colors.find(({ id }) => id === colorId);
  const soldOut = isSoldOut(product);
  const state = soldOut ? 'soldOut' : variantId ? 'ready' : 'pick';

  const chooseColor = (id: string) => {
    setColorId(id);

    // O tamanho escolhido pode não existir na cor nova.
    if (!sizeOptions(product, id).some((option) => option.size === size && option.variantId !== null)) {
      setSize(null);
    }
  };

  const submit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!variantId) {
      setSizeMissing(true);
      firstSizeRef.current?.focus();

      return;
    }

    const formData = new FormData(event.currentTarget);

    startTransition(() => action(formData));
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <input type="hidden" name="variantId" value={variantId ?? ''} />
      {product.colors.length > 0
        ? (
            <div>
              <p id="color-label" className="text-body font-bold text-ink">
                Cor:
                {' '}
                <span className="font-normal text-gray-700">{color?.name}</span>
              </p>
              <div role="radiogroup" aria-labelledby="color-label" className="mt-2 flex flex-wrap gap-2">
                {product.colors.map(({ id, name, swatch }) => (
                  <label key={id} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="color"
                      value={id}
                      checked={id === colorId}
                      onChange={() => chooseColor(id)}
                      className="peer sr-only"
                    />
                    <span className="sr-only">{name}</span>
                    <span
                      aria-hidden
                      className="flex size-10 items-center justify-center rounded-pill border-2 border-transparent transition-colors duration-base peer-checked:border-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand"
                    >
                      <span className={`size-7 rounded-pill ${swatchClass[swatch]}`} />
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )
        : null}
      <div>
        <div className="flex items-center gap-3">
          <p id="size-label" className="text-body font-bold text-ink">Tamanho</p>
          {sizeChart
            ? (
                <>
                  <span aria-hidden className="h-4 w-px bg-paper-line" />
                  <SizeChartDialog>{sizeChart}</SizeChartDialog>
                </>
              )
            : null}
        </div>
        <div
          role="radiogroup"
          aria-labelledby="size-label"
          aria-describedby={sizeMissing ? 'size-error' : undefined}
          className="mt-2 flex flex-wrap gap-2"
        >
          {options.map(({ size: option, variantId: id }) => (
            <label key={option} className={id === null ? 'cursor-not-allowed' : 'cursor-pointer'}>
              <input
                ref={option === firstAvailable ? firstSizeRef : undefined}
                type="radio"
                name="size"
                value={option}
                checked={option === size}
                disabled={id === null}
                onChange={() => {
                  setSize(option);
                  setSizeMissing(false);
                }}
                className="peer sr-only"
              />
              <span className="flex h-ctl-lg min-w-11 items-center justify-center rounded-pill border border-paper-sand px-3 text-body font-semibold text-ink transition-colors duration-base peer-checked:border-ink peer-checked:bg-ink peer-checked:text-gray-0 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand peer-disabled:border-paper-line peer-disabled:text-gray-500 peer-disabled:line-through peer-enabled:hover:border-ink">
                {option}
                {id === null ? <span className="sr-only"> (esgotado)</span> : null}
              </span>
            </label>
          ))}
        </div>
        {sizeMissing
          ? <p id="size-error" role="alert" className="mt-2 text-body-sm text-danger-700">Escolha um tamanho para continuar.</p>
          : null}
      </div>
      <div className="flex items-center gap-3">
        <button type="submit" disabled={soldOut || pending} className={submitClass[state]}>
          {soldOut ? 'Esgotado' : pending ? 'Adicionando…' : variantId ? 'Adicionar à sacola' : 'Selecione um tamanho'}
        </button>
        <FavoriteButton productId={product.id} productName={product.name} size="lg" />
      </div>
      {result
        ? (
            <p role={result.ok ? 'status' : 'alert'} className={result.ok ? 'text-body-sm font-semibold text-success-700' : 'text-body-sm text-danger-700'}>
              {result.ok ? 'Adicionado à sacola.' : result.error}
            </p>
          )
        : null}
    </form>
  );
}
