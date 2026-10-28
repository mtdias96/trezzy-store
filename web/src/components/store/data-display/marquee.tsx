import { Fragment, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

type MarqueeProps = {
  items: readonly string[];
  // Itens que cada cópia precisa ter para passar da largura da tela: se ela acabar antes da borda, sobra um vão
  // vazio até a volta recomeçar. Depende do tamanho de cada item.
  minItemsPerCopy: number;
  // Velocidade constante, qualquer que seja o número de itens.
  secondsPerItem: number;
  reverse?: boolean;
  renderItem: (item: string) => ReactNode;
  // Espaço entre os itens: gap e o padding do fim da cópia, iguais, para não dar emenda.
  className?: string;
};

// Trilho com duas cópias iguais: anda 50% e a segunda ocupa o lugar da primeira sem emenda. Só o transform anima,
// no compositor. Escondido do leitor de tela: quem usa dá o texto uma vez, fora do trilho, quando ele importa.
// Para com a caixa "Pausar animações" (variante motion-paused do globals.css).
export function Marquee({ items, minItemsPerCopy, secondsPerItem, reverse = false, renderItem, className }: MarqueeProps) {
  if (items.length === 0) {
    return null;
  }

  // A chave é a posição: dois itens podem ter o mesmo texto.
  const rounds = Math.ceil(minItemsPerCopy / items.length);
  const copy = Array.from({ length: rounds }, (_, round) =>
    items.map((item, index) => ({ key: `${round}-${index}`, item })),
  ).flat();

  return (
    <div
      aria-hidden
      className={cn('flex w-max motion-paused:paused', reverse ? 'animate-marquee-reverse' : 'animate-marquee')}
      style={{ animationDuration: `${copy.length * secondsPerItem}s` }}
    >
      {[0, 1].map((half) => (
        <div key={half} className={cn('flex shrink-0 items-center', className)}>
          {copy.map(({ key, item }) => <Fragment key={key}>{renderItem(item)}</Fragment>)}
        </div>
      ))}
    </div>
  );
}
