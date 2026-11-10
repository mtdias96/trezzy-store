import { PriceBandsSection } from '@/features/store/catalog/components/price-bands/price-bands-section';
import { getPriceBands } from '@/features/store/catalog/data/queries';

type PriceBandsContainerProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export async function PriceBandsContainer({ eyebrow, title, description }: PriceBandsContainerProps) {
  const bands = await getPriceBands();

  return bands.length > 0
    ? <PriceBandsSection eyebrow={eyebrow} title={title} description={description} bands={bands} />
    : null;
}
