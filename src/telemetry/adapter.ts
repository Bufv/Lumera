import type { LearningEvent, TelemetryAdapter } from './events';
import { pastikanEventValid } from './validate';

/**
 * Adapter telemetry berbasis localStorage (R-002).
 *
 * Antarmukanya ASYNC sejak awal meski implementasinya sinkron. Saat backend dibangun,
 * hanya isi berkas ini yang berubah — tidak ada pemanggil yang perlu disentuh.
 */

const STORAGE_KEY = 'lumera.telemetry.events.v1';

function bacaMentah(): LearningEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LearningEvent[]) : [];
  } catch {
    // Data rusak tidak boleh menjatuhkan aplikasi, tapi juga tidak boleh lewat diam-diam.
    console.error('[lumera/telemetry] gagal membaca event tersimpan; mengembalikan daftar kosong');
    return [];
  }
}

export function buatLocalStorageTelemetry(): TelemetryAdapter {
  return {
    async record(event: LearningEvent): Promise<void> {
      // Validasi SEBELUM tulis. Melempar, bukan menelan — lihat validate.ts.
      pastikanEventValid(event);

      const semua = bacaMentah();

      // Kontrak aturan 1: tepat sekali per pelajaran selesai.
      if (semua.some((e) => e.eventId === event.eventId)) {
        throw new Error(`[lumera/telemetry] eventId duplikat: ${event.eventId}`);
      }

      semua.push(event);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(semua));
    },

    async readAll(): Promise<LearningEvent[]> {
      return bacaMentah();
    },

    async clear(): Promise<void> {
      localStorage.removeItem(STORAGE_KEY);
    },
  };
}

export const telemetry = buatLocalStorageTelemetry();

// Diekspos ke konsol peramban agar quickstart V-7 bisa dijalankan tanpa devtools tambahan.
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).lumeraTelemetry = telemetry;
}
