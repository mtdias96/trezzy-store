'use server';

import { newsletterSchema } from '@/features/store/newsletter/model/schema';
import type { ActionResult } from '@/lib/action-result';

// Valida e não guarda: a newsletter ainda não existe na API.
export async function subscribeToNewsletter(_state: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const email = formData.get('email');
  const parsed = newsletterSchema.safeParse({ email });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Digite um e-mail válido.',
      values: { email: typeof email === 'string' ? email : '' },
    };
  }

  return { ok: false, error: 'Não foi possível assinar agora. Tente de novo em instantes.', values: { email: parsed.data.email } };
}
