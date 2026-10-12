import type { NavItem } from '@/components/site/header';

type Pkg = { slug: string; name: string };
type Area = { slug: string; name: string };

/** Üst menü: paketler ve bölgeler veritabanından gelir, böylece panelden yapılan değişiklik menüye yansır. */
export function buildNavigation(packages: Pkg[], areas: Area[]): NavItem[] {
  return [
    {
      label: 'Ev Boyama',
      href: '/ev-boyama',
      children: [
        { label: 'Ev Boyama Hizmeti', href: '/ev-boyama', note: 'Hizmetin kapsamı ve süreç' },
        ...packages.map((p) => ({ label: p.name, href: `/ev-boyama/${p.slug}` })),
        { label: 'İç Cephe Boyama', href: '/hizmetler/ic-cephe-boyama' },
        { label: 'Boya Badana', href: '/hizmetler/boya-badana' },
      ],
    },
    { label: 'Boya Fiyatları', href: '/boya-fiyatlari' },
    {
      label: 'Hizmetlerimiz',
      href: '/hizmetler',
      children: [
        { label: 'Tüm Hizmetler', href: '/hizmetler' },
        { label: 'Komple Ev Tadilatı', href: '/hizmetler/ev-tadilati' },
        { label: 'Mutfak Tadilatı', href: '/hizmetler/mutfak-tadilati' },
        { label: 'Banyo Tadilatı', href: '/hizmetler/banyo-tadilati' },
        { label: 'Alçı ve Sıva', href: '/hizmetler/alci-siva' },
        { label: 'Elektrik Tesisatı', href: '/hizmetler/elektrik-tesisati' },
        { label: 'Anahtar Teslim İnşaat', href: '/hizmetler/anahtar-teslim-insaat' },
      ],
    },
    { label: 'Projelerimiz', href: '/projeler' },
    {
      label: 'Kurumsal',
      href: '/kurumsal',
      children: [
        { label: 'Hakkımızda', href: '/kurumsal' },
        { label: 'Çalışma Süreci', href: '/surec' },
        { label: 'Kat Karşılığı İnşaat', href: '/kat-karsiligi' },
        { label: 'Hizmet Bölgeleri', href: '/hizmet-bolgeleri', note: areas.map((a) => a.name).join(', ') },
      ],
    },
    { label: 'Blog', href: '/blog' },
    { label: 'İletişim', href: '/iletisim' },
  ];
}

export const footerServiceLinks = [
  { label: 'Ev Boyama', href: '/ev-boyama' },
  { label: 'Boya Fiyatları', href: '/boya-fiyatlari' },
  { label: 'İç Cephe Boyama', href: '/hizmetler/ic-cephe-boyama' },
  { label: 'Boya Badana', href: '/hizmetler/boya-badana' },
  { label: 'Komple Ev Tadilatı', href: '/hizmetler/ev-tadilati' },
  { label: 'Tüm Hizmetler', href: '/hizmetler' },
];
