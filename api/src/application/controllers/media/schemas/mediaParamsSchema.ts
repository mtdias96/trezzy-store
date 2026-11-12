import * as z from 'zod';

export const mediaParamsSchema = z.object({
  id: z.uuid(),
});

export type MediaParams = z.infer<typeof mediaParamsSchema>;
