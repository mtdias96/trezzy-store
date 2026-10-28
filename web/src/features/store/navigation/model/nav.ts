import { pendingRoute } from '@/lib/route';

import type { FeaturedProduct, MenuDepartment, NavDepartment, NavEntry, NavLink, StoreMenu } from './types';

type LinkSeed = readonly [label: string, slug: string];

function links(base: `/${string}`, seeds: readonly LinkSeed[]): NavLink[] {
  return seeds.map(([label, slug]) => ({ label, href: pendingRoute(`${base}/${slug}`) }));
}

const BRANDS: NavDepartment = {
  kind: 'department',
  id: 'brands',
  label: 'Marcas',
  href: pendingRoute('/marcas'),
  allLabel: 'Ver todas as marcas',
  sections: [
    {
      title: 'Em alta',
      links: links('/marcas', [
        ['Pátio 9', 'patio-9'],
        ['Norte/Sul', 'norte-sul'],
        ['Forte Athletics', 'forte-athletics'],
      ]),
    },
    { title: 'Destaques', links: links('/marcas', [['Novidades', 'novidades'], ['Collabs', 'collabs']]) },
  ],
};

function toNavDepartment({ id, label, href, categories, shortcuts }: MenuDepartment): NavDepartment {
  return {
    kind: 'department',
    id,
    label,
    href,
    allLabel: `Ver tudo em ${label}`,
    sections: [
      { title: 'Categorias', links: categories },
      { title: 'Destaques', links: shortcuts },
    ],
  };
}

// Ordem do header: Novidades, os departamentos do catálogo, Marcas, Drops e Outlet.
export function storeNav(departments: readonly MenuDepartment[]): NavEntry[] {
  return [
    { kind: 'link', label: 'Novidades', href: pendingRoute('/novidades') },
    ...departments.map(toNavDepartment),
    BRANDS,
    { kind: 'link', label: 'Drops', href: pendingRoute('/drops'), highlight: true },
    { kind: 'link', label: 'Outlet', href: pendingRoute('/outlet') },
  ];
}

export function departmentIds(nav: readonly NavEntry[]): string[] {
  return nav.flatMap((entry) => (entry.kind === 'department' ? [entry.id] : []));
}

export function toStoreMenu(
  nav: readonly NavEntry[],
  featured: Partial<Record<string, readonly FeaturedProduct[]>>,
): StoreMenu {
  return {
    entries: nav.map((entry) => (entry.kind === 'department' ? { ...entry, featured: featured[entry.id] ?? [] } : entry)),
  };
}
