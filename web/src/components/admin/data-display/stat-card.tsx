type StatCardProps = {
  label: string;
  value: string;
};

export function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-card border border-border bg-card p-5">
      <p className="text-body-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-display-md tabular-nums">{value}</p>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div role="status" className="rounded-card border border-border bg-card p-5">
      <span className="sr-only">Carregando…</span>
      <div className="h-4 w-2/3 animate-skeleton rounded-md bg-muted" />
      <div className="mt-3 h-7 w-1/3 animate-skeleton rounded-md bg-muted" />
    </div>
  );
}
