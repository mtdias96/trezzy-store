import type { Route } from 'next';

export type DepartmentId = 'streetwear' | 'sneakers' | 'eyewear' | 'brands';

export type NavLink = {
  label: string;
  href: Route;
};

export type NavSection = {
  title: string;
  links: readonly NavLink[];
};

export type NavShortcut = NavLink & {
  kind: 'link';
  highlight?: boolean;
};

export type NavDepartment = {
  kind: 'department';
  id: DepartmentId;
  label: string;
  href: Route;
  // Link para a página do departamento, que o gatilho do painel não abre (ele só abre o painel).
  allLabel: string;
  sections: readonly NavSection[];
};

export type NavEntry = NavShortcut | NavDepartment;

export type FeaturedProduct = {
  id: string;
  name: string;
  brand: string;
  priceInCents: number;
  href: Route;
  imageUrl: string | null;
};

export type StoreMenuDepartment = NavDepartment & {
  featured: readonly FeaturedProduct[];
};

export type StoreMenuEntry = NavShortcut | StoreMenuDepartment;

export type StoreMenu = {
  entries: readonly StoreMenuEntry[];
};
