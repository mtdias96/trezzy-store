import type { ReactNode } from 'react';

import { DesktopNav } from '@/features/store/navigation/components/desktop-nav';
import { getStoreMenu } from '@/features/store/navigation/data/queries';

type DesktopNavContainerProps = {
  promo?: ReactNode;
};

export async function DesktopNavContainer({ promo }: DesktopNavContainerProps) {
  return <DesktopNav menu={await getStoreMenu()} promo={promo} />;
}
