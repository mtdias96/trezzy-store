import { ProductEditor } from '@/features/admin/products/components/editor/product-editor';
import { ProductVariantsFields } from '@/features/admin/products/components/variants/product-variants-fields';
import { listBrands, listCategories } from '@/features/admin/products/data/queries';

import { ProductMediaContainer } from './product-media-container';

export async function ProductNewContainer() {
  const [brands, categories] = await Promise.all([listBrands(), listCategories()]);

  return (
    <ProductEditor
      brands={brands}
      categories={categories}
      media={<ProductMediaContainer />}
      variants={<ProductVariantsFields defaultSizeGrid="one" variants={[]} />}
    />
  );
}
