import * as z from 'zod';

import { MEDIA_ACCEPTED_TYPES, MEDIA_MAX_BYTES } from './media';

// Os mesmos limites da tabela `media` da API: o pedido de upload é recusado antes de chegar a ela.
export const mediaUploadSchema = z.object({
  contentType: z.enum(MEDIA_ACCEPTED_TYPES),
  sizeBytes: z.number().int().positive().max(MEDIA_MAX_BYTES),
});

export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;

export const mediaIdSchema = z.string().min(1);
