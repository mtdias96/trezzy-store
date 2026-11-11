import type { ReactNode } from 'react';
import Link from 'next/link';

import { PageContainer } from '@/components/store/layout/page-container';
import { SectionHeading } from '@/components/store/layout/section-heading';
import { DROPS_HREF } from '@/features/store/drops/model/drop';

type DropCalendarSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function DropCalendarSection({ eyebrow, title, description, children }: DropCalendarSectionProps) {
  return (
    <section aria-labelledby="drop-calendar-title" className="bg-brand-950 py-16 clip-slant lg:py-35">
      <PageContainer>
        <SectionHeading
          id="drop-calendar-title"
          tone="dark"
          eyebrow={eyebrow}
          title={title}
          description={description}
          actions={(
            <Link
              href={DROPS_HREF}
              className="flex h-ctl-lg shrink-0 items-center self-start rounded-pill bg-gray-0 px-4.5 text-body font-bold text-ink transition-colors duration-base hover:bg-surface md:self-auto"
            >
              Calendário completo
            </Link>
          )}
        />
        {children}
      </PageContainer>
    </section>
  );
}
