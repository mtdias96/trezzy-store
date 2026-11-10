import { EditorialSection } from '@/features/store/home/components/editorial-section';
import { getHomeEditorial } from '@/features/store/home/data/queries';

export async function EditorialContainer() {
  const editorial = await getHomeEditorial();

  return editorial ? <EditorialSection editorial={editorial} /> : null;
}
