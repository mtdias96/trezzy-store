'use client';

import { ProductMedia } from '@/features/admin/products/components/media/product-media';
import { uploadProductImage } from '@/features/admin/products/data/upload';
import { useMediaUploads } from '@/features/admin/products/hooks/use-media-uploads';
import type { MediaItem } from '@/features/admin/products/model/media';
import type { ProductMediaFile } from '@/features/admin/products/model/types';

type ProductMediaContainerProps = {
  initialMedia?: readonly ProductMediaFile[];
};

function toMediaItem({ id, url }: ProductMediaFile): MediaItem {
  return { id, mediaId: id, name: url.split('/').at(-1) ?? id, previewUrl: url, status: 'done', progress: 100 };
}

export function ProductMediaContainer({ initialMedia = [] }: ProductMediaContainerProps) {
  const { items, rejections, addFiles, remove, reorder } = useMediaUploads(uploadProductImage, initialMedia.map(toMediaItem));

  return (
    <ProductMedia items={items} rejections={rejections} onFiles={addFiles} onRemove={remove} onReorder={reorder} />
  );
}
