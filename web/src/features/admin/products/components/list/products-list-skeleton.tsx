export function ProductsListSkeleton() {
  return (
    <div role="status" className="mx-auto flex w-full max-w-400 flex-col gap-6 px-5 py-8 sm:px-8">
      <span className="sr-only">Carregando produtos…</span>
      <div className="h-8 w-48 animate-skeleton rounded-md bg-muted" />
      <div className="h-ctl w-full animate-skeleton rounded-pill bg-muted lg:w-2/3" />
      <div className="h-96 animate-skeleton rounded-card bg-muted" />
    </div>
  );
}
