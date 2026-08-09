import * as Sentry from '@sentry/react';

/**
 * Pemantauan error produksi (US3, spec 002). Sentry tingkatan gratis; tidak ada
 * backend sendiri untuk menampung log error (R-004 research.md).
 *
 * PENTING (Constitution Prinsip VI vs privasi anak — Constitution Check plan.md):
 * hanya field pada data-model.md § ErrorReportContext yang boleh meninggalkan
 * perangkat siswa: `message`, `stack`, `route`, `appVersion`. TIDAK PERNAH nama
 * tampilan, isi localStorage, IP, atau user agent penuh. `sendDefaultPii: false`
 * menutup jalur bawaan Sentry; `scrubBeforeSend` di bawah adalah lapisan kedua
 * yang eksplisit — jangan bergantung pada satu lapisan saja.
 */

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export function initErrorReporting(): void {
  if (!DSN) {
    // Tanpa DSN (mis. build lokal/dev), pemantauan dinonaktifkan secara EKSPLISIT.
    // Bukan kegagalan diam-diam — memang belum ada tujuan pengiriman.
    return;
  }

  Sentry.init({
    dsn: DSN,
    release: import.meta.env.VITE_APP_VERSION,
    // Nonaktifkan pengiriman otomatis IP address & data PII bawaan Sentry.
    sendDefaultPii: false,
    beforeSend: scrubBeforeSend,
  });
}

/**
 * Menyaring event Sentry sebelum terkirim. Dibuat sebagai fungsi murni terpisah
 * (bukan inline di initErrorReporting) supaya dapat diuji tanpa DSN/network
 * sungguhan — lihat tests/unit/error-reporting.test.ts.
 *
 * Pendekatan ALLOWLIST lewat destructuring-drop: field berisiko (user, request,
 * breadcrumbs, extra, contexts) dibuang eksplisit alih-alih mencoba menebak
 * field baru yang mungkin ditambahkan Sentry SDK di masa depan.
 */
export function scrubBeforeSend(
  event: Sentry.ErrorEvent,
): Sentry.ErrorEvent | null {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user, request, breadcrumbs, extra, contexts, ...safeEvent } = event;

  return {
    ...safeEvent,
    tags: {
      ...safeEvent.tags,
      // Rute aplikasi saat ini (hash) — konteks navigasi, bukan identitas siswa.
      route: typeof window !== 'undefined' ? window.location.hash || '(unknown)' : '(unknown)',
    },
  };
}
