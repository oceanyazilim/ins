import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextVitals,
  ...nextTs,
  { ignores: ['.next/**', 'node_modules/**', 'drizzle/**', 'test-results/**', 'playwright-report/**', '.data/**', 'storage/**', 'next-env.d.ts'] },
];

export default config;
