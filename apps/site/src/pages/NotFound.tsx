import { Button, Container } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';

export default function NotFound() {
  const t = useT();
  const { path } = useLocale();
  return (
    <Container size="narrow" className="py-28">
      <p className="font-display text-[clamp(5rem,16vw,11rem)] font-black leading-none tracking-[-0.05em] text-green-600">404</p>
      <h1 className="mt-4 font-display text-4xl font-black">{t('error.not_found')}</h1>
      <Button to={path('/')} className="mt-8">{t('nav.home')}</Button>
    </Container>
  );
}