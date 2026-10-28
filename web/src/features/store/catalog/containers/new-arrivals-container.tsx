import { NewArrivalsSection } from '@/features/store/catalog/components/new-arrivals/new-arrivals-section';
import { getNewArrivals } from '@/features/store/catalog/data/queries';

type NewArrivalsContainerProps = {
  title: string;
};

export async function NewArrivalsContainer({ title }: NewArrivalsContainerProps) {
  const arrivals = await getNewArrivals();

  return arrivals && arrivals.tabs.length > 0 ? <NewArrivalsSection title={title} arrivals={arrivals} /> : null;
}
