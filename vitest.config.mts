import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@content': path.resolve(import.meta.dirname, 'content'),
      // Next dışında çalışan testlerde "server-only" koruması devre dışı bırakılır.
      'server-only': path.resolve(import.meta.dirname, 'tests/stubs/empty.ts'),
    },
  },
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    globalSetup: ['tests/global-setup.ts'],
    fileParallelism: false,
    testTimeout: 20_000,
  },
});
