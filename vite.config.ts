/// <reference types="vitest" />
import { defineConfig } from 'vite';

const basePath = process.env.VITE_BASE_PATH ?? '/';

export default defineConfig({
  base: basePath.endsWith('/') ? basePath : `${basePath}/`,
  test: {
    include: ['api/**/*.test.ts'],
    environment: 'node',
  },
});