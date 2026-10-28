import type { Route } from 'next';

export type Department = {
  slug: string;
  name: string;
  productCount: number;
  imageUrl: string | null;
  href: Route;
};
