/**
 * Header keamanan wajib pada SETIAP response (US4 spec 002, FR-009).
 * Kontrak lengkap + alasan tiap nilai:
 * specs/002-production-readiness/contracts/security-headers-contract.md
 *
 * Diekstrak sebagai modul terpisah dari worker/index.js supaya dapat diuji
 * sebagai fungsi murni tanpa runtime Worker sungguhan (T021).
 */
export const SECURITY_HEADERS = Object.freeze({
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://*.sentry.io; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
});

/**
 * CSP dilonggarkan HANYA saat `isDev` true. Vite menyuntikkan `<script>`
 * inline untuk preamble React Fast Refresh (HMR) yang diblokir CSP ketat di
 * atas — tanpa ini `npm run dev` gagal total sejak halaman pertama dimuat.
 *
 * `staging`/`production` TIDAK PERNAH melewati cabang ini: keduanya adalah
 * output `vite build` (bukan `vite dev`), jadi `isDev` selalu false untuk
 * keduanya. Kontrak header ketat (contracts/security-headers-contract.md,
 * quickstart.md § V-4) hanya mengikat kedua environment itu, bukan dev lokal.
 * Jika `isDev` tidak terkirim sama sekali (undefined/falsy), default-nya
 * adalah SECURITY_HEADERS yang ketat (fail-closed), bukan yang longgar.
 *
 * CATATAN 2026-08-09 — kenapa BUKAN `env.ENVIRONMENT` dari wrangler `vars`:
 * terbukti lewat pengujian lokal bahwa override `vars` per-environment di
 * `wrangler.jsonc` (`env.staging.vars`/`env.production.vars`) TIDAK bertahan
 * lewat config redirect yang dibuat @cloudflare/vite-plugin saat `vite build`
 * — persis alur yang dipakai `deploy.yml` (`npm run build` lalu
 * `wrangler deploy --env <x>`). Andai keputusan CSP ketat/longgar ini
 * bergantung pada `env.ENVIRONMENT`, staging DAN production akan diam-diam
 * mewarisi CSP longgar. `import.meta.env.DEV` tidak melalui wrangler sama
 * sekali — konstanta build-time Vite yang sepenuhnya independen dari isu ini.
 */
const DEV_CONTENT_SECURITY_POLICY =
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' ws: wss: https://*.sentry.io; frame-ancestors 'none'";

export function headersUntukEnvironment(isDev) {
  if (isDev) {
    return { ...SECURITY_HEADERS, 'Content-Security-Policy': DEV_CONTENT_SECURITY_POLICY };
  }
  return SECURITY_HEADERS;
}

/**
 * Mengembalikan Response BARU dengan header keamanan tertambah — Response
 * bawaan immutable soal header, jadi tidak bisa dimutasi in-place.
 */
export function applySecurityHeaders(response, isDev) {
  const headers = new globalThis.Headers(response.headers);
  for (const [name, value] of Object.entries(headersUntukEnvironment(isDev))) {
    headers.set(name, value);
  }
  return new globalThis.Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
