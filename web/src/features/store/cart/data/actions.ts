'use server';

import * as z from 'zod';

import type { ActionResult } from '@/lib/action-result';

const addToBagSchema = z.object({ variantId: z.string().min(1) });

// Valida e não guarda: o carrinho ainda não existe na API.
export async function addToBag(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = addToBagSchema.safeParse({ variantId: formData.get('variantId') });

  if (!parsed.success) {
    return { ok: false, error: 'Escolha um tamanho para continuar.' };
  }

  return { ok: false, error: 'Não foi possível adicionar à sacola agora. Tente de novo em instantes.' };
}
