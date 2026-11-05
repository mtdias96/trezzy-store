import { type RefObject, useEffect, useState } from 'react';

// Elemento escondido (display: none) conta como fora da tela.
export function useInView(ref: RefObject<Element | null>): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? false));

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref]);

  return inView;
}
