'use client';

import { HeartIcon } from 'lucide-react';

import { useStoredFlag } from '@/hooks/use-stored-flag';

type FavoriteButtonSize = 'sm' | 'lg';

type FavoriteButtonProps = {
  productId: string;
  productName: string;
  size?: FavoriteButtonSize;
};

const sizeClass = {
  sm: 'size-10 bg-gray-0 text-ink shadow-knob',
  lg: 'size-12.5 border border-paper-line bg-gray-0 text-ink hover:border-ink',
} satisfies Record<FavoriteButtonSize, string>;

// Rótulo fixo e estado no aria-pressed (botão de alternância). relative z-10: fica acima do link que cobre o card.
export function FavoriteButton({ productId, productName, size = 'sm' }: FavoriteButtonProps) {
  const [active, setActive] = useStoredFlag(`favorite:${productId}`);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`Favoritar ${productName}`}
      onClick={() => setActive(!active)}
      className={`relative z-10 flex shrink-0 items-center justify-center rounded-pill transition duration-fast hover:scale-105 active:scale-90 ${sizeClass[size]}`}
    >
      <HeartIcon aria-hidden className={active ? 'size-4.5 fill-brand text-brand' : 'size-4.5'} />
    </button>
  );
}
