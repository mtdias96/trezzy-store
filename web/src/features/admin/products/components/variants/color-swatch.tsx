import { cn } from 'cn';

import type { ColorSwatch as Swatch } from '@/features/admin/products/model/variants';

const swatchClass = {
  black: 'bg-ink',
  white: 'border border-gray-300 bg-gray-0',
  'off-white': 'border border-gray-300 bg-paper',
  'heather-gray': 'bg-gray-400',
  green: 'bg-success-700',
} satisfies Record<Swatch, string>;

type ColorSwatchProps = {
  swatch?: Swatch;
};

export function ColorSwatch({ swatch }: ColorSwatchProps) {
  return (
    <span
      aria-hidden
      className={cn('size-2.5 shrink-0 rounded-pill', swatch ? swatchClass[swatch] : 'border border-gray-300 bg-gray-100')}
    />
  );
}
