import type { Metadata } from 'next';
import { ProjectGrid } from '@/components/interactive/project-grid';
import { CtaSection, PageHero } from '@/components/sections/blocks';
import { Container, EmptyState, Section } from '@/components/ui/primitives';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema } from '@/seo/schema';
import { getProjects } from '@/server/data';

const PATH = '/projeler';
const crumbs = [
  { name: 'Ana Sayfa', path: '/' },
  { name: 'Projelerimiz', path: PATH },
];

export const generateMetadata = (): Promise<Metadata> =>
  pageMetadata({
    path: PATH,
    title: 'Projelerimiz',
    description: 'Ocean İnşaat’ın konut, kurumsal yapı ve turizm başlıklarında uygulama, koordinasyon ve taşeronluk kapsamında görev aldığı projeler.',
  });

export default async function ProjelerPage() {
  const projects = await getProjects();
  const paint = projects.filter((p) => p.kind === 'boya');
  const construction = projects.filter((p) => p.kind !== 'boya');

  return (
    <>
      <PageHero
        crumbs={crumbs}
        eyebrow="Portföy"
        title="Projelerimiz"
        lead="Farklı ölçek ve türde yapılarda Ocean İnşaat’ın uygulama, koordinasyon ve taşeronluk kapsamında görev aldığı işler."
      />

      {paint.length > 0 && (
        <Section labelledBy="boya-projeleri">
          <Container>
            <h2 id="boya-projeleri" className="mb-10 text-h2 font-bold">
              Boya ve tadilat işleri
            </h2>
            <ProjectGrid projects={paint} />
          </Container>
        </Section>
      )}

      <Section tone={paint.length ? 'soft' : 'paper'} labelledBy="insaat-projeleri">
        <Container>
          <h2 id="insaat-projeleri" className={paint.length ? 'mb-10 text-h2 font-bold' : 'sr-only'}>
            İnşaat projeleri
          </h2>
          {construction.length > 0 ? <ProjectGrid projects={construction} /> : <EmptyState title="Henüz yayınlanmış proje yok" text="Projeler eklendiğinde burada listelenecek." />}
        </Container>
      </Section>

      <CtaSection title="Benzer bir iş mi planlıyorsunuz?" text="İhtiyacınızı paylaşın; kapsamı birlikte değerlendirelim." />
      <JsonLdScript data={breadcrumbSchema(SITE_URL, crumbs)} />
    </>
  );
}
