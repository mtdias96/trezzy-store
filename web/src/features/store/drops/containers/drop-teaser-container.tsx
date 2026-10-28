import { DropTeaserCard } from '@/features/store/drops/components/teaser/drop-teaser-card';
import { getNextDrop } from '@/features/store/drops/data/queries';

export async function DropTeaserContainer() {
  const drop = await getNextDrop();

  return drop ? <DropTeaserCard drop={drop} /> : null;
}
