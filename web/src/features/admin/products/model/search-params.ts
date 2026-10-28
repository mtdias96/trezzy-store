import {
  createSearchParamsCache,
  createSerializer,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

import { DEFAULT_PRODUCT_SORT, PRODUCT_SORTS, STATUS_FILTERS, STOCK_FILTERS } from './list';

export const productListParsers = {
  busca: parseAsString.withDefault(''),
  marca: parseAsArrayOf(parseAsString).withDefault([]),
  categoria: parseAsArrayOf(parseAsString).withDefault([]),
  status: parseAsStringLiteral(STATUS_FILTERS).withDefault('todos'),
  estoque: parseAsStringLiteral(STOCK_FILTERS).withDefault('todos'),
  ordem: parseAsStringLiteral(PRODUCT_SORTS).withDefault(DEFAULT_PRODUCT_SORT),
};

export const productListParamsCache = createSearchParamsCache(productListParsers);

export const serializeProductListParams = createSerializer(productListParsers);
