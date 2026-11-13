import * as z from 'zod';

export const storeProductParamsSchema = z.object({
  slug: z.string().max(80).regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
});

export type StoreProductParams = z.infer<typeof storeProductParamsSchema>;
