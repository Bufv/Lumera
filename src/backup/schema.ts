import type { LearnerProfile } from '../profile';
import type { Siswa } from '../progress/store';

/**
 * Format berkas ekspor/impor progres (US7 spec 002, FR-018–020).
 * Kontrak lengkap: specs/002-production-readiness/contracts/progress-export-contract.md
 */

/** Versi bentuk BERKAS EKSPOR itu sendiri — terpisah dari schemaVersion di
 * dalam `siswa`/`learnerProfile` (kontrak aturan 1). */
export const EXPORT_SCHEMA_VERSION = 1;

export interface ExportedProgressFile {
  schemaVersion: number;
  /** ISO 8601 — dipakai untuk peringatan menimpa data lebih baru (kontrak aturan 4). */
  exportedAt: string;
  siswa: Siswa;
  learnerProfile: LearnerProfile;
}

export function namaBerkasEkspor(tanggal: Date = new Date()): string {
  const iso = tanggal.toISOString().slice(0, 10); // YYYY-MM-DD
  return `lumera-progres-${iso}.json`;
}
