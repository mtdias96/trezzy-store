import 'server-only';

import * as z from 'zod';

import { http, HttpError } from '@/lib/http';

// Contrato da rota pública do próximo drop. Ainda não existe na API (web/AGENTS.md, Pendências).

const dropSchema = z.object({
  number: z.number().int().positive(),
  title: z.string(),
  description: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  imageUrl: z.url(),
  imageAlt: z.string(),
  sticker: z.string().nullable(),
});

export type DropDto = z.infer<typeof dropSchema>;

// GET /store/drops/next → { drop }, ou 404 quando não há drop marcado
export async function fetchNextDrop(): Promise<DropDto | null> {
  try {
    const { drop } = await http('/store/drops/next', { schema: z.object({ drop: dropSchema }) });

    return drop;
  } catch (error) {
    if (error instanceof HttpError && error.status === 404) {
      return null;
    }

    throw error;
  }
}
