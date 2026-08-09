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
 * Mengembalikan Response BARU dengan header keamanan tertambah — Response
 * bawaan immutable soal header, jadi tidak bisa dimutasi in-place.
 */
export function applySecurityHeaders(response) {
  const headers = new globalThis.Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new globalThis.Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
