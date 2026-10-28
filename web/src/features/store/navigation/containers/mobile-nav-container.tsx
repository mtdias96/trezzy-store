import { MobileNav } from '@/features/store/navigation/components/mobile-nav';
import { getStoreMenu } from '@/features/store/navigation/data/queries';

// Mesma entrada de cache do DesktopNavContainer: a segunda chamada não vai à API.
export async function MobileNavContainer() {
  return <MobileNav menu={await getStoreMenu()} />;
}
