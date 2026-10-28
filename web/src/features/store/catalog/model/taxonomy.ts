import type { Route } from 'next';

import { CATALOG_LABELS, type CatalogSort, SORT_LABELS } from './listing';
import { serializeCatalogFilters } from './search-params';

export type TaxonomyCategory = {
  slug: string;
  name: string;
};

export type TaxonomyDepartment = {
  slug: string;
  name: string;
  categories: readonly TaxonomyCategory[];
};

// Departamentos e categorias da vitrine, na ordem do menu. É a única fonte desses nomes: o menu, o catálogo, a home
// e a trilha do produto leem daqui, e a API é consultada só pelo slug.
// - name: só texto, muda à vontade.
// - slug: a URL (/streetwear/camisetas) e a chave da API. Trocá-lo muda um endereço que o Google já conhece.
export const STORE_DEPARTMENTS: readonly TaxonomyDepartment[] = [
  {
    slug: 'streetwear',
    name: 'Streetwear',
    categories: [
      { slug: 'camisetas', name: 'Camisetas' },
      { slug: 'moletons', name: 'Moletons' },
      { slug: 'jaquetas', name: 'Jaquetas' },
      { slug: 'calcas', name: 'Calças' },
      { slug: 'shorts', name: 'Shorts' },
      { slug: 'acessorios', name: 'Acessórios' },
    ],
  },
  {
    slug: 'sneakers',
    name: 'Sneakers',
    categories: [
      { slug: 'casual', name: 'Casual' },
      { slug: 'corrida', name: 'Corrida' },
      { slug: 'skate', name: 'Skate' },
      { slug: 'trail', name: 'Trail' },
    ],
  },
  {
    slug: 'eyewear',
    name: 'Eyewear',
    categories: [
      { slug: 'solar', name: 'Solar' },
      { slug: 'esportivo', name: 'Esportivo' },
      { slug: 'metal', name: 'Metal' },
      { slug: 'acetato', name: 'Acetato' },
    ],
  },
];

export const ALL_PRODUCTS_HREF: Route = '/produtos';

// O typedRoutes recusa barra no slug (SafeSlug) e não prova isso numa string qualquer; o spec garante o formato.
export function departmentHref(department: string): Route {
  return `/${department}` as Route;
}

export function categoryHref(department: string, category: string): Route {
  return `/${department}/${category}` as Route;
}

export function findDepartment(slug: string): TaxonomyDepartment | undefined {
  return STORE_DEPARTMENTS.find((department) => department.slug === slug);
}

export function findCategory(department: TaxonomyDepartment, slug: string): TaxonomyCategory | undefined {
  return department.categories.find((category) => category.slug === slug);
}

const MENU_SHORTCUTS = ['novidades', 'mais-vendidos'] as const satisfies readonly CatalogSort[];

export type DepartmentLinks = {
  id: string;
  label: string;
  href: Route;
  categories: { label: string; href: Route }[];
  shortcuts: { label: string; href: Route }[];
};

// O menu é outra feature: o layout entrega estes links a ela, e o header muda junto com o catálogo.
export function departmentLinks(departments: readonly TaxonomyDepartment[] = STORE_DEPARTMENTS): DepartmentLinks[] {
  return departments.map(({ slug, name, categories }) => ({
    id: slug,
    label: name,
    href: departmentHref(slug),
    categories: categories.map((category) => ({ label: category.name, href: categoryHref(slug, category.slug) })),
    shortcuts: [
      ...MENU_SHORTCUTS.map((ordem) => ({
        label: SORT_LABELS[ordem],
        href: serializeCatalogFilters(departmentHref(slug), { ordem }) as Route,
      })),
      { label: CATALOG_LABELS.outlet, href: serializeCatalogFilters(departmentHref(slug), { promocao: true }) as Route },
    ],
  }));
}
