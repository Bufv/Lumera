/**
 * Skema event pembelajaran (FR-015, Prinsip VI).
 * Sumber: specs/001-core-mvp-prototype/contracts/learning-event-contract.md
 *
 * Knowledge Bank & Refresh Harian belum dibangun, tapi keduanya nanti bergantung
 * penuh pada data ini — dan data yang tidak direkam hari ini hilang permanen.
 * Karena itu bentuknya dikunci sekarang.
 */

export const SCHEMA_VERSION = 1 as const;

export interface MistakeEntry {
  conceptId: string;
  mistakeType: string;
  nomorPercobaan: number;
}

export interface LessonCompletedEvent {
  type: 'lesson_completed';
  eventId: string;
  siswaId: string;
  moduleId: string;
  /** Wajib non-kosong. */
  conceptIds: string[];
  /** Boleh kosong — siswa bisa benar di percobaan pertama. */
  mistakes: MistakeEntry[];
  /** Wajib > 0. Waktu aktif dari langkah 1 sampai penekanan "Lanjutkan". */
  durasiMs: number;
  /** ISO 8601. */
  selesaiPada: string;
  schemaVersion: typeof SCHEMA_VERSION;
}

export type LearningEvent = LessonCompletedEvent;

export interface TelemetryAdapter {
  record(event: LearningEvent): Promise<void>;
  /** Dipakai untuk memverifikasi SC-006. */
  readAll(): Promise<LearningEvent[]>;
  clear(): Promise<void>;
}

export function buatEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
