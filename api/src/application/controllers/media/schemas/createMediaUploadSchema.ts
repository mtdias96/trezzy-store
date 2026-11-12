import * as z from 'zod';

import { MEDIA_CONTENT_TYPES, MEDIA_MAX_SIZE_BYTES } from '@application/entities/Media';

export const createMediaUploadSchema = z.object({
  contentType: z.enum(MEDIA_CONTENT_TYPES),
  sizeBytes: z.number().int().positive().max(MEDIA_MAX_SIZE_BYTES),
});

export type CreateMediaUploadBody = z.infer<typeof createMediaUploadSchema>;
