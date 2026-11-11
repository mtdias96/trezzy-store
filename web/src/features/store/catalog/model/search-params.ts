import {
  createLoader,
  createSerializer,
  parseAsArrayOf,
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
} from 'nuqs/server';

import { CATALOG_SORTS, DEFAULT_CATALOG_SORT, PRICE_RANGES } from './listing';

export const catalogParsers = {
  tamanho: parseAsArrayOf(parseAsString).withDefault([]),
  marca: parseAsArrayOf(parseAsString).withDefault([]),
  preco: parseAsStringLiteral(PRICE_RANGES.map(({ value }) => value)),
  promocao: parseAsBoolean.withDefault(false),
  ordem: parseAsStringLiteral(CATALOG_SORTS).withDefault(DEFAULT_CATALOG_SORT),
  pagina: parseAsInteger.withDefault(1),
};

export const loadCatalogFilters = createLoader(catalogParsers);

export const serializeCatalogFilters = createSerializer(catalogParsers);
