import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { sites } from './build/sites-vite-plugin';

export default defineConfig(({ mode }) => ({
  plugins: mode === 'test' ? [react()] : [react(), sites(), cloudflare()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
}));
