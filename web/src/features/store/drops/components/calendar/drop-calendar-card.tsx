import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';

import { DropReminderButton } from '@/features/store/drops/components/hero/drop-reminder-button';
import { dropReminderKey } from '@/features/store/drops/model/drop';
import type { CalendarDrop } from '@/features/store/drops/model/types';

type DropCalendarCardProps = {
  drop: CalendarDrop;
  imageSizes: string;
};

const STATUS = {
  upcoming: { label: 'Em breve', className: 'bg-brand text-gray-0' },
  available: { label: 'Disponível', className: 'bg-success-500 text-gray-0' },
  'sold-out': { label: 'Esgotado', className: 'bg-line text-ink' },
} satisfies Record<CalendarDrop['status'], { label: string; className: string }>;

function DropAction({ drop }: { drop: CalendarDrop }) {
  if (drop.status === 'upcoming') {
    return <DropReminderButton storageKey={dropReminderKey(drop.number)} variant="card" />;
  }

  if (drop.status === 'available') {
    return (
      <Link href={drop.href} className="flex h-ctl-lg items-center rounded-lg bg-lime px-3.5 text-body font-bold text-ink transition-colors duration-base hover:bg-lime-500">
        Comprar agora
        <span className="sr-only">{`: ${drop.title}`}</span>
      </Link>
    );
  }

  return <p className="flex h-ctl-lg items-center rounded-lg border border-gray-0/15 px-3.5 text-body font-bold text-on-dark-muted">Esgotado</p>;
}

export function DropCalendarCard({ drop, imageSizes }: DropCalendarCardProps) {
  const status = STATUS[drop.status];

  return (
    <article className="flex h-full flex-col">
      <div className="relative aspect-4/5 overflow-hidden rounded-tile bg-gray-0/10">
        {drop.imageUrl
          ? <Image src={drop.imageUrl} alt="" fill sizes={imageSizes} className="object-cover" />
          : <ImageIcon aria-hidden className="absolute inset-0 m-auto size-7 text-on-dark-muted/60" />}
        <span className={`absolute top-2.5 left-2.5 rounded-tag px-2 py-1.5 text-tag uppercase ${status.className}`}>{status.label}</span>
        <span className="absolute right-2.5 bottom-2.5 rounded-tag bg-ink/60 px-2 py-1 text-caption leading-tight font-bold tracking-wide text-gray-0">{drop.stockLabel}</span>
      </div>
      <div className="flex flex-1 flex-col px-0.5 pt-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-2">
          <p className="text-micro font-bold whitespace-nowrap text-brand-300 uppercase">{drop.numberLabel}</p>
          <p className="text-micro font-bold whitespace-nowrap text-on-dark-muted">{drop.dateLabel}</p>
        </div>
        <h3 className="mt-2 text-price tracking-normal text-gray-0">{drop.title}</h3>
        <p className="mt-1.5 text-body-sm text-on-dark-muted">{drop.subtitle}</p>
        <div className="mt-auto pt-3.75">
          <DropAction drop={drop} />
        </div>
      </div>
    </article>
  );
}
