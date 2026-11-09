'use client';

import { HeartIcon } from 'lucide-react';

import { useStoredFlag } from '@/hooks/use-stored-flag';

type FavoriteButtonProps = {
  productId: string;
  productName: string;
};

// Rótulo fixo e estado no aria-pressed (botão de alternância).
export function FavoriteButton({ productId, productName }: FavoriteButtonProps) {
  const [active, setActive] = useStoredFlag(`favorite:${productId}`);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`Favoritar ${productName}`}
      onClick={() => setActive(!active)}
      className="flex size-12.5 shrink-0 items-center justify-center rounded-pill border border-line bg-gray-0 text-ink transition duration-fast hover:scale-105 hover:border-ink active:scale-90"
    >
      <HeartIcon aria-hidden className={active ? 'size-4.5 fill-brand text-brand' : 'size-4.5'} />
    </button>
  );
}
