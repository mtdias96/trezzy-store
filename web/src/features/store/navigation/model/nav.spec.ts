import type { Route } from 'next';
import { describe, expect, it } from 'vitest';

import { departmentIds, storeNav, toStoreMenu } from './nav';
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
    id: 'streetwear',
    label: 'Streetwear',
    href: route('/streetwear'),
    categories: [{ label: 'Camisetas', href: route('/streetwear/camisetas') }],
    shortcuts: [
      { label: 'Novidades', href: route('/streetwear?ordem=novidades') },
      { label: 'Outlet', href: route('/streetwear?promocao=true') },
    ],
  },
  {
    id: 'sneakers',
    label: 'Sneakers',
    href: route('/sneakers'),
    categories: [{ label: 'Skate', href: route('/sneakers/skate') }],
    shortcuts: [],
  },
];

describe('storeNav', () => {
  it('places the catalog departments between Novidades and Marcas, in the order received', () => {
    expect(storeNav(departments).map(({ label }) => label)).toEqual([
      'Novidades',
      'Streetwear',
      'Sneakers',
      'Marcas',
      'Drops',
      'Outlet',
    ]);
  });

  it('builds each panel from the catalog links, with the department name in "see all"', () => {
    const streetwear = storeNav(departments).find((entry) => entry.kind === 'department' && entry.id === 'streetwear');

    expect(streetwear).toMatchObject({
      allLabel: 'Ver tudo em Streetwear',
      sections: [
        { title: 'Categorias', links: [{ label: 'Camisetas', href: route('/streetwear/camisetas') }] },
        { title: 'Destaques', links: [{ label: 'Novidades' }, { label: 'Outlet', href: '/streetwear?promocao=true' }] },
      ],
    });
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

describe('departmentIds', () => {
  it('lists the panels in header order, brands included', () => {
    expect(departmentIds(storeNav(departments))).toEqual(['streetwear', 'sneakers', 'brands']);
  });
});

describe('toStoreMenu', () => {
  it('attaches the featured products to their department', () => {
    const menu = toStoreMenu(storeNav(departments), { streetwear: [product] });
    const streetwear = menu.entries.find((entry) => entry.kind === 'department' && entry.id === 'streetwear');

    expect(streetwear).toMatchObject({ featured: [product] });
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
