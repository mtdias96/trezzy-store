import type { Ref } from 'react';

import type { CalendarDrop } from '@/features/store/drops/model/types';

import { DropCalendarCard } from './drop-calendar-card';

type DropCalendarListProps = {
  ref?: Ref<HTMLUListElement>;
  drops: readonly CalendarDrop[];
};

const CARD_IMAGE_SIZES = '(min-width: 1440px) 335px, (min-width: 640px) 23vw, 46vw';

export function DropCalendarList({ ref, drops }: DropCalendarListProps) {
  return (
    <ul ref={ref} className="mt-5 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 lg:mt-7">
      {drops.map((drop) => (
        <li key={drop.number}>
          <DropCalendarCard drop={drop} imageSizes={CARD_IMAGE_SIZES} />
        </li>
      ))}
    </ul>
  );
}
