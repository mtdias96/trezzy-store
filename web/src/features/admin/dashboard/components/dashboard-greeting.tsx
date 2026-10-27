'use client';

import { useClientValue } from '@/hooks/use-client-value';
import { greetingFor } from '@/lib/date';

export function DashboardGreeting() {
  const greeting = useClientValue(() => greetingFor(new Date()), null);

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-center gap-3">
        {greeting === null
          ? <span className="h-6 w-36 animate-skeleton rounded-md bg-muted" />
          : <p className="truncate type-display text-display-md">{greeting}</p>}
        <span aria-hidden className="hidden rotate-sticker font-hand text-hand text-brand sm:inline">
          Bora vender!
        </span>
      </div>
      <p className="hidden truncate text-body-sm text-muted-foreground sm:block">
        Veja o que está acontecendo na loja hoje.
      </p>
    </div>
  );
}
