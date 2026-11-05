export function UserMenuSkeleton() {
  return (
    <div role="status" className="flex h-ctl-lg items-center rounded-pill border border-gray-250 py-1 pr-2.5 pl-1">
      <span className="sr-only">Carregando…</span>
      <div className="size-9 animate-skeleton rounded-pill bg-muted" />
    </div>
  );
}
