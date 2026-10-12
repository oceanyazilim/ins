import type { Metadata } from 'next';
import Image from 'next/image';
import { Gallery } from '@/components/interactive/gallery';
import { CtaSection } from '@/components/sections/blocks';
import { ProjectCard } from '@/components/sections/cards';
import { Badge, Breadcrumbs, Container, Section, SectionHeader } from '@/components/ui/primitives';
import { JsonLdScript, pageMetadata, SITE_URL } from '@/seo';
import { breadcrumbSchema } from '@/seo/schema';
import { getProject, getProjects } from '@/server/data';
import { redirectOrNotFound } from '@/server/redirects';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return pageMetadata({ path: `/projeler/${p.slug}`, title: p.metaTitle || p.title, description: p.metaDescription || p.summary, image: p.images[0]?.src });
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return redirectOrNotFound(`/projeler/${slug}`);
  const others = (await getProjects()).filter((x) => x.slug !== p.slug && x.kind === p.kind).slice(0, 3);
  const path = `/projeler/${p.slug}`;
  const crumbs = [
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Projelerimiz', path: '/projeler' },
    { name: p.title, path },
  ];
  const cover = p.images[0];
  const facts = [
    ['Proje türü', p.projectType],
    ['Kategori', p.category],
    ['Bölge', p.region],
    ['Durum', p.status],
  ].filter(([, v]) => v);

  return (
    <>
      <div className="bg-soft">
        <Container className="py-10 md:py-14">
          <Breadcrumbs items={crumbs} />
          <div className="mt-8 flex flex-wrap gap-2">
            {p.category && <Badge tone="neutral">{p.category}</Badge>}
            {p.status && <Badge>{p.status}</Badge>}
          </div>
          <h1 className="mt-4 max-w-4xl text-h1 font-extrabold animate-(--animate-hero-in)">{p.title}</h1>
          <p className="mt-5 max-w-3xl text-lead text-muted">{p.summary}</p>
        </Container>
        {cover && (
          <Container className="pb-0">
            <div className="relative aspect-[16/9] translate-y-10 overflow-hidden rounded-(--radius-xl) bg-line md:translate-y-16">
              <Image src={cover.src} alt={cover.alt} fill priority sizes="(min-width: 1280px) 1184px, 100vw" className="object-cover" />
            </div>
          </Container>
        )}
      </div>

      <Section className={cover ? 'pt-24 md:pt-36' : undefined}>
        <Container className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
          <div data-reveal>
            <h2 className="text-h3 font-bold">Proje hakkında</h2>
            <div className="prose-ocean mt-5">
              {p.about.split(/\n{2,}/).map((t) => (
                <p key={t.slice(0, 40)}>{t}</p>
              ))}
            </div>
            {p.role && (
              <>
                <h2 className="mt-12 text-h3 font-bold">Ocean İnşaat’ın rolü</h2>
                <p className="mt-4 text-muted">{p.role}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.roleTags.map((t) => (
                    <li key={t}>
                      <Badge tone="navy">{t}</Badge>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <aside data-reveal className="lg:sticky lg:top-28 lg:self-start">
            <dl className="divide-y divide-line border-y border-line">
              {facts.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-4">
                  <dt className="text-muted">{k}</dt>
                  <dd className="text-right font-semibold text-navy-900">{v}</dd>
                </div>
              ))}
            </dl>
            {p.relatedServices.length > 0 && (
              <div className="mt-8">
                <h2 className="font-display text-sm font-bold uppercase tracking-[0.14em] text-muted">İlgili hizmet başlıkları</h2>
                <ul className="mt-4 space-y-2 text-navy-900">
                  {p.relatedServices.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </Container>
      </Section>

      {p.images.length > 1 && (
        <Section tone="soft" labelledBy="galeri-baslik">
          <Container>
            <SectionHeader id="galeri-baslik" eyebrow="Galeri" title="Proje karelerinden" />
            <Gallery images={p.images} />
          </Container>
        </Section>
      )}

      {others.length > 0 && (
        <Section labelledBy="diger-projeler">
          <Container>
            <SectionHeader id="diger-projeler" eyebrow="Portföy" title="Diğer projeler" />
            <div className="grid gap-x-6 gap-y-12 md:grid-cols-3">
              {others.map((o, i) => (
                <ProjectCard key={o.slug} project={o} index={i} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      <CtaSection title="Benzer bir proje için bize ulaşın." text="Projenizin türünü ve kapsamını paylaşın; ekibimiz değerlendirip size dönsün." />
      <JsonLdScript data={breadcrumbSchema(SITE_URL, crumbs)} />
    </>
  );
}
