'use server';

import { mediaIdSchema, mediaUploadSchema } from '@/features/admin/products/model/schema';
import { requireAdminSession } from '@/features/shared/auth/session/session';
import type { ActionResult } from '@/lib/action-result';
import { isRequestFailure } from '@/lib/http';

import { confirmMediaUpload, createMediaUpload } from './api';

const UPLOAD_UNAVAILABLE = 'Não foi possível enviar a foto agora. Tente de novo em instantes.';

export async function startMediaUpload(input: unknown): Promise<ActionResult<{ mediaId: string; uploadUrl: string }>> {
  const parsed = mediaUploadSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, error: 'Use JPG, PNG ou WEBP de até 10 MB.' };
  }

  await requireAdminSession();

  try {
    const { id, uploadUrl } = await createMediaUpload(parsed.data);

    return { ok: true, data: { mediaId: id, uploadUrl } };
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    return { ok: false, error: UPLOAD_UNAVAILABLE };
  }
}

export async function finishMediaUpload(mediaId: unknown): Promise<ActionResult> {
  const parsed = mediaIdSchema.safeParse(mediaId);

  if (!parsed.success) {
    return { ok: false, error: UPLOAD_UNAVAILABLE };
  }

  await requireAdminSession();

  try {
    await confirmMediaUpload(parsed.data);

    return { ok: true, data: undefined };
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    return { ok: false, error: UPLOAD_UNAVAILABLE };
  }
}
