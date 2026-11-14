import Image from 'next/image';
import Link from 'next/link';

import type { ProductColorway } from '@/features/store/catalog/model/types';

type ColorwayPickerProps = {
  colorName: string;
  colorways: readonly ProductColorway[];
};

// Cada cor é outra página, com fotos próprias: a troca é navegação, funciona sem JavaScript e aproveita o cache. A cor
// esgotada continua clicável, porque a página dela existe e avisa.
export function ColorwayPicker({ colorName, colorways }: ColorwayPickerProps) {
  return (
    <nav aria-labelledby="colorway-label">
      <p id="colorway-label" className="text-body font-bold text-ink">
        Cor:
        {' '}
        <span className="font-normal text-gray-700">{colorName}</span>
      </p>
      <ul className="mt-2 flex snap-x gap-2 overflow-x-auto pb-1">
        {colorways.map(({ name, href, imageUrl, inStock, current }) => (
          <li key={href} className="w-18 shrink-0 snap-start">
            <Link
              href={href}
              aria-current={current ? 'page' : undefined}
              className={`group flex flex-col gap-1 ${inStock ? '' : 'opacity-50'}`}
            >
              <span
                className={`relative block aspect-square overflow-hidden rounded-tile border-2 bg-surface transition-colors duration-base ${current ? 'border-ink' : 'border-transparent group-hover:border-line-strong'}`}
              >
                {imageUrl ? <Image src={imageUrl} alt="" fill sizes="72px" className="object-cover" /> : null}
              </span>
              <span className="truncate text-caption text-gray-700">{name}</span>
              {inStock ? null : <span className="sr-only">(esgotado)</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
