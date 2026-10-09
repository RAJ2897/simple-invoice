import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['test/**/*.e2e-spec.ts'],
    // talks to a real Postgres, which may be a remote one
    testTimeout: 60_000,
    hookTimeout: 120_000,
    fileParallelism: false,
  },
});
