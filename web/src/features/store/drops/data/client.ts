import { LIVE_DROP_STOCK_PATH } from '@/features/store/drops/model/drop';
import type { LiveDropStock } from '@/features/store/drops/model/types';

// Roda no navegador e lê uma rota do próprio app: o resto do data/ é só de servidor.
export async function fetchLiveDropStock(signal: AbortSignal): Promise<LiveDropStock[]> {
  const response = await fetch(LIVE_DROP_STOCK_PATH, { signal });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const { drops } = await response.json() as { drops: LiveDropStock[] };

  return drops;
}
