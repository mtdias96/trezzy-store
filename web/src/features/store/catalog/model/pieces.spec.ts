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

  it('names every whole department, whose taxonomy name is not a piece', () => {
    expect(STORE_PIECES.filter((piece) => piece.category === undefined && piece.name === undefined)).toEqual([]);
  });
});

describe('toPieceShortcuts', () => {
  it('counts a whole department and links to it', () => {
    expect(toPieceShortcuts([department('sneakers', 4)])).toEqual([
      { name: 'Tênis', icon: 'sneaker', href: '/sneakers', productCount: 4 },
    ]);
  });

  it('counts a category and keeps its taxonomy name', () => {
    expect(toPieceShortcuts([department('streetwear', 9, { camisetas: 3 })])).toEqual([
      { name: 'Nome de camisetas', icon: 'shirt', href: '/streetwear/camisetas', productCount: 3 },
    ]);
  });

  it('prefers the name of the piece over the taxonomy name', () => {
    expect(toPieceShortcuts([department('streetwear', 1, { acessorios: 1 })])[0]?.name).toBe('Bonés e acessórios');
  });

  it('follows the order of the grid, not the order of the departments', () => {
    const shortcuts = toPieceShortcuts([department('eyewear', 4), department('streetwear', 1, { shorts: 1 }), department('sneakers', 4)]);

    expect(shortcuts.map(({ icon }) => icon)).toEqual(['sneaker', 'shorts', 'glasses']);
  });

  it('skips pieces without products or missing from the response', () => {
    const shortcuts = toPieceShortcuts([department('sneakers', 0), department('streetwear', 1, { moletons: 0, jaquetas: 1 })]);

    expect(shortcuts.map(({ icon }) => icon)).toEqual(['jacket']);
  });
});
