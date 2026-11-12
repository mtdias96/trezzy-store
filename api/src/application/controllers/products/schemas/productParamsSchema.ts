import * as z from 'zod';

export const productParamsSchema = z.object({
  id: z.uuid(),
});

export type ProductParams = z.infer<typeof productParamsSchema>;
