import type { ReactNode } from 'react';

type SectionTone = 'light' | 'dark';

type SectionHeadingProps = {
  id: string;
  eyebrow: string;
  title: string;
  description?: string;
  filters?: ReactNode;
  actions?: ReactNode;
  tone?: SectionTone;
};

const toneClass = {
  light: {
    eyebrow: 'text-eyebrow text-brand uppercase',
    title: 'mt-3.25 text-heading text-ink',
    description: 'text-lead text-gray-800',
  },
  dark: {
    eyebrow: 'text-eyebrow text-brand-300 uppercase',
    title: 'mt-3.25 text-heading text-gray-0',
    description: 'text-body-lg leading-normal text-on-dark-muted',
  },
} satisfies Record<SectionTone, Record<'eyebrow' | 'title' | 'description', string>>;

// Cabeçalho das seções da loja: etiqueta, título (o id liga o aria-labelledby da seção) e, à direita no desktop e
// alinhadas à base do título, a descrição ou as ações da seção. Com as duas, a descrição desce para baixo do título.
// Os filtros ficam sempre embaixo do título.
export function SectionHeading({ id, eyebrow, title, description, filters, actions, tone = 'light' }: SectionHeadingProps) {
  const classes = toneClass[tone];

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-10">
      <div className="min-w-0">
        <p className={classes.eyebrow}>{eyebrow}</p>
        <h2 id={id} className={classes.title}>{title}</h2>
        {description && actions ? <p className={`mt-3.5 max-w-110 ${classes.description}`}>{description}</p> : null}
        {filters ? <div className="mt-3.5">{filters}</div> : null}
      </div>
      {description && !actions ? <p className={`max-w-95 ${classes.description}`}>{description}</p> : null}
      {actions}
    </div>
  );
}
