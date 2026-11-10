import * as z from 'zod';

export const newsletterSchema = z.object({
  email: z.string('Digite seu e-mail.').trim().min(1, 'Digite seu e-mail.').toLowerCase().pipe(z.email('Digite um e-mail válido.')),
});
