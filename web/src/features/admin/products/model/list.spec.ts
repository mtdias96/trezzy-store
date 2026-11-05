import { describe, expect, it } from 'vitest';

import {
  brandOptions,
  categoryOptions,
  filterProducts,
  formatCatalogSummary,
  nextSort,
  type ProductListFilters,
  sortProducts,
  statusOptions,
  stockOptions,
  toProductListItem,
} from './list';
import type { ProductListItem, ProductSummary } from './types';

function product(overrides: Partial<ProductListItem>): ProductListItem {
  return {
    id: 'p',
    title: 'Produto',
    brandId: 'nike-sb',
    brand: 'Nike SB',
    categoryId: 'tenis',
    category: 'Tênis',
    status: 'active',
    skus: [],
    variantsCount: 1,
    totalStock: 10,
    stockLevel: 'in-stock',
    minPriceInCents: 10000,
    maxPriceInCents: 10000,
    coverUrl: null,
    updatedAt: '2026-10-20T12:00:00Z',
    ...overrides,
  };
}

const dunk = product({ id: 'dunk', title: 'Dunk Low Pro', skus: ['NSB-DUNK-42'], variantsCount: 6, totalStock: 26, stockLevel: 'low', minPriceInCents: 89999, updatedAt: '2026-10-19T12:00:00Z' });
const gazelle = product({ id: 'gazelle', title: 'Gazelle Indoor', brandId: 'adidas', brand: 'adidas Originals', variantsCount: 6, totalStock: 47, minPriceInCents: 79999, updatedAt: '2026-10-24T12:00:00Z' });
const crew = product({ id: 'crew', title: 'Stock Logo Crew', brandId: 'stussy', brand: 'Stüssy', categoryId: 'moletons', category: 'Moletons', status: 'draft', variantsCount: 8, totalStock: 0, stockLevel: 'out', minPriceInCents: 68990, updatedAt: '2026-10-26T12:00:00Z' });
const items = [dunk, gazelle, crew];

const noFilters: ProductListFilters = { busca: '', marca: [], categoria: [], status: 'todos', estoque: 'todos' };
const ids = (list: readonly ProductListItem[]) => list.map(({ id }) => id);

describe('filterProducts', () => {
  it('keeps everything without filters', () => {
    expect(ids(filterProducts(items, noFilters))).toEqual(['dunk', 'gazelle', 'crew']);
  });

  it('searches the title and the SKUs, ignoring accents and case', () => {
    expect(ids(filterProducts(items, { ...noFilters, busca: 'GAZELLE' }))).toEqual(['gazelle']);
    expect(ids(filterProducts(items, { ...noFilters, busca: 'nsb-dunk' }))).toEqual(['dunk']);
  });

  it('keeps any of the chosen brands and categories', () => {
    expect(ids(filterProducts(items, { ...noFilters, marca: ['nike-sb', 'stussy'] }))).toEqual(['dunk', 'crew']);
    expect(ids(filterProducts(items, { ...noFilters, categoria: ['moletons'] }))).toEqual(['crew']);
  });

  it('filters by status and stock level', () => {
    expect(ids(filterProducts(items, { ...noFilters, status: 'rascunhos' }))).toEqual(['crew']);
    expect(ids(filterProducts(items, { ...noFilters, estoque: 'baixo' }))).toEqual(['dunk']);
  });

  it('combines the filters', () => {
    expect(filterProducts(items, { ...noFilters, marca: ['adidas'], estoque: 'sem-estoque' })).toEqual([]);
  });
});

describe('sortProducts', () => {
  it.each([
    ['atualizado-desc', ['crew', 'gazelle', 'dunk']],
    ['produto-asc', ['dunk', 'gazelle', 'crew']],
    ['preco-desc', ['dunk', 'gazelle', 'crew']],
    ['estoque-asc', ['crew', 'dunk', 'gazelle']],
  ] as const)('sorts by %s', (sort, expected) => {
    expect(ids(sortProducts(items, sort))).toEqual(expected);
  });
});

