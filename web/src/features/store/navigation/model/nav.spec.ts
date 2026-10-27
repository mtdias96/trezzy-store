import { describe, expect, it } from 'vitest';

import { departmentIds, dropBadge, STORE_NAV, toStoreMenu } from './nav';
import type { FeaturedProduct } from './types';

const product: FeaturedProduct = {
  id: 'camiseta-galeria',
  name: 'Camiseta Pesada "Galeria"',
  brand: 'Pátio 9',
  priceInCents: 27990,
  href: '/',
  imageUrl: null,
};

describe('STORE_NAV', () => {
  it('has unique hrefs, so no two links in the menu point to the same page', () => {
    const hrefs = STORE_NAV.flatMap((entry) =>
      entry.kind === 'link'
        ? [entry.href]
        : [entry.href, ...entry.sections.flatMap(({ links }) => links.map(({ href }) => href))],
    );

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('keeps every department page under its own path', () => {
    const outside = STORE_NAV.flatMap((entry) =>
      entry.kind === 'department'
        ? entry.sections.flatMap(({ links }) => links).filter(({ href }) => !href.startsWith(`${entry.href}/`))
        : [],
    );

    expect(outside).toEqual([]);
  });
});

describe('departmentIds', () => {
  it('lists the departments in header order', () => {
    expect(departmentIds()).toEqual(['streetwear', 'sneakers', 'eyewear', 'brands']);
  });
});

describe('toStoreMenu', () => {
  it('attaches the featured products to their department', () => {
    const menu = toStoreMenu({ streetwear: [product] }, null);
    const streetwear = menu.entries.find((entry) => entry.kind === 'department' && entry.id === 'streetwear');

    expect(streetwear).toMatchObject({ featured: [product] });
  });

  it('opens a department without featured products when there are none', () => {
    const menu = toStoreMenu({}, null);

    expect(menu.entries.filter((entry) => entry.kind === 'department').every((entry) => entry.featured.length === 0)).toBe(true);
  });

  it('keeps the shortcuts as they are', () => {
    const menu = toStoreMenu({}, null);

    expect(menu.entries.filter((entry) => entry.kind === 'link').map(({ label }) => label)).toEqual([
      'Novidades',
      'Drops',
      'Outlet',
    ]);
  });
});

describe('dropBadge', () => {
  it('pads the drop number and shows the store weekday and hour', () => {
    // 19h em São Paulo (UTC-3) de sexta, 30/10/2026.
    expect(dropBadge(7, new Date('2026-10-30T22:00:00Z'))).toBe('Drop 07 · Sex 19h');
  });
});
