'use client';

import { useRef } from 'react';

import { DropCalendarList } from '@/features/store/drops/components/calendar/drop-calendar-list';
import { useLiveDropCalendar } from '@/features/store/drops/hooks/use-live-drop-calendar';
import type { CalendarDrop } from '@/features/store/drops/model/types';

type DropCalendarListContainerProps = {
  drops: readonly CalendarDrop[];
};

export function DropCalendarListContainer({ drops }: DropCalendarListContainerProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const liveDrops = useLiveDropCalendar(drops, listRef);

  return <DropCalendarList ref={listRef} drops={liveDrops} />;
}
