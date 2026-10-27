import { useRef, useState } from 'react';

import {
  type MediaItem,
  type MediaRejection,
  type MediaUploader,
  moveMedia,
  updateMedia,
  validateMediaFile,
} from '@/features/admin/products/model/media';

type Upload = {
  controller: AbortController;
  previewUrl: string;
};

// Sem cleanup em effect: com o cacheComponents, o Next esconde a página com <Activity> ao navegar, roda os cleanups e
// guarda o estado. Cancelar os envios ou revogar as prévias ali quebraria a lista quando a página voltasse.
export function useMediaUploads(upload: MediaUploader) {
  const [items, setItems] = useState<readonly MediaItem[]>([]);
  const [rejections, setRejections] = useState<readonly MediaRejection[]>([]);
  const uploads = useRef(new Map<string, Upload>());

  function update(id: string, patch: Partial<MediaItem>) {
    setItems((current) => updateMedia(current, id, patch));
  }

  function start(id: string, file: File, signal: AbortSignal) {
    upload(file, { signal, onProgress: (progress) => update(id, { progress }) }).then(
      () => update(id, { status: 'done', progress: 100 }),
      () => {
        if (!signal.aborted) {
          update(id, { status: 'error' });
        }
      },
    );
  }

  function addFiles(files: readonly File[]) {
    const added: MediaItem[] = [];
    const rejected: MediaRejection[] = [];

    for (const file of files) {
      const reason = validateMediaFile(file);

      if (reason) {
        rejected.push({ name: file.name, reason });
        continue;
      }

      const id = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      const controller = new AbortController();

      uploads.current.set(id, { controller, previewUrl });
      added.push({ id, name: file.name, previewUrl, status: 'uploading', progress: 0 });
      start(id, file, controller.signal);
    }

    setRejections(rejected);
    setItems((current) => [...current, ...added]);
  }

  function remove(id: string) {
    const removed = uploads.current.get(id);

    if (removed) {
      removed.controller.abort();
      URL.revokeObjectURL(removed.previewUrl);
      uploads.current.delete(id);
    }

    setItems((current) => current.filter((item) => item.id !== id));
  }

  function reorder(activeId: string, overId: string) {
    setItems((current) => moveMedia(current, activeId, overId));
  }

  return { items, rejections, addFiles, remove, reorder };
}
