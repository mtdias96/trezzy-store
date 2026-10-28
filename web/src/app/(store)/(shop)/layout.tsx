import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { AccountLink } from '@/components/store/shell/account-link';
import { AnnouncementBar } from '@/components/store/shell/announcement-bar';
import { BagLink } from '@/components/store/shell/bag-link';
import { HeaderSearch } from '@/components/store/shell/header-search';
import { StoreHeader } from '@/components/store/shell/store-header';
import { ANNOUNCEMENTS } from '@/features/store/announcements/model/announcements';
import { departmentLinks } from '@/features/store/catalog/model/taxonomy';
import { DropTeaserContainer } from '@/features/store/drops/containers/drop-teaser-container';
import { DesktopNavContainer } from '@/features/store/navigation/containers/desktop-nav-container';
import { MobileNavContainer } from '@/features/store/navigation/containers/mobile-nav-container';

// PRÉVIA (não commitar): sacola fixa. A contagem de verdade vem do carrinho, num Suspense (lê cookie).
const PREVIEW_BAG_COUNT = 1;

// Os departamentos do menu são os do catálogo: renomear na taxonomia muda o header junto.
const DEPARTMENTS = departmentLinks();

// tabIndex -1: sem ele, o Safari não move o foco do "Pular para o conteúdo". O NuqsAdapter só lê a URL nos hooks
// dos filtros, que ficam dentro de Suspense: a casca estática continua estática.
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
      <main id="conteudo" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        <NuqsAdapter>{children}</NuqsAdapter>
      </main>
    </>
  );
}
