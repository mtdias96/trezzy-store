import type { Route } from 'next';
import { describe, expect, it } from 'vitest';

import { STORE_PIECES, toPieceShortcuts } from './pieces';
import { findCategory, findDepartment } from './taxonomy';
import type { Department } from './types';

function department(slug: string, productCount: number, categoryCounts: Record<string, number> = {}): Department {
  return {
    slug,
    name: `Nome de ${slug}`,
    productCount,
    imageUrl: null,
    href: `/${slug}` as Route,
    categories: Object.entries(categoryCounts).map(([category, count]) => ({
      slug: category,
      name: `Nome de ${category}`,
      href: `/${slug}/${category}` as Route,
      productCount: count,
    })),
  };
}

describe('STORE_PIECES', () => {
  it.each(STORE_PIECES.map((piece) => [piece.department, piece.category ?? '(departamento)', piece] as const))(
    'points %s / %s at the taxonomy',
    (_department, _category, piece) => {
      const known = findDepartment(piece.department);

      expect(known).toBeDefined();

      if (known && piece.category) {
        expect(findCategory(known, piece.category)).toBeDefined();
      }
    },
  );
});

describe('toPieceShortcuts', () => {
  it('counts a whole department, with its taxonomy name, and links to it', () => {
    expect(toPieceShortcuts([department('tenis', 4)])).toEqual([
      { name: 'Nome de tenis', icon: 'sneaker', href: '/tenis', productCount: 4 },
    ]);
  });

  it('counts a category and keeps its taxonomy name', () => {
    expect(toPieceShortcuts([department('roupas', 9, { camisetas: 3 })])).toEqual([
      { name: 'Nome de camisetas', icon: 'shirt', href: '/roupas/camisetas', productCount: 3 },
    ]);
  });

  it('follows the order of the grid, not the order of the departments', () => {
    const shortcuts = toPieceShortcuts([department('oculos', 4), department('roupas', 1, { calcas: 1 }), department('tenis', 4)]);

    expect(shortcuts.map(({ icon }) => icon)).toEqual(['sneaker', 'pants', 'glasses']);
  });

  it('skips pieces without products or missing from the response', () => {
    const shortcuts = toPieceShortcuts([department('tenis', 0), department('acessorios', 1, { bones: 1 }), department('roupas', 1, { moletons: 0 })]);

    expect(shortcuts.map(({ icon }) => icon)).toEqual(['cap']);
  });
});
