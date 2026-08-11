import { describe, expect, it } from 'vitest';
import {
  applySecurityHeaders,
  SECURITY_HEADERS,
  VERSION_HEADER,
} from '../../worker/security-headers.js';

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

  it('menghilangkan hanya CSP pada Vite development agar React Refresh dapat berjalan', () => {
    const original = new Response('<html></html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    });

    const hasil = applySecurityHeaders(original, {
      omitContentSecurityPolicy: true,
    });

    expect(hasil.headers.get('Content-Security-Policy')).toBeNull();
    expect(hasil.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(hasil.headers.get('X-Frame-Options')).toBe('DENY');
    expect(hasil.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
  });

  /**
   * FR-005 (T047): versi yang sedang dilayani MUST terbaca dari aplikasi hidup,
   * tanpa menunggu error terjadi (Sentry) atau membuka riwayat pipeline.
   */
  it('menyematkan versi build sebagai header keterlacakan rilis', () => {
    const original = new Response('<html></html>', { status: 200 });

    const hasil = applySecurityHeaders(original, { appVersion: 'abc1234' });

    expect(hasil.headers.get(VERSION_HEADER)).toBe('abc1234');
  });

  it('menyematkan versi pada fallback SPA dan response error, bukan hanya aset sukses', () => {
    for (const status of [200, 404]) {
      const hasil = applySecurityHeaders(new Response('x', { status }), {
        appVersion: 'abc1234',
      });
      expect(hasil.headers.get(VERSION_HEADER)).toBe('abc1234');
    }
  });

  it('tidak menyematkan header versi kosong ketika versi tidak diketahui', () => {
    const hasil = applySecurityHeaders(new Response('x', { status: 200 }));

    expect(hasil.headers.get(VERSION_HEADER)).toBeNull();
  });

  it('header versi tidak tercampur ke dalam daftar header keamanan', () => {
    // Keduanya melayani requirement berbeda (FR-005 vs FR-009); mencampurnya
    // membuat perubahan pada satu diam-diam mengubah makna yang lain.
    expect(Object.keys(SECURITY_HEADERS)).not.toContain(VERSION_HEADER);
  });

  it('CSP mengizinkan connect-src ke Sentry tapi tidak liar (bukan wildcard *)', () => {
    const csp = SECURITY_HEADERS['Content-Security-Policy'];
    expect(csp).toContain('connect-src');
    expect(csp).not.toContain('connect-src *');
    expect(csp).toContain('sentry.io');
    expect(csp).toContain("script-src 'self'");
    expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
  });
});
