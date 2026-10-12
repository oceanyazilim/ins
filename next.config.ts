import type { NextConfig } from 'next';
import { staticRedirects } from './src/config/redirects';

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com",
      "font-src 'self'",
      "connect-src 'self' https://www.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [360, 480, 640, 828, 1080, 1280, 1536, 1920],
    localPatterns: [{ pathname: '/images/**' }, { pathname: '/media/**' }, { pathname: '/logo/**' }],
  },
  experimental: { serverActions: { bodySizeLimit: '30mb' } },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/images/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/logo/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/admin/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ];
  },
  async redirects() {
    return [
      // www → çıplak alan adı (tek canonical host)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.oceaninsaat.com.tr' }],
        destination: 'https://oceaninsaat.com.tr/:path*',
        permanent: true,
      },
      ...staticRedirects.map((r) => ({ source: r.source, destination: r.destination, permanent: true })),
    ];
  },
};

export default nextConfig;
