import { notFound } from 'next/navigation';

import { ProductEditor } from '@/features/admin/products/components/editor/product-editor';
import { ProductVariantsFields } from '@/features/admin/products/components/variants/product-variants-fields';
import { getProduct, listBrands, listCategories } from '@/features/admin/products/data/queries';

import { ProductMediaContainer } from './product-media-container';

type ProductEditContainerProps = {
  params: Promise<{ id: string }>;
};

export async function ProductEditContainer({ params }: ProductEditContainerProps) {
  const { id } = await params;
  const [product, brands, categories] = await Promise.all([getProduct(id), listBrands(), listCategories()]);

  if (!product) {
    notFound();
  }

  return (
    <ProductEditor
      product={product}
      brands={brands}
      categories={categories}
      media={<ProductMediaContainer key={product.id} initialMedia={product.media} />}
      variants={<ProductVariantsFields defaultSizeGrid={product.sizeGrid} variants={product.variants} />}
    />
  );
}
