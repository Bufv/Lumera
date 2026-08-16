import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  {
    ignores: ['dist/', 'build/', 'coverage/', 'node_modules/', '*.min.js'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  // Gerbang aksesibilitas statis (spec 002 US9, R-007 research.md; gerbang 1
  // contracts/ci-pipeline-contract.md). Sengaja dibatasi ke `src/` — hanya itu
  // kode yang benar-benar dikirim ke siswa. `docs/sample/` dan `Beranda.tsx` di
  // root adalah artefak referensi yang tidak pernah dirender (lihat CLAUDE.md),
  // jadi memerahkan CI karenanya hanya menciptakan kebisingan tanpa siswa yang
  // diuntungkan.
  {
    files: ['src/**/*.tsx'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // Wadah yang bisa di-scroll MUST dapat difokuskan keyboard (WCAG 2.1.1),
      // dan itulah persis pola `role="region" tabIndex={0}` pada scroller jalur
      // belajar — default rule hanya mengizinkan `tabpanel`.
      'jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'region'] }],
      // Label toggle di Pengaturan membungkus teksnya dalam <span><strong>,
      // jadi teks berada di kedalaman 3 — asosiasi implisitnya sendiri valid.
      'jsx-a11y/label-has-associated-control': ['error', { depth: 3 }],
    },
  },
  // Allow CommonJS files (require, __dirname, console)
  {
    files: ['**/*.cjs'],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 2020,
      globals: {
        console: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off',
    },
  },
);
