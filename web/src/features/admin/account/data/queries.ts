import 'server-only';

import { initialsFromEmail } from '@/features/admin/account/model/initials';
import { requireAdminSession } from '@/features/shared/auth/session/session';

import { fetchMe } from './api';

export async function getPanelAccount(): Promise<{ email: string; initials: string }> {
  await requireAdminSession();

  const { email } = await fetchMe();

  return { email, initials: initialsFromEmail(email) };
}
