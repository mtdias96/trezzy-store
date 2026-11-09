import { Marquee } from '@/components/store/data-display/marquee';

type RibbonDividerProps = {
  highlight?: string;
  tagline: string;
  placement?: RibbonPlacement;
};

type RibbonPlacement = 'overlap' | 'overlapDesktop' | 'below';

// overlap: sobe metade da altura (h-36 e h-56), e as fitas cruzam a base da seção de cima. overlapDesktop: só a partir
// do lg, para quando a seção de cima não aparece no celular.
const placementClass = {
  overlap: 'relative -mt-18 h-36 overflow-hidden lg:-mt-28 lg:h-56',
  overlapDesktop: 'relative mt-4 h-36 overflow-hidden lg:-mt-28 lg:h-56',
  below: 'relative mt-4 h-36 overflow-hidden lg:mt-10 lg:h-56',
} satisfies Record<RibbonPlacement, string>;

// -inset-x-16: a fita passa da tela dos dois lados, para a ponta inclinada não aparecer.
// As cópias cobrem telas de até 5120px: cada item tem uns 420px na fita preta e uns 650px na roxa.
export function RibbonDivider({ highlight, tagline, placement = 'below' }: RibbonDividerProps) {
  return (
    <div aria-hidden className={placementClass[placement]}>
      {highlight
        ? (
            <div className="absolute -inset-x-16 top-1/2 -translate-y-full rotate-ribbon bg-brand py-2 text-gray-0">
              <Marquee
                items={[highlight]}
                minItemsPerCopy={9}
                secondsPerItem={12}
                className="gap-10 pr-10"
                renderItem={(item) => (
                  <span className="type-display text-display-xl whitespace-nowrap lg:text-display-2xl">{item}</span>
                )}
              />
            </div>
          )
        : null}
      <div className="absolute -inset-x-16 top-1/2 -translate-y-1/4 rotate-ribbon-cross bg-ink py-2.5 text-gray-0">
        <Marquee
          items={[tagline]}
          minItemsPerCopy={13}
          secondsPerItem={12}
          reverse
          className="gap-10 pr-10"
          renderItem={(item) => (
            <span className="text-body-sm font-extrabold whitespace-nowrap uppercase lg:text-body-lg">{`${item} ·`}</span>
          )}
        />
      </div>
    </div>
  );
}
