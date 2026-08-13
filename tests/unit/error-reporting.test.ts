import { describe, expect, it } from 'vitest';
import type { ErrorEvent as SentryErrorEvent } from '@sentry/react';
import { scrubBeforeSend } from '../../src/monitoring/errorReporting';

/**
 * data-model.md § ErrorReportContext: hanya message/stack/route/appVersion
 * yang boleh keluar dari perangkat siswa. Test ini memastikan field berisiko
 * PII benar-benar disaring, bukan sekadar diasumsikan aman karena
 * `sendDefaultPii: false` di init() (lapisan pertama tidak cukup dites
 * langsung tanpa DSN sungguhan, jadi lapisan kedua inilah yang diverifikasi).
 */
describe('scrubBeforeSend (US3 spec 002 — instrumentasi tanpa membocorkan PII)', () => {
  function eventBerisiko(): SentryErrorEvent {
    return {
      event_id: 'abc123',
      timestamp: 1234567890,
      platform: 'javascript',
      release: 'test-sha',
      exception: {
        values: [{ type: 'Error', value: 'Gagal memuat modul' }],
      },
      // Field di bawah ini SEMUA harus disaring habis:
      user: { id: 'siswa-123', email: 'siswa@contoh.com', username: 'Ardi' },
      request: {
        headers: { Cookie: 'sesi=rahasia', 'User-Agent': 'Mozilla/5.0 ...' },
        url: 'https://lumera.example/beranda',
      },
      breadcrumbs: [
        { message: 'displayName diubah menjadi Ardi Pratama', category: 'ui.input' },
        { message: JSON.stringify({ lumens: 50, streakCount: 3 }), category: 'console' },
      ],
      extra: { localStorageSnapshot: '{"lumera.profile.v1":"..."}' },
      contexts: { device: { name: 'iPhone 15' }, culture: { locale: 'id-ID' } },
    } as unknown as SentryErrorEvent;
  }

  it('membuang user, request, breadcrumbs, extra, dan contexts sepenuhnya', () => {
    const hasil = scrubBeforeSend(eventBerisiko());

    expect(hasil).not.toBeNull();
    expect(hasil).not.toHaveProperty('user');
    expect(hasil).not.toHaveProperty('request');
    expect(hasil).not.toHaveProperty('breadcrumbs');
    expect(hasil).not.toHaveProperty('extra');
    expect(hasil).not.toHaveProperty('contexts');
  });

  it('tetap meloloskan message/stack (lewat exception) dan appVersion (lewat release)', () => {
    const hasil = scrubBeforeSend(eventBerisiko());

    expect(hasil?.exception?.values?.[0]?.value).toBe('Gagal memuat modul');
    expect(hasil?.release).toBe('test-sha');
  });

  it('menyematkan route dari hash aplikasi saat ini sebagai tag, bukan dari breadcrumbs', () => {
    window.location.hash = '#/pelajaran?modul=math-slope';
    const hasil = scrubBeforeSend(eventBerisiko());

    expect(hasil?.tags?.route).toBe('#/pelajaran?modul=math-slope');
  });

  it('tidak pernah menyertakan string yang mengandung nama siswa dari fixture manapun', () => {
    const hasil = scrubBeforeSend(eventBerisiko());
    const serialized = JSON.stringify(hasil);

    expect(serialized).not.toContain('Ardi');
    expect(serialized).not.toContain('siswa@contoh.com');
    expect(serialized).not.toContain('rahasia');
  });
});
