import type { ReactNode } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import {
  ArrowLeftRightIcon,
  ArrowUpRightIcon,
  BadgeCheckIcon,
  type LucideIcon,
  MessageCircleIcon,
  ReceiptTextIcon,
  TruckIcon,
} from 'lucide-react';

import { PageContainer } from '@/components/store/layout/page-container';

import { StoreLogo } from './store-logo';

type FooterLink = {
  label: string;
  href: Route;
};

type ExternalLink = {
  label: string;
  href: string;
};

type FooterGuarantee = {
  kind: 'original' | 'invoice' | 'exchange' | 'shipping';
  label: string;
};

export type StoreFooterContent = {
  tagline: string;
  newsletter: { eyebrow: string; title: string; description: string };
  contact: { whatsapp: ExternalLink; email: string; hours: readonly { days: string; time: string }[] } | null;
  columns: readonly { title: string; links: readonly FooterLink[] }[];
  social: readonly ExternalLink[];
  company: { name: string; cnpj: string; address: string } | null;
  paymentHighlight: string;
  payments: readonly string[];
  guarantees: readonly FooterGuarantee[];
  copyright: string;
  legal: readonly FooterLink[];
};

type StoreFooterProps = {
  content: StoreFooterContent;
  newsletterForm: ReactNode;
};

const guaranteeIcon = {
  original: BadgeCheckIcon,
  invoice: ReceiptTextIcon,
  exchange: ArrowLeftRightIcon,
  shipping: TruckIcon,
} satisfies Record<FooterGuarantee['kind'], LucideIcon>;

const columnTitleClass = 'text-eyebrow text-gray-0 uppercase';
const linkClass = 'flex min-h-11 items-center text-body text-on-ink-muted transition-colors duration-base hover:text-gray-0 md:min-h-8';
const contactLabelClass = 'text-caption text-on-ink-subtle';

