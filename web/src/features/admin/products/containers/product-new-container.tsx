import { listBrands, listCategories } from '@/features/admin/products/data/queries';

import { ProductFormContainer } from './product-form-container';

export async function ProductNewContainer() {
  const [brands, categories] = await Promise.all([listBrands(), listCategories()]);

  return <ProductFormContainer brands={brands} categories={categories} />;
}
