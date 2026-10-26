'use client';

import { useSearchParams } from 'next/navigation';

// Leva o ?next= que o proxy pôs na URL para a action. Fica num <Suspense> próprio: o useSearchParams tira do HTML
// estático só este campo, e não o formulário inteiro. A action só aceita caminhos do painel.
export function RedirectField() {
  const next = useSearchParams().get('next');

  return next ? <input type="hidden" name="next" value={next} /> : null;
}
