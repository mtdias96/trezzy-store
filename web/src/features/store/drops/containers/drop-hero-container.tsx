import { DropHero } from '@/features/store/drops/components/hero/drop-hero';
import { getNextDrop } from '@/features/store/drops/data/queries';

// Sem drop marcado (ou com a API fora do ar), a home começa pela seção seguinte.
export async function DropHeroContainer() {
  const drop = await getNextDrop();

  return drop ? <DropHero drop={drop} /> : null;
}
