import * as z from 'zod';

import { colorNameSchema } from './createProductSchema';

export const setProductColorwaySchema = z.object({
  colorName: colorNameSchema,
  // Ausente: fica na família atual. null: sai dela. Um id: entra na família desse produto.
  familyOf: z.uuid().transform((productId) => productId.toLowerCase()).nullable().optional(),
});

export type SetProductColorwayBody = z.infer<typeof setProductColorwaySchema>;
