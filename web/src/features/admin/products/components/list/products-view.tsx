import type { ReactNode } from 'react';

type ProductsViewProps = {
  summary?: string;
  children: ReactNode;
};

export function ProductsView({ summary, children }: ProductsViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-400 flex-1 flex-col gap-6 px-5 py-8 sm:px-8">
      <header className="flex flex-col gap-1.5">
        <h1 className="type-display text-display-lg">Produtos</h1>
        {summary ? <p className="text-body text-muted-foreground">{summary}</p> : null}
      </header>
      {children}
    </div>
  );
}
