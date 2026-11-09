import type { Route } from 'next';

export type HomeBanner = {
  id: string;
  imageUrl: string;
  imageAlt: string;
  href: Route;
};

export type HomeCollection = {
  id: string;
  title: string;
  caption: string;
  imageUrl: string | null;
  href: Route;
};

export type HomeCollections = {
  featured: HomeCollection;
  others: HomeCollection[];
};

export type StorePerk = {
  title: string;
  description: string;
};
