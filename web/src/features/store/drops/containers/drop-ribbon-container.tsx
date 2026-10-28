import { RibbonDivider } from '@/components/store/layout/ribbon-divider';
import { getNextDrop } from '@/features/store/drops/data/queries';

type DropRibbonContainerProps = {
  tagline: string;
};

export async function DropRibbonContainer({ tagline }: DropRibbonContainerProps) {
  const drop = await getNextDrop();

  return <RibbonDivider highlight={drop?.shortLabel} tagline={tagline} />;
}
