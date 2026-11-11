import { MobileNav } from '@/features/store/navigation/components/mobile-nav';
import { getStoreMenu } from '@/features/store/navigation/data/queries';
import type { MenuDepartment } from '@/features/store/navigation/model/types';

type MobileNavContainerProps = {
  departments: readonly MenuDepartment[];
};

export async function MobileNavContainer({ departments }: MobileNavContainerProps) {
  return <MobileNav menu={await getStoreMenu(departments)} />;
}
