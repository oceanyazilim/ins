import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Ocean İnşaat',
    short_name: 'Ocean İnşaat',
    description: 'Sancaktepe merkezli ev boyama, boya badana, tadilat ve inşaat hizmetleri.',
    start_url: '/',
    display: 'browser',
    lang: 'tr',
    background_color: '#ffffff',
    theme_color: '#0b0b0d',
    icons: [{ src: '/icon.png', sizes: '512x512', type: 'image/png' }],
  };
}
