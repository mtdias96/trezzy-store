import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRightIcon, ImageIcon } from 'lucide-react';

import type { OutletProduct } from '@/features/store/catalog/model/types';
import { formatPrice } from '@/lib/money';

type OutletTileProps = {
  product: OutletProduct;
  imageSizes: string;
};

// A seta some nas peças estreitas (@3xs), para o nome e os dois preços caberem.
export function OutletTile({ product, imageSizes }: OutletTileProps) {
  const { name, categoryName, href, imageUrl, priceInCents, compareAtPriceInCents } = product;

  return (
    <Link href={href} className="group @container relative block size-full overflow-hidden rounded-tile bg-surface-media">
      <div className="absolute inset-0 transition-transform duration-slow ease-out group-hover:scale-105">
        {imageUrl
          ? <Image src={imageUrl} alt="" fill sizes={imageSizes} className="object-cover" />
          : <ImageIcon aria-hidden className="absolute inset-0 m-auto size-7 text-gray-500" />}
      </div>
      {categoryName
        ? <span className="absolute top-3 left-3 rounded-tag bg-gray-0 px-2 py-1.5 text-tag text-ink uppercase">{categoryName}</span>
        : null}
      <div className="absolute inset-x-2.5 bottom-2.5 flex min-h-13.5 items-center justify-between gap-3 rounded-tile bg-gray-0/95 px-3 py-1.5">
        <div className="min-w-0">
          <h3 className="truncate text-body-sm font-semibold text-ink">{name}</h3>
          <p className="flex flex-wrap items-baseline gap-x-1.5">
            <span className="text-body leading-tight font-bold text-ink">
              <span className="sr-only">Por </span>
              {formatPrice(priceInCents)}
            </span>
            <del className="text-caption text-gray-600">
              <span className="sr-only">De </span>
              {formatPrice(compareAtPriceInCents)}
            </del>
          </p>
        </div>
        <span aria-hidden className="hidden size-7.5 shrink-0 items-center justify-center rounded-pill bg-ink text-gray-0 @3xs:flex">
          <ArrowUpRightIcon className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}
