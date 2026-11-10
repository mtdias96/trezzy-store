import { describe, expect, it } from 'vitest';

import { RESALE_PANELS, toResalePanels } from './resale';
import type { ResalePanel } from './types';

const panels = (count: number): ResalePanel[] => Array.from({ length: count }, (_, index) => ({
  id: `painel-${index}`,
  eyebrow: 'Etiqueta',
  title: 'Título',
  description: 'Texto',
  imageUrl: null,
  imageAlt: '',
}));

describe('toResalePanels', () => {
  it('keeps the first three panels, in the order received', () => {
    expect(toResalePanels(panels(5))?.map(({ id }) => id)).toEqual(['painel-0', 'painel-1', 'painel-2']);
  });

  it('hides the section with fewer than three panels', () => {
    expect(toResalePanels(panels(RESALE_PANELS - 1))).toBeNull();
  });
});
