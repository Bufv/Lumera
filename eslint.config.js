import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

// US9 spec 002 (T048, R-007): gerbang aksesibilitas statis — gagal lint jika
// melanggar, bukan hanya diaudit manual. `flat/recommended` sudah mencakup
// aturan seperti alt-text/aria-* yang paling sering terlewat.
export default tseslint.config(
  {
    // `docs/sample/` dan `Beranda.tsx` di root adalah referensi desain yang
    // dikutip/ditempel dari luar (lihat docs/desain-fondasi.md) — bukan kode
    // aplikasi (Vite hanya membundel dari `src/`) dan sengaja tidak diperbaiki
    // agar tetap jadi rujukan apa adanya.
    ignores: [
      'dist/',
      'build/',
      'coverage/',
      'node_modules/',
      '*.min.js',
      'docs/sample/',
      'Beranda.tsx',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
);
