import * as konten from '../../content/math-slope';

/**
 * Metadata ringan modul — TIDAK mengimpor `VisualModel`/`UserAction` (React
 * components). Diimpor oleh `index.ts` (modul penuh) DAN oleh
 * `src/modules/index.ts` (registry lazy, US11 spec 002 T061) — satu sumber
 * kebenaran, tanpa duplikasi nilai antara keduanya.
 */
export const mathSlopeMeta = {
  id: 'math-slope',
  subjectWorldId: 'matematika',
  judul: 'Membaca Kemiringan Grafik',
  conceptIds: konten.conceptIds,
} as const;
