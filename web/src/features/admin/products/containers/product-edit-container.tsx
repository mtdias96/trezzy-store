import { notFound } from 'next/navigation';

import { getProduct, listBrands, listCategories } from '@/features/admin/products/data/queries';

import { ProductFormContainer } from './product-form-container';

type ProductEditContainerProps = {
  params: Promise<{ id: string }>;
};

export async function ProductEditContainer({ params }: ProductEditContainerProps) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([getProduct(id), listBrands(), listCategories()]);

  if (!product) {
    notFound();
  }

  return <ProductFormContainer key={product.id} product={product} brands={brands} categories={categories} />;
}
