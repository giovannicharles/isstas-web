import { useMemo, useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Container, Reveal } from '@isstas/ui';
import { useLocale, useT } from '@/lib/i18n';
import { useApi } from '@/lib/useApi';
import { usePageMeta } from '@/lib/usePageMeta';
import type { Faq as FaqType } from '@/lib/types';
import { PageBanner } from '@/components/PageBanner';
import { EmptyState } from '@/components/States';

export default function Faq() {
  const { locale } = useLocale();
  const t = useT();
  const { data } = useApi<FaqType[]>('/faqs', locale);
  const [q, setQ] = useState('');
  usePageMeta({ title: t('faq.title'), alternates: { fr: '/faq', en: '/faq' } });

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (data ?? []).map((g) => ({ ...g, faqs: g.faqs.filter((f) => !needle || (f.question + f.answer).toLowerCase().includes(needle)) })).filter((g) => g.faqs.length);
  }, [data, q]);

  return (
    <>
      <PageBanner title={t('faq.title')} lead={t('faq.lead')} crumbs={[{ label: t('faq.title') }]} />
      <Container size="narrow" className="py-14 sm:py-20">
        <label htmlFor="faq-q" className="sr-only">{t('faq.search')}</label>
        <input id="faq-q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('faq.search')} className="field" />
        {!groups.length ? <div className="mt-10"><EmptyState /></div> : groups.map((g) => (
          <Reveal as="section" key={g.id} className="mt-12">
            <h2 className="font-display text-2xl font-black">{g.name}</h2>
            <Accordion type="single" collapsible className="mt-4 border-t-2 border-green-700">
              {g.faqs.map((f) => (
                <AccordionItem key={f.question} value={f.question}>
                  <AccordionTrigger>{f.question}</AccordionTrigger>
                  <AccordionContent><div className="prose-isstas" dangerouslySetInnerHTML={{ __html: f.answer }} /></AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        ))}
      </Container>
    </>
  );
}