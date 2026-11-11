import { CollectionsSection } from '@/features/store/home/components/collections-section';
import { getHomeCollections } from '@/features/store/home/data/queries';

type CollectionsContainerProps = {
  eyebrow: string;
  title: string;
  description: string;
  featuredBadge: string;
  featuredLinkLabel: string;
};

export async function CollectionsContainer(props: CollectionsContainerProps) {
  const collections = await getHomeCollections();

  return collections ? <CollectionsSection {...props} collections={collections} /> : null;
}
