import type { AttemptResult, VerifikasiKonten } from '../shell/types';
import type { MotionMistake, MotionState } from '../modules/physics-motion/scoring';
import { jarakTempuh, kecepatanPada } from '../modules/physics-motion/scoring';

export const stateAwal: MotionState = { kecepatanAwal: 4, percepatan: 2, waktuTarget: 5 };

export const conceptIds = ['glbb', 'jarak-tempuh', 'percepatan'];

export const prompt =
  'Sebuah benda mulai bergerak dengan kecepatan awal 4 m/s dan percepatan tetap 2 m/s². Jalankan simulasinya, amati apa yang terjadi, lalu tentukan jarak yang ditempuh setelah 5 detik.';

export const pertanyaanRefleksi =
  'Jika percepatannya dijadikan nol tapi kecepatan awalnya tetap, bagaimana bentuk gerak bendanya berubah?';

export function penjelasanKenapa(hasil: AttemptResult): string {
  const { kecepatanAwal: v0, percepatan: a, waktuTarget: t } = stateAwal;
  const s = jarakTempuh(v0, a, t);
  const dasar = `Pada GLBB, jarak dihitung dengan s = v₀·t + ½·a·t² = (${v0}×${t}) + (½×${a}×${t}²) = ${v0 * t} + ${0.5 * a * t * t} = ${s} m.`;

  if (hasil.benar) {
    return `${dasar} Perhatikan bahwa benda makin cepat seiring waktu — itulah sebabnya jaraknya lebih jauh daripada sekadar v₀·t.`;
  }

  switch (hasil.mistakeType as MotionMistake) {
    case 'abaikan_percepatan':
      return `${dasar} Kamu menghitung ${v0 * t} m, yaitu v₀·t saja. Itu berlaku kalau kecepatannya tetap — padahal di sini benda dipercepat, jadi suku ½·a·t² tidak boleh hilang.`;
    case 'lupa_setengah':
      return `${dasar} Suku percepatannya sudah kamu pakai, tapi tanpa faktor ½. Faktor itu muncul karena kecepatan bertambah bertahap dari v₀, bukan langsung maksimum sejak awal.`;
    case 'pakai_kecepatan_akhir':
      return `${dasar} Angka ${kecepatanPada(v0, a, t)} adalah kecepatan akhir (v = v₀ + a·t), satuannya m/s. Yang ditanyakan adalah jarak, satuannya meter.`;
    default:
      return `${dasar} Coba jalankan lagi simulasinya dan perhatikan bacaan s saat t mencapai ${t} detik.`;
  }
}

export const verifikasi: VerifikasiKonten = {
  rujukanCP:
    'Fase E Fisika — Gerak: peserta didik dapat menganalisis besaran gerak lurus berubah beraturan (jarak, kecepatan, percepatan) secara kuantitatif.',
  penulis: 'tim-kurikulum-lumera',
  reviewer: 'reviewer-pedagogi-fisika',
  tanggalVerifikasi: '2026-07-29',
};
