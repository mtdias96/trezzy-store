import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRightIcon, ImageIcon } from 'lucide-react';

import { productCountLabel } from '@/features/store/catalog/model/departments';
import type { PriceBand } from '@/features/store/catalog/model/types';

export type PriceBandTone = 'brand' | 'ink' | 'surface';

type PriceBandTileProps = {
  band: PriceBand;
  tone: PriceBandTone;
};

const toneClass = {
  brand: { tile: 'bg-brand', strong: 'text-gray-0', muted: 'text-gray-0/75', arrow: 'bg-gray-0 text-ink', photo: 'border-brand' },
  ink: { tile: 'bg-ink', strong: 'text-gray-0', muted: 'text-gray-0/75', arrow: 'bg-brand text-gray-0', photo: 'border-ink' },
  surface: { tile: 'bg-surface', strong: 'text-ink', muted: 'text-ink/75', arrow: 'bg-ink text-gray-0', photo: 'border-surface' },
} satisfies Record<PriceBandTone, Record<'tile' | 'strong' | 'muted' | 'arrow' | 'photo', string>>;

const PHOTO_TILT = ['-rotate-6', 'rotate-2', 'rotate-10'];

// A borda das fotos tem a cor do card, para separar uma da outra no leque. Entre 1100px e 1440px as colunas estreitam,
// e o leque fecha para o total de produtos caber ao lado dele.
export function PriceBandTile({ band, tone }: PriceBandTileProps) {
  const { href, caption, amount, productCount, photos } = band;
  const classes = toneClass[tone];

  return (
    <Link href={href} className={`group @container relative flex h-full flex-col justify-between gap-4 rounded-tile p-3 sm:min-h-62.5 sm:p-6 ${classes.tile}`}>
      <span>
        <span className={`block text-body leading-none font-medium ${classes.muted}`}>{caption}</span>
        <span className={`mt-2 block text-amount whitespace-nowrap ${classes.strong}`}>{amount}</span>
      </span>
      <span aria-hidden className={`absolute top-6 right-6 hidden size-9 items-center justify-center rounded-pill sm:flex ${classes.arrow}`}>
        <ArrowUpRightIcon className="size-4 transition-transform duration-slow ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
      <span className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <span aria-hidden className="flex items-end -space-x-2.5 pl-1.25 sm:-space-x-4 lg:-space-x-8 xl:-space-x-4">
          {photos.map(({ id, imageUrl }, index) => (
            <span key={id} className={`relative block aspect-4/5 w-10 overflow-hidden rounded-tile border-2 bg-line sm:w-16 ${PHOTO_TILT[index] ?? ''} ${classes.photo}`}>
              {imageUrl
                ? <Image src={imageUrl} alt="" fill sizes="64px" className="object-cover" />
                : <ImageIcon className="absolute inset-0 m-auto size-4 text-gray-500" />}
            </span>
          ))}
        </span>
        <span className={`text-caption leading-none font-semibold ${classes.muted}`}>{productCountLabel(productCount)}</span>
      </span>
    </Link>
  );
}
