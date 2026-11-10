import { PageContainer } from '@/components/store/layout/page-container';
import { SectionHeading } from '@/components/store/layout/section-heading';
import type { BrandTile } from '@/features/store/catalog/model/types';

import { BrandCard } from './brand-card';

type BrandsSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  brands: readonly BrandTile[];
};

export function BrandsSection({ eyebrow, title, description, brands }: BrandsSectionProps) {
  return (
    <section aria-labelledby="brands-title">
      <PageContainer>
        <SectionHeading id="brands-title" eyebrow={eyebrow} title={title} description={description} />
        <ul className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4 lg:mt-8">
          {brands.map((brand) => (
            <li key={brand.slug}>
              <BrandCard brand={brand} />
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
