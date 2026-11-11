import Image from 'next/image';
import Link from 'next/link';
import { ArrowRightIcon, ImageIcon } from 'lucide-react';

import { PageContainer } from '@/components/store/layout/page-container';
import type { HomeEditorial } from '@/features/store/home/model/types';

type EditorialSectionProps = {
  editorial: HomeEditorial;
};

const IMAGE_SIZES = '(min-width: 1440px) 1014px, (min-width: 1100px) 72vw, 92vw';

// O card sobe sobre a foto: no celular só a borda, no tablet o canto, e no desktop ele desce 96px além dela (o pb-24).
export function EditorialSection({ editorial }: EditorialSectionProps) {
  const { badge, eyebrow, title, description, highlights, imageUrl, imageAlt, linkLabel, href } = editorial;

  return (
    <section aria-labelledby="editorial-title">
      <PageContainer>
        <div className="relative lg:-mx-4 lg:pb-24">
          <div className="relative aspect-4/3 overflow-hidden rounded-tile bg-line sm:aspect-video lg:w-18/25">
            {imageUrl
              ? <Image src={imageUrl} alt={imageAlt} fill sizes={IMAGE_SIZES} className="object-cover" />
              : <ImageIcon aria-hidden className="absolute inset-0 m-auto size-7 text-gray-500" />}
            <p className="absolute top-3 left-3 rounded-pill bg-gray-0 px-2.5 py-1.5 text-overline text-ink uppercase sm:top-4.5 sm:left-4.5">
              {badge}
            </p>
          </div>
          <div className="relative mx-2 -mt-6 rounded-tile bg-ink p-5 sm:-mt-24 sm:mr-6 sm:ml-auto sm:w-3/5 sm:max-w-135 sm:p-8 lg:absolute lg:right-0 lg:bottom-0 lg:m-0 lg:w-2/5 lg:p-10">
            <p className="text-eyebrow leading-none text-brand-300 uppercase">{eyebrow}</p>
            <h2 id="editorial-title" className="mt-6 text-heading text-gray-0">{title}</h2>
            <p className="mt-3.5 max-w-100 text-lead text-on-ink-muted">{description}</p>
            <dl className="mt-6 grid auto-cols-fr grid-flow-col border-y border-on-ink-line">
              {highlights.map(({ value, label }) => (
                <div key={label} className="flex flex-col-reverse justify-end border-l border-on-ink-line py-3.5 pl-2 first:border-l-0 first:pl-0 sm:pl-3.5">
                  <dt className="mt-1.5 text-micro leading-3.25 font-semibold text-on-ink-subtle uppercase">{label}</dt>
                  <dd className="text-price leading-none tracking-normal text-gray-0">{value}</dd>
                </div>
              ))}
            </dl>
            <Link
              href={href}
              className="group mt-6 flex h-13.5 items-center justify-between rounded-xl bg-gray-0 px-4.5 text-body-lg font-bold text-ink"
            >
              {linkLabel}
              <ArrowRightIcon aria-hidden className="size-4 transition-transform duration-slow ease-out group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
