import type { RefObject } from 'react';

import { type Countdown, toCountdown } from '@/lib/countdown';

import { useInView } from './use-in-view';
import { useNowInSeconds } from './use-now-in-seconds';

// null no servidor e na hidratação, que não podem ler a hora.
export function useCountdown(endsAt: string, ref: RefObject<Element | null>): Countdown | null {
  const now = useNowInSeconds(useInView(ref));

  return now === null ? null : toCountdown(Date.parse(endsAt) - now * 1000);
}
