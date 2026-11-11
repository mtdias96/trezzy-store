import type { ComponentProps } from 'react';

import { ResaleSection } from '@/features/store/home/components/resale-section';
import { getResalePanels } from '@/features/store/home/data/queries';

type ResaleContainerProps = Omit<ComponentProps<typeof ResaleSection>, 'panels'>;

export async function ResaleContainer(props: ResaleContainerProps) {
  const panels = await getResalePanels();

  return panels ? <ResaleSection {...props} panels={panels} /> : null;
}
