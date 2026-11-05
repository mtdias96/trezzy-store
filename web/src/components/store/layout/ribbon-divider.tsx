import { Marquee } from '@/components/store/data-display/marquee';

type RibbonDividerProps = {
  highlight?: string;
  tagline: string;
};

// -inset-x-16: a fita passa da tela dos dois lados, para a ponta inclinada não aparecer.
// Cada item tem uns 500px: 6 por cópia passam de um monitor de 2560px.
export function RibbonDivider({ highlight, tagline }: RibbonDividerProps) {
  return (
    <div aria-hidden className="relative mt-4 h-36 overflow-hidden lg:mt-10 lg:h-56">
      {highlight
        ? (
            <div className="absolute -inset-x-16 top-1/2 -translate-y-full rotate-ribbon bg-brand py-2 text-gray-0">
              <Marquee
                items={[highlight]}
                minItemsPerCopy={6}
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
          minItemsPerCopy={6}
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
