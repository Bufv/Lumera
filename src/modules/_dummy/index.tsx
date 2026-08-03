import type { LessonModule } from '../../shell/types';
import { color, spacing, typography } from '../../design/tokens';

/**
 * Modul dummy — HANYA untuk memvalidasi bahwa LessonShell menjalankan ketujuh langkah
 * dan bahwa kontrak slot benar-benar reusable (T022). Tidak didaftarkan ke registry
 * produksi dan tidak muncul di Atlas.
 */

interface DummyState {
  nilai: number;
}

export const dummyModule: LessonModule<DummyState, number> = {
  id: '_dummy',
  subjectWorldId: '_dev',
  judul: 'Modul Uji Shell',
  conceptIds: ['uji-shell'],

  prompt: 'Geser ke angka 5, lalu kirim jawabanmu.',
  pertanyaanRefleksi: 'Apa yang berubah saat kamu menggeser slider?',
  penjelasanKenapa: (h) =>
    h.benar
      ? 'Benar. Nilai state modul memang berubah nyata mengikuti slider.'
      : 'Nilai yang dikirim belum 5. Perhatikan angka yang tampil saat menggeser.',

  initialState: { nilai: 0 },
  nilai: (jawaban) =>
    jawaban === 5 ? { benar: true, mistakeType: null } : { benar: false, mistakeType: 'nilai_salah' },

  VisualModel: ({ state, onStateChange }) => (
    <div style={{ textAlign: 'center', padding: spacing.xl }}>
      <p style={{ fontFamily: typography.fontFamily, fontSize: typography.size.xxl, color: color.ink }}>
        {state.nilai}
      </p>
      <input
        type="range"
        min={0}
        max={10}
        value={state.nilai}
        aria-label="Nilai uji"
        onChange={(e) => onStateChange({ nilai: Number(e.target.value) })}
      />
    </div>
  ),

  UserAction: ({ state, onSubmit, disabled }) => (
    <div style={{ textAlign: 'center', padding: spacing.md }}>
      <button type="button" disabled={disabled} onClick={() => onSubmit(state.nilai)}>
        Kirim {state.nilai}
      </button>
    </div>
  ),

  verifikasi: {
    rujukanCP: 'N/A — modul uji internal',
    penulis: 'tim-lumera',
    reviewer: 'tim-lumera-qa',
    tanggalVerifikasi: '2026-07-29',
  },
};
