/**
 * Pemilih usulan pelajaran untuk Beranda harian.
 *
 * Ini penerapan celah "beranda harian" dari docs/ux-inspirasi-brilliant.md:
 * mastery MENGGERAKKAN arah belajar, bukan sekadar dipajang. Logika sengaja murni
 * (tanpa React / localStorage) agar bisa diuji otomatis.
 */

import type { Siswa } from './store';
import { SUBJECT_WORLDS } from '../atlas/subject-worlds';

/** Di bawah ambang ini, sebuah modul dianggap masih perlu dilatih. */
export const AMBANG_KUASAI = 80;

/** Urutan prioritas: yang sedang digarap dulu, lalu yang baru, terakhir yang sudah kuat. */
export type AlasanUsulan = 'ulang' | 'baru' | 'pertahankan';

export interface Usulan {
  moduleId: string;
  judul: string;
  subjectWorldNama: string;
  /** null jika belum pernah dikerjakan. */
  masteryPersen: number | null;
  alasan: AlasanUsulan;
}

/** Bentuk minimal modul yang dibutuhkan — cocok dengan LessonModule tanpa mengikat tipe komponen. */
export interface ModulRingkas {
  id: string;
  judul: string;
  subjectWorldId: string;
}

const namaSubjectWorld = new Map(SUBJECT_WORLDS.map((w) => [w.id, w.nama]));

const bobotAlasan: Record<AlasanUsulan, number> = { ulang: 0, baru: 1, pertahankan: 2 };

/**
 * Memilih hingga `batas` pelajaran untuk diusulkan hari ini.
 *
 * - `ulang`: pernah dikerjakan tapi mastery < AMBANG_KUASAI → didahulukan, mastery terendah dulu.
 * - `baru`: belum pernah dikerjakan → dorong keluasan.
 * - `pertahankan`: sudah dikuasai → hanya muncul kalau slot masih tersisa, mastery terendah dulu.
 *
 * Siswa pertama kali (tanpa riwayat) otomatis mendapat seluruh usulan bertipe `baru`.
 */
export function pilihUsulan(modul: ModulRingkas[], siswa: Siswa, batas = 3): Usulan[] {
  const usulan: Usulan[] = modul.map((m) => {
    const rec = siswa.mastery.find((x) => x.moduleId === m.id);
    const masteryPersen = rec ? rec.masteryPersen : null;
    const alasan: AlasanUsulan =
      masteryPersen === null ? 'baru' : masteryPersen < AMBANG_KUASAI ? 'ulang' : 'pertahankan';
    return {
      moduleId: m.id,
      judul: m.judul,
      subjectWorldNama: namaSubjectWorld.get(m.subjectWorldId) ?? m.subjectWorldId,
      masteryPersen,
      alasan,
    };
  });

  usulan.sort((a, b) => {
    if (bobotAlasan[a.alasan] !== bobotAlasan[b.alasan]) {
      return bobotAlasan[a.alasan] - bobotAlasan[b.alasan];
    }
    // Dalam kelompok yang sama, mastery lebih rendah lebih mendesak.
    // `baru` (null) diperlakukan sebagai belum ada skor; urutannya stabil mengikuti input.
    return (a.masteryPersen ?? -1) - (b.masteryPersen ?? -1);
  });

  return usulan.slice(0, batas);
}
