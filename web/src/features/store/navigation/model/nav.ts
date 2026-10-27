import { formatWeekdayHour } from '@/lib/date';
import { pendingRoute } from '@/lib/route';

import type { DepartmentId, FeaturedProduct, NavEntry, NavLink, NavSection, StoreMenu } from './types';

type Path = `/${string}`;

// [rótulo, slug]: o slug vira a URL, em pt-BR e indexada pelo Google.
type LinkSeed = readonly [label: string, slug: string];

function links(base: Path, seeds: readonly LinkSeed[]): NavLink[] {
  return seeds.map(([label, slug]) => ({ label, href: pendingRoute(`${base}/${slug}`) }));
}

function categories(base: Path, seeds: readonly LinkSeed[]): NavSection {
  return { title: 'Categorias', links: links(base, seeds) };
}

function highlights(base: Path): NavSection {
  return {
    title: 'Destaques',
    links: links(base, [['Novidades', 'novidades'], ['Mais vendidos', 'mais-vendidos'], ['Outlet', 'outlet']]),
  };
}

// Ordem do header. Categorias e marcas fixas até a API da vitrine listar as ativas.
export const STORE_NAV: readonly NavEntry[] = [
  { kind: 'link', label: 'Novidades', href: pendingRoute('/novidades') },
  {
    kind: 'department',
    id: 'streetwear',
    label: 'Streetwear',
    href: pendingRoute('/streetwear'),
    allLabel: 'Ver tudo em Streetwear',
    sections: [
      categories('/streetwear', [
        ['Camisetas', 'camisetas'],
        ['Moletons', 'moletons'],
        ['Jaquetas', 'jaquetas'],
        ['Calças', 'calcas'],
        ['Shorts', 'shorts'],
        ['Acessórios', 'acessorios'],
      ]),
      highlights('/streetwear'),
    ],
  },
  {
    kind: 'department',
    id: 'sneakers',
    label: 'Sneakers',
    href: pendingRoute('/sneakers'),
    allLabel: 'Ver tudo em Sneakers',
    sections: [
      categories('/sneakers', [
        ['Casual', 'casual'],
        ['Skate', 'skate'],
        ['Corrida', 'corrida'],
        ['Basquete', 'basquete'],
        ['Chinelos e slides', 'chinelos-e-slides'],
      ]),
      highlights('/sneakers'),
    ],
  },
  {
    kind: 'department',
    id: 'eyewear',
    label: 'Eyewear',
    href: pendingRoute('/eyewear'),
    allLabel: 'Ver tudo em Eyewear',
    sections: [
      categories('/eyewear', [
        ['Óculos de sol', 'oculos-de-sol'],
        ['Armações', 'armacoes'],
        ['Esportivos', 'esportivos'],
        ['Estojos e cordões', 'estojos-e-cordoes'],
      ]),
      highlights('/eyewear'),
    ],
  },
  {
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
  },
  { kind: 'link', label: 'Drops', href: pendingRoute('/drops'), highlight: true },
  { kind: 'link', label: 'Outlet', href: pendingRoute('/outlet') },
];

export function departmentIds(nav: readonly NavEntry[] = STORE_NAV): DepartmentId[] {
  return nav.flatMap((entry) => (entry.kind === 'department' ? [entry.id] : []));
}

// Departamento sem destaques (API fora do ar, nenhum produto marcado) abre só com os links.
export function toStoreMenu(
  featured: Partial<Record<DepartmentId, readonly FeaturedProduct[]>>,
  drop: StoreMenu['drop'],
  nav: readonly NavEntry[] = STORE_NAV,
): StoreMenu {
  return {
    entries: nav.map((entry) => (entry.kind === 'department' ? { ...entry, featured: featured[entry.id] ?? [] } : entry)),
    drop,
  };
}

// "Drop 07 · Sex 19h", com o dia e a hora da loja.
export function dropBadge(number: number, startsAt: Date): string {
  return `Drop ${String(number).padStart(2, '0')} · ${formatWeekdayHour(startsAt)}`;
}
