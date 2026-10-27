import { type ReactNode, useId } from 'react';

type FormCardProps = {
  title: string;
  count?: number;
  meta?: ReactNode;
  children: ReactNode;
};

export function FormCard({ title, count, meta, children }: FormCardProps) {
  const titleId = useId();

  return (
    <section aria-labelledby={titleId} className="flex flex-col gap-4 rounded-card border border-border bg-card p-5">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 id={titleId} className="type-display text-display-sm">{title}</h2>
          {count === undefined
            ? null
            : (
                <span
                  className="
                    flex h-6 min-w-6 items-center justify-center rounded-pill bg-gray-150 px-1.5 font-mono text-caption
                    text-muted-foreground
                  "
                >
                  {count}
                </span>
              )}
        </div>
        {meta ? <p className="text-body-sm text-muted-foreground">{meta}</p> : null}
      </header>
      {children}
    </section>
  );
}
