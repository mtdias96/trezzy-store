import 'server-only';

import * as z from 'zod';

import { authorizedHttp } from '@/features/shared/auth/session/authorized-http';

// Strings soltas, e não um enum: uma permissão nova na API não pode derrubar o painel antes do front conhecê-la.
const myPermissionsSchema = z.object({
  permissions: z.array(z.string()),
});

export function fetchMyPermissions() {
  return authorizedHttp('/me/permissions', { schema: myPermissionsSchema });
}
