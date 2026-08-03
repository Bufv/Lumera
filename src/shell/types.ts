import type { ComponentType } from 'react';

/**
 * Kontrak modul ↔ LessonShell.
 * Sumber: specs/001-core-mvp-prototype/contracts/lesson-module-contract.md
 *
 * Modul hanya mengisi slot langkah 2 (Model visual) dan 3 (Aksi pengguna).
 * Langkah 1, 4, 5, 6, 7 milik Shell — modul tidak punya kendali atas transisi antar langkah.
 */

export interface AttemptResult {
  benar: boolean;
  /** Wajib non-null saat `benar === false` (kontrak aturan 4). */
  mistakeType: string | null;
  nomorPercobaan: number;
}

export interface VisualModelProps<TState = unknown> {
  state: TState;
  onStateChange: (next: TState) => void;
}

export interface UserActionProps<TState = unknown, TJawaban = unknown> {
  state: TState;
  /** Boleh dipanggil berkali-kali; Shell menaikkan nomorPercobaan tiap panggilan. */
  onSubmit: (jawaban: TJawaban) => void;
  /** true saat Shell sedang menampilkan umpan balik. */
  disabled: boolean;
}

/** Metadata verifikasi konten — wajib terisi sebelum rilis (FR-016, FR-020). */
export interface VerifikasiKonten {
  /** Capaian Pembelajaran Kurikulum Merdeka yang dirujuk. */
  rujukanCP: string;
  penulis: string;
  /** Wajib berbeda dari `penulis` (gate konstitusi). */
  reviewer: string;
  /** ISO date, YYYY-MM-DD. */
  tanggalVerifikasi: string;
}

export interface LessonModule<TState = unknown, TJawaban = unknown> {
  id: string;
  subjectWorldId: string;
  judul: string;
  /** Tidak boleh kosong — dipakai sebagai concept_id pada event log (FR-015). */
  conceptIds: string[];

  /** Langkah 1 — dirender Shell. */
  prompt: string;
  /**
   * Langkah 5 — dirender Shell.
   * Wajib mengembalikan teks non-kosong untuk `benar === true` MAUPUN `false`.
   * String kosong pada jawaban benar adalah pelanggaran Prinsip II, bukan optimasi.
   */
  penjelasanKenapa: (hasil: AttemptResult) => string;
  /** Langkah 6 — dirender Shell. */
  pertanyaanRefleksi: string;

  /** Slot langkah 2 — milik modul. */
  VisualModel: ComponentType<VisualModelProps<TState>>;
  /** Slot langkah 3 — milik modul. */
  UserAction: ComponentType<UserActionProps<TState, TJawaban>>;

  /** State awal simulasi modul. */
  initialState: TState;
  /** Menilai jawaban; wajib mengisi mistakeType saat salah. */
  nilai: (jawaban: TJawaban, state: TState) => { benar: boolean; mistakeType: string | null };

  verifikasi: VerifikasiKonten;
}

export type AnyLessonModule = LessonModule<never, never>;

/** Ketujuh langkah, berurutan. Shell yang memiliki urutan ini. */
export const LESSON_STEPS = [
  'prompt',
  'visual',
  'action',
  'feedback',
  'why',
  'reflection',
  'continue',
] as const;

export type LessonStep = (typeof LESSON_STEPS)[number];
