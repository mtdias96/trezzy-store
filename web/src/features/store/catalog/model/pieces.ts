import type { Department, PieceIconName, PieceShortcut } from './types';

type PieceSeed = {
  icon: PieceIconName;
  department: string;
  category?: string;
};

// Na ordem da grade. Cada peça aponta para um departamento inteiro ou uma categoria da taxonomia, e leva o nome dela.
export const STORE_PIECES: readonly PieceSeed[] = [
  { icon: 'sneaker', department: 'tenis' },
  { icon: 'shirt', department: 'roupas', category: 'camisetas' },
  { icon: 'hoodie', department: 'roupas', category: 'moletons' },
  { icon: 'pants', department: 'roupas', category: 'calcas' },
  { icon: 'glasses', department: 'oculos' },
  { icon: 'cap', department: 'acessorios', category: 'bones' },
];

// Peça sem produto fica de fora: o atalho levaria a uma listagem vazia.
export function toPieceShortcuts(departments: readonly Department[]): PieceShortcut[] {
  return STORE_PIECES.flatMap(({ icon, department: departmentSlug, category: categorySlug }) => {
    const department = departments.find(({ slug }) => slug === departmentSlug);
    const target = categorySlug === undefined
      ? department
      : department?.categories.find(({ slug }) => slug === categorySlug);

    return target && target.productCount > 0
      ? [{ name: target.name, icon, href: target.href, productCount: target.productCount }]
      : [];
  });
}
