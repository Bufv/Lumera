import { useState } from 'react';
import { color, radius, spacing, typography } from '../../design/tokens';

/**
 * Refleksi (langkah 6). Milik Shell.
 * Jawaban refleksi tidak dinilai — tujuannya memaksa siswa berhenti sejenak dan
 * mengartikulasikan pemahamannya, bukan menambah satu ronde penilaian lagi.
 */
export function Step6_Reflection({ pertanyaan }: { pertanyaan: string }) {
  const [jawaban, setJawaban] = useState('');

  return (
    <section style={{ maxWidth: '46rem', margin: '0 auto', padding: spacing.lg }}>
      <h2
        style={{
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.sm,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: color.inkMuted,
          marginBottom: spacing.sm,
        }}
      >
        Refleksi
      </h2>
      <label
        htmlFor="refleksi"
        style={{
          display: 'block',
          fontFamily: typography.fontFamily,
          fontSize: typography.size.lg,
          color: color.ink,
          marginBottom: spacing.md,
        }}
      >
        {pertanyaan}
      </label>
      <textarea
        id="refleksi"
        value={jawaban}
        onChange={(e) => setJawaban(e.target.value)}
        rows={3}
        placeholder="Tulis dengan kalimatmu sendiri…"
        style={{
          width: '100%',
          padding: spacing.md,
          border: `1px solid ${color.border}`,
          borderRadius: radius.sm,
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.base,
          color: color.ink,
          background: color.surface,
          resize: 'vertical',
        }}
      />
    </section>
  );
}
