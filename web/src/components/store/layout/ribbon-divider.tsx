import { Marquee } from '@/components/store/data-display/marquee';

type RibbonDividerProps = {
  // Fita roxa, em destaque (o drop da semana). Sem ela, só a fita escura.
  highlight?: string;
  tagline: string;
};

// Separador de seções: duas fitas cruzadas, correndo em sentidos opostos. Decorativo: o leitor de tela pula.
// As fitas passam 4rem de cada lado da tela, para a ponta inclinada não aparecer; o overflow-hidden corta a sobra.
// A roxa fica acima do centro e a escura logo abaixo: no celular as duas aparecem inteiras, e no desktop a inclinação
// faz a escura cruzar a roxa do lado esquerdo.
// Cada fita tem uns 500px por item: 6 por cópia passam de um monitor de 2560px.
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
