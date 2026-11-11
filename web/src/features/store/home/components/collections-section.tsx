import { PageContainer } from '@/components/store/layout/page-container';
import { SectionHeading } from '@/components/store/layout/section-heading';
import type { HomeCollections } from '@/features/store/home/model/types';

import { CollectionTile, FeaturedCollectionTile } from './collection-tile';

type CollectionsSectionProps = {
  eyebrow: string;
  title: string;
  description: string;
  featuredBadge: string;
  featuredLinkLabel: string;
  collections: HomeCollections;
};

const FEATURED_TILE_SIZES = '(min-width: 1440px) 700px, (min-width: 960px) 49vw, 92vw';
const TILE_SIZES = '(min-width: 1440px) 346px, (min-width: 960px) 24vw, 46vw';

// A coleção da semana define a altura do mosaico, e as outras quatro esticam em duas linhas.
export function CollectionsSection({ eyebrow, title, description, featuredBadge, featuredLinkLabel, collections }: CollectionsSectionProps) {
  return (
    <section aria-labelledby="collections-title">
      <PageContainer>
        <SectionHeading id="collections-title" eyebrow={eyebrow} title={title} description={description} />
        <ul className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-12 lg:-mx-4 lg:mt-8">
          <li className="col-span-2 aspect-square md:col-span-6 md:row-span-2 md:aspect-27/25">
            <FeaturedCollectionTile
              collection={collections.featured}
              imageSizes={FEATURED_TILE_SIZES}
              badge={featuredBadge}
              linkLabel={featuredLinkLabel}
            />
          </li>
          {collections.others.map((collection) => (
            <li key={collection.id} className="aspect-4/5 md:col-span-3 md:aspect-auto">
              <CollectionTile collection={collection} imageSizes={TILE_SIZES} />
            </li>
          ))}
        </ul>
      </PageContainer>
    </section>
  );
}
