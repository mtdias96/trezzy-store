const rating = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function formatRating(value: number): string {
  return rating.format(value);
}
