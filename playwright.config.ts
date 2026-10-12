import { defineConfig, devices } from '@playwright/test';

const PORT = 3200;
const TEST_DB = process.env.TEST_DATABASE_URL ?? 'postgres://ocean:ocean@localhost:54329/ocean_test';

/**
 * Uçtan uca testler üretim derlemesine karşı, izole test veritabanıyla çalışır.
 * Ön koşul: gömülü PostgreSQL çalışıyor olmalı (npm run db:start).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, locale: 'tr-TR', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx tsx scripts/test-db.ts && npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}/api/health`,
    timeout: 600_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: TEST_DB,
      SITE_URL: 'https://oceaninsaat.com.tr',
      APP_SECRET: 'e2e-secret-e2e-secret-e2e-secret-000000',
      STORAGE_DIR: './.data/e2e-storage',
      NODE_ENV: 'production',
    },
  },
});
