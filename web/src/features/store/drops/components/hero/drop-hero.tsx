import { type CSSProperties, Fragment } from 'react';
import Link from 'next/link';
import { ArrowRightIcon } from 'lucide-react';

import { CountdownBlocks } from '@/components/store/data-display/countdown-blocks';
import { PageContainer } from '@/components/store/layout/page-container';
import { dropReminderKey, DROPS_HREF } from '@/features/store/drops/model/drop';
import type { Drop } from '@/features/store/drops/model/types';
import { longestWordLength, words } from '@/lib/text';

import { DropHeroPhoto } from './drop-hero-photo';
import { DropReminderButton } from './drop-reminder-button';

type DropHeroProps = {
  drop: Drop;
};

// O título é <h2>: o <h1> da home é o nome da loja. Uma palavra por linha, como no design, com o tamanho calculado
// para a mais longa encher a largura do card (text-display-hero). O espaço entre os <span> mantém o texto lido
// como "Runner 03 Lima Ácida", e não "Runner03LimaÁcida".
// Colunas iguais: o título cresce com a largura e preenche o card até perto da altura da foto; o contador e os
// botões ficam no pé.
export function DropHero({ drop }: DropHeroProps) {
  const titleSize = { '--hero-letters': longestWordLength(drop.title) } as CSSProperties;

  return (
    <section aria-labelledby="drop-hero-title">
      <PageContainer className="grid gap-3 pt-4 lg:grid-cols-2 lg:gap-4 lg:pt-6">
        <div className="@container flex flex-col rounded-block bg-brand-950 p-5 text-gray-0 sm:p-7 lg:p-8">
          <p className="flex items-center gap-2 self-start rounded-pill bg-brand px-3 py-1.5 text-micro font-extrabold uppercase">
            <span aria-hidden className="size-1.5 rounded-pill bg-lime" />
            {drop.longLabel}
          </p>
          <h2
            id="drop-hero-title"
            className="mt-5 type-display text-display-hero wrap-break-word"
            style={titleSize}
          >
            {words(drop.title).map((word, index) => (
              <Fragment key={`${index}-${word}`}>
                {index > 0 ? ' ' : null}
                <span className="block">{word}</span>
              </Fragment>
            ))}
          </h2>
          <p className="mt-6 max-w-sm text-body-lg text-brand-200">{drop.description}</p>
          <div className="mt-6 lg:mt-auto lg:pt-6">
            <p className="sr-only">Começa em</p>
            <CountdownBlocks endsAt={drop.startsAt} />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <DropReminderButton storageKey={dropReminderKey(drop.number)} />
            <Link
              href={DROPS_HREF}
              className="flex h-cta items-center justify-between gap-2 rounded-xl border border-brand-700 px-4 text-body font-bold transition-colors duration-base hover:bg-brand-900"
            >
              Calendário de drops
              <ArrowRightIcon aria-hidden className="size-4" />
            </Link>
          </div>
        </div>
        <DropHeroPhoto src={drop.imageUrl} alt={drop.imageAlt} sticker={drop.sticker} />
      </PageContainer>
    </section>
  );
}
