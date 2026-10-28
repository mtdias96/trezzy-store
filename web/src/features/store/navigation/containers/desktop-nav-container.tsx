import type { ReactNode } from 'react';

import { DesktopNav } from '@/features/store/navigation/components/desktop-nav';
import { getStoreMenu } from '@/features/store/navigation/data/queries';
import type { MenuDepartment } from '@/features/store/navigation/model/types';

type DesktopNavContainerProps = {
  departments: readonly MenuDepartment[];
  promo?: ReactNode;
};

export async function DesktopNavContainer({ departments, promo }: DesktopNavContainerProps) {
  return <DesktopNav menu={await getStoreMenu(departments)} promo={promo} />;
}
