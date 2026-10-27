import type { ReactNode } from 'react';

type ProductsViewProps = {
  children: ReactNode;
};

export function ProductsView({ children }: ProductsViewProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 py-8 sm:px-8">
      <h1 className="type-display text-display-lg">Produtos</h1>
      {children}
    </div>
  );
}
