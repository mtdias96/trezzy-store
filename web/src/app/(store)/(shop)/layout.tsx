import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { AccountLink } from '@/components/store/shell/account-link';
import { AnnouncementBar } from '@/components/store/shell/announcement-bar';
import { BagLink } from '@/components/store/shell/bag-link';
import { HeaderSearch } from '@/components/store/shell/header-search';
import { StoreFooter } from '@/components/store/shell/store-footer';
import { StoreHeader } from '@/components/store/shell/store-header';
import { ANNOUNCEMENTS } from '@/features/store/announcements/model/announcements';
import { departmentLinks } from '@/features/store/catalog/model/taxonomy';
import { DropTeaserContainer } from '@/features/store/drops/containers/drop-teaser-container';
import { PRIVACY_HREF, storeFooter } from '@/features/store/institutional/model/footer';
import { DesktopNavContainer } from '@/features/store/navigation/containers/desktop-nav-container';
import { MobileNavContainer } from '@/features/store/navigation/containers/mobile-nav-container';
import { NewsletterContainer } from '@/features/store/newsletter/containers/newsletter-container';

// PRÉVIA (não commitar): sacola fixa. A contagem de verdade vem do carrinho, num Suspense (lê cookie).
const PREVIEW_BAG_COUNT = 1;

// Os departamentos do menu e do rodapé são os do catálogo: renomear na taxonomia muda os dois junto.
const DEPARTMENTS = departmentLinks();
const FOOTER = storeFooter(DEPARTMENTS);

// tabIndex -1: sem ele, o Safari não move o foco do "Pular para o conteúdo". O NuqsAdapter só lê a URL nos hooks
// dos filtros, que ficam dentro de Suspense: a casca estática continua estática.
// min-h-svh: o conteúdo da página chega em streaming depois do rodapé (o loading.tsx e os Suspense). Sem a altura
// mínima, o rodapé aparece na tela abaixo do skeleton e é empurrado quando a página chega (CLS 0,61 na home).
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHeader
        announcements={<AnnouncementBar items={ANNOUNCEMENTS} />}
        mobileNav={<MobileNavContainer departments={DEPARTMENTS} />}
        nav={<DesktopNavContainer departments={DEPARTMENTS} promo={<DropTeaserContainer />} />}
        search={<HeaderSearch />}
        account={<AccountLink />}
        bag={<BagLink count={PREVIEW_BAG_COUNT} />}
      />
      <main id="conteudo" tabIndex={-1} className="flex min-h-svh flex-1 flex-col outline-none">
        <NuqsAdapter>{children}</NuqsAdapter>
      </main>
      <StoreFooter content={FOOTER} newsletterForm={<NewsletterContainer privacyHref={PRIVACY_HREF} />} />
    </>
  );
}
