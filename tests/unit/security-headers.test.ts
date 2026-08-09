import { describe, expect, it } from 'vitest';
import { applySecurityHeaders, SECURITY_HEADERS } from '../../worker/security-headers.js';

/**
 * contracts/security-headers-contract.md: header ini WAJIB hadir pada setiap
 * response, termasuk aset statis yang sukses (200) — bukan hanya fallback SPA.
 * Diekstrak sebagai fungsi murni (T020) khusus agar dapat diuji di sini tanpa
 * runtime Worker/Cloudflare sungguhan (T021).
 */
describe('applySecurityHeaders (US4 spec 002)', () => {
  it('menambahkan seluruh header wajib dari kontrak pada response 200', () => {
    const original = new Response('<html></html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

    const hasil = applySecurityHeaders(original);

    for (const [nama, nilai] of Object.entries(SECURITY_HEADERS)) {
      expect(hasil.headers.get(nama)).toBe(nilai);
    }
  });

  it('juga menambahkan header pada response fallback SPA (bukan hanya aset sukses)', () => {
    const fallback = new Response('<html>index</html>', { status: 200 });
    const hasil = applySecurityHeaders(fallback);

    expect(hasil.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
    expect(hasil.headers.get('X-Frame-Options')).toBe('DENY');
  });

  it('mempertahankan status, statusText, dan header asli yang tidak tumpang tindih', () => {
    const original = new Response('not found', {
      status: 404,
      statusText: 'Not Found',
      headers: { 'Content-Type': 'text/plain' },
    });

    const hasil = applySecurityHeaders(original);

    expect(hasil.status).toBe(404);
    expect(hasil.statusText).toBe('Not Found');
    expect(hasil.headers.get('Content-Type')).toBe('text/plain');
    expect(hasil.headers.get('X-Content-Type-Options')).toBe('nosniff');
  });

  it('CSP mengizinkan connect-src ke Sentry tapi tidak liar (bukan wildcard *)', () => {
    const csp = SECURITY_HEADERS['Content-Security-Policy'];
    expect(csp).toContain('connect-src');
    expect(csp).not.toContain("connect-src *");
    expect(csp).toContain('sentry.io');
  });
});
