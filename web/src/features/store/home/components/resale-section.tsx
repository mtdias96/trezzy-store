import type { Route } from 'next';
import Link from 'next/link';
import { ArrowDownToLineIcon, ArrowRightIcon, CheckIcon } from 'lucide-react';

import { PageContainer } from '@/components/store/layout/page-container';
import type { ResalePanel } from '@/features/store/home/model/types';

import { ResalePanels } from './resale-panels';

type ResaleSectionProps = {
  eyebrow: string;
  titleAccent: string;
  titleRest: string;
  description: string;
  perks: readonly string[];
  primaryLabel: string;
  primaryHref: Route;
  catalogLabel: string;
  catalogHref: Route;
  panels: readonly ResalePanel[];
};

export function ResaleSection({ eyebrow, titleAccent, titleRest, description, perks, primaryLabel, primaryHref, catalogLabel, catalogHref, panels }: ResaleSectionProps) {
  return (
    <section aria-labelledby="resale-title">
      <PageContainer>
        <div className="flex flex-col gap-2 lg:-mx-4 lg:h-145 lg:flex-row">
          <div className="flex flex-col justify-between gap-8 rounded-tile bg-ink p-6 sm:p-8 lg:w-12/35 lg:p-10">
            <div>
              <p className="text-eyebrow text-brand uppercase">{eyebrow}</p>
              <h2 id="resale-title" className="mt-3.25 text-heading leading-none">
                <span className="text-brand-300">{titleAccent}</span>
                {' '}
                <span className="text-gray-0">{titleRest}</span>
              </h2>
              <p className="mt-3.5 text-lead text-on-ink-muted">{description}</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-2.5 text-body-lg font-medium text-gray-0">
                  <span aria-hidden className="flex size-6 shrink-0 items-center justify-center rounded-pill bg-brand">
                    <CheckIcon className="size-3.5" />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link href={primaryHref} className="group flex h-13.5 items-center justify-between gap-2 rounded-xl bg-brand px-4.5 text-body-lg leading-none font-bold text-gray-0 sm:grow-13 sm:basis-0">
                {primaryLabel}
                <ArrowRightIcon aria-hidden className="size-4 transition-transform duration-slow ease-out group-hover:translate-x-0.5" />
              </Link>
              <Link href={catalogHref} className="flex h-13.5 items-center justify-between rounded-xl border border-gray-0/35 px-4.5 text-center text-body-lg leading-none font-bold text-gray-0 sm:grow-10 sm:basis-0">
                <span className="flex-1">{catalogLabel}</span>
                <ArrowDownToLineIcon aria-hidden className="size-4 shrink-0" />
              </Link>
            </div>
          </div>
          <div className="min-w-0 md:h-115 lg:h-auto lg:flex-1">
            <ResalePanels panels={panels} />
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
