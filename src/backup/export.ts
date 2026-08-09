import { loadLearnerProfile } from '../profile';
import { bacaSiswa } from '../progress/store';
import { EXPORT_SCHEMA_VERSION, namaBerkasEkspor, type ExportedProgressFile } from './schema';

/** Bagian murni/testable — memisahkan pembentukan data dari efek samping unduhan (T036). */
export function buatBerkasEkspor(): ExportedProgressFile {
  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    siswa: bacaSiswa(),
    learnerProfile: loadLearnerProfile(),
  };
}

/**
 * Memicu unduhan berkas ekspor lewat Blob + elemen `<a download>` — Web API
 * bawaan, tidak ada dependency baru (R-010 research.md).
 */
export function unduhBerkasEkspor(): void {
  const data = buatBerkasEkspor();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = namaBerkasEkspor();
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
