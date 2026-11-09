import { NewArrivalsSection } from '@/features/store/catalog/components/new-arrivals/new-arrivals-section';
import { getNewArrivals } from '@/features/store/catalog/data/queries';
import type { FormAction } from '@/lib/action-result';

type NewArrivalsContainerProps = {
  eyebrow: string;
  title: string;
  // Vem da página: a sacola é outra feature.
  addToBagAction: FormAction;
};

export async function NewArrivalsContainer({ eyebrow, title, addToBagAction }: NewArrivalsContainerProps) {
  const arrivals = await getNewArrivals();

  return arrivals && arrivals.tabs.length > 0
    ? <NewArrivalsSection eyebrow={eyebrow} title={title} arrivals={arrivals} addToBagAction={addToBagAction} />
    : null;
}
