import type { Department, PieceIconName, PieceShortcut } from './types';

type PieceSeed = {
  icon: PieceIconName;
  department: string;
  category?: string;
  // Só quando o nome da peça difere do nome na taxonomia.
  name?: string;
};

// Na ordem da grade. Cada peça aponta para um departamento inteiro ou uma categoria da taxonomia.
export const STORE_PIECES: readonly PieceSeed[] = [
  { icon: 'sneaker', department: 'sneakers', name: 'Tênis' },
  { icon: 'shirt', department: 'streetwear', category: 'camisetas' },
  { icon: 'hoodie', department: 'streetwear', category: 'moletons' },
  { icon: 'jacket', department: 'streetwear', category: 'jaquetas' },
  { icon: 'pants', department: 'streetwear', category: 'calcas' },
  { icon: 'shorts', department: 'streetwear', category: 'shorts' },
  { icon: 'glasses', department: 'eyewear', name: 'Óculos' },
  { icon: 'cap', department: 'streetwear', category: 'acessorios', name: 'Bonés e acessórios' },
];

// Peça sem produto fica de fora: o atalho levaria a uma listagem vazia.
export function toPieceShortcuts(departments: readonly Department[]): PieceShortcut[] {
  return STORE_PIECES.flatMap(({ icon, department: departmentSlug, category: categorySlug, name }) => {
    const department = departments.find(({ slug }) => slug === departmentSlug);
    const target = categorySlug === undefined
      ? department
      : department?.categories.find(({ slug }) => slug === categorySlug);

    return target && target.productCount > 0
      ? [{ name: name ?? target.name, icon, href: target.href, productCount: target.productCount }]
      : [];
  });
}
