import 'server-only';

import { toProductListItem } from '@/features/admin/products/model/list';
import type {
  CategoryOption,
  ProductDetail,
  ProductListItem,
  SelectOption,
} from '@/features/admin/products/model/types';
import { requireAdminSession } from '@/features/shared/auth/session/session';

import { fetchBrands, fetchCategories, fetchProduct, fetchProducts } from './api';

export async function listBrands(): Promise<SelectOption[]> {
  await requireAdminSession();

  return (await fetchBrands()).map(({ id, name }) => ({ value: id, label: name }));
}

export async function listCategories(): Promise<CategoryOption[]> {
  await requireAdminSession();

  return (await fetchCategories()).map(({ id, name, grid }) => ({ value: id, label: name, grid }));
}

export async function listProducts(): Promise<ProductListItem[]> {
  await requireAdminSession();

  const [products, brands, categories] = await Promise.all([fetchProducts(), listBrands(), listCategories()]);

  return products.map((product) => toProductListItem(product, brands, categories));
}

// A grade vem da categoria do produto; sem a categoria na lista, o cadastro abre em tamanho único.
export async function getProduct(id: string): Promise<ProductDetail | null> {
  await requireAdminSession();

  const [product, categories] = await Promise.all([fetchProduct(id), listCategories()]);

  if (!product) {
    return null;
  }

  return { ...product, sizeGrid: categories.find(({ value }) => value === product.categoryId)?.grid ?? 'one' };
}
