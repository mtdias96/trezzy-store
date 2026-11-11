import Image from 'next/image';
import Link from 'next/link';

import { productCountLabel } from '@/features/store/catalog/model/departments';
import type { BrandTile } from '@/features/store/catalog/model/types';

type BrandCardProps = {
  brand: BrandTile;
};

export function BrandCard({ brand }: BrandCardProps) {
  const { name, productCount, imageUrl, href } = brand;

  return (
    <Link href={href} className="group @container relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-tile bg-ink text-center text-gray-0">
      {imageUrl
        ? (
            <>
              <Image
                src={imageUrl}
                alt=""
                fill
                sizes="(min-width: 1440px) 335px, (min-width: 960px) 24vw, (min-width: 640px) 46vw, 46vw"
                className="object-cover transition-transform duration-slow ease-out group-hover:scale-105"
              />
              <span aria-hidden className="absolute inset-0 bg-ink/50" />
            </>
          )
        : null}
      <span className="relative px-2">
        <span className="block text-tile-title uppercase">{name}</span>
        <span className="mt-1.5 block text-caption leading-3.5 font-medium">{productCountLabel(productCount)}</span>
      </span>
    </Link>
  );
}
