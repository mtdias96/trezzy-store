import type { Route } from 'next';

export type Department = {
  slug: string;
  name: string;
  productCount: number;
  imageUrl: string | null;
  href: Route;
  categories: readonly DepartmentCategory[];
};

export type DepartmentCategory = {
  slug: string;
  name: string;
  href: Route;
  productCount: number;
};

export type PieceIconName = 'sneaker' | 'shirt' | 'hoodie' | 'pants' | 'glasses' | 'cap' | 'tag';

export type PieceShortcut = {
  name: string;
  icon: PieceIconName;
  href: Route;
  productCount: number;
};

export type ProductSummary = {
  id: string;
  name: string;
  brand: string;
  href: Route;
  imageUrl: string | null;
  hoverImageUrl: string | null;
  priceInCents: number;
  compareAtPriceInCents: number | null;
  installments: { count: number; valueInCents: number } | null;
  pixPriceInCents: number | null;
  rating: number | null;
  sizeOptions: SizeOption[];
};

export type SizeFacet = {
  value: string;
  count: number;
};

export type BrandFacet = {
  slug: string;
  name: string;
  count: number;
};

// Uma página da listagem. As contagens de cada filtro ignoram o próprio filtro: marcar uma marca não zera as outras.
export type CatalogResults = {
  products: ProductSummary[];
  total: number;
  sizes: SizeFacet[];
  brands: BrandFacet[];
};

export type ProductTab = {
  // "all" ou o slug do departamento.
  id: string;
  label: string;
  products: ProductSummary[];
};

export type ProductTabs = {
  total: number;
  tabs: ProductTab[];
};

export type OutletProduct = {
  id: string;
  name: string;
  categoryName: string | null;
  href: Route;
  imageUrl: string | null;
  priceInCents: number;
  compareAtPriceInCents: number;
};

export type OutletShowcase = {
  products: OutletProduct[];
  topDiscountPercent: number;
};

export type BrandTile = {
  slug: string;
  name: string;
  productCount: number;
  imageUrl: string | null;
  href: Route;
};

export type PriceBandPhoto = {
  id: string;
  imageUrl: string | null;
};

export type PriceBand = {
  href: Route;
  caption: string;
  amount: string;
  productCount: number;
  photos: PriceBandPhoto[];
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

export type ProductDetail = Omit<ProductSummary, 'imageUrl' | 'hoverImageUrl' | 'sizeOptions'> & {
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
