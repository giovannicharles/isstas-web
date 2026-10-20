import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useT } from '@/lib/i18n';
import { SettingsProvider } from '@/lib/settings';
import { FloatingActions } from './FloatingActions';
import { Footer } from './Footer';
import { Navbar } from './Navbar';
import { TopHeader } from './TopHeader';

function Shell() {
  const t = useT();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-bold">
        {t('nav.skip_to_content')}
      </a>
      <TopHeader />
      <Navbar />
      <main id="contenu" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <FloatingActions />
    </>
  );
}

export function Layout() {
  return (
    <SettingsProvider>
      <Shell />
    </SettingsProvider>
  );
}