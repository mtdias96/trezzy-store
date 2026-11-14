import { cn } from 'cn';

import type { ColorSwatch as Swatch } from '@/lib/color';

const swatchClass = {
  black: 'bg-ink',
  white: 'border border-gray-300 bg-gray-0',
  'off-white': 'border border-gray-300 bg-off-white',
  'heather-gray': 'bg-gray-400',
  green: 'bg-success-700',
} satisfies Record<Swatch, string>;

const sizeClass = {
  sm: 'size-2.5',
  lg: 'size-7',
} satisfies Record<'sm' | 'lg', string>;

type ColorSwatchProps = {
  // Sem amostra: cor fora das sugestões do design, que aparece neutra.
  swatch?: Swatch | null;
  size?: keyof typeof sizeClass;
};

export function ColorSwatch({ swatch, size = 'sm' }: ColorSwatchProps) {
  return (
    <span
      aria-hidden
      className={cn('shrink-0 rounded-pill', sizeClass[size], swatch ? swatchClass[swatch] : 'border border-gray-300 bg-gray-100')}
    />
  );
}
