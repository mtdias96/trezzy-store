import { describe, expect, it } from 'vitest';

import { loadCatalogFilters, serializeCatalogFilters } from './search-params';

describe('loadCatalogFilters', () => {
  it('reads the lists and falls back to the defaults, ignoring the old sale switch', () => {
    expect(loadCatalogFilters({ tamanho: 'P,M', marca: 'kairo', preco: 'acima-1200', promocao: 'true' })).toEqual({
      tamanho: ['P', 'M'],
      marca: ['kairo'],
      preco: 'acima-1200',
      ordem: 'relevancia',
      pagina: 1,
    });
  });

  it('ignores an unknown sort or price range instead of failing', () => {
    expect(loadCatalogFilters({ ordem: 'mais-barato', preco: '0-50', pagina: 'dois' })).toMatchObject({
      ordem: 'relevancia',
      preco: null,
      pagina: 1,
    });
  });
});

describe('serializeCatalogFilters', () => {
  it('leaves the defaults out of the URL', () => {
    expect(serializeCatalogFilters('/roupas', { tamanho: [], ordem: 'relevancia', pagina: 1 })).toBe('/roupas');
    expect(serializeCatalogFilters('/roupas', { ordem: 'menor-preco' })).toBe('/roupas?ordem=menor-preco');
  });
});
