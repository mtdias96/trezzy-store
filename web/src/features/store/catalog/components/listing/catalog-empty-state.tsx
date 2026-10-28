import type { Route } from 'next';
import Link from 'next/link';
import { SearchXIcon } from 'lucide-react';

type CatalogEmptyStateProps = {
  // Com filtro (ou numa página além da última), o caminho é limpá-los; sem filtro, a seção está vazia mesmo.
  filtered: boolean;
  clearHref: Route;
};

export function CatalogEmptyState({ filtered, clearHref }: CatalogEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-paper-sand px-6 py-16 text-center">
      <SearchXIcon aria-hidden className="size-8 text-gray-500" />
      <h2 className="type-display text-display-sm not-italic">
        {filtered ? 'Nenhum produto com esses filtros' : 'Nada por aqui ainda'}
      </h2>
      <p className="max-w-sm text-body text-gray-700">
        {filtered ? 'Tire um filtro ou comece de novo.' : 'Os próximos drops chegam em breve.'}
      </p>
      {filtered
        ? (
            <Link
              href={clearHref}
              className="mt-2 flex h-ctl-lg items-center rounded-pill bg-ink px-5 text-body font-bold text-gray-0 transition-colors duration-base hover:bg-ink-soft"
            >
              Limpar filtros
            </Link>
          )
        : null}
    </div>
  );
}
