'use client';

import type { ReactNode } from 'react';

type FilterSectionProps = {
  // O conteúdo aponta para o título pelo aria-labelledby.
  titleId: string;
  title: string;
  // Só com algo marcado: o "Limpar" volta a seção ao estado inicial (um radio não desmarca no clique).
  onClear?: () => void;
  children: ReactNode;
};

export function FilterSection({ titleId, title, onClear, children }: FilterSectionProps) {
  return (
    <div className="border-t border-paper-line pt-5 first:border-t-0 first:pt-0">
      <div className="flex items-center justify-between gap-3">
        <h2 id={titleId} className="text-micro font-extrabold text-ink uppercase">
          {title}
        </h2>
        {onClear
          ? (
              // aria-label, e não um span sr-only: o espaço no começo do span some no nome ("Limparpreço").
              <button
                type="button"
                onClick={onClear}
                aria-label={`Limpar ${title.toLocaleLowerCase('pt-BR')}`}
                className="flex h-6 items-center text-caption font-semibold text-gray-700 underline underline-offset-2 transition-colors duration-base hover:text-ink"
              >
                Limpar
              </button>
            )
          : null}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
