import { AccountLink } from '@/components/store/shell/account-link';
import { AnnouncementBar } from '@/components/store/shell/announcement-bar';
import { BagLink } from '@/components/store/shell/bag-link';
import { HeaderSearch } from '@/components/store/shell/header-search';
import { StoreHeader } from '@/components/store/shell/store-header';
import { ANNOUNCEMENTS } from '@/features/store/announcements/model/announcements';
import { DropTeaserContainer } from '@/features/store/drops/containers/drop-teaser-container';
import { DesktopNavContainer } from '@/features/store/navigation/containers/desktop-nav-container';
import { MobileNavContainer } from '@/features/store/navigation/containers/mobile-nav-container';

// PRÉVIA (não commitar): sacola fixa. A contagem de verdade vem do carrinho, num Suspense (lê cookie).
const PREVIEW_BAG_COUNT = 1;

// Vitrine cacheada: o menu vem de um 'use cache' e entra no shell estático, sem Suspense.
// O <main> recebe o foco do "Pular para o conteúdo" (tabIndex -1 para o Safari mover o foco).
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreHeader
        announcements={<AnnouncementBar items={ANNOUNCEMENTS} />}
        mobileNav={<MobileNavContainer />}
        nav={<DesktopNavContainer promo={<DropTeaserContainer />} />}
        search={<HeaderSearch />}
        account={<AccountLink />}
        bag={<BagLink count={PREVIEW_BAG_COUNT} />}
      />
      <main id="conteudo" tabIndex={-1} className="flex flex-1 flex-col outline-none">
        {children}
      </main>
    </>
  );
}
