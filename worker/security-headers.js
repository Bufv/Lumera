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
 * Header keterlacakan rilis (FR-005, T047). Bukan header keamanan — sengaja
 * dipisah dari SECURITY_HEADERS supaya keduanya tidak tercampur maknanya.
 *
 * Kenapa header dan bukan hanya UI: saat insiden, pertanyaan pertama adalah
 * "versi mana yang SEDANG DILAYANI?". Jawaban lewat Sentry menuntut sebuah error
 * terjadi lebih dulu, dan run Actions terakhir hanya menunjukkan apa yang
 * DI-DEPLOY — bukan hal yang sama bila sebuah rollback sudah berjalan.
 */
export const VERSION_HEADER = 'X-Lumera-Version';

/**
 * Mengembalikan Response BARU dengan header keamanan tertambah — Response
 * bawaan immutable soal header, jadi tidak bisa dimutasi in-place.
 *
 * `appVersion` diterima sebagai argumen, bukan dibaca dari `import.meta.env`
 * di dalam sini, supaya fungsi ini tetap murni dan dapat diuji dengan nilai
 * eksplisit (alasan yang sama dengan ekstraksi modul ini di T020/T021).
 */
export function applySecurityHeaders(
  response,
  { omitContentSecurityPolicy = false, appVersion = '' } = {},
) {
  const headers = new globalThis.Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    if (omitContentSecurityPolicy && name === 'Content-Security-Policy') continue;
    headers.set(name, value);
  }
  if (appVersion) headers.set(VERSION_HEADER, appVersion);
  return new globalThis.Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
