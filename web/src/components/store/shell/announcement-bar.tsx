import { Marquee } from '@/components/store/data-display/marquee';

type AnnouncementBarProps = {
  items: readonly string[];
};

// O leitor de tela lê os avisos uma vez, pela <ul> sr-only; o trilho animado fica escondido dele.
// O hover não pausa (é do design). A pausa exigida para movimento infinito (WCAG 2.2.2) é a caixa que aparece ao
// receber o foco pelo teclado: marcada, ela para todos os marquees da página, sem JS (variante motion-paused).
export function AnnouncementBar({ items }: AnnouncementBarProps) {
  return (
    <div className="relative flex h-10 items-center overflow-hidden border-b border-ink-soft">
      <ul aria-label="Avisos da loja" className="sr-only">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <label className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:inset-y-1.5 focus-within:right-4 focus-within:z-10 focus-within:flex focus-within:items-center focus-within:gap-2 focus-within:rounded-pill focus-within:bg-gray-0 focus-within:px-3 focus-within:text-caption focus-within:font-bold focus-within:text-ink">
        <input type="checkbox" data-pause-motion className="accent-brand" />
        Pausar animações
      </label>
      {/* Cada aviso tem uns 225px: 12 por cópia passam de um monitor de 2560px. 5 s por aviso dão uns 45px/s. */}
      <Marquee
        items={items}
        minItemsPerCopy={12}
        secondsPerItem={5}
        className="gap-9 pr-9"
        renderItem={(item) => (
          <span className="flex items-center gap-9">
            <span className="text-caption font-extrabold whitespace-nowrap uppercase">{item}</span>
            <span className="size-1.5 rounded-pill bg-brand" />
          </span>
        )}
      />
    </div>
  );
}
