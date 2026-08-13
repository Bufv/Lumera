import { normalizeLearnerProfile, saveLearnerProfile, type LearnerProfile } from '../profile';
import { migrasiSiswa, simpanSiswa, type Siswa } from '../progress/store';
import { EXPORT_SCHEMA_VERSION, type ExportedProgressFile } from './schema';

/**
 * Validasi & penerapan berkas impor progres (US7 spec 002, T037).
 * Kontrak: specs/002-production-readiness/contracts/progress-export-contract.md
 *
 * Dipisah jadi dua langkah (validasi murni → terap efek samping) supaya UI
 * dapat menampilkan konfirmasi "berkas ini lebih lama dari progresmu saat
 * ini" SEBELUM menimpa apapun (kontrak aturan 4), dan supaya validasi dapat
 * diuji tanpa localStorage sungguhan.
 */

export type ValidasiImporHasil =
  | { ok: false; error: string }
  | {
      ok: true;
      data: ExportedProgressFile;
      /** true jika `exportedAt` berkas lebih lama dari data lokal — UI MUST minta konfirmasi eksplisit sebelum menimpa. */
      perluKonfirmasiTimpa: boolean;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Waktu pembaruan mastery terbaru pada data lokal, atau null jika belum ada progres sama sekali. */
function pembaruanTerakhir(siswa: Siswa): string | null {
  let terbaru: string | null = null;
  for (const catatan of siswa.mastery) {
    if (!terbaru || catatan.diperbaruiPada > terbaru) terbaru = catatan.diperbaruiPada;
  }
  return terbaru;
}

/**
 * Mem-parse dan memvalidasi teks berkas mentah. Tidak menyentuh localStorage —
 * lihat terapkanImpor() untuk langkah penerapan.
 */
export function validasiBerkasImpor(rawText: string, siswaLokal: Siswa): ValidasiImporHasil {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    return { ok: false, error: 'Berkas bukan JSON yang valid — pastikan ini berkas ekspor Lumera.' };
  }

  if (!isRecord(parsed)) {
    return { ok: false, error: 'Berkas tidak valid — bentuknya bukan objek JSON.' };
  }

  const { schemaVersion, exportedAt, siswa, learnerProfile } = parsed as Partial<ExportedProgressFile>;

  if (typeof schemaVersion !== 'number') {
    return { ok: false, error: 'Berkas tidak memiliki penanda versi (schemaVersion) yang valid.' };
  }
  // Kontrak aturan 2: berkas dari versi Lumera yang lebih baru dari yang dimengerti aplikasi ini.
  if (schemaVersion > EXPORT_SCHEMA_VERSION) {
    return {
      ok: false,
      error: 'Berkas ini dibuat oleh versi Lumera yang lebih baru. Perbarui aplikasi lalu coba lagi.',
    };
  }

  if (!isRecord(siswa) || !isRecord(learnerProfile)) {
    return { ok: false, error: 'Berkas tidak lengkap — data progres atau profil hilang.' };
  }

  if (typeof exportedAt !== 'string' || Number.isNaN(Date.parse(exportedAt))) {
    return { ok: false, error: 'Berkas tidak memiliki waktu ekspor yang valid.' };
  }

  // Kontrak aturan 3: migrasi berurutan lewat fungsi yang sama dipakai bacaSiswa()/
  // normalizeLearnerProfile() — satu sumber kebenaran untuk "apa itu bentuk valid".
  const data: ExportedProgressFile = {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    exportedAt,
    siswa: migrasiSiswa(siswa as Partial<Siswa>),
    learnerProfile: normalizeLearnerProfile(learnerProfile) as LearnerProfile,
  };

  const lokalTerbaru = pembaruanTerakhir(siswaLokal);
  const perluKonfirmasiTimpa = lokalTerbaru !== null && exportedAt < lokalTerbaru;

  return { ok: true, data, perluKonfirmasiTimpa };
}

/** Menerapkan berkas yang SUDAH divalidasi (dan sudah dikonfirmasi siswa bila perlu) ke localStorage. */
export function terapkanImpor(data: ExportedProgressFile): void {
  simpanSiswa(data.siswa);
  saveLearnerProfile(data.learnerProfile);
}
