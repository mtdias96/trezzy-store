import { Fragment } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { CountdownBlocks } from '@/components/store/data-display/countdown-blocks';
import { dropReminderKey, DROPS_HREF } from '@/features/store/drops/model/drop';
import type { Drop } from '@/features/store/drops/model/types';
import { twoDigits, words } from '@/lib/text';

import { DropHeroPhoto } from './drop-hero-photo';
import { DropReminderButton } from './drop-reminder-button';

type DropHeroProps = {
  drop: Drop;
};

// No lg a foto sai do fluxo e fica por baixo da metade direita do texto: o título invade o lado que o degradê escurece.
// O pb abre espaço para a fita, que sobe e cruza a base do hero (RibbonDivider com overlap).
export function DropHero({ drop }: DropHeroProps) {
  const titleWords = words(drop.title);
  const lastIndex = titleWords.length - 1;

  return (
    <section
      aria-labelledby="drop-hero-title"
      className="relative mx-auto max-w-360 overflow-hidden bg-brand-950 text-gray-0"
    >
      <DropHeroPhoto
        src={drop.imageUrl}
        alt={drop.imageAlt}
        number={twoDigits(drop.number)}
        sticker={drop.sticker}
        caption={drop.caption}
      />
      <div className="@container relative -mt-16 px-4 pb-24 sm:px-6 lg:mt-0 lg:w-1/2 lg:px-8 lg:pt-18 lg:pb-40">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <p className="flex items-center gap-2 rounded-pill bg-brand px-3 py-1.5 text-micro font-extrabold uppercase">
            <span aria-hidden className="size-1.5 rounded-pill bg-brand-200" />
            {drop.longLabel}
          </p>
          <p className="-rotate-3 font-hand text-hand text-brand-300">não pisca</p>
        </div>
        {/* O espaço entre as palavras mantém o título lido como "Runner 03 Lima Ácida". */}
        <h2 id="drop-hero-title" className="mt-5 type-display text-display-hero wrap-break-word">
          {titleWords.map((word, index) => (
            <Fragment key={`${index}-${word}`}>
              {index > 0 ? ' ' : null}
              {index === lastIndex && index > 0 ? <span className="text-outline">{word}</span> : word}
            </Fragment>
          ))}
        </h2>
        <p className="mt-6 max-w-md text-body-lg text-brand-200 lg:mt-8">{drop.description}</p>
        <div className="mt-10 max-w-140 lg:mt-14">
          <p className="sr-only">Começa em</p>
          <CountdownBlocks endsAt={drop.startsAt} />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <DropReminderButton storageKey={dropReminderKey(drop.number)} />
            <Link
              href={DROPS_HREF}
              className="flex h-cta items-center justify-between gap-2 rounded-xl border border-gray-0/30 px-4 text-body font-bold transition-colors duration-base hover:bg-gray-0/10"
            >
              Calendário de drops
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
