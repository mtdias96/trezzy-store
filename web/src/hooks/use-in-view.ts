import { type RefObject, useEffect, useState } from 'react';

// Elemento escondido (display: none) conta como fora da tela. O rootMargin antecipa a resposta: '600px' fica true antes
// de o elemento aparecer.
export function useInView(ref: RefObject<Element | null>, rootMargin?: string): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false), { rootMargin });

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}
