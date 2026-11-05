import { matchesSearch } from '@/lib/text';

import type { ProductListItem, ProductStatus, ProductSummary, SelectOption, StockLevel } from './types';
import { summarizeVariants } from './variants';

export const STATUS_FILTERS = ['todos', 'ativos', 'inativos', 'rascunhos'] as const;
export type StatusFilter = (typeof STATUS_FILTERS)[number];

const STATUS_BY_FILTER = {
  ativos: 'active',
  inativos: 'inactive',
  rascunhos: 'draft',
} satisfies Record<Exclude<StatusFilter, 'todos'>, ProductStatus>;

const STATUS_FILTER_LABELS = {
  todos: 'Todos',
  ativos: 'Ativos',
  inativos: 'Inativos',
  rascunhos: 'Rascunhos',
} satisfies Record<StatusFilter, string>;

export const STOCK_FILTERS = ['todos', 'em-estoque', 'baixo', 'sem-estoque'] as const;
export type StockFilter = (typeof STOCK_FILTERS)[number];

const LEVEL_BY_FILTER = {
  'em-estoque': 'in-stock',
  baixo: 'low',
  'sem-estoque': 'out',
} satisfies Record<Exclude<StockFilter, 'todos'>, StockLevel>;

const STOCK_FILTER_LABELS = {
  todos: 'Todos',
  'em-estoque': 'Em estoque',
  baixo: 'Estoque baixo',
  'sem-estoque': 'Sem estoque',
} satisfies Record<StockFilter, string>;

export const SORT_COLUMNS = ['produto', 'preco', 'variantes', 'estoque', 'atualizado'] as const;
export type SortColumn = (typeof SORT_COLUMNS)[number];
export type SortDirection = 'asc' | 'desc';

export const PRODUCT_SORTS = SORT_COLUMNS.flatMap((column) => [`${column}-asc`, `${column}-desc`] as const);
export type ProductSort = (typeof PRODUCT_SORTS)[number];
export const DEFAULT_PRODUCT_SORT: ProductSort = 'atualizado-desc';

export type ProductListFilters = {
  busca: string;
  marca: readonly string[];
  categoria: readonly string[];
  status: StatusFilter;
  estoque: StockFilter;
};

export type FilterOption<Value extends string = string> = SelectOption & {
  value: Value;
  count: number;
};

export type ProductListFilterChanges = Partial<{
  marca: string[];
  categoria: string[];
  status: StatusFilter;
  estoque: StockFilter;
}>;

function labelOf(options: readonly SelectOption[], value: string): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function toProductListItem(
  product: ProductSummary,
  brands: readonly SelectOption[],
  categories: readonly SelectOption[],
): ProductListItem {
  const summary = summarizeVariants(product.variants);

  return {
    id: product.id,
    title: product.title,
    brandId: product.brandId,
    brand: labelOf(brands, product.brandId),
    categoryId: product.categoryId,
    category: labelOf(categories, product.categoryId),
    status: product.status,
    skus: product.variants.map(({ sku }) => sku),
    variantsCount: summary.count,
    totalStock: summary.totalStock,
    stockLevel: summary.stockLevel,
    minPriceInCents: summary.minPriceInCents,
    maxPriceInCents: summary.maxPriceInCents,
    coverUrl: product.coverUrl,
    updatedAt: product.updatedAt,
  };
}

export function filterProducts(items: readonly ProductListItem[], filters: ProductListFilters): readonly ProductListItem[] {
  return items.filter((item) =>
    matchesSearch(`${item.title} ${item.skus.join(' ')}`, filters.busca)
    && (filters.marca.length === 0 || filters.marca.includes(item.brandId))
    && (filters.categoria.length === 0 || filters.categoria.includes(item.categoryId))
    && (filters.status === 'todos' || item.status === STATUS_BY_FILTER[filters.status])
    && (filters.estoque === 'todos' || item.stockLevel === LEVEL_BY_FILTER[filters.estoque]));
}

const collator = new Intl.Collator('pt-BR', { sensitivity: 'base' });

function compareBy(column: SortColumn, a: ProductListItem, b: ProductListItem): number {
  switch (column) {
    case 'produto':
      return collator.compare(a.title, b.title);
    case 'preco':
      return (a.minPriceInCents ?? 0) - (b.minPriceInCents ?? 0);
    case 'variantes':
      return a.variantsCount - b.variantsCount;
    case 'estoque':
      return a.totalStock - b.totalStock;
    case 'atualizado':
      return Date.parse(a.updatedAt) - Date.parse(b.updatedAt);
  }
}

export function parseSort(sort: ProductSort): { column: SortColumn; direction: SortDirection } {
  const [column, direction] = sort.split('-') as [SortColumn, SortDirection];

  return { column, direction };
}

export function sortProducts(items: readonly ProductListItem[], sort: ProductSort): readonly ProductListItem[] {
  const { column, direction } = parseSort(sort);
  const sign = direction === 'asc' ? 1 : -1;

  return items.toSorted((a, b) => sign * compareBy(column, a, b));
}

// Primeiro clique: nome de A a Z, e números e datas do maior para o menor. Clicar de novo inverte.
export function nextSort(current: ProductSort, column: SortColumn): ProductSort {
  const { column: currentColumn, direction } = parseSort(current);

  if (currentColumn === column) {
    return direction === 'asc' ? `${column}-desc` : `${column}-asc`;
  }

  return column === 'produto' ? 'produto-asc' : `${column}-desc`;
}

function countBy(items: readonly ProductListItem[], key: (item: ProductListItem) => string): Map<string, number> {
  const counts = new Map<string, number>();

  for (const item of items) {
    counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
  }

  return counts;
}

export function brandOptions(items: readonly ProductListItem[]): FilterOption[] {
  const labels = new Map(items.map(({ brandId, brand }) => [brandId, brand]));

  return [...countBy(items, ({ brandId }) => brandId)]
    .map(([value, count]) => ({ value, label: labels.get(value) ?? value, count }))
    .sort((a, b) => b.count - a.count || collator.compare(a.label, b.label));
}

export function categoryOptions(categories: readonly SelectOption[], items: readonly ProductListItem[]): FilterOption[] {
  const counts = countBy(items, ({ categoryId }) => categoryId);

  return categories
    .map(({ value, label }) => ({ value, label, count: counts.get(value) ?? 0 }))
    .filter(({ count }) => count > 0);
}

export function statusOptions(items: readonly ProductListItem[]): FilterOption<StatusFilter>[] {
  return STATUS_FILTERS.map((value) => ({
    value,
    label: STATUS_FILTER_LABELS[value],
    count: value === 'todos' ? items.length : items.filter(({ status }) => status === STATUS_BY_FILTER[value]).length,
  }));
}

export function stockOptions(items: readonly ProductListItem[]): FilterOption<StockFilter>[] {
  return STOCK_FILTERS.map((value) => ({
    value,
    label: STOCK_FILTER_LABELS[value],
    count: value === 'todos' ? items.length : items.filter(({ stockLevel }) => stockLevel === LEVEL_BY_FILTER[value]).length,
  }));
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function formatCatalogSummary(items: readonly ProductListItem[]): string {
  const variants = items.reduce((sum, { variantsCount }) => sum + variantsCount, 0);
  const active = items.filter(({ status }) => status === 'active').length;

  return [plural(items.length, 'produto', 'produtos'), plural(variants, 'variante', 'variantes'), plural(active, 'ativo', 'ativos')]
    .join(' · ');
}
