import Link from 'next/link';
import { ShoppingBagIcon } from 'lucide-react';

import { pendingRoute } from '@/lib/route';

type BagLinkProps = {
  count?: number;
};

function bagLabel(count: number): string {
  if (count === 0) {
    return 'Sacola vazia';
  }

  return count === 1 ? 'Sacola: 1 item' : `Sacola: ${count} itens`;
}

// Abaixo do xl, ícone com o contador por cima, como o da conta: a pílula "Sacola" não cabe ao lado da marca em 360px
// nem dos itens do menu em 1100px.
export function BagLink({ count = 0 }: BagLinkProps) {
  return (
    <Link
      href={pendingRoute('/sacola')}
      aria-label={bagLabel(count)}
      className="relative flex size-11 shrink-0 items-center justify-center rounded-pill transition-colors duration-base hover:bg-ink-soft xl:h-ctl-lg xl:w-auto xl:gap-2.5 xl:bg-gray-0 xl:pr-1.5 xl:pl-4 xl:text-body xl:font-bold xl:text-ink xl:hover:bg-paper-stone"
    >
      <ShoppingBagIcon aria-hidden className="size-5 xl:hidden" />
      <span aria-hidden className="hidden xl:inline">
        Sacola
      </span>
      {count > 0
        ? (
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-pill bg-brand px-1 text-caption font-bold text-gray-0 tabular-nums ring-2 ring-ink xl:static xl:size-8 xl:ring-0"
            >
              {count}
            </span>
          )
        : null}
    </Link>
  );
}
