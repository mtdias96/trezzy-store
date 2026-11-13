import * as z from 'zod';

const MAX_LIST_ITEMS = 20;

// O HTTP API v2 junta parâmetros repetidos (?size=M&size=G) com vírgula: chega "M,G".
function commaList(item: z.ZodString) {
  return z
    .string()
    .transform((value) => value.split(',').filter((part) => part !== ''))
    .pipe(z.array(item).max(MAX_LIST_ITEMS))
    .default([]);
}

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/);
const cents = z.coerce.number().int().nonnegative();

export const listStoreProductsSchema = z.object({
  category: commaList(slug),
  brand: commaList(slug),
  size: commaList(z.string().max(10)),
  priceAboveInCents: cents.optional(),
  priceUpToInCents: cents.optional(),
  sort: z.enum(['relevance', 'newest', 'best-selling', 'price-asc', 'price-desc']).default('relevance'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(24),
});

export type ListStoreProductsQuery = z.infer<typeof listStoreProductsSchema>;
