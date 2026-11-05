import type { ReactNode } from 'react';

type CatalogBrowserProps = {
  toolbar: ReactNode;
  sidebar: ReactNode;
  // A lista atual continua na tela, apagada, enquanto a do filtro novo não chega.
  busy: boolean;
  children: ReactNode;
};

const resultsClass = {
  idle: 'min-w-0 flex-1 transition-opacity duration-base',
  busy: 'min-w-0 flex-1 opacity-60 transition-opacity duration-base',
} satisfies Record<'idle' | 'busy', string>;

// O painel lateral só existe a partir do lg; abaixo, os filtros abrem na gaveta do toolbar.
export function CatalogBrowser({ toolbar, sidebar, busy, children }: CatalogBrowserProps) {
  return (
    <div className="mt-6 lg:mt-8">
      <div className="flex items-center justify-between gap-3 lg:justify-end">{toolbar}</div>
      <div className="mt-4 flex items-start gap-6 lg:mt-5">
        <aside
          aria-label="Filtros"
          className="hidden w-68 shrink-0 rounded-card border border-paper-line bg-gray-0 p-5 lg:sticky-panel lg:block"
        >
          {sidebar}
        </aside>
        <div aria-busy={busy} className={busy ? resultsClass.busy : resultsClass.idle}>
          {children}
        </div>
      </div>
    </div>
  );
}
