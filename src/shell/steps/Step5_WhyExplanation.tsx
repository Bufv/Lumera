import { color, radius, spacing, typography } from '../../design/tokens';

/**
 * Penjelasan "Kenapa?" (langkah 5). Milik Shell.
 *
 * Ditampilkan pada jawaban BENAR maupun SALAH — Prinsip II. Registry sudah menolak modul
 * yang mengembalikan teks kosong, jadi komponen ini selalu punya isi.
 */
export function Step5_WhyExplanation({ teks }: { teks: string }) {
  return (
    <section
      style={{
        maxWidth: '46rem',
        margin: '0 auto',
        background: color.surface,
        border: `1px solid ${color.border}`,
        borderRadius: radius.md,
        padding: spacing.lg,
      }}
    >
      <h2
        style={{
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.sm,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: color.teal,
          marginBottom: spacing.sm,
        }}
      >
        Kenapa begitu?
      </h2>
      <p
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.size.lg,
          lineHeight: typography.lineHeight.normal,
          color: color.ink,
        }}
      >
        {teks}
      </p>
    </section>
  );
}
