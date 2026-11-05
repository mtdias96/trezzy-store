import 'server-only';

import * as z from 'zod';

import { authorizedHttp } from '@/features/shared/auth/session/authorized-http';

const meSchema = z.object({
  email: z.email(),
});

export function fetchMe() {
  return authorizedHttp('/me', { schema: meSchema });
}
