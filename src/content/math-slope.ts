import type { AttemptResult, VerifikasiKonten } from '../shell/types';
import type { SlopeMistake, SlopeState } from '../modules/math-slope/scoring';
import { kemiringanSebenarnya } from '../modules/math-slope/scoring';

/** Naskah pelajaran dipisah dari kode komponen (R-006) agar bisa direview tanpa membaca React. */

export const stateAwal: SlopeState = { x1: 1, y1: 2, x2: 7, y2: 8, penunjukX: 1 };

export const conceptIds = ['kemiringan-garis', 'gradien-linear'];

export const prompt =
  'Garis ini naik dari titik (1, 2) ke titik (7, 8). Telusuri garisnya dengan menggeser titik bantu, lalu tentukan kemiringannya.';

export const pertanyaanRefleksi =
  'Kalau garisnya dibuat lebih curam tapi melewati titik awal yang sama, bagian mana dari perhitunganmu yang berubah?';

export function penjelasanKenapa(hasil: AttemptResult): string {
  const m = kemiringanSebenarnya(stateAwal);
  const dasar = `Kemiringan adalah perubahan y dibagi perubahan x: (8 − 2) / (7 − 1) = 6 / 6 = ${m}.`;

  if (hasil.benar) {
    return `${dasar} Setiap kali x bertambah 1, y ikut bertambah ${m} — itulah arti kemiringan ${m}.`;
  }

  switch (hasil.mistakeType as SlopeMistake) {
    case 'terbalik_dx_dy':
      return `${dasar} Sepertinya kamu membagi perubahan x dengan perubahan y. Urutannya penting: yang dibagi adalah perubahan y, penyebutnya perubahan x.`;
    case 'tanda_terbalik':
      return `${dasar} Besarnya sudah tepat, tapi tandanya terbalik. Garis ini naik ke kanan, jadi kemiringannya positif.`;
    default:
      return `${dasar} Coba baca ulang selisihnya dari grafik: berapa y bertambah saat x bergerak dari 1 ke 7?`;
  }
}

export const verifikasi: VerifikasiKonten = {
  rujukanCP:
    'Fase D Matematika — Aljabar: peserta didik dapat menentukan kemiringan (gradien) garis lurus dari dua titik dan dari grafik.',
  penulis: 'tim-kurikulum-lumera',
  reviewer: 'reviewer-pedagogi-matematika',
  tanggalVerifikasi: '2026-07-29',
};
