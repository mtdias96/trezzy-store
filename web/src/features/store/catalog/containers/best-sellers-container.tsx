import { BestSellersSection } from '@/features/store/catalog/components/best-sellers/best-sellers-section';
import { getWeeklyBestSellers } from '@/features/store/catalog/data/queries';
import type { FormAction } from '@/lib/action-result';

type BestSellersContainerProps = {
  eyebrow: string;
  title: string;
  // Vem da página: a sacola é outra feature.
  addToBagAction: FormAction;
};

export async function BestSellersContainer({ eyebrow, title, addToBagAction }: BestSellersContainerProps) {
  const bestSellers = await getWeeklyBestSellers();

  return bestSellers && bestSellers.tabs.length > 0
    ? <BestSellersSection eyebrow={eyebrow} title={title} tabs={bestSellers.tabs} addToBagAction={addToBagAction} />
    : null;
}
