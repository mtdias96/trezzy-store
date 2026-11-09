import type { Route } from 'next';

export type HomeBanner = {
  id: string;
  imageUrl: string;
  imageAlt: string;
  href: Route;
};

export type StorePerk = {
  title: string;
  description: string;
};
