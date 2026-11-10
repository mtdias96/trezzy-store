import type { Metadata } from 'next';

import { HeroCarousel, type HeroSlide } from '@/components/store/data-display/hero-carousel';
import { RibbonDivider } from '@/components/store/layout/ribbon-divider';
import { addToBag } from '@/features/store/cart/data/actions';
import { BestSellersContainer } from '@/features/store/catalog/containers/best-sellers-container';
import { DepartmentShowcaseContainer } from '@/features/store/catalog/containers/department-showcase-container';
import { NewArrivalsContainer } from '@/features/store/catalog/containers/new-arrivals-container';
import { OutletContainer } from '@/features/store/catalog/containers/outlet-container';
import { PiecesContainer } from '@/features/store/catalog/containers/pieces-container';
import { DropHero } from '@/features/store/drops/components/hero/drop-hero';
import { DropCalendarContainer } from '@/features/store/drops/containers/drop-calendar-container';
import { getNextDrop } from '@/features/store/drops/data/queries';
import { HeroBanner } from '@/features/store/home/components/hero-banner';
import { StorePerks } from '@/features/store/home/components/store-perks';
import { CollectionsContainer } from '@/features/store/home/containers/collections-container';
import { EditorialContainer } from '@/features/store/home/containers/editorial-container';
import { getHomeBanners } from '@/features/store/home/data/queries';
import {
  BEST_SELLERS_SECTION,
  COLLECTIONS_SECTION,
  DEPARTMENTS_HEADING,
  DROP_CALENDAR_SECTION,
  HERO_CAROUSEL_LABEL,
  NEW_ARRIVALS_SECTION,
  OUTLET_SECTION,
  PIECES_SECTION,
  STORE_PERKS,
  STREET_TAGLINE,
} from '@/features/store/home/model/content';

export const metadata: Metadata = {
  title: { absolute: 'Trezzy Store: streetwear, sneakers e eyewear' },
  description: 'Streetwear, sneakers e óculos das marcas que fazem a rua. Drops semanais, frete grátis acima de R$ 299.',
};

// O <h1> é o nome da loja, só para leitor de tela e buscadores: o maior texto visível é o título do drop (<h2>).
// O drop abre o carrossel. Os banners ainda não têm arte para o celular e só entram no desktop: no celular o slide do
// drop é alto e estreito, e o corte da arte larga deixaria só o meio dela.
// A fita sobe e cruza a base do hero onde há slide na tela; sem nenhum, fica logo abaixo do header.
export default async function Page() {
  const [drop, banners] = await Promise.all([getNextDrop(), getHomeBanners()]);
  const slides: HeroSlide[] = [
    ...(drop ? [{ id: 'drop', content: <DropHero drop={drop} />, desktopOnly: false }] : []),
    ...banners.map((banner) => ({ id: banner.id, content: <HeroBanner banner={banner} />, desktopOnly: true })),
  ];
  const ribbonPlacement = drop ? 'overlap' : slides.length > 0 ? 'overlapDesktop' : 'below';

  return (
    <>
      <h1 className="sr-only">Trezzy Store: streetwear, sneakers e eyewear</h1>
      {slides.length > 0 ? <HeroCarousel label={HERO_CAROUSEL_LABEL} slides={slides} /> : null}
      <RibbonDivider highlight={drop?.shortLabel} tagline={STREET_TAGLINE} placement={ribbonPlacement} />
      <div className="flex flex-col gap-16 pb-16 lg:gap-30 lg:pb-30">
        <StorePerks perks={STORE_PERKS} />
        <DepartmentShowcaseContainer {...DEPARTMENTS_HEADING} />
        <NewArrivalsContainer {...NEW_ARRIVALS_SECTION} addToBagAction={addToBag} />
        <OutletContainer {...OUTLET_SECTION} />
        <CollectionsContainer {...COLLECTIONS_SECTION} />
        <DropCalendarContainer {...DROP_CALENDAR_SECTION} />
        <BestSellersContainer {...BEST_SELLERS_SECTION} addToBagAction={addToBag} />
        <PiecesContainer {...PIECES_SECTION} />
        <EditorialContainer />
      </div>
    </>
  );
}
