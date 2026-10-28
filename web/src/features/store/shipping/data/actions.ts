'use server';

import { shippingEstimateSchema } from '@/features/store/shipping/model/schema';
import type { ShippingQuote } from '@/features/store/shipping/model/types';
import type { ActionResult } from '@/lib/action-result';

// Valida o CEP e não calcula: o frete ainda não existe na API.

export async function estimateShipping(
  _state: ActionResult<ShippingQuote[]> | null,
  formData: FormData,
): Promise<ActionResult<ShippingQuote[]>> {
  const parsed = shippingEstimateSchema.safeParse({ cep: formData.get('cep') });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'CEP inválido.' };
  }

  return { ok: false, error: 'Não foi possível calcular o frete agora. Tente de novo em instantes.' };
}
