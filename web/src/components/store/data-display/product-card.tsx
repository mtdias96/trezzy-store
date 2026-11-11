import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon, StarIcon } from 'lucide-react';

import type { FormAction } from '@/lib/action-result';
import { formatPrice } from '@/lib/money';
import { formatRating } from '@/lib/number';

import { type QuickSizeOption, QuickSizes } from './quick-sizes';

export type ProductCardData = {
  name: string;
  brand: string;
  href: Route;
  imageUrl: string | null;
  hoverImageUrl: string | null;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  installments: { count: number; valueInCents: number } | null;
  pixPriceInCents: number | null;
  rating: number | null;
  sizeOptions: readonly QuickSizeOption[];
};

type ProductCardProps = {
  product: ProductCardData;
  // Só quem monta a grade sabe a largura da foto em cada tela e quais cards abrem a página visíveis (o LCP).
  imageSizes: string;
  imageLoading?: 'eager' | 'lazy';
  // Vem da página: a sacola é outra feature.
  addToBagAction: FormAction;
};

// O link do nome cobre o card (::after), e o painel de tamanhos fica fora dele: botão dentro de link é HTML inválido.
// O min-h reserva as duas linhas do nome, para os preços da mesma linha da grade não ficarem em alturas diferentes.
// A segunda foto só entra no hover com mouse: em display none, o lazy não baixa a imagem de quem nem passou por ali.
export function ProductCard({ product, imageSizes, imageLoading = 'lazy', addToBagAction }: ProductCardProps) {
  const canAddQuickly = product.sizeOptions.some(({ variantId }) => variantId !== null);
  const { compareAtPriceInCents: compareAt, priceInCents, installments, pixPriceInCents } = product;
  const wasPrice = compareAt !== null && compareAt > priceInCents ? compareAt : null;

  return (
    <article className="group/card @container relative flex h-full flex-col rounded-tile has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand">
      <div className="relative aspect-4/5 overflow-hidden rounded-tile bg-surface-media">
        <div className="absolute inset-0 transition-transform duration-slow ease-out group-hover/card:scale-105">
          {product.imageUrl
            ? <Image src={product.imageUrl} alt="" fill sizes={imageSizes} loading={imageLoading} className="object-cover" />
            : <ImageIcon aria-hidden className="absolute inset-0 m-auto size-7 text-gray-500" />}
          {product.hoverImageUrl
            ? <Image src={product.hoverImageUrl} alt="" fill sizes={imageSizes} className="hidden object-cover opacity-0 transition transition-discrete duration-slow ease-out group-hover/card:opacity-100 starting:opacity-0 pointer-fine:group-hover/card:block" />
            : null}
        </div>
        {canAddQuickly ? <QuickSizes options={product.sizeOptions} action={addToBagAction} /> : null}
      </div>
      <div className="flex flex-1 flex-col px-0.5 pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-overline text-gray-700 uppercase">{product.brand}</p>
          {product.rating === null
            ? null
            : (
                <p className="flex shrink-0 items-center gap-1 text-caption font-semibold text-ink">
                  <StarIcon aria-hidden className="size-2.75 fill-current stroke-0" />
                  <span className="sr-only">Nota </span>
                  {formatRating(product.rating)}
                  <span className="sr-only"> de 5</span>
                </p>
              )}
        </div>
        <h3 className="mt-1 line-clamp-2 min-h-9.5 text-product-name text-ink">
          <Link href={product.href} className="outline-none after:absolute after:inset-0 after:rounded-tile">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-1.5">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-price text-ink">
              <span className="sr-only">Por </span>
              {formatPrice(priceInCents)}
            </span>
            {wasPrice === null
              ? null
              : (
                  <del className="text-body-sm text-gray-600">
                    <span className="sr-only">De </span>
                    {formatPrice(wasPrice)}
                  </del>
                )}
          </p>
          <p className="mt-1 text-caption text-gray-700">
            {installments ? <span>{`${installments.count}x de ${formatPrice(installments.valueInCents)} sem juros`}</span> : null}
            {installments && pixPriceInCents !== null ? <span aria-hidden className="hidden @2xs:inline">{' · '}</span> : null}
            {pixPriceInCents === null ? null : <span className="block font-bold text-success-700 @2xs:inline">{`${formatPrice(pixPriceInCents)} no PIX`}</span>}
          </p>
        </div>
      </div>
    </article>
  );
}
