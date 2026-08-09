import { cloudflare } from '@cloudflare/vite-plugin';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { sites } from './build/sites-vite-plugin';

// FR-005 / spec 002 T005: setiap build production disematkan versi commit yang
// sedang dibangun, dibaca lewat `import.meta.env.VITE_APP_VERSION`. `ci.yml`
// mengisinya dengan `github.sha`; build lokal tanpa variabel ini jatuh ke
// 'dev' — tidak pernah undefined, agar konsumen (mis. monitoring/errorReporting.ts)
// tidak perlu menangani kasus kosong secara terpisah.
const appVersion = process.env.VITE_APP_VERSION || 'dev';

export default defineConfig(({ mode }) => ({
  plugins: mode === 'test' ? [react()] : [react(), sites(), cloudflare()],
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
  },
  build: {
    // FR-012 / spec 002 T025: source map publik membocorkan detail implementasi
    // internal ke pengguna akhir build production — jangan pernah diterbitkan.
    sourcemap: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
  },
}));
