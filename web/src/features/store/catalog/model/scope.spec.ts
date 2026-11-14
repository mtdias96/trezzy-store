import { describe, expect, it } from 'vitest';

import type { CatalogFilters } from './listing';
import {
  allProductsScope,
  categoryScope,
  departmentFilterItems,
  departmentScope,
  isSharedQuery,
  pageLinks,
  toCatalogQuery,
} from './scope';

const noFilters: CatalogFilters = { tamanho: [], marca: [], preco: null, promocao: false, ordem: 'relevancia', pagina: 1 };

describe('departmentScope', () => {
  it('titles the page with the department and opens on "Tudo"', () => {
    const scope = departmentScope('roupas');

    expect(scope).toMatchObject({
      department: 'roupas',
      category: null,
      title: 'Roupas',
      trail: [{ name: 'Início', href: '/' }],
      href: '/roupas',
    });
    expect(scope?.tabs.filter(({ active }) => active)).toEqual([{ label: 'Tudo', href: '/roupas', active: true }]);
    expect(scope?.tabs.map(({ label }) => label)).toEqual(['Tudo', 'Camisetas', 'Moletons', 'Calças']);
  });

  it('describes the page with its categories', () => {
    expect(departmentScope('roupas')?.description).toBe('Roupas das marcas que fazem a rua: camisetas, moletons e calças.');
  });

  it('has no tabs and no category list for a department without subcategories', () => {
    const scope = departmentScope('tenis');

    expect(scope?.tabs).toEqual([]);
    expect(scope?.description).toBe('Tênis das marcas que fazem a rua.');
  });

  it('returns null for a slug outside the taxonomy', () => {
    expect(departmentScope('camisetas')).toBeNull();
  });
});

describe('categoryScope', () => {
  it('titles the page with the category, under the department in the trail', () => {
    const scope = categoryScope('roupas', 'camisetas');

    expect(scope).toMatchObject({
      department: 'roupas',
      category: 'camisetas',
      title: 'Camisetas',
      metaTitle: 'Camisetas · Roupas',
      trail: [{ name: 'Início', href: '/' }, { name: 'Roupas', href: '/roupas' }],
      href: '/roupas/camisetas',
    });
    expect(scope?.tabs.find(({ active }) => active)?.label).toBe('Camisetas');
  });

  it('returns null for a category of another department', () => {
    expect(categoryScope('roupas', 'bones')).toBeNull();
    expect(categoryScope('bones', 'roupas')).toBeNull();
  });
});

describe('allProductsScope', () => {
  it('lists the departments as tabs, with "Tudo" active', () => {
    const scope = allProductsScope();

    expect(scope).toMatchObject({ department: null, category: null, href: '/produtos' });
    expect(scope.tabs.map(({ label, active }) => [label, active])).toEqual([
      ['Tudo', true],
      ['Roupas', false],
      ['Tênis', false],
      ['Óculos', false],
      ['Acessórios', false],
    ]);
  });
});

describe('departmentFilterItems', () => {
  const scope = departmentScope('tenis');

  it('counts every department and their sum in "Todos", marking the current one', () => {
    const items = scope && departmentFilterItems(scope, [
      { slug: 'roupas', productCount: 8 },
      { slug: 'tenis', productCount: 4 },
    ]);

    expect(items).toEqual([
      { label: 'Todos', href: '/produtos', count: 12, active: false },
      { label: 'Roupas', href: '/roupas', count: 8, active: false },
      { label: 'Tênis', href: '/tenis', count: 4, active: true },
      { label: 'Óculos', href: '/oculos', count: 0, active: false },
      { label: 'Acessórios', href: '/acessorios', count: 0, active: false },
    ]);
  });

  it('keeps the links without numbers when the API is down', () => {
    const items = scope && departmentFilterItems(scope, []);

    expect(items?.map(({ count }) => count)).toEqual([null, null, null, null, null]);
  });
});

describe('toCatalogQuery', () => {
  it('sorts and dedupes the filters, so the same choice hits the same cache entry', () => {
    const scope = categoryScope('roupas', 'camisetas');
    const query = scope && toCatalogQuery(scope, {
      tamanho: ['M', 'G', 'M'],
      marca: ['patio-9', 'mormaco'],
      preco: null,
      promocao: false,
      ordem: 'menor-preco',
      pagina: 0,
    });

    expect(query).toEqual({
      department: 'roupas',
      category: 'camisetas',
      sizes: ['G', 'M'],
      brands: ['mormaco', 'patio-9'],
      priceAboveInCents: null,
      priceUpToInCents: null,
      onSale: false,
      sort: 'menor-preco',
      page: 1,
    });
  });

  it('turns the price range into limits in cents and keeps the sale switch', () => {
    const query = toCatalogQuery(allProductsScope(), { ...noFilters, preco: '300-700', promocao: true });

    expect(query).toMatchObject({ priceAboveInCents: 30000, priceUpToInCents: 70000, onSale: true });
  });
});

describe('isSharedQuery', () => {
  const scope = allProductsScope();

  it('shares the page as the links open it, in any order, page or sale switch', () => {
    expect(isSharedQuery(toCatalogQuery(scope, { ...noFilters, ordem: 'novidades', pagina: 3, promocao: true }))).toBe(true);
  });

  it('does not share a size, brand or price choice', () => {
    expect(isSharedQuery(toCatalogQuery(scope, { ...noFilters, tamanho: ['M'] }))).toBe(false);
    expect(isSharedQuery(toCatalogQuery(scope, { ...noFilters, marca: ['kairo'] }))).toBe(false);
    expect(isSharedQuery(toCatalogQuery(scope, { ...noFilters, preco: 'ate-300' }))).toBe(false);
  });
});

describe('pageLinks', () => {
  const scope = allProductsScope();

  it('has no links when everything fits in one page', () => {
    expect(pageLinks(scope, noFilters, 24)).toEqual({ page: 1, pageCount: 1, previous: null, next: null });
  });

  it('keeps the filters in the links and drops the page from the first one', () => {
    const links = pageLinks(scope, { ...noFilters, marca: ['kairo'], pagina: 2 }, 60);

    expect(links).toEqual({
      page: 2,
      pageCount: 3,
      previous: '/produtos?marca=kairo',
      next: '/produtos?marca=kairo&pagina=3',
    });
  });

  it('clamps a page past the end to the last one', () => {
    expect(pageLinks(scope, { ...noFilters, pagina: 9 }, 30)).toMatchObject({ page: 2, next: null });
  });
});
