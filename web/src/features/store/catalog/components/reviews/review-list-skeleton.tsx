export function ReviewListSkeleton() {
  return (
    <div role="status" className="grid gap-3 md:grid-cols-3">
      <span className="sr-only">Carregando avaliações…</span>
      {[0, 1, 2].map((card) => <div key={card} className="h-48 animate-skeleton rounded-2xl bg-paper-stone" />)}
    </div>
  );
}
