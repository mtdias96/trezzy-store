import { PiecesSection } from '@/features/store/catalog/components/pieces/pieces-section';
import { getOutletShowcase, listDepartments } from '@/features/store/catalog/data/queries';
import { toPieceShortcuts } from '@/features/store/catalog/model/pieces';

type PiecesContainerProps = {
  title: string;
};

export async function PiecesContainer({ title }: PiecesContainerProps) {
  const [departments, outlet] = await Promise.all([listDepartments(), getOutletShowcase()]);
  const pieces = toPieceShortcuts(departments);

  return pieces.length > 0
    ? <PiecesSection title={title} pieces={pieces} outletDiscountPercent={outlet?.topDiscountPercent ?? null} />
    : null;
}
