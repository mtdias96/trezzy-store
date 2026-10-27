type AnnouncementBarProps = {
  items: readonly string[];
};

// Cada aviso ocupa uns 225px com o espaço até o próximo. A cópia precisa ser mais larga que a tela: se acabar antes
// da borda, sobra um vão vazio até a volta recomeçar. 12 avisos ou mais dão uns 2700px, acima de um monitor de 2560px.
const ITEMS_PER_COPY = 12;
// Velocidade constante, qualquer que seja o número de avisos: 5 s por aviso dá uns 45px/s (medido no Chrome).
const SECONDS_PER_ITEM = 5;

// O trilho tem duas cópias iguais: o marquee anda 50% e a segunda ocupa o lugar da primeira sem emenda.
// O leitor de tela lê a lista uma vez só, pela <ul> sr-only; o trilho animado fica escondido dele.
// O hover não pausa (é do design). A pausa exigida para movimento infinito (WCAG 2.2.2) é a caixa que aparece
// ao receber o foco pelo teclado, sem JS: o :has(:checked) para a animação.
export function AnnouncementBar({ items }: AnnouncementBarProps) {
  const rounds = Math.max(1, Math.ceil(ITEMS_PER_COPY / items.length));
  const copy = Array.from({ length: rounds }, (_, round) => items.map((item) => ({ key: `${round}-${item}`, item }))).flat();

  return (
    <div className="group relative flex h-10 items-center overflow-hidden border-b border-ink-soft">
      <ul aria-label="Avisos da loja" className="sr-only">
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
      <label className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:inset-y-1.5 focus-within:right-4 focus-within:z-10 focus-within:flex focus-within:items-center focus-within:gap-2 focus-within:rounded-pill focus-within:bg-gray-0 focus-within:px-3 focus-within:text-caption focus-within:font-bold focus-within:text-ink">
        <input type="checkbox" className="accent-brand" />
        Pausar avisos
      </label>
      <div
        aria-hidden
        className="flex w-max animate-marquee group-has-checked:paused"
        style={{ animationDuration: `${copy.length * SECONDS_PER_ITEM}s` }}
      >
        {[0, 1].map((half) => (
          <div key={half} className="flex shrink-0 items-center gap-9 pr-9">
            {copy.map(({ key, item }) => (
              <span key={key} className="flex items-center gap-9">
                <span className="text-caption font-extrabold whitespace-nowrap uppercase">{item}</span>
                <span className="size-1.5 rounded-pill bg-brand" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
