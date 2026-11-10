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

export type HomeEditorial = {
  badge: string;
  eyebrow: string;
  title: string;
  description: string;
  highlights: { value: string; label: string }[];
  imageUrl: string | null;
  imageAlt: string;
  linkLabel: string;
  href: Route;
};

export type StorePerk = {
  title: string;
  description: string;
};
