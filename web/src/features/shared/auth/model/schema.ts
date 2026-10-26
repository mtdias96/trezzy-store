import * as z from 'zod';

import { toPanelPath } from '@/features/shared/auth/model/paths';

export const signInSchema = z.object({
  email: z.string().trim().min(1, 'Informe o e-mail.').toLowerCase().pipe(z.email('Informe um e-mail válido.')),
  password: z.string().min(1, 'Informe a senha.').max(256, 'A senha passou do tamanho máximo.'),
  // O checkbox marcado envia "on"; desmarcado, não envia nada.
  remember: z.literal('on').optional().transform((value) => value === 'on'),
  next: z.string().optional().transform(toPanelPath),
});

export type SignInInput = z.infer<typeof signInSchema>;
