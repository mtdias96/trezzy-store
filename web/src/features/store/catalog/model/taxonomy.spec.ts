import { describe, expect, it } from 'vitest';

import { departmentLinks, findCategory, findDepartment, STORE_DEPARTMENTS } from './taxonomy';

// Páginas fixas da loja na raiz: um departamento com um desses slugs ficaria escondido atrás delas.
const STORE_PAGES = ['produtos', 'novidades', 'marcas', 'drops', 'outlet', 'busca', 'sacola', 'conta', 'admin'];

describe('STORE_DEPARTMENTS', () => {
  const slugs = STORE_DEPARTMENTS.flatMap(({ slug, categories }) => [slug, ...categories.map((category) => category.slug)]);

  it('uses URL-safe slugs (lowercase, digits and hyphens), as the API does', () => {
    expect(slugs.filter((slug) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug))).toEqual([]);
  });

  it('has unique department slugs, none hidden behind a store page', () => {
    const departments = STORE_DEPARTMENTS.map(({ slug }) => slug);

    expect(new Set(departments).size).toBe(departments.length);
    expect(departments.filter((slug) => STORE_PAGES.includes(slug))).toEqual([]);
  });

  it('has unique category slugs within each department', () => {
    const duplicated = STORE_DEPARTMENTS.filter(({ categories }) => new Set(categories.map(({ slug }) => slug)).size !== categories.length);

    expect(duplicated).toEqual([]);
  });

  it('has a name for every department and category', () => {
    const names = STORE_DEPARTMENTS.flatMap(({ name, categories }) => [name, ...categories.map((category) => category.name)]);

    expect(names.filter((name) => name.trim() === '')).toEqual([]);
  });
});

describe('findDepartment and findCategory', () => {
  it('find by slug, and only inside the department', () => {
    const streetwear = findDepartment('streetwear');

    expect(streetwear?.name).toBe('Streetwear');
    expect(streetwear && findCategory(streetwear, 'camisetas')?.name).toBe('Camisetas');
    expect(streetwear && findCategory(streetwear, 'skate')).toBeUndefined();
    expect(findDepartment('camisetas')).toBeUndefined();
  });
});

describe('departmentLinks', () => {
  const tree = [{ slug: 'eyewear', name: 'Óculos', categories: [{ slug: 'solar', name: 'Sol' }] }];

  it('feeds the menu with the taxonomy names, so a rename reaches the header', () => {
    expect(departmentLinks(tree)).toEqual([
      {
        id: 'eyewear',
        label: 'Óculos',
        href: '/eyewear',
        categories: [{ label: 'Sol', href: '/eyewear/solar' }],
        shortcuts: [
          { label: 'Novidades', href: '/eyewear?ordem=novidades' },
          { label: 'Mais vendidos', href: '/eyewear?ordem=mais-vendidos' },
          { label: 'Outlet', href: '/eyewear?promocao=true' },
        ],
      },
    ]);
  });
});
