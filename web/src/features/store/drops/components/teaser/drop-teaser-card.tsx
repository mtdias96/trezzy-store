import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { Countdown } from '@/components/store/data-display/countdown';
import { NavigationMenuLink } from '@/components/ui/navigation-menu';
import { DROPS_HREF } from '@/features/store/drops/model/drop';
import type { Drop } from '@/features/store/drops/model/types';

type DropTeaserCardProps = {
  drop: Drop;
};

// Card do drop no painel do mega menu: só vive dentro do NavigationMenu (o link fecha o painel ao navegar).
export function DropTeaserCard({ drop }: DropTeaserCardProps) {
  return (
    <div className="flex w-64 shrink-0 flex-col rounded-card bg-brand-950 p-5 text-gray-0 xl:w-70">
      <span className="self-start rounded-pill bg-brand px-2.5 py-1 text-micro font-extrabold uppercase">
        {drop.shortLabel}
      </span>
      <p className="mt-6 type-display text-display-md xl:text-display-lg">{drop.title}</p>
      <p className="mt-auto pt-8 text-display-md font-bold text-brand-300">
        <span className="sr-only">Começa em </span>
        <Countdown endsAt={drop.startsAt} />
      </p>
      <NavigationMenuLink
        render={<Link href={DROPS_HREF} />}
        className="mt-5 flex h-ctl-lg items-center justify-between rounded-xl bg-gray-0 px-4 text-body font-bold text-ink transition-colors duration-base hover:bg-paper-stone"
      >
        Ver drops
        <ArrowRightIcon aria-hidden className="size-4" />
      </NavigationMenuLink>
    </div>
  );
}
