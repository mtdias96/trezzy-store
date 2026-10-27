// Os mesmos limites da tabela `media` da API (content type e tamanho).
export const MEDIA_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MEDIA_MAX_BYTES = 10 * 1024 * 1024;

export type MediaStatus = 'uploading' | 'done' | 'error';

export type MediaItem = {
  id: string;
  name: string;
  previewUrl: string;
  status: MediaStatus;
  progress: number;
};

export type MediaRejection = {
  name: string;
  reason: string;
};

export type MediaUploader = (
  file: File,
  options: { onProgress: (percent: number) => void; signal: AbortSignal },
) => Promise<void>;

export function updateMedia(items: readonly MediaItem[], id: string, patch: Partial<MediaItem>): readonly MediaItem[] {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function moveMedia(items: readonly MediaItem[], activeId: string, overId: string): readonly MediaItem[] {
  const from = items.findIndex(({ id }) => id === activeId);
  const to = items.findIndex(({ id }) => id === overId);

  if (from === -1 || to === -1 || from === to) {
    return items;
  }

  const next = [...items];
  next.splice(to, 0, ...next.splice(from, 1));

  return next;
}

function isAcceptedType(type: string): boolean {
  return MEDIA_ACCEPTED_TYPES.some((accepted) => accepted === type);
}

export function validateMediaFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (!isAcceptedType(file.type)) {
    return 'formato não aceito (use JPG, PNG ou WEBP)';
  }

  if (file.size > MEDIA_MAX_BYTES) {
    return 'passa de 10 MB';
  }

  return null;
}

export function formatImageCount(count: number): string {
  if (count === 0) {
    return 'Nenhuma imagem';
  }

  return count === 1 ? '1 imagem' : `${count} imagens`;
}
