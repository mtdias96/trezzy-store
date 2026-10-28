import type { Route } from 'next';

import { CATALOG_LABELS, type CatalogFilters, type CatalogSort, currentPage, findPriceRange, pageCount } from './listing';
import { serializeCatalogFilters } from './search-params';
import {
  ALL_PRODUCTS_HREF,
  categoryHref,
  departmentHref,
  findCategory,
  findDepartment,
  STORE_DEPARTMENTS,
  type TaxonomyDepartment,
} from './taxonomy';
import type { Crumb, Department } from './types';

export const HOME_CRUMB: Crumb = { name: CATALOG_LABELS.home, href: '/' };

export type CatalogTab = {
  label: string;
  href: Route;
  active: boolean;
};

// Uma página do catálogo: o que ela fixa na consulta (departamento e categoria) e o que mostra no topo. Os filtros
// da URL (tamanho, marca, ordem) somam a isso.
export type CatalogScope = {
  department: string | null;
  category: string | null;
  title: string;
  metaTitle: string;
  description: string;
  trail: Crumb[];
  href: Route;
  tabsLabel: string;
  tabs: CatalogTab[];
};

const TAGLINE = 'das marcas que fazem a rua';

const listFormat = new Intl.ListFormat('pt-BR', { type: 'conjunction' });

const lower = (text: string) => text.toLocaleLowerCase('pt-BR');

function sentence(text: string): string {
  return `${text.charAt(0).toLocaleUpperCase('pt-BR')}${text.slice(1)}`;
}

function categoryTabs({ slug: department, categories }: TaxonomyDepartment, active: string | null): CatalogTab[] {
  return [
    { label: CATALOG_LABELS.allCategories, href: departmentHref(department), active: active === null },
    ...categories.map(({ slug, name }) => ({ label: name, href: categoryHref(department, slug), active: slug === active })),
  ];
}

export function allProductsScope(): CatalogScope {
  return {
    department: null,
    category: null,
    title: CATALOG_LABELS.allProducts,
    metaTitle: CATALOG_LABELS.allProducts,
    description: `${sentence(listFormat.format(STORE_DEPARTMENTS.map(({ name }) => lower(name))))} ${TAGLINE}.`,
    trail: [HOME_CRUMB],
    href: ALL_PRODUCTS_HREF,
    tabsLabel: 'Departamentos',
    tabs: [
      { label: CATALOG_LABELS.allCategories, href: ALL_PRODUCTS_HREF, active: true },
      ...STORE_DEPARTMENTS.map(({ slug, name }) => ({ label: name, href: departmentHref(slug), active: false })),
    ],
  };
}

export function departmentScope(slug: string): CatalogScope | null {
  const department = findDepartment(slug);

  if (!department) {
    return null;
  }

  return {
    department: department.slug,
    category: null,
    title: department.name,
    metaTitle: department.name,
    description: `${department.name} ${TAGLINE}: ${listFormat.format(department.categories.map(({ name }) => lower(name)))}.`,
    trail: [HOME_CRUMB],
    href: departmentHref(department.slug),
    tabsLabel: `Categorias de ${department.name}`,
    tabs: categoryTabs(department, null),
  };
}

export function categoryScope(departmentSlug: string, categorySlug: string): CatalogScope | null {
  const department = findDepartment(departmentSlug);
  const category = department && findCategory(department, categorySlug);

  if (!department || !category) {
    return null;
  }

  return {
    department: department.slug,
    category: category.slug,
    title: category.name,
    metaTitle: `${category.name} · ${department.name}`,
    description: `${category.name} de ${lower(department.name)} ${TAGLINE}.`,
    trail: [HOME_CRUMB, { name: department.name, href: departmentHref(department.slug) }],
    href: categoryHref(department.slug, category.slug),
    tabsLabel: `Categorias de ${department.name}`,
    tabs: categoryTabs(department, category.slug),
  };
}

export type DepartmentFilterItem = {
  label: string;
  href: Route;
  count: number | null;
  active: boolean;
};

// Contagens da API. Sem ela (lista vazia), os links continuam e os números somem.
export function departmentFilterItems(
  scope: CatalogScope,
  departments: readonly Pick<Department, 'slug' | 'productCount'>[],
): DepartmentFilterItem[] {
  const counted = departments.length > 0;
  const countOf = (slug: string) => (counted ? departments.find((item) => item.slug === slug)?.productCount ?? 0 : null);

  return [
    {
      label: CATALOG_LABELS.allDepartments,
      href: ALL_PRODUCTS_HREF,
      count: counted ? departments.reduce((sum, { productCount }) => sum + productCount, 0) : null,
      active: scope.department === null,
    },
    ...STORE_DEPARTMENTS.map(({ slug, name }) => ({
      label: name,
      href: departmentHref(slug),
      count: countOf(slug),
      active: scope.department === slug,
    })),
  ];
}

export type CatalogQuery = {
  department: string | null;
  category: string | null;
  sizes: string[];
  brands: string[];
  priceAboveInCents: number | null;
  priceUpToInCents: number | null;
  onSale: boolean;
  sort: CatalogSort;
  page: number;
};

// Ordenada e sem repetição: ?marca=a,b e ?marca=b,a são a mesma consulta e a mesma entrada de cache.
export function toCatalogQuery({ department, category }: CatalogScope, filters: CatalogFilters): CatalogQuery {
  const price = findPriceRange(filters.preco);

  return {
    department,
    category,
    sizes: [...new Set(filters.tamanho)].sort(),
    brands: [...new Set(filters.marca)].sort(),
    priceAboveInCents: price?.aboveInCents ?? null,
    priceUpToInCents: price?.upToInCents ?? null,
    onSale: filters.promocao,
    sort: filters.ordem,
    page: currentPage(filters.pagina),
  };
}

// A página como os links a abrem (abas, departamentos, menu e paginação), em qualquer ordem: poucas combinações,
// repetidas por todo visitante. A promoção entra porque é o "Outlet" do menu.
export function isSharedQuery({ sizes, brands, priceAboveInCents, priceUpToInCents }: CatalogQuery): boolean {
  return sizes.length === 0 && brands.length === 0 && priceAboveInCents === null && priceUpToInCents === null;
}

export type PageLinks = {
  page: number;
  pageCount: number;
  previous: Route | null;
  next: Route | null;
};

// Links, e não botões: a paginação funciona sem JavaScript e os buscadores chegam à página 2.
export function pageLinks(scope: CatalogScope, filters: CatalogFilters, total: number): PageLinks {
  const count = pageCount(total);
  const page = Math.min(currentPage(filters.pagina), count);
  const hrefFor = (pagina: number) => serializeCatalogFilters(scope.href, { ...filters, pagina }) as Route;

  return {
    page,
    pageCount: count,
    previous: page > 1 ? hrefFor(page - 1) : null,
    next: page < count ? hrefFor(page + 1) : null,
  };
}
