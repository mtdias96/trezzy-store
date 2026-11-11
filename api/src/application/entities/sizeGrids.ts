export type SizeGrid = 'num' | 'apparel' | 'one';

// Ids da coluna `categories.grid`.
export const SIZES_BY_GRID: Record<SizeGrid, readonly string[]> = {
  num: Array.from({ length: 13 }, (_, index) => String(34 + index)),
  apparel: ['PP', 'P', 'M', 'G', 'GG', 'XGG'],
  one: ['U'],
};
