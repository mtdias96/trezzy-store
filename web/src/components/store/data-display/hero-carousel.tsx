'use client';

import {
  createContext,
  type FocusEvent,
  type PointerEvent,
  type ReactNode,
  use,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';
import { flushSync } from 'react-dom';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { useInView } from '@/hooks/use-in-view';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useWindowLoaded } from '@/hooks/use-window-loaded';

const HeroSlideNearContext = createContext(true);

// O slide é o atual ou o vizinho dele: o conteúdo usa para adiar o que pesa até estar para aparecer.
export function useHeroSlideNear(): boolean {
  return use(HeroSlideNearContext);
}

// desktopOnly: o slide não tem arte para o celular e só entra a partir do lg.
export type HeroSlide = {
  id: string;
  content: ReactNode;
  desktopOnly: boolean;
};

type HeroCarouselProps = {
  label: string;
  slides: readonly HeroSlide[];
};

type Direction = 'forward' | 'backward';

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 48;
// O lg do globals.css: abaixo dele, o slide do drop empilha foto e texto e fica alto demais para a arte larga.
const DESKTOP_QUERY = '(width >= 68.75rem)';

const MOVING = 'transition-transform duration-700 ease-in-out';

// Quem espera fica do lado de onde vai entrar, sem transição: troca de lado fora da tela, sem cruzar a vista.
const positionClass = {
  current: `translate-x-0 ${MOVING}`,
  leaving: { forward: `-translate-x-full ${MOVING}`, backward: `translate-x-full ${MOVING}` },
  waiting: { forward: 'translate-x-full', backward: '-translate-x-full' },
} satisfies {
  current: string;
  leaving: Record<Direction, string>;
  waiting: Record<Direction, string>;
};

// O slide só do desktop some no celular pelo CSS, já no HTML do servidor, sem esperar a hidratação.
const displayClass = {
  always: 'col-start-1 row-start-1 grid',
  desktopOnly: 'col-start-1 row-start-1 hidden lg:grid',
} satisfies Record<'always' | 'desktopOnly', string>;

const ARROW_CLASS = `
  pointer-events-auto flex size-11 items-center justify-center rounded-pill border border-gray-0/30 bg-ink/40 text-gray-0
  opacity-0 transition duration-base group-hover/hero:opacity-100 hover:bg-ink/70 focus-visible:opacity-100
`;

// A caixa "Pausar animações" da faixa de avisos (WCAG 2.2.2) e o prefers-reduced-motion também param a troca.
function motionPaused(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    || document.querySelector('[data-pause-motion]:checked') !== null;
}

// Os slides ficam empilhados na mesma célula do grid, e o hero tem a altura do mais alto. Avançar sempre traz o próximo
// pela direita, inclusive do último para o primeiro; voltar traz pela esquerda. A navegação só passa pelos slides que a
// tela mostra: no celular, os desktopOnly ficam de fora.
// A troca automática para com o mouse em cima, com o foco dentro e fora da tela, e recomeça a cada slide.
// As setas só existem com mouse (pointer-fine) e aparecem no hover e no foco do teclado. No toque, o gesto troca.
export function HeroCarousel({ label, slides }: HeroCarouselProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const inView = useInView(sectionRef);
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const [current, setCurrent] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);
  const [direction, setDirection] = useState<Direction>('forward');
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const visible = slides.flatMap((slide, index) => (desktop || !slide.desktopOnly ? [index] : []));
  const total = visible.length;
  // Saindo do desktop com um slide só dele na tela, o hero volta ao primeiro que o celular mostra.
  const shown = visible.includes(current) ? current : (visible[0] ?? 0);
  const position = visible.indexOf(shown);
  const windowLoaded = useWindowLoaded();

  // Os vizinhos só depois do load: antes disso, a foto deles disputaria a rede com a abertura da página.
  const isNear = (index: number): boolean => index === shown
    || (windowLoaded && (index === visible[(position + 1) % total] || index === visible[(position - 1 + total) % total]));

  // Em dois tempos: primeiro todos os que esperam vão para o lado de entrada (flushSync aplica já), e só no quadro
  // seguinte o novo slide entra. Num quadro só, o navegador animaria a partir de onde o slide estava.
  const go = (step: 1 | -1) => {
    const from = shown;
    const to = visible[(visible.indexOf(from) + step + total) % total] ?? from;

    flushSync(() => {
      setDirection(step === 1 ? 'forward' : 'backward');
      setLeaving(null);
    });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLeaving(from);
        setCurrent(to);
      });
    });
  };

  const advance = useEffectEvent(() => {
    if (!motionPaused()) {
      go(1);
    }
  });

  useEffect(() => {
    if (total < 2 || hovered || focused || !inView) {
      return;
    }

    const timer = window.setTimeout(advance, AUTOPLAY_MS);

    return () => window.clearTimeout(timer);
  }, [shown, total, hovered, focused, inView]);

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocused(false);
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    swipeStart.current = event.pointerType === 'mouse' ? null : { x: event.clientX, y: event.clientY };
  };

  const onPointerUp = (event: PointerEvent<HTMLElement>) => {
    const start = swipeStart.current;

    swipeStart.current = null;

    if (!start || total < 2) {
      return;
    }

    const dx = event.clientX - start.x;

    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(event.clientY - start.y)) {
      go(dx < 0 ? 1 : -1);
    }
  };

  const positionFor = (index: number): string => {
    if (index === shown) {
      return positionClass.current;
    }

    return index === leaving ? positionClass.leaving[direction] : positionClass.waiting[direction];
  };

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carrossel"
      aria-label={label}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onFocus={() => setFocused(true)}
      onBlur={onBlur}
      className="group/hero relative grid touch-pan-y overflow-hidden"
    >
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          inert={index !== shown}
          className={`${slide.desktopOnly ? displayClass.desktopOnly : displayClass.always} ${positionFor(index)}`}
        >
          <HeroSlideNearContext value={isNear(index)}>{slide.content}</HeroSlideNearContext>
        </div>
      ))}
      {total > 1
        ? (
            <div className="pointer-events-none absolute inset-0 hero-frame">
              <div className="absolute inset-y-0 left-2 hidden items-center lg:left-4 pointer-fine:flex">
                <button type="button" aria-label="Slide anterior" onClick={() => go(-1)} className={ARROW_CLASS}>
                  <ChevronLeftIcon aria-hidden className="size-5" />
                </button>
              </div>
              <div className="absolute inset-y-0 right-2 hidden items-center lg:right-4 pointer-fine:flex">
                <button type="button" aria-label="Próximo slide" onClick={() => go(1)} className={ARROW_CLASS}>
                  <ChevronRightIcon aria-hidden className="size-5" />
                </button>
              </div>
            </div>
          )
        : null}
    </section>
  );
}
