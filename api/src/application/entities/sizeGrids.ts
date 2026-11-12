export type SizeGrid = 'num' | 'apparel' | 'one';

// Ids da coluna `categories.grid`.
export const SIZES_BY_GRID: Record<SizeGrid, readonly string[]> = {
  num: Array.from({ length: 13 }, (_, index) => String(34 + index)),
  apparel: ['PP', 'P', 'M', 'G', 'GG', 'XGG'],
  one: ['U'],
};

// Cor e, dentro da cor, a ordem da grade (34 antes de 35, PP antes de P). Tamanho fora da grade vai para o fim.
export function sortVariants<T extends { size: string; color: string }>(grid: SizeGrid, variants: readonly T[]): T[] {
  const rank = (size: string) => {
    const index = SIZES_BY_GRID[grid].indexOf(size);

    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };

  return [...variants].sort((a, b) => a.color.localeCompare(b.color, 'pt-BR') || rank(a.size) - rank(b.size));
}
