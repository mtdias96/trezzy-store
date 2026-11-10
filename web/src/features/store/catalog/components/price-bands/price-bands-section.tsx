import { PageContainer } from '@/components/store/layout/page-container';
import { SectionHeading } from '@/components/store/layout/section-heading';
import type { PriceBand } from '@/features/store/catalog/model/types';

import { PriceBandTile, type PriceBandTone } from './price-band-tile';

type PriceBandsSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  bands: readonly PriceBand[];
};

const LEADING_TONES: readonly PriceBandTone[] = ['brand', 'ink'];

export function PriceBandsSection({ eyebrow, title, description, bands }: PriceBandsSectionProps) {
  return (
    <section aria-labelledby="price-bands-title">
      <PageContainer>
        <SectionHeading id="price-bands-title" eyebrow={eyebrow} title={title} description={description} />
        <ul className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 lg:mt-8 lg:auto-cols-fr lg:grid-flow-col lg:grid-cols-none">
          {bands.map((band, index) => (
            <li key={band.href}>
              <PriceBandTile band={band} tone={LEADING_TONES[index] ?? 'surface'} />
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
