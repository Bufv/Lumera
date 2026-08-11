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
 * Field yang boleh ikut terkirim. Ini keseluruhan permukaan yang diizinkan —
 * apa pun di luar daftar ini dibuang, termasuk field yang belum ada saat baris
 * ini ditulis (mis. field baru dari upgrade SDK Sentry).
 *
 * `exception` membawa message + stack; `release` membawa appVersion; `route`
 * ditambahkan terpisah sebagai tag di bawah. Sisanya adalah metadata transport
 * tanpa isi yang bisa dihubungkan ke siswa tertentu.
 */
export const FIELD_EVENT_DIIZINKAN: readonly (keyof Sentry.ErrorEvent)[] = [
  'event_id',
  'timestamp',
  'platform',
  'level',
  'environment',
  'release',
  'sdk',
  'exception',
  'message',
];

/**
 * Menyaring event Sentry sebelum terkirim. Dibuat sebagai fungsi murni terpisah
 * (bukan inline di initErrorReporting) supaya dapat diuji tanpa DSN/network
 * sungguhan — lihat tests/unit/error-reporting.test.ts.
 *
 * ALLOWLIST sungguhan: event dibangun ulang dari nol berisi hanya
 * `FIELD_EVENT_DIIZINKAN`. Versi sebelumnya membuang lima field berisiko lewat
 * destructuring lalu menyebar sisanya (`...safeEvent`) — itu default-ALLOW, dan
 * setiap field baru yang ditambahkan Sentry SDK di kemudian hari akan lolos
 * sendiri tanpa ada yang menyadarinya. Kontrak T013/data-model.md § ErrorReportContext
 * menuntut kebalikannya: default-DENY.
 */
export function scrubBeforeSend(
  event: Sentry.ErrorEvent,
): Sentry.ErrorEvent | null {
  const aman: Record<string, unknown> = {};

  for (const field of FIELD_EVENT_DIIZINKAN) {
    if (event[field] !== undefined) {
      aman[field] = event[field];
    }
  }

  // Tag dibangun dari nol, bukan menyebar `event.tags` — tag yang disetel di
  // tempat lain (atau oleh integrasi Sentry) tidak otomatis ikut lolos.
  aman.tags = {
    // Rute aplikasi saat ini (hash) — konteks navigasi, bukan identitas siswa.
    route: typeof window !== 'undefined' ? window.location.hash || '(unknown)' : '(unknown)',
  };

  // `type: undefined` adalah penanda wajib Sentry untuk event error (bukan
  // transaction). Disetel eksplisit karena allowlist membangun objek dari nol,
  // jadi tidak ada field yang terbawa diam-diam dari event asal.
  return { ...aman, type: undefined } as Sentry.ErrorEvent;
}
