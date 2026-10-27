import { PanelNav } from '@/features/admin/navigation/components/panel-nav';
import { getPanelNav } from '@/features/admin/navigation/data/queries';

export async function PanelNavContainer() {
  const items = await getPanelNav();

  return <PanelNav items={items} />;
}
