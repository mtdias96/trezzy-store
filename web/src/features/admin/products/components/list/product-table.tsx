import type { Route } from 'next';
import Link from 'next/link';
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react';

import { Checkbox } from '@/components/ui/checkbox';
import { parseSort, type ProductSort, type SortColumn } from '@/features/admin/products/model/list';
import type { ProductListItem } from '@/features/admin/products/model/types';

import { ProductRow } from './product-row';

type Column = {
  label: string;
  sort?: SortColumn;
  align?: 'right';
};

const COLUMNS: readonly Column[] = [
  { label: 'Produto', sort: 'produto' },
  { label: 'Categoria' },
  { label: 'Preço', sort: 'preco', align: 'right' },
  { label: 'Variantes', sort: 'variantes', align: 'right' },
  { label: 'Estoque', sort: 'estoque', align: 'right' },
  { label: 'Status' },
  { label: 'Atualizado', sort: 'atualizado' },
];

type ProductTableProps = {
  products: readonly ProductListItem[];
  now: Date;
  sort: ProductSort;
  sortLinks: Record<SortColumn, Route>;
  clearFiltersHref: Route;
};

export function ProductTable({ products, now, sort, sortLinks, clearFiltersHref }: ProductTableProps) {
  const current = parseSort(sort);

  return (
    <div className="overflow-x-auto rounded-card border border-border bg-card">
      <table className="w-full min-w-5xl border-collapse text-left">
        <thead>
          <tr className="text-micro font-semibold text-muted-foreground uppercase">
            <th scope="col" className="w-12 py-4 pr-2 pl-4">
              <Checkbox aria-label="Selecionar todos" />
            </th>
            {COLUMNS.map(({ label, sort: column, align }) => {
              const isActive = column === current.column;
              let SortIcon = ChevronsUpDownIcon;

              if (isActive) {
                SortIcon = current.direction === 'asc' ? ArrowUpIcon : ArrowDownIcon;
              }

              return (
                <th
                  key={label}
                  scope="col"
                  aria-sort={isActive ? (current.direction === 'asc' ? 'ascending' : 'descending') : undefined}
                  className={align === 'right' ? 'py-4 pr-4 text-right' : 'py-4 pr-4'}
                >
                  {column
                    ? (
                        <Link
                          href={sortLinks[column]}
                          scroll={false}
                          className={
                            isActive
                              ? 'inline-flex items-center gap-1 text-ink'
                              : 'inline-flex items-center gap-1 transition-colors hover:text-ink'
                          }
                        >
                          {label}
                          <SortIcon aria-hidden className="size-3.5" />
                        </Link>
                      )
                    : label}
                </th>
              );
            })}
            <th scope="col" className="w-14 py-4 pr-4">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => <ProductRow key={product.id} product={product} now={now} />)}
          {products.length === 0
            ? (
                <tr className="border-t border-border">
                  <td colSpan={COLUMNS.length + 2} className="px-6 py-14 text-center">
                    <p className="text-body-lg font-semibold">Nenhum produto com esses filtros</p>
                    <Link href={clearFiltersHref} className="mt-1 inline-block text-body text-brand underline-offset-4 hover:underline">
                      Limpar filtros
                    </Link>
                  </td>
                </tr>
              )
            : null}
        </tbody>
      </table>
    </div>
  );
}
