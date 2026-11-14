import type { ValidationError } from '@application/errors/ValidationError';

// Regras para ligar as cores de um mesmo modelo numa família (ADR-018).

export type ColorwayProduct = {
  id: string;
  brandId: string;
  categoryId: string;
  familyId: string | null;
  colorName: string | null;
};

export type ColorwaySibling = {
  id: string;
  colorName: string | null;
};

// O produto de "mesmo modelo de". A marca e a categoria iguais mantêm a grade: o tamanho escolhido segue na troca.
export function familyLinkIssues(
  product: Pick<ColorwayProduct, 'brandId' | 'categoryId'> & { id: string | null },
  target: ColorwayProduct | null,
): ValidationError.Issue[] {
  if (!target) {
    return [{ field: 'familyOf', error: 'Product not found.' }];
  }

  if (target.id === product.id) {
    return [{ field: 'familyOf', error: 'A product cannot be linked to itself.' }];
  }

  if (target.brandId !== product.brandId || target.categoryId !== product.categoryId) {
    return [{ field: 'familyOf', error: 'Must be a product of the same brand and category.' }];
  }

  return target.colorName === null ? [{ field: 'familyOf', error: 'The linked product has no color name yet.' }] : [];
}

// siblings: as outras cores da família, sem o próprio produto.
export function colorNameIssues(colorName: string | null, siblings: readonly ColorwaySibling[] | null): ValidationError.Issue[] {
  if (siblings === null) {
    return [];
  }

  if (colorName === null) {
    return [{ field: 'colorName', error: 'Required for a product linked to other colors.' }];
  }

  const taken = siblings.some((sibling) => sibling.colorName?.toLocaleLowerCase('pt-BR') === colorName.toLocaleLowerCase('pt-BR'));

  return taken ? [{ field: 'colorName', error: 'Another color of this model already has this name.' }] : [];
}
