import type { AnyLessonModule, LessonModule } from './types';

/**
 * Registry modul yang MENOLAK modul tidak memenuhi kontrak.
 *
 * Inilah mekanisme yang membuat pelanggaran Prinsip II sulit terjadi secara struktural,
 * bukan sekadar diandalkan pada disiplin manual. Modul yang kehilangan slot, penjelasan
 * "Kenapa?", atau metadata verifikasi tidak akan pernah muncul di aplikasi.
 */

export class ModulTidakMemenuhiKontrakError extends Error {
  readonly pelanggaran: string[];

  constructor(moduleId: string, pelanggaran: string[]) {
    super(`Modul "${moduleId}" ditolak registry: ${pelanggaran.join('; ')}`);
    this.name = 'ModulTidakMemenuhiKontrakError';
    this.pelanggaran = pelanggaran;
  }
}

export function periksaKontrak(modul: Partial<AnyLessonModule>): string[] {
  const p: string[] = [];

  if (!modul.id) p.push('id kosong');
  if (!modul.subjectWorldId) p.push('subjectWorldId kosong');
  if (!modul.judul) p.push('judul kosong');

  if (!Array.isArray(modul.conceptIds) || modul.conceptIds.length === 0) {
    p.push('conceptIds kosong — event log tidak akan valid (FR-015)');
  }

  if (!modul.prompt) p.push('prompt (langkah 1) kosong');
  if (!modul.pertanyaanRefleksi) p.push('pertanyaanRefleksi (langkah 6) kosong');
  if (!modul.VisualModel) p.push('VisualModel (slot langkah 2) tidak disediakan');
  if (!modul.UserAction) p.push('UserAction (slot langkah 3) tidak disediakan');
  if (typeof modul.nilai !== 'function') p.push('nilai() tidak disediakan');

  // Kontrak aturan 1: "Kenapa?" wajib non-kosong pada jawaban BENAR maupun SALAH.
  if (typeof modul.penjelasanKenapa !== 'function') {
    p.push('penjelasanKenapa (langkah 5) tidak disediakan');
  } else {
    for (const benar of [true, false]) {
      try {
        const teks = modul.penjelasanKenapa({
          benar,
          mistakeType: benar ? null : 'contoh',
          nomorPercobaan: 1,
        });
        if (!teks || teks.trim().length === 0) {
          p.push(
            `penjelasanKenapa mengembalikan teks kosong untuk benar=${benar} — ` +
              'Prinsip II menuntut penjelasan muncul di kedua kondisi',
          );
        }
      } catch {
        p.push(`penjelasanKenapa melempar error untuk benar=${benar}`);
      }
    }
  }

  // Gate konstitusi: konten wajib terverifikasi, reviewer ≠ penulis (FR-016, FR-020).
  const v = modul.verifikasi;
  if (!v) {
    p.push('verifikasi konten kosong (FR-016)');
  } else {
    if (!v.rujukanCP) p.push('verifikasi.rujukanCP kosong');
    if (!v.penulis) p.push('verifikasi.penulis kosong');
    if (!v.reviewer) p.push('verifikasi.reviewer kosong');
    if (!v.tanggalVerifikasi) p.push('verifikasi.tanggalVerifikasi kosong');
    if (v.penulis && v.reviewer && v.penulis === v.reviewer) {
      p.push('verifikasi.reviewer sama dengan penulis — gate konstitusi melarang self-review');
    }
  }

  return p;
}

const modulTerdaftar = new Map<string, AnyLessonModule>();

export function daftarkanModul<TState, TJawaban>(modul: LessonModule<TState, TJawaban>): void {
  const pelanggaran = periksaKontrak(modul as unknown as Partial<AnyLessonModule>);
  if (pelanggaran.length > 0) {
    throw new ModulTidakMemenuhiKontrakError(modul.id || '(tanpa id)', pelanggaran);
  }
  modulTerdaftar.set(modul.id, modul as unknown as AnyLessonModule);
}

export function ambilModul(id: string): AnyLessonModule | undefined {
  return modulTerdaftar.get(id);
}

export function semuaModul(): AnyLessonModule[] {
  return [...modulTerdaftar.values()];
}

export function kosongkanRegistry(): void {
  modulTerdaftar.clear();
}
