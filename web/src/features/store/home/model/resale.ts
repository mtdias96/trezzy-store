import type { ResalePanel } from './types';

export const RESALE_PANELS = 3;

// A sanfona é desenhada para três painéis: com menos, a seção some.
export function toResalePanels(panels: readonly ResalePanel[]): ResalePanel[] | null {
  return panels.length >= RESALE_PANELS ? panels.slice(0, RESALE_PANELS) : null;
}
