import * as z from 'zod';

import { CEP_PATTERN } from '@/lib/cep';

export const shippingEstimateSchema = z.object({
  cep: z.string().regex(CEP_PATTERN, 'Digite um CEP com 8 números.'),
});
