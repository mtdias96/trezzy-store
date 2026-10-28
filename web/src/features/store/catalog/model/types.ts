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

export type ColorSwatch = 'black' | 'white' | 'off-white' | 'heather-gray' | 'green';

export type ProductColor = {
  id: string;
  name: string;
  swatch: ColorSwatch;
};

export type ProductVariant = {
  id: string;
  colorId: string;
  size: string;
  inStock: boolean;
};

export type ProductImage = {
  url: string;
  alt: string;
};

export type Crumb = {
  name: string;
  href: Route;
};

export type FitResult = 'small' | 'true-to-size' | 'large';

export type ReviewSummary = {
  // Quantas avaliações com 5, 4, 3, 2 e 1 estrela, nessa ordem.
  distribution: [number, number, number, number, number];
  fit: FitResult | null;
};

export type ProductReview = {
  id: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
  size: string | null;
  verified: boolean;
  author: string;
  location: string | null;
};

export type ProductDetail = Omit<ProductSummary, 'imageUrl'> & {
  slug: string;
  description: string[];
  composition: string[];
  reviewCount: number;
  reviewSummary: ReviewSummary;
  department: Crumb;
  category: Crumb | null;
  images: ProductImage[];
  colors: ProductColor[];
  sizes: string[];
  variants: ProductVariant[];
  sizeChart: { headers: string[]; rows: string[][] } | null;
};

// variantId null: esgotado nessa cor.
export type SizeOption = {
  size: string;
  variantId: string | null;
};
