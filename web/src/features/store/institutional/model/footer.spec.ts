import type { Route } from 'next';
import { describe, expect, it } from 'vitest';

import { storeFooter } from './footer';

describe('storeFooter', () => {
  const departments = [
    { label: 'Sneakers', href: '/sneakers' as Route },
    { label: 'Eyewear', href: '/eyewear' as Route },
  ];

  it('opens with the help links, the first thing a customer looks for at the bottom of the page', () => {
    expect(storeFooter(departments).columns.map(({ title }) => title)).toEqual(['Ajuda', 'Loja', 'A Trezzy']);
  });

  it('lists the shop links in the header order, with the catalog departments in the middle', () => {
    const shop = storeFooter(departments).columns.find(({ title }) => title === 'Loja');

    expect(shop?.links.map(({ label }) => label)).toEqual(['Novidades', 'Sneakers', 'Eyewear', 'Marcas', 'Drops', 'Outlet']);
  });

  it('keeps every footer link internal and unique', () => {
    const { columns, legal } = storeFooter(departments);
    const hrefs = [...columns.flatMap(({ links }) => links.map(({ href }) => href)), ...legal.map(({ href }) => href)];

    expect(hrefs.filter((href) => !href.startsWith('/'))).toEqual([]);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
