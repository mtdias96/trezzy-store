'use client';

import { ProductMedia } from '@/features/admin/products/components/media/product-media';
import { uploadProductImage } from '@/features/admin/products/data/upload';
import { useMediaUploads } from '@/features/admin/products/hooks/use-media-uploads';

export function ProductMediaContainer() {
  const { items, rejections, addFiles, remove, reorder } = useMediaUploads(uploadProductImage);

  return (
    <ProductMedia items={items} rejections={rejections} onFiles={addFiles} onRemove={remove} onReorder={reorder} />
  );
}
