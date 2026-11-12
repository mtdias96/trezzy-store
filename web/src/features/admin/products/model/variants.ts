import type { ProductVariant, StockLevel } from './types';

// Os ids são os da coluna `categories.grid` da API: a grade vem da categoria, e o produto a herda.
export type SizeGridId = 'num' | 'apparel' | 'one';

export type SizeGrid = {
  id: SizeGridId;
  label: string;
  examples: string;
  range: string;
};

export const SIZE_GRIDS: readonly SizeGrid[] = [
  { id: 'num', label: 'Numérica', examples: 'Calçados e calças', range: '34 – 46' },
  { id: 'apparel', label: 'Vestuário', examples: 'Camisetas e moletons', range: 'PP – XGG' },
  { id: 'one', label: 'Tamanho único', examples: 'Óculos e acessórios', range: 'U' },
];

// Os mesmos tamanhos da API (sizeGrids.ts): ela recusa tamanho fora da grade da categoria.
export const SIZES_BY_GRID: Record<SizeGridId, readonly string[]> = {
  num: Array.from({ length: 13 }, (_, index) => String(34 + index)),
  apparel: ['PP', 'P', 'M', 'G', 'GG', 'XGG'],
  one: ['U'],
};

export type VariantDraft = {
  size: string;
  color: string;
  sku: string;
  priceInCents: number;
  stock: number;
  active: boolean;
};

// Tamanhos × cores, sem repetir a combinação que a lista já tem. Sem cor, a variante leva cor vazia.
export function generateVariants(
  sizes: readonly string[],
  colors: readonly string[],
  priceInCents: number,
  existing: readonly Pick<VariantDraft, 'size' | 'color'>[],
): VariantDraft[] {
  const taken = new Set(existing.map(({ size, color }) => `${size}|${color}`));

  return (colors.length > 0 ? colors : ['']).flatMap((color) =>
    sizes
      .filter((size) => !taken.has(`${size}|${color}`))
      .map((size) => ({ size, color, sku: '', priceInCents, stock: 0, active: true })),
  );
}

// Índices das variantes cujo tamanho não está na grade: a grade trocada depois de gerar deixa linhas que a API recusa.
export function variantsOutsideGrid(variants: readonly Pick<VariantDraft, 'size'>[], grid: SizeGridId): number[] {
  return variants.flatMap(({ size }, index) => (SIZES_BY_GRID[grid].includes(size) ? [] : [index]));
}

// A API guarda a cor em minúsculas e sem espaços nas pontas.
export function normalizeColor(color: string): string {
  return color.trim().toLowerCase();
}

export type ColorSwatch = 'black' | 'white' | 'off-white' | 'heather-gray' | 'green';

export type ColorSuggestion = {
  label: string;
  swatch: ColorSwatch;
};

export const COLOR_SUGGESTIONS: readonly ColorSuggestion[] = [
  { label: 'Preto', swatch: 'black' },
  { label: 'Branco', swatch: 'white' },
  { label: 'Off-white', swatch: 'off-white' },
  { label: 'Cinza mescla', swatch: 'heather-gray' },
  { label: 'Verde', swatch: 'green' },
];

// Variante ativa com até 3 unidades acende o "Baixo" do produto, mesmo com o total alto.
export const LOW_STOCK_UNITS = 3;

export type VariantSummary = {
  count: number;
  activeCount: number;
  totalStock: number;
  outOfStockCount: number;
  stockLevel: StockLevel;
  minPriceInCents: number | null;
  maxPriceInCents: number | null;
};

// Campo de estoque apagado vira NaN no formulário: o resumo conta zero até o admin digitar.
function stockOf(stock: number): number {
  return Number.isFinite(stock) ? stock : 0;
}

// Preço e nível de estoque olham só as variantes ativas: as inativas não estão à venda.
export function summarizeVariants(variants: readonly Pick<ProductVariant, 'active' | 'stock' | 'priceInCents'>[]): VariantSummary {
  const active = variants.filter((variant) => variant.active);
  const prices = active.map(({ priceInCents }) => priceInCents);
  const activeStock = active.reduce((sum, { stock }) => sum + stockOf(stock), 0);

  let stockLevel: StockLevel = 'in-stock';

  if (activeStock === 0) {
    stockLevel = 'out';
  } else if (active.some(({ stock }) => stockOf(stock) <= LOW_STOCK_UNITS)) {
    stockLevel = 'low';
  }

  return {
    count: variants.length,
    activeCount: active.length,
    totalStock: variants.reduce((sum, { stock }) => sum + stockOf(stock), 0),
    outOfStockCount: active.filter(({ stock }) => stockOf(stock) === 0).length,
    stockLevel,
    minPriceInCents: prices.length > 0 ? Math.min(...prices) : null,
    maxPriceInCents: prices.length > 0 ? Math.max(...prices) : null,
  };
}

// A API guarda a cor em minúsculas ("cinza mescla"): a amostra vem da sugestão de mesmo nome.
export function colorSuggestionOf(color: string): ColorSuggestion | undefined {
  return COLOR_SUGGESTIONS.find(({ label }) => label.toLowerCase() === color);
}
