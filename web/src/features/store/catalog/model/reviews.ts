import type { FitResult, ReviewSummary } from './types';

export type RatingShare = {
  stars: number;
  percent: number;
};

export function ratingShares({ distribution }: ReviewSummary): RatingShare[] {
  const total = distribution.reduce((sum, count) => sum + count, 0);

  return distribution.map((count, index) => ({
    stars: 5 - index,
    percent: total === 0 ? 0 : Math.round((count / total) * 100),
  }));
}

export const FIT_OPTIONS = [
  { value: 'small', label: 'Pequeno' },
  { value: 'true-to-size', label: 'Normal' },
  { value: 'large', label: 'Grande' },
] as const satisfies readonly { value: FitResult; label: string }[];

export function fitLabel(fit: FitResult): string {
  return FIT_OPTIONS.find(({ value }) => value === fit)?.label ?? '';
}
