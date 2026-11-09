import { OutletSection } from '@/features/store/catalog/components/outlet/outlet-section';
import { getOutletShowcase } from '@/features/store/catalog/data/queries';

type OutletContainerProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export async function OutletContainer({ eyebrow, title, description }: OutletContainerProps) {
  const showcase = await getOutletShowcase();

  return showcase ? <OutletSection eyebrow={eyebrow} title={title} description={description} showcase={showcase} /> : null;
}
