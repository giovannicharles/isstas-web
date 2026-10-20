import { lazy, Suspense } from 'react';
import { AdminBoot } from '@admin/components/AdminBoot';
import { createBrowserRouter, Navigate, Outlet, useParams } from 'react-router-dom';
import { DEFAULT_LOCALE, isLocale } from '@isstas/i18n';
import { Layout } from '@/components/layout/Layout';
import { PageSkeleton } from '@/components/States';
import { LocaleProvider } from '@/lib/i18n';

const Home = lazy(() => import('@/pages/Home'));
const Programs = lazy(() => import('@/pages/Programs'));
const LevelPage = lazy(() => import('@/pages/LevelPage'));
const ProgramPage = lazy(() => import('@/pages/ProgramPage'));
const Compare = lazy(() => import('@/pages/Compare'));
const AdmissionHub = lazy(() => import('@/pages/admission/AdmissionHub'));
const Procedure = lazy(() => import('@/pages/admission/Procedure'));
const Checklist = lazy(() => import('@/pages/admission/Checklist'));
const Fees = lazy(() => import('@/pages/admission/Fees'));
const PreRegistration = lazy(() => import('@/pages/admission/PreRegistration'));
const Track = lazy(() => import('@/pages/admission/Track'));
const Downloads = lazy(() => import('@/pages/Downloads'));
const Contact = lazy(() => import('@/pages/Contact'));
const Faq = lazy(() => import('@/pages/Faq'));
const News = lazy(() => import('@/pages/News'));
const NewsArticle = lazy(() => import('@/pages/NewsArticle'));
const ContentPage = lazy(() => import('@/pages/ContentPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function RootRedirect() {
  const preferred = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : DEFAULT_LOCALE;
  return <Navigate to={`/${isLocale(preferred) ? preferred : DEFAULT_LOCALE}`} replace />;
}

function LocaleGate() {
  const { locale } = useParams();
  if (!isLocale(locale)) return <Navigate to={`/${DEFAULT_LOCALE}`} replace />;
  return (
    <LocaleProvider>
      <Suspense fallback={<PageSkeleton />}>
        <Outlet />
      </Suspense>
    </LocaleProvider>
  );
}

export const router = createBrowserRouter([
  { path: '/', element: <RootRedirect /> },
  // Administration : /admin (meme projet, bundle charge a la demande)
  {
    path: '/admin/*',
    HydrateFallback: AdminBoot,
    lazy: async () => ({ Component: (await import('@admin/AdminApp')).default }),
  },
  {
    path: '/:locale',
    element: <LocaleGate />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Home /> },
          { path: 'formations', element: <Programs /> },
          { path: 'formations/:level', element: <LevelPage /> },
          { path: 'formations/:level/:program', element: <ProgramPage /> },
          { path: 'comparateur', element: <Compare /> },
          { path: 'admission', element: <AdmissionHub /> },
          { path: 'admission/procedure', element: <Procedure /> },
          { path: 'admission/dossier', element: <Checklist /> },
          { path: 'admission/frais', element: <Fees /> },
          { path: 'admission/pre-inscription', element: <PreRegistration /> },
          { path: 'admission/suivi', element: <Track /> },
          { path: 'telechargements', element: <Downloads /> },
          { path: 'contact', element: <Contact /> },
          { path: 'cabinet', element: <Contact kind="appointment" /> },
          { path: 'faq', element: <Faq /> },
          { path: 'actualites', element: <News /> },
          { path: 'actualites/:slug', element: <NewsArticle /> },
          { path: 'a-propos/:slug', element: <ContentPage /> },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);