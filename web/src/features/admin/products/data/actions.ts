'use server';

import { revalidateTag } from 'next/cache';
import * as z from 'zod';

import { mediaIdSchema, mediaUploadSchema, productCreateSchema } from '@/features/admin/products/model/schema';
import { requireAdminSession } from '@/features/shared/auth/session/session';
import type { ActionResult } from '@/lib/action-result';
import { HttpError, isRequestFailure } from '@/lib/http';

import { confirmMediaUpload, createMediaUpload, createProduct as createProductRequest } from './api';

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

const SAVE_UNAVAILABLE = 'Não foi possível salvar agora. Tente de novo em instantes.';
const REVIEW_FIELDS = 'Revise os campos destacados.';

// A API responde em inglês: as mensagens que o admin pode corrigir viram pt-BR, o resto vira um aviso genérico.
const API_MESSAGES: Record<string, string> = {
  'Brand not found.': 'Marca não encontrada.',
  'Category not found.': 'Categoria não encontrada.',
  'A product with this title already exists for this brand.': 'Já existe um produto com esse título nessa marca.',
  'SKU already in use.': 'SKU já usado em outro produto.',
  'SKU is repeated in this product.': 'SKU repetido neste produto.',
  'Size and color are repeated in this product.': 'Tamanho e cor repetidos neste produto.',
  'An active product needs at least one photo.': 'Produto ativo precisa de pelo menos uma foto.',
  'Media not found.': 'Foto não encontrada: envie de novo.',
  'Media upload is not confirmed.': 'O envio da foto não terminou: envie de novo.',
  'Media is already in use.': 'Foto já usada em outro produto.',
  'Title must contain a letter or a number.': 'Use pelo menos uma letra ou um número.',
  'Photo is repeated in this product.': 'Foto repetida neste produto.',
  'A product has at most 10 photos.': 'Use até 10 fotos.',
};

// O `Size must be one of: …` leva a grade no fim do texto.
function translateApiMessage(message: string): string {
  if (message.startsWith('Size must be one of:')) {
    return `Fora da grade da categoria (${message.slice('Size must be one of:'.length).trim().replace(/\.$/, '')}).`;
  }

  return API_MESSAGES[message] ?? 'Valor inválido.';
}

// 409: dois cadastros ao mesmo tempo, e o segundo esbarrou no unique.
const CONFLICT_MESSAGES: Record<string, string> = {
  'A product with this title was just created.': 'Outro cadastro com esse título acabou de ser salvo. Troque o título e salve de novo.',
  'SKU already in use.': 'Um dos SKUs acabou de ser usado em outro produto. Troque o SKU e salve de novo.',
  'A photo is already in use by another product.': 'Uma das fotos acabou de ser usada em outro produto. Troque a foto e salve de novo.',
};

const apiConflictSchema = z.object({ error: z.object({ code: z.literal('CONFLICT'), message: z.string() }) });

const apiValidationSchema = z.object({
  error: z.object({
    code: z.literal('VALIDATION'),
    message: z.array(z.object({ field: z.string(), error: z.string() })),
  }),
});

function toFieldErrors(issues: readonly { field: string; error: string }[]): Partial<Record<string, string[]>> {
  const fieldErrors: Partial<Record<string, string[]>> = {};

  for (const { field, error } of issues) {
    fieldErrors[field] = [...(fieldErrors[field] ?? []), error];
  }

  return fieldErrors;
}

export async function createProduct(_state: ActionResult | null, input: unknown): Promise<ActionResult> {
  const parsed = productCreateSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: REVIEW_FIELDS,
      fieldErrors: toFieldErrors(parsed.error.issues.map(({ path, message }) => ({ field: path.join('.'), error: message }))),
    };
  }

  await requireAdminSession();

  try {
    await createProductRequest(parsed.data);
  } catch (error) {
    if (!isRequestFailure(error)) {
      throw error;
    }

    const validation = error instanceof HttpError ? apiValidationSchema.safeParse(error.payload) : null;

    if (validation?.success) {
      return {
        ok: false,
        error: REVIEW_FIELDS,
        fieldErrors: toFieldErrors(
          validation.data.error.message.map(({ field, error: message }) => ({
            field,
            error: translateApiMessage(message),
          })),
        ),
      };
    }

    const conflict = error instanceof HttpError ? apiConflictSchema.safeParse(error.payload) : null;

    if (conflict?.success) {
      return { ok: false, error: CONFLICT_MESSAGES[conflict.data.error.message] ?? SAVE_UNAVAILABLE };
    }

    return { ok: false, error: SAVE_UNAVAILABLE };
  }

  // A vitrine guarda as listas por horas: sem isso, o produto novo só aparece quando a entrada vencer.
  revalidateTag('catalog', 'max');

  return { ok: true, data: undefined };
}
