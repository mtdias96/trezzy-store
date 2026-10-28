import type { SizeGridId } from './variants';

export type SelectOption = {
  value: string;
  label: string;
};

// Os status da coluna `products.status` da API.
export type ProductStatus = 'draft' | 'active' | 'inactive' | 'archived';

export type StockLevel = 'in-stock' | 'low' | 'out';

export type ProductVariant = {
  id: string;
  size: string;
  color: string;
  sku: string;
  priceInCents: number;
  stock: number;
  active: boolean;
};

export type ProductMediaFile = {
  id: string;
  url: string;
};

export type ProductDetail = {
  id: string;
  title: string;
  description: string;
  status: ProductStatus;
  brandId: string;
  categoryId: string;
  sizeGrid: SizeGridId;
  media: readonly ProductMediaFile[];
  variants: readonly ProductVariant[];
  updatedAt: string;
};

// O produto na lista: sem descrição e sem galeria, só com a capa.
export type ProductSummary = Pick<ProductDetail, 'id' | 'title' | 'status' | 'brandId' | 'categoryId' | 'variants' | 'updatedAt'> & {
  coverUrl: string | null;
};

// A grade é da categoria, e o produto a herda (coluna `categories.grid` da API).
export type CategoryOption = SelectOption & {
  grid: SizeGridId;
};

export type ProductListItem = {
  id: string;
  title: string;
  brandId: string;
  brand: string;
  categoryId: string;
  category: string;
  status: ProductStatus;
  skus: readonly string[];
  variantsCount: number;
  totalStock: number;
  stockLevel: StockLevel;
  minPriceInCents: number | null;
  maxPriceInCents: number | null;
  coverUrl: string | null;
  updatedAt: string;
};
