import Link from 'next/link';
import { UserIcon } from 'lucide-react';

import { pendingRoute } from '@/lib/route';

export function AccountLink() {
  return (
    <Link
      href={pendingRoute('/conta')}
      aria-label="Minha conta"
      className="flex size-11 shrink-0 items-center justify-center rounded-pill transition-colors duration-base hover:bg-ink-soft"
    >
      <UserIcon aria-hidden className="size-5" />
    </Link>
  );
}
