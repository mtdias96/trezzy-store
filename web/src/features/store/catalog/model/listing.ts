import { formatWholeAmount } from '@/lib/money';

import type { SizeFacet } from './types';

// Textos fixos da listagem e da trilha, num lugar só: trocar aqui troca em todas as páginas do catálogo.
export const CATALOG_LABELS = {
  home: 'Início',
  allProducts: 'Todos os produtos',
  allDepartments: 'Todos',
  allCategories: 'Tudo',
  departments: 'Categoria',
  sizes: 'Tamanho',
  brands: 'Marca',
  price: 'Preço',
  onSale: 'Só promoções',
  // Atalho do menu para as promoções de um departamento.
  outlet: 'Outlet',
  clear: 'Limpar',
  sort: 'Ordenar',
  filters: 'Filtrar',
} as const;

// Valores em pt-BR porque vão para a URL (?ordem=menor-preco). A API recebe os dela, mapeados no data/queries.ts.
export const CATALOG_SORTS = ['relevancia', 'novidades', 'mais-vendidos', 'menor-preco', 'maior-preco'] as const;

export type CatalogSort = (typeof CATALOG_SORTS)[number];

export const DEFAULT_CATALOG_SORT: CatalogSort = 'relevancia';

export const SORT_LABELS = {
  relevancia: 'Relevância',
  novidades: 'Novidades',
  'mais-vendidos': 'Mais vendidos',
  'menor-preco': 'Menor preço',
  'maior-preco': 'Maior preço',
} satisfies Record<CatalogSort, string>;

// Limites das faixas do filtro de preço, em reais inteiros: [300, 700, 1200] vira "Até R$ 300", "R$ 300 – 700",
// "R$ 700 – 1.200" e "Acima de R$ 1.200". Rótulo e valor da URL saem daqui: mudar uma faixa é mudar o número.
const PRICE_STEPS = [300, 700, 1200];

// Em centavos, como a API. Acima de `above` (exclusivo) e até `upTo` (inclusivo), como diz o rótulo: os R$ 300,00
// entram em "Até R$ 300", e não em "R$ 300 – 700".
export type PriceRange = {
  value: string;
  label: string;
  aboveInCents: number | null;
  upToInCents: number | null;
};

const money = (reais: number) => `R$\u00A0${formatWholeAmount(reais * 100)}`;

export function priceRanges(steps: readonly number[] = PRICE_STEPS): PriceRange[] {
  return [null, ...steps].map((above, index) => {
    const upTo = steps[index] ?? null;
    const range = { aboveInCents: above === null ? null : above * 100, upToInCents: upTo === null ? null : upTo * 100 };

    if (above === null) {
      return { value: `ate-${upTo}`, label: `Até ${money(upTo ?? 0)}`, ...range };
    }

    if (upTo === null) {
      return { value: `acima-${above}`, label: `Acima de ${money(above)}`, ...range };
    }

    return { value: `${above}-${upTo}`, label: `${money(above)} – ${formatWholeAmount(upTo * 100)}`, ...range };
  });
}

export const PRICE_RANGES = priceRanges();

export function findPriceRange(value: string | null): PriceRange | undefined {
  return PRICE_RANGES.find((range) => range.value === value);
}

// Divisível por 2 e por 3: as linhas da grade fecham no celular e no desktop.
export const CATALOG_PAGE_SIZE = 24;

export type CatalogFilters = {
  tamanho: string[];
  marca: string[];
  preco: string | null;
  promocao: boolean;
  ordem: CatalogSort;
  pagina: number;
};

export function activeFilterCount({ tamanho, marca, preco, promocao }: Omit<CatalogFilters, 'ordem' | 'pagina'>): number {
  return tamanho.length + marca.length + (preco === null ? 0 : 1) + (promocao ? 1 : 0);
}

export function toggleValue(values: readonly string[], value: string): string[] {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function pageCount(total: number): number {
  return Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
}

// Página fora do intervalo (?pagina=0, ?pagina=-3) vira a primeira; acima do total, a API responde vazio.
export function currentPage(page: number): number {
  return Number.isInteger(page) && page > 1 ? page : 1;
}

// Tamanho marcado que saiu do recorte (outro filtro o zerou) continua na lista, para dar para desmarcar.
export function sizeFilterOptions(facets: readonly SizeFacet[], selected: readonly string[]): string[] {
  const values = facets.map(({ value }) => value);

  return [...values, ...selected.filter((value) => !values.includes(value))];
}
