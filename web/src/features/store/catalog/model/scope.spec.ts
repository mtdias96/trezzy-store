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
    const scope = departmentScope('streetwear');

    expect(scope).toMatchObject({
      department: 'streetwear',
      category: null,
      title: 'Streetwear',
      trail: [{ name: 'Início', href: '/' }],
      href: '/streetwear',
    });
    expect(scope?.tabs.filter(({ active }) => active)).toEqual([{ label: 'Tudo', href: '/streetwear', active: true }]);
    expect(scope?.tabs.map(({ label }) => label)).toEqual(['Tudo', 'Camisetas', 'Moletons', 'Jaquetas', 'Calças', 'Shorts', 'Acessórios']);
  });

  it('describes the page with its categories', () => {
    expect(departmentScope('sneakers')?.description).toBe('Sneakers das marcas que fazem a rua: casual, corrida, skate e trail.');
  });

  it('returns null for a slug outside the taxonomy', () => {
    expect(departmentScope('camisetas')).toBeNull();
  });
});

describe('categoryScope', () => {
  it('titles the page with the category, under the department in the trail', () => {
    const scope = categoryScope('streetwear', 'camisetas');

    expect(scope).toMatchObject({
      department: 'streetwear',
      category: 'camisetas',
      title: 'Camisetas',
      metaTitle: 'Camisetas · Streetwear',
      trail: [{ name: 'Início', href: '/' }, { name: 'Streetwear', href: '/streetwear' }],
      href: '/streetwear/camisetas',
    });
    expect(scope?.tabs.find(({ active }) => active)?.label).toBe('Camisetas');
  });

  it('returns null for a category of another department', () => {
    expect(categoryScope('streetwear', 'skate')).toBeNull();
    expect(categoryScope('skate', 'streetwear')).toBeNull();
  });
});

describe('allProductsScope', () => {
  it('lists the departments as tabs, with "Tudo" active', () => {
    const scope = allProductsScope();

    expect(scope).toMatchObject({ department: null, category: null, href: '/produtos' });
    expect(scope.tabs.map(({ label, active }) => [label, active])).toEqual([
      ['Tudo', true],
      ['Streetwear', false],
      ['Sneakers', false],
      ['Eyewear', false],
    ]);
  });
});

describe('departmentFilterItems', () => {
  const scope = departmentScope('sneakers');

  it('counts every department and their sum in "Todos", marking the current one', () => {
    const items = scope && departmentFilterItems(scope, [
      { slug: 'streetwear', productCount: 8 },
      { slug: 'sneakers', productCount: 4 },
    ]);

    expect(items).toEqual([
      { label: 'Todos', href: '/produtos', count: 12, active: false },
      { label: 'Streetwear', href: '/streetwear', count: 8, active: false },
      { label: 'Sneakers', href: '/sneakers', count: 4, active: true },
      { label: 'Eyewear', href: '/eyewear', count: 0, active: false },
    ]);
  });

  it('keeps the links without numbers when the API is down', () => {
    const items = scope && departmentFilterItems(scope, []);

    expect(items?.map(({ count }) => count)).toEqual([null, null, null, null]);
  });
});

describe('toCatalogQuery', () => {
  it('sorts and dedupes the filters, so the same choice hits the same cache entry', () => {
    const scope = categoryScope('streetwear', 'camisetas');
    const query = scope && toCatalogQuery(scope, {
      tamanho: ['M', 'G', 'M'],
      marca: ['patio-9', 'mormaco'],
      preco: null,
      promocao: false,
      ordem: 'menor-preco',
      pagina: 0,
    });

    expect(query).toEqual({
      department: 'streetwear',
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
