import { MobileNav } from '@/features/store/navigation/components/mobile-nav';
import { getStoreMenu } from '@/features/store/navigation/data/queries';

export async function MobileNavContainer() {
  return <MobileNav menu={await getStoreMenu()} />;
}
