import type { NextRequest } from 'next/server';

import { guardPanel } from '@/features/shared/auth/session/guard';

export function proxy(request: NextRequest) {
  return guardPanel(request);
}

export const config = {
  matcher: ['/admin/:path*'],
};
