import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon, StarIcon } from 'lucide-react';

import { discountPercent, formatPrice } from '@/lib/money';
import { formatRating } from '@/lib/number';

import { FavoriteButton } from './favorite-button';

export type ProductTag = 'drop' | 'new' | 'last-units' | 'sold-out';

export type ProductCardData = {
  id: string;
  name: string;
  brand: string;
  href: Route;
  imageUrl: string | null;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  installments: { count: number; valueInCents: number } | null;
  pixPriceInCents: number | null;
  rating: number | null;
  tag: ProductTag | null;
};

type ProductCardProps = {
  product: ProductCardData;
  // Só quem monta a grade sabe a largura da foto em cada tela e quais cards abrem a página visíveis (o LCP).
  imageSizes: string;
  imageLoading?: 'eager' | 'lazy';
};

type BadgeTone = 'brand' | 'danger' | 'warning' | 'ink' | 'muted';

const badgeToneClass = {
  brand: 'bg-brand text-gray-0',
  danger: 'bg-danger-600 text-gray-0',
  warning: 'bg-warning-500 text-ink',
  ink: 'bg-ink text-gray-0',
  muted: 'bg-gray-700 text-gray-0',
} satisfies Record<BadgeTone, string>;

// Esgotado vence tudo: um "-17%" num produto que não dá para comprar engana.
function badgeFor({ tag, priceInCents, compareAtPriceInCents }: ProductCardData): { label: string; tone: BadgeTone } | null {
  const discount = compareAtPriceInCents === null ? 0 : discountPercent(compareAtPriceInCents, priceInCents);

  if (tag === 'sold-out') {
    return { label: 'Esgotado', tone: 'muted' };
  }

  if (tag === 'drop') {
    return { label: 'Drop', tone: 'brand' };
  }

  if (discount > 0) {
    return { label: `-${discount}%`, tone: 'danger' };
  }

  if (tag === 'last-units') {
    return { label: 'Últimas unidades', tone: 'warning' };
  }

  return tag === 'new' ? { label: 'Novo', tone: 'ink' } : null;
}

// O link do nome cobre o card (::after), e o favorito fica fora dele: botão dentro de link é HTML inválido.
// A sombra é uma camada (::after) que só troca a opacidade: animar o box-shadow repinta a cada quadro.
export function ProductCard({ product, imageSizes, imageLoading = 'lazy' }: ProductCardProps) {
  const badge = badgeFor(product);
  const { compareAtPriceInCents: compareAt, priceInCents } = product;
  const wasPrice = compareAt !== null && compareAt > priceInCents ? compareAt : null;

  return (
    <article className="group/card @container relative flex h-full flex-col rounded-card border border-paper-line bg-gray-0 p-1.5 transition duration-slow ease-out after:pointer-events-none after:absolute after:inset-0 after:rounded-card after:opacity-0 after:shadow-pop after:transition-opacity after:duration-slow focus-within:border-brand hover:-translate-y-1 hover:border-brand hover:after:opacity-100 has-focus-visible:-translate-y-1 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand has-focus-visible:after:opacity-100">
      <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-paper-stone">
        <div className="absolute inset-0 transition-transform duration-slow ease-out group-hover/card:scale-105">
          {product.imageUrl
            ? <Image src={product.imageUrl} alt="" fill sizes={imageSizes} loading={imageLoading} className="object-cover" />
            : <ImageIcon aria-hidden className="absolute inset-0 m-auto size-7 text-gray-500" />}
        </div>
        {badge
          ? (
              <span className={`absolute top-2.5 left-2.5 rounded-pill px-2.5 py-1 text-micro font-extrabold uppercase ${badgeToneClass[badge.tone]}`}>
                {badge.label}
              </span>
            )
          : null}
        <div className="absolute top-2 right-2">
          <FavoriteButton productId={product.id} productName={product.name} />
        </div>
      </div>
      <div className="flex flex-1 flex-col px-2 pt-3 pb-2 @2xs:px-2.5">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-micro font-bold text-gray-700 uppercase">{product.brand}</p>
          {product.rating === null
            ? null
            : (
                <p className="flex shrink-0 items-center gap-1 text-caption font-semibold text-ink">
                  <StarIcon aria-hidden className="size-3 fill-current" />
                  <span className="sr-only">Nota </span>
                  {formatRating(product.rating)}
                  <span className="sr-only"> de 5</span>
                </p>
              )}
        </div>
        <h3 className="mt-1.5 line-clamp-2 text-body font-medium text-ink @2xs:text-body-lg">
          <Link href={product.href} className="outline-none after:absolute after:inset-0 after:rounded-card">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto pt-4">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-body-lg font-extrabold text-ink @2xs:text-display-sm">
              <span className="sr-only">Por </span>
              {formatPrice(product.priceInCents)}
            </span>
            {wasPrice === null
              ? null
              : (
                  <del className="text-caption text-gray-600">
                    <span className="sr-only">De </span>
                    {formatPrice(wasPrice)}
                  </del>
                )}
          </p>
          {product.installments
            ? (
                <p className="mt-0.5 text-caption text-gray-700">
                  {`${product.installments.count}x de ${formatPrice(product.installments.valueInCents)} sem juros`}
                </p>
              )
            : null}
          {product.pixPriceInCents === null
            ? null
            : (
                <p className="mt-2 inline-flex flex-wrap items-baseline gap-x-1.5 rounded-lg bg-success-50 px-2 py-1 text-success-700">
                  <span className="text-micro font-extrabold">PIX</span>
                  <span className="text-body-sm font-bold">{formatPrice(product.pixPriceInCents)}</span>
                  <span className="hidden text-caption @2xs:inline">{`-${discountPercent(product.priceInCents, product.pixPriceInCents)}%`}</span>
                </p>
              )}
        </div>
      </div>
    </article>
  );
}
