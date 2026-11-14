import type { Route } from 'next';
import { describe, expect, it } from 'vitest';

import { storeNav, toStoreMenu } from './nav';
import type { FeaturedProduct, MenuDepartment } from './types';

// O Route sem genérico só aceita rota estática: a dinâmica (/[department]) passa como literal só no <Link>.
const route = (path: string) => path as Route;

const product: FeaturedProduct = {
  id: 'camiseta-galeria',
  name: 'Camiseta Pesada "Galeria"',
  brand: 'Pátio 9',
  priceInCents: 27990,
  href: '/',
  imageUrl: null,
};

const departments: MenuDepartment[] = [
  {
    id: 'roupas',
    label: 'Roupas',
    href: route('/roupas'),
    categories: [{ label: 'Camisetas', href: route('/roupas/camisetas') }],
    categorySlugs: ['camisetas'],
    shortcuts: [
      { label: 'Novidades', href: route('/roupas?ordem=novidades') },
      { label: 'Mais vendidos', href: route('/roupas?ordem=mais-vendidos') },
    ],
  },
  {
    id: 'acessorios',
    label: 'Acessórios',
    href: route('/acessorios'),
    categories: [{ label: 'Bonés', href: route('/acessorios/bones') }],
    categorySlugs: ['bones'],
    shortcuts: [],
  },
];

describe('storeNav', () => {
  it('places the catalog departments between Novidades and Marcas, in the order received', () => {
    expect(storeNav(departments).map(({ label }) => label)).toEqual([
      'Novidades',
      'Roupas',
      'Acessórios',
      'Marcas',
      'Drops',
      'Outlet',
    ]);
  });

  it('builds each panel from the catalog links, with the department name in "see all"', () => {
    const clothing = storeNav(departments).find((entry) => entry.kind === 'department' && entry.id === 'roupas');

    expect(clothing).toMatchObject({
      allLabel: 'Ver tudo em Roupas',
      sections: [
        { title: 'Categorias', links: [{ label: 'Camisetas', href: route('/roupas/camisetas') }] },
        { title: 'Destaques', links: [{ label: 'Novidades' }, { label: 'Mais vendidos', href: '/roupas?ordem=mais-vendidos' }] },
      ],
    });
  });

  it('drops an empty section, as a department without subcategories has no "Categorias"', () => {
    const shoes: MenuDepartment = { id: 'tenis', label: 'Tênis', href: route('/tenis'), categories: [], categorySlugs: ['tenis'], shortcuts: [] };
    const [, entry] = storeNav([shoes]);

    expect(entry).toMatchObject({ id: 'tenis', sections: [] });
  });

  it('has unique hrefs, so no two links in the menu point to the same page', () => {
    const hrefs = storeNav(departments).flatMap((entry) =>
      entry.kind === 'link'
        ? [entry.href]
        : [entry.href, ...entry.sections.flatMap(({ links }) => links.map(({ href }) => href))],
    );

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});

describe('toStoreMenu', () => {
  it('attaches the featured products to their department', () => {
    const menu = toStoreMenu(storeNav(departments), { roupas: [product] });
    const clothing = menu.entries.find((entry) => entry.kind === 'department' && entry.id === 'roupas');

    expect(clothing).toMatchObject({ featured: [product] });
  });

  it('opens a department without featured products when there are none', () => {
    const menu = toStoreMenu(storeNav(departments), {});

    expect(menu.entries.filter((entry) => entry.kind === 'department').every((entry) => entry.featured.length === 0)).toBe(true);
  });

  it('keeps the shortcuts as they are', () => {
    const menu = toStoreMenu(storeNav(departments), {});

    expect(menu.entries.filter((entry) => entry.kind === 'link').map(({ label }) => label)).toEqual([
      'Novidades',
      'Drops',
      'Outlet',
    ]);
  });
});
