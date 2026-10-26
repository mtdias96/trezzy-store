// Carregamento dos loading.tsx: blocos na cor muted pulsando com o animate-skeleton.
export function PageSkeleton() {
  return (
    <div role="status" className="flex flex-1 flex-col gap-4 p-6">
      <span className="sr-only">Carregando…</span>
      <div className="h-ctl w-1/2 animate-skeleton rounded-md bg-muted" />
      <div className="h-field animate-skeleton rounded-card bg-muted" />
      <div className="h-field animate-skeleton rounded-card bg-muted" />
    </div>
  );
}
