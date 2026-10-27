import { DesktopNav } from '@/features/store/navigation/components/desktop-nav';
import { getStoreMenu } from '@/features/store/navigation/data/queries';

export async function DesktopNavContainer() {
  return <DesktopNav menu={await getStoreMenu()} />;
}
