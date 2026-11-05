type PanelMarqueeProps = {
  items: readonly string[];
};

// A lista vai duas vezes no trilho: o marquee anda 50% e a segunda cópia ocupa o lugar da primeira sem emenda.
export function PanelMarquee({ items }: PanelMarqueeProps) {
  return (
    <div aria-hidden className="group flex h-9.5 shrink-0 items-center overflow-hidden bg-lime text-ink">
      <div className="flex w-max animate-marquee group-hover:paused">
        {[0, 1].map((copy) => (
          <ul key={copy} className="flex shrink-0 items-center gap-9 pr-9">
            {items.map((item) => (
              <li key={item} className="flex items-center gap-4">
                <span className="type-display text-display-xs">{item}</span>
                <span className="size-1.5 rounded-pill bg-brand" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}
