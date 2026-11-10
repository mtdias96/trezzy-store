import 'server-only';

import * as z from 'zod';

import { http, HttpError } from '@/lib/http';
import { internalPathSchema } from '@/lib/internal-path';

// Contrato das rotas públicas de drops. Ainda não existem na API (web/AGENTS.md, Pendências).

const dropSchema = z.object({
  number: z.number().int().positive(),
  brand: z.string(),
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

const calendarDropBaseSchema = z.object({
  number: z.number().int().positive(),
  brand: z.string(),
  title: z.string(),
  startsAt: z.iso.datetime({ offset: true }),
  priceInCents: z.number().int().positive(),
  // true: o preço é o menor de vários modelos ("A partir de").
  priceIsFrom: z.boolean(),
  imageUrl: z.url().nullable(),
  href: internalPathSchema,
});

const calendarDropSchema = z.discriminatedUnion('status', [
  calendarDropBaseSchema.extend({ status: z.literal('upcoming'), quantity: z.number().int().positive(), unit: z.enum(['pair', 'piece']) }),
  calendarDropBaseSchema.extend({ status: z.literal('available'), remaining: z.number().int().positive() }),
  calendarDropBaseSchema.extend({ status: z.literal('sold-out'), soldOutAfterMinutes: z.number().int().positive() }),
]);

export type CalendarDropDto = z.infer<typeof calendarDropSchema>;

// GET /store/drops/calendar?limit={n} → { drops }, na ordem do calendário
export async function fetchDropCalendar(limit: number): Promise<CalendarDropDto[]> {
  const { drops } = await http(`/store/drops/calendar?limit=${limit}`, { schema: z.object({ drops: z.array(calendarDropSchema) }) });

  return drops;
}
