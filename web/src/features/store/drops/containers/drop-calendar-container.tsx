import { DropCalendarSection } from '@/features/store/drops/components/calendar/drop-calendar-section';
import { getDropCalendar } from '@/features/store/drops/data/queries';

import { DropCalendarListContainer } from './drop-calendar-list-container';

type DropCalendarContainerProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export async function DropCalendarContainer({ eyebrow, title, description }: DropCalendarContainerProps) {
  const drops = await getDropCalendar();

  return drops.length > 0
    ? (
        <DropCalendarSection eyebrow={eyebrow} title={title} description={description}>
          <DropCalendarListContainer drops={drops} />
        </DropCalendarSection>
      )
    : null;
}