describe('nextSort', () => {
  it('starts names from A to Z and numbers from the largest', () => {
    expect(nextSort('atualizado-desc', 'produto')).toBe('produto-asc');
    expect(nextSort('atualizado-desc', 'preco')).toBe('preco-desc');
  });

  it('flips the direction of the current column', () => {
    expect(nextSort('preco-desc', 'preco')).toBe('preco-asc');
    expect(nextSort('preco-asc', 'preco')).toBe('preco-desc');
  });
});

describe('filter options', () => {
  it('lists the brands by number of products, then by name', () => {
    const extra = product({ id: 'blazer' });

    expect(brandOptions([...items, extra])).toEqual([
      { value: 'nike-sb', label: 'Nike SB', count: 2 },
      { value: 'adidas', label: 'adidas Originals', count: 1 },
      { value: 'stussy', label: 'Stüssy', count: 1 },
    ]);
  });

  it('keeps the category order and drops the empty ones', () => {
    const categories = [
      { value: 'tenis', label: 'Tênis' },
      { value: 'bones', label: 'Bonés' },
      { value: 'moletons', label: 'Moletons' },
    ];

    expect(categoryOptions(categories, items)).toEqual([
      { value: 'tenis', label: 'Tênis', count: 2 },
      { value: 'moletons', label: 'Moletons', count: 1 },
    ]);
  });

  it('counts each status and stock level', () => {
    expect(statusOptions(items).map(({ value, count }) => [value, count])).toEqual([
      ['todos', 3],
      ['ativos', 2],
      ['inativos', 0],
      ['rascunhos', 1],
    ]);
    expect(stockOptions(items).map(({ value, count }) => [value, count])).toEqual([
      ['todos', 3],
      ['em-estoque', 1],
      ['baixo', 1],
      ['sem-estoque', 1],
    ]);
  });
});

describe('formatCatalogSummary', () => {
  it('sums products, variants and active products', () => {
    expect(formatCatalogSummary(items)).toBe('3 produtos · 20 variantes · 2 ativos');
  });

  it('uses the singular for one', () => {
    expect(formatCatalogSummary([product({})])).toBe('1 produto · 1 variante · 1 ativo');
  });
});

describe('toProductListItem', () => {
  const detail: ProductSummary = {
    id: 'chase',
    title: 'Hooded Chase Sweat',
    status: 'active',
    brandId: 'carhartt-wip',
    categoryId: 'moletons',
    coverUrl: 'https://cdn.trezzy.com/chase.webp',
    variants: [
      { id: 'v1', size: 'M', color: 'cinza mescla', sku: 'CWIP-CHASE-M', priceInCents: 74990, stock: 10, active: true },
      { id: 'v2', size: 'XGG', color: 'cinza mescla', sku: 'CWIP-CHASE-XGG', priceInCents: 78990, stock: 2, active: true },
    ],
    updatedAt: '2026-10-22T12:00:00Z',
  };

  it('names the brand and category and sums the variants', () => {
    expect(toProductListItem(detail, [{ value: 'carhartt-wip', label: 'Carhartt WIP' }], [{ value: 'moletons', label: 'Moletons' }]))
      .toEqual({
        id: 'chase',
        title: 'Hooded Chase Sweat',
        brandId: 'carhartt-wip',
        brand: 'Carhartt WIP',
        categoryId: 'moletons',
        category: 'Moletons',
        status: 'active',
        skus: ['CWIP-CHASE-M', 'CWIP-CHASE-XGG'],
        variantsCount: 2,
        totalStock: 12,
        stockLevel: 'low',
        minPriceInCents: 74990,
        maxPriceInCents: 78990,
        coverUrl: 'https://cdn.trezzy.com/chase.webp',
        updatedAt: '2026-10-22T12:00:00Z',
      });
  });

  it('falls back to the id for a brand or category outside the lists', () => {
    expect(toProductListItem(detail, [], [])).toMatchObject({ brand: 'carhartt-wip', category: 'moletons' });
  });
});
