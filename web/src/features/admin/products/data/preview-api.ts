import 'server-only';

import type { ProductStatus } from '@/features/admin/products/model/types';

import type { BrandDto, CategoryDto, ProductDto, ProductSummaryDto } from './api';

// PRÉVIA (não commitar): as rotas do catálogo com os dados de exemplo do design (19 produtos, 84 variantes), até a API
// existir. O queries.ts importa daqui em vez do api.ts.

const BRANDS: BrandDto[] = [
  { id: 'nike-sb', name: 'Nike SB', active: true },
  { id: 'adidas-originals', name: 'adidas Originals', active: true },
  { id: 'vans', name: 'Vans', active: true },
  { id: 'carhartt-wip', name: 'Carhartt WIP', active: true },
  { id: 'stussy', name: 'Stüssy', active: true },
  { id: 'thrasher', name: 'Thrasher', active: true },
  { id: 'new-era', name: 'New Era', active: true },
  { id: 'element', name: 'Element', active: true },
  { id: 'converse', name: 'Converse', active: true },
  { id: 'dickies', name: 'Dickies', active: true },
  { id: 'oakley', name: 'Oakley', active: true },
  { id: 'ray-ban', name: 'Ray-Ban', active: true },
  { id: 'palace', name: 'Palace', active: true },
];

const CATEGORIES: CategoryDto[] = [
  { id: 'tenis', name: 'Tênis', grid: 'num', active: true },
  { id: 'camisetas', name: 'Camisetas', grid: 'apparel', active: true },
  { id: 'moletons', name: 'Moletons', grid: 'apparel', active: true },
  { id: 'calcas', name: 'Calças', grid: 'num', active: true },
  { id: 'bones', name: 'Bonés', grid: 'one', active: true },
  { id: 'oculos', name: 'Óculos', grid: 'one', active: true },
  { id: 'shapes-skate', name: 'Shapes & Skate', grid: 'one', active: true },
];

const COLOR_CODES: Record<string, string> = {
  preto: 'PRE',
  branco: 'BRA',
  'off-white': 'OFF',
  'cinza mescla': 'CMS',
  verde: 'VER',
};

type Seed = {
  id: string;
  title: string;
  brandId: string;
  categoryId: string;
  status?: ProductStatus;
  priceInCents: number;
  updatedAt: string;
  // [tamanho, cor, estoque, preço próprio]
  variants: readonly (readonly [string, string, number, number?])[];
};

function product({ variants, priceInCents, status = 'active', ...seed }: Seed): ProductDto {
  const prefix = seed.id.split('-').map((word) => word[0]?.toUpperCase() ?? '').join('');

  return {
    ...seed,
    status,
    description: `${seed.title}. Materiais, caimento e detalhes do produto.`,
    media: [],
    variants: variants.map(([size, color, stock, ownPrice]) => ({
      id: `${seed.id}-${size}-${color}`.replaceAll(' ', '-'),
      size,
      color,
      sku: `${prefix}-${size}-${COLOR_CODES[color] ?? 'COR'}`,
      priceInCents: ownPrice ?? priceInCents,
      stock,
      active: true,
    })),
  };
}

