import type { Route } from 'next';

export type Department = {
  slug: string;
  name: string;
  productCount: number;
  imageUrl: string | null;
  href: Route;
};

export type ProductTag = 'drop' | 'new' | 'last-units';

export type ProductSummary = {
  id: string;
  name: string;
  brand: string;
  href: Route;
  imageUrl: string | null;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  installments: { count: number; valueInCents: number } | null;
  pixPriceInCents: number | null;
  rating: number | null;
  tag: ProductTag | null;
};

export type NewArrivalsTab = {
  // "all" ou o slug do departamento.
  id: string;
  label: string;
  products: ProductSummary[];
};

export type NewArrivals = {
  total: number;
  tabs: NewArrivalsTab[];
};
