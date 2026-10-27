import { createLoader } from 'nuqs/server';
import { describe, expect, it } from 'vitest';

import { productListParsers, serializeProductListParams } from './search-params';

const load = createLoader(productListParsers);

describe('product list search params', () => {
  it('falls back to the defaults for missing or unknown values', () => {
    expect(load('?status=xyz&ordem=qualquer')).toEqual({
      busca: '',
      marca: [],
      categoria: [],
      status: 'todos',
      estoque: 'todos',
      ordem: 'atualizado-desc',
    });
  });

  it('reads several brands from one comma-separated key', () => {
    expect(load('?marca=nike-sb,vans').marca).toEqual(['nike-sb', 'vans']);
  });

  it('leaves the defaults out of the URL', () => {
    expect(serializeProductListParams('/admin/produtos', { status: 'todos', ordem: 'preco-asc' })).toBe(
      '/admin/produtos?ordem=preco-asc',
    );
  });
});
