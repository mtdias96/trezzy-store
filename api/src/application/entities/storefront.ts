import { type SizeGrid, SIZES_BY_GRID, sortVariants } from './sizeGrids';

// Condições da loja (as mesmas do selo "10x sem juros · 10% off no Pix" da vitrine).
const MAX_INSTALLMENTS = 10;
const PIX_DISCOUNT = 0.1;

export function storePricing(priceInCents: number): Storefront.Pricing {
  return {
    installments: { count: MAX_INSTALLMENTS, valueInCents: Math.ceil(priceInCents / MAX_INSTALLMENTS) },
    pixPriceInCents: Math.round(priceInCents * (1 - PIX_DISCOUNT)),
  };
}

type StockVariant = { id: string; size: string; color: string; stock: number; active: boolean };

// A cor que a página do produto abre selecionada: a primeira em ordem alfabética com estoque, ou a primeira se tudo
// esgotou. O card mostra os tamanhos dela, e a barra de tamanhos põe essa variante na sacola.
export function defaultColor(grid: SizeGrid, variants: readonly StockVariant[]): string | null {
  const sorted = sortVariants(grid, variants.filter(({ active }) => active));

  return (sorted.find(({ stock }) => stock > 0) ?? sorted[0])?.color ?? null;
}

export function sizeOptions(grid: SizeGrid, variants: readonly StockVariant[]): Storefront.SizeOption[] {
  const color = defaultColor(grid, variants);

  return sortVariants(grid, variants)
    .filter((variant) => variant.active && variant.color === color)
    .map(({ id, size, stock }) => ({ size, variantId: stock > 0 ? id : null }));
}

// Na listagem os produtos misturam grades: a ordem segue a numérica, depois vestuário e tamanho único.
const SIZE_RANK = new Map([...SIZES_BY_GRID.num, ...SIZES_BY_GRID.apparel, ...SIZES_BY_GRID.one].map((size, index) => [size, index]));

export function compareSizes(a: string, b: string): number {
  return (SIZE_RANK.get(a) ?? Number.MAX_SAFE_INTEGER) - (SIZE_RANK.get(b) ?? Number.MAX_SAFE_INTEGER) || a.localeCompare(b);
}

export namespace Storefront {
  export type Pricing = {
    installments: { count: number; valueInCents: number };
    pixPriceInCents: number;
  };

  // variantId null: esgotado nessa cor.
  export type SizeOption = { size: string; variantId: string | null };
}
