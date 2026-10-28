'use client';

import { useClientValue } from '@/hooks/use-client-value';
import { formatShortDate, formatTimeAgo } from '@/lib/date';

type RelativeDateProps = {
  date: string;
};

// O servidor não lê a hora numa página cacheada: ele e a hidratação mostram a data, e o navegador troca pelo relativo.
export function RelativeDate({ date }: RelativeDateProps) {
  const label = useClientValue(() => formatTimeAgo(new Date(date), new Date()), formatShortDate(new Date(date)));

  return <time dateTime={date}>{label}</time>;
}
