import type { MediaUploader } from '@/features/admin/products/model/media';
import { uploadWithProgress } from '@/lib/upload';

import { finishMediaUpload, startMediaUpload } from './actions';

// Roda no browser: a foto vai direto para o S3 pela URL pré-assinada, sem passar pelo Next. As actions só pedem a URL
// e confirmam o envio.
export const uploadProductImage: MediaUploader = async (file, { onProgress, signal }) => {
  const started = await startMediaUpload({ contentType: file.type, sizeBytes: file.size });

  if (!started.ok) {
    throw new Error(started.error);
  }

  await uploadWithProgress(started.data.uploadUrl, file, { onProgress, signal });

  const finished = await finishMediaUpload(started.data.mediaId);

  if (!finished.ok) {
    throw new Error(finished.error);
  }

  return { mediaId: started.data.mediaId };
};
