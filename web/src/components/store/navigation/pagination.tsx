import type { Route } from 'next';
import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

type PaginationProps = {
  page: number;
  pageCount: number;
  previous: Route | null;
  next: Route | null;
};

const LINK_CLASS = 'flex h-ctl-lg items-center gap-1.5 rounded-pill border border-paper-line bg-gray-0 px-4 text-body font-bold text-ink transition-colors duration-base hover:border-ink';

export function Pagination({ page, pageCount, previous, next }: PaginationProps) {
  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav aria-label="Paginação" className="flex flex-wrap items-center justify-center gap-3">
      {previous
        ? (
            <Link href={previous} rel="prev" className={LINK_CLASS}>
              <ChevronLeftIcon aria-hidden className="size-4" />
              Anterior
            </Link>
          )
        : null}
      <p className="text-body text-gray-700 tabular-nums">
        {`Página ${page} de ${pageCount}`}
      </p>
      {next
        ? (
            <Link href={next} rel="next" className={LINK_CLASS}>
              Próxima
              <ChevronRightIcon aria-hidden className="size-4" />
            </Link>
          )
        : null}
    </nav>
  );
}