// As colunas e a faixa de baixo usam o mesmo vão (gap-8) do grid de 12: o formulário da newsletter, a segunda coluna
// de links e as garantias começam na mesma linha vertical.
export function StoreFooter({ content, newsletterForm }: StoreFooterProps) {
  const { tagline, newsletter, contact, columns, social, company, paymentHighlight, payments, guarantees, copyright, legal } = content;

  return (
    <footer className="bg-ink text-gray-0">
      <PageContainer>
        <section
          aria-labelledby="newsletter-title"
          className="grid gap-8 border-b border-on-ink-line py-12 md:grid-cols-2 md:items-end lg:py-16"
        >
          <div>
            <p className="text-eyebrow text-brand-300 uppercase">{newsletter.eyebrow}</p>
            <h2 id="newsletter-title" className="mt-3.25 max-w-120 text-heading text-balance">{newsletter.title}</h2>
            <p className="mt-3.5 max-w-110 text-lead text-pretty text-on-ink-muted">{newsletter.description}</p>
          </div>
          {newsletterForm}
        </section>

        <div className="grid gap-12 py-12 lg:grid-cols-12 lg:gap-8 lg:py-16">
          <div className="flex flex-col items-start gap-6 lg:col-span-4">
            <Link href="/" aria-label="Trezzy Store, página inicial" className="rounded-md">
              <StoreLogo />
            </Link>
            <p className="max-w-80 text-body-lg text-pretty text-on-ink-muted">{tagline}</p>
            {social.length > 0
              ? (
                  <ul aria-label="Redes sociais" className="flex flex-wrap gap-2">
                    {social.map(({ label, href }) => (
                      <li key={href}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex h-ctl items-center gap-1.5 rounded-pill border border-on-ink-line px-3.5 text-body-sm font-semibold transition-colors duration-base hover:bg-ink-soft sm:px-4"
                        >
                          {label}
                          <ArrowUpRightIcon
                            aria-hidden
                            className="hidden size-3.5 text-on-ink-subtle transition-transform duration-slow ease-out group-hover:translate-x-px group-hover:-translate-y-px sm:block"
                          />
                          <span className="sr-only">(abre em nova aba)</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )
              : null}
          </div>

          <div className="grid gap-10 md:grid-cols-4 md:gap-8 lg:col-span-8">
            {contact
              ? (
                  <div>
                    <h2 id="footer-contact" className={columnTitleClass}>Atendimento</h2>
                    <address className="mt-4 flex flex-col items-start gap-4 not-italic">
                      <div className="flex flex-col items-start gap-1.5">
                        <a
                          href={contact.whatsapp.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-ctl-lg items-center gap-2 rounded-pill border border-on-ink-line bg-ink-soft px-4 text-body font-semibold transition-colors duration-base hover:border-gray-0/35"
                        >
                          <MessageCircleIcon aria-hidden className="size-4.5 text-brand-300" />
                          WhatsApp
                          <ArrowUpRightIcon aria-hidden className="size-3.5 text-on-ink-subtle" />
                          <span className="sr-only">(abre em nova aba)</span>
                        </a>
                        <span className={contactLabelClass}>{contact.whatsapp.label}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className={contactLabelClass}>E-mail</span>
                        <a
                          href={`mailto:${contact.email}`}
                          className="inline-flex min-h-6 items-center text-body font-semibold transition-colors duration-base hover:text-brand-300"
                        >
                          {contact.email}
                        </a>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className={contactLabelClass}>Horário de Brasília</span>
                        {contact.hours.map(({ days, time }) => (
                          <span key={days} className="text-body text-on-ink-muted">
                            {`${days}, `}
                            <span className="whitespace-nowrap">{time}</span>
                          </span>
                        ))}
                      </div>
                    </address>
                  </div>
                )
              : null}

            <nav aria-label="Rodapé" className="grid grid-cols-2 gap-x-4 gap-y-10 md:col-span-3 md:col-start-2 md:grid-cols-3 md:gap-x-8">
              {columns.map(({ title, links }, index) => {
                const titleId = `footer-column-${index}`;

                return (
                  <div key={title}>
                    <h2 id={titleId} className={columnTitleClass}>{title}</h2>
                    <ul aria-labelledby={titleId} className="mt-2 flex flex-col md:mt-3">
                      {links.map((link) => (
                        <li key={link.href}>
                          <Link href={link.href} className={linkClass}>{link.label}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="grid gap-8 border-t border-on-ink-line py-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p id="footer-payments" className="text-overline text-on-ink-subtle uppercase">Pagamento</p>
            <p className="mt-2 text-body-sm font-semibold text-gray-0">{paymentHighlight}</p>
            <ul aria-labelledby="footer-payments" className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-body-sm text-on-ink-muted">
              {payments.map((payment) => <li key={payment}>{payment}</li>)}
            </ul>
          </div>
          <ul aria-label="Garantias" className="grid grid-cols-2 gap-x-4 gap-y-3 md:gap-x-8">
            {guarantees.map(({ kind, label }) => {
              const Icon = guaranteeIcon[kind];

              return (
                <li key={kind} className="flex items-start gap-2 text-body-sm font-semibold">
                  <Icon aria-hidden className="size-4.5 shrink-0 text-brand-300" />
                  {label}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex flex-col gap-4 border-t border-on-ink-line py-6 text-caption text-on-ink-subtle md:flex-row md:items-end md:justify-between md:gap-10">
          <div className="flex flex-col gap-1">
            <p>{copyright}</p>
            {company
              ? (
                  <address className="flex flex-col not-italic md:flex-row md:flex-wrap md:gap-x-2">
                    <span>{company.name}</span>
                    <span aria-hidden className="hidden md:inline">·</span>
                    <span className="whitespace-nowrap">{`CNPJ ${company.cnpj}`}</span>
                    <span aria-hidden className="hidden md:inline">·</span>
                    <span>{company.address}</span>
                  </address>
                )
              : null}
          </div>
          <ul aria-label="Políticas" className="flex shrink-0 flex-wrap gap-x-5 gap-y-2">
            {legal.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-6 items-center transition-colors duration-base hover:text-gray-0">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </PageContainer>
    </footer>
  );
}
