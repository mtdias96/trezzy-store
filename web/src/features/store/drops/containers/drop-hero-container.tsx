import { DropHero } from '@/features/store/drops/components/hero/drop-hero';
import { getNextDrop } from '@/features/store/drops/data/queries';

export async function DropHeroContainer() {
  const drop = await getNextDrop();

  return drop ? <DropHero drop={drop} /> : null;
}
