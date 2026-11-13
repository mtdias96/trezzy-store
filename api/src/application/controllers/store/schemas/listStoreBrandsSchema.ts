import * as z from 'zod';

export const listStoreBrandsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(48).default(24),
});

export type ListStoreBrandsQuery = z.infer<typeof listStoreBrandsSchema>;
