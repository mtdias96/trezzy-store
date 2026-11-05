'use client';

import { CalendarIcon } from 'lucide-react';

import { useClientValue } from '@/hooks/use-client-value';
import { formatShortDate } from '@/lib/date';

export function PanelToday() {
  const today = useClientValue(() => formatShortDate(new Date()), null);

  return (
    <div className="hidden items-center gap-2.5 xl:flex">
      <span className="flex size-9 items-center justify-center rounded-xl border border-gray-250 bg-gray-100 text-ink">
        <CalendarIcon aria-hidden className="size-4" />
      </span>
      {today === null
        ? <span className="h-4 w-20 animate-skeleton rounded-md bg-muted" />
        : <span className="text-body font-semibold whitespace-nowrap text-ink">{today}</span>}
    </div>
  );
}
