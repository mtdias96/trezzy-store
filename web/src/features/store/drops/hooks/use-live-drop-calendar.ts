import { type RefObject, useEffect, useState } from 'react';

import { fetchLiveDropStock } from '@/features/store/drops/data/client';
import { withLiveStock } from '@/features/store/drops/model/drop';
import type { CalendarDrop, LiveDropStock } from '@/features/store/drops/model/types';
import { useInView } from '@/hooks/use-in-view';

// Antes de o calendário aparecer, para o número já estar certo quando ele chegar à tela.
const FETCH_MARGIN = '600px';

// Sem a rota, o calendário segue com os números do HTML: o erro não tem o que mostrar.
export function useLiveDropCalendar(drops: readonly CalendarDrop[], ref: RefObject<Element | null>): readonly CalendarDrop[] {
  const near = useInView(ref, FETCH_MARGIN);
  const [stock, setStock] = useState<readonly LiveDropStock[]>([]);

  useEffect(() => {
    if (!near) {
      return;
    }

    const controller = new AbortController();

    fetchLiveDropStock(controller.signal).then(setStock).catch(() => {});

    return () => controller.abort();
  }, [near]);

  return withLiveStock(drops, stock);
}
