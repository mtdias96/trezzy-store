'use server';

import { shippingEstimateSchema } from '@/features/store/shipping/model/schema';
import type { ShippingQuote } from '@/features/store/shipping/model/types';
import type { ActionResult } from '@/lib/action-result';

// Valida o CEP e não calcula: o frete ainda não existe na API.
// PRÉVIA (não commitar): opções de exemplo, com o frete grátis acima de R$ 299 da faixa de avisos.
const PREVIEW_QUOTES: ShippingQuote[] = [
  { id: 'pac', name: 'PAC', deadline: '5 a 8 dias úteis', priceInCents: 2290 },
  { id: 'sedex', name: 'SEDEX', deadline: '2 a 3 dias úteis', priceInCents: 3890 },
  { id: 'retirada', name: 'Retirar na loja', deadline: 'Pronto em 1 dia útil', priceInCents: 0 },
];

export async function estimateShipping(
  _state: ActionResult<ShippingQuote[]> | null,
  formData: FormData,
): Promise<ActionResult<ShippingQuote[]>> {
  const parsed = shippingEstimateSchema.safeParse({ cep: formData.get('cep') });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'CEP inválido.' };
  }

  return { ok: true, data: PREVIEW_QUOTES };
}