const PRODUCTS: readonly ProductDto[] = [
  product({
    id: 'stock-logo-crew',
    title: 'Stock Logo Crew',
    brandId: 'stussy',
    categoryId: 'moletons',
    priceInCents: 68990,
    updatedAt: '2026-10-26T21:30:00-03:00',
    variants: [
      ['P', 'preto', 12], ['M', 'preto', 10], ['G', 'preto', 9], ['GG', 'preto', 8],
      ['P', 'cinza mescla', 7], ['M', 'cinza mescla', 6], ['G', 'cinza mescla', 4], ['GG', 'cinza mescla', 2],
    ],
  }),
  product({
    id: 'shape-seal-8',
    title: 'Shape Seal 8.0',
    brandId: 'element',
    categoryId: 'shapes-skate',
    priceInCents: 38990,
    updatedAt: '2026-10-24T18:00:00-03:00',
    variants: [['U', 'off-white', 5]],
  }),
  product({
    id: 'gazelle-indoor',
    title: 'Gazelle Indoor "Collegiate Purple"',
    brandId: 'adidas-originals',
    categoryId: 'tenis',
    priceInCents: 79999,
    updatedAt: '2026-10-24T11:00:00-03:00',
    variants: [['38', 'branco', 10], ['39', 'branco', 9], ['40', 'branco', 8], ['41', 'branco', 8], ['42', 'branco', 7], ['43', 'branco', 5]],
  }),
  product({
    id: 'skate-mag-hoodie',
    title: 'Skate Mag Hoodie "Black"',
    brandId: 'thrasher',
    categoryId: 'moletons',
    priceInCents: 54990,
    updatedAt: '2026-10-22T16:00:00-03:00',
    variants: [['P', 'preto', 12], ['M', 'preto', 10], ['G', 'preto', 9], ['GG', 'preto', 7]],
  }),
  product({
    id: 'hooded-chase-sweat',
    title: 'Hooded Chase Sweat "Ash Heather"',
    brandId: 'carhartt-wip',
    categoryId: 'moletons',
    priceInCents: 74990,
    updatedAt: '2026-10-22T10:00:00-03:00',
    variants: [['P', 'cinza mescla', 10], ['M', 'cinza mescla', 8], ['GG', 'cinza mescla', 5, 78990], ['XGG', 'cinza mescla', 2, 78990]],
  }),
  product({
    id: 'dunk-low-pro',
    title: 'Dunk Low Pro "Black/White"',
    brandId: 'nike-sb',
    categoryId: 'tenis',
    priceInCents: 89999,
    updatedAt: '2026-10-19T15:00:00-03:00',
    variants: [['38', 'preto', 8], ['39', 'preto', 6], ['40', 'preto', 5], ['41', 'preto', 3], ['42', 'preto', 2], ['43', 'preto', 2]],
  }),
  product({
    id: '9fifty-new-york-yankees',
    title: '9FIFTY New York Yankees "Black"',
    brandId: 'new-era',
    categoryId: 'bones',
    priceInCents: 29999,
    updatedAt: '2026-10-16T12:00:00-03:00',
    variants: [['U', 'preto', 7]],
  }),
  product({
    id: 'sk8-hi-pro',
    title: 'Sk8-Hi Pro "Black/White"',
    brandId: 'vans',
    categoryId: 'tenis',
    priceInCents: 59999,
    updatedAt: '2026-10-15T14:00:00-03:00',
    variants: [['37', 'preto', 9], ['38', 'preto', 7], ['39', 'preto', 6], ['40', 'preto', 5], ['41', 'preto', 4], ['42', 'preto', 2], ['43', 'preto', 1]],
  }),
  product({
    id: 'tri-ferg-hood',
    title: 'Tri-Ferg Hood "Grey Marl"',
    brandId: 'palace',
    categoryId: 'moletons',
    status: 'draft',
    priceInCents: 99990,
    updatedAt: '2026-10-14T09:00:00-03:00',
    variants: [['P', 'cinza mescla', 6], ['M', 'cinza mescla', 6], ['G', 'cinza mescla', 5], ['GG', 'cinza mescla', 4]],
  }),
  product({
    id: 'sb-zoom-blazer-mid',
    title: 'SB Zoom Blazer Mid "White/Black"',
    brandId: 'nike-sb',
    categoryId: 'tenis',
    priceInCents: 69999,
    updatedAt: '2026-10-13T17:00:00-03:00',
    variants: [['38', 'branco', 6], ['39', 'branco', 7], ['40', 'branco', 8], ['41', 'branco', 8], ['42', 'branco', 6], ['43', 'branco', 4]],
  }),
  product({
    id: 'samba-adv',
    title: 'Samba ADV "Core Black"',
    brandId: 'adidas-originals',
    categoryId: 'tenis',
    priceInCents: 64999,
    updatedAt: '2026-10-12T13:00:00-03:00',
    variants: [['38', 'preto', 5], ['39', 'preto', 6], ['40', 'preto', 7], ['41', 'preto', 7], ['42', 'preto', 5], ['43', 'preto', 4]],
  }),
  product({
    id: 'old-skool-pro',
    title: 'Old Skool Pro "Black/White"',
    brandId: 'vans',
    categoryId: 'tenis',
    priceInCents: 49999,
    updatedAt: '2026-10-10T10:00:00-03:00',
    variants: [['38', 'preto', 9], ['39', 'preto', 9], ['40', 'preto', 10], ['41', 'preto', 9], ['42', 'preto', 8], ['43', 'preto', 6]],
  }),
  product({
    id: 'one-star-pro',
    title: 'One Star Pro "Egret"',
    brandId: 'converse',
    categoryId: 'tenis',
    priceInCents: 54999,
    updatedAt: '2026-10-08T15:00:00-03:00',
    variants: [['38', 'off-white', 4], ['39', 'off-white', 5], ['40', 'off-white', 6], ['41', 'off-white', 5], ['42', 'off-white', 4]],
  }),
  product({
    id: 'basic-stussy-tee',
    title: 'Basic Stüssy Tee "White"',
    brandId: 'stussy',
    categoryId: 'camisetas',
    priceInCents: 32990,
    updatedAt: '2026-10-07T11:00:00-03:00',
    variants: [['P', 'branco', 12], ['M', 'branco', 14], ['G', 'branco', 12], ['GG', 'branco', 9], ['XGG', 'branco', 5]],
  }),
  product({
    id: 'flame-logo-tee',
    title: 'Flame Logo Tee "Black"',
    brandId: 'thrasher',
    categoryId: 'camisetas',
    priceInCents: 27990,
    updatedAt: '2026-10-06T16:00:00-03:00',
    variants: [['P', 'preto', 10], ['M', 'preto', 12], ['G', 'preto', 11], ['GG', 'preto', 8], ['XGG', 'preto', 3]],
  }),
  product({
    id: 'single-knee-pant',
    title: 'Single Knee Pant "Dark Navy"',
    brandId: 'carhartt-wip',
    categoryId: 'calcas',
    priceInCents: 79990,
    updatedAt: '2026-10-05T12:00:00-03:00',
    variants: [['38', 'preto', 6], ['40', 'preto', 7], ['42', 'preto', 6], ['44', 'preto', 4]],
  }),
  product({
    id: '874-work-pant',
    title: '874 Work Pant "Khaki"',
    brandId: 'dickies',
    categoryId: 'calcas',
    priceInCents: 44990,
    updatedAt: '2026-10-03T09:00:00-03:00',
    variants: [['38', 'off-white', 8], ['40', 'off-white', 9], ['42', 'off-white', 7], ['44', 'off-white', 5]],
  }),
  product({
    id: 'frogskins',
    title: 'Frogskins "Matte Black"',
    brandId: 'oakley',
    categoryId: 'oculos',
    priceInCents: 89990,
    updatedAt: '2026-10-02T14:00:00-03:00',
    variants: [['U', 'preto', 0]],
  }),
  product({
    id: 'wayfarer-classic',
    title: 'Wayfarer Classic "Green"',
    brandId: 'ray-ban',
    categoryId: 'oculos',
    status: 'inactive',
    priceInCents: 79990,
    updatedAt: '2026-09-30T10:00:00-03:00',
    variants: [['U', 'verde', 4]],
  }),
];

export async function fetchProducts(): Promise<ProductSummaryDto[]> {
  return PRODUCTS.map(({ id, title, status, brandId, categoryId, variants, media, updatedAt }) => ({
    id,
    title,
    status,
    brandId,
    categoryId,
    variants,
    updatedAt,
    coverUrl: media[0]?.url ?? null,
  }));
}

export async function fetchProduct(id: string): Promise<ProductDto | null> {
  return PRODUCTS.find((product) => product.id === id) ?? null;
}

export async function fetchBrands(): Promise<BrandDto[]> {
  return BRANDS;
}

export async function fetchCategories(): Promise<CategoryDto[]> {
  return CATEGORIES;
}
