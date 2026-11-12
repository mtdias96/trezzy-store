import { randomUUID } from 'node:crypto';

import { mbToBytes } from '@shared/utils/mbToBytes';

// Os mesmos limites dos checks da tabela `media`.
export const MEDIA_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MEDIA_MAX_SIZE_BYTES = mbToBytes(10);

const EXTENSION_BY_CONTENT_TYPE: Record<Media.ContentType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Assinatura de cada formato: o Content-Type é declarado por quem envia, os primeiros bytes são o arquivo de verdade.
// `null` é um byte qualquer (no WebP, o tamanho do bloco RIFF).
const SIGNATURE_BY_CONTENT_TYPE: Record<Media.ContentType, readonly (number | null)[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  'image/webp': [0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50],
};

export const MEDIA_SIGNATURE_MAX_BYTES = Math.max(
  ...Object.values(SIGNATURE_BY_CONTENT_TYPE).map((signature) => signature.length),
);

export class Media {
  readonly id: string;
  readonly key: string;
  readonly contentType: Media.ContentType;
  readonly sizeBytes: number;
  readonly uploadedAt: Date | null;

  // Reidrata do banco, sem gerar nada. Mídia nova nasce pelo `create`.
  constructor(attr: Media.Attributes) {
    this.id = attr.id;
    this.key = attr.key;
    this.contentType = attr.contentType;
    this.sizeBytes = attr.sizeBytes;
    this.uploadedAt = attr.uploadedAt;
  }

  // O prefixo `uploads/` guarda o arquivo como foi enviado: um processamento futuro filtra o evento do S3 por ele.
  static create({ contentType, sizeBytes }: Media.CreateInput): Media {
    const id = randomUUID();

    return new Media({
      id,
      key: `uploads/${id}.${EXTENSION_BY_CONTENT_TYPE[contentType]}`,
      contentType,
      sizeBytes,
      uploadedAt: null,
    });
  }

  matchesSignature(firstBytes: Uint8Array): boolean {
    const signature = SIGNATURE_BY_CONTENT_TYPE[this.contentType];

    return (
      firstBytes.length >= signature.length &&
      signature.every((byte, index) => byte === null || firstBytes[index] === byte)
    );
  }
}

export namespace Media {
  export type ContentType = (typeof MEDIA_CONTENT_TYPES)[number];

  export type Attributes = {
    id: string;
    key: string;
    contentType: ContentType;
    sizeBytes: number;
    uploadedAt: Date | null;
  };

  export type CreateInput = {
    contentType: ContentType;
    sizeBytes: number;
  };
}
