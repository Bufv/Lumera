import { color, radius, spacing, typography } from '../../design/tokens';

/**
 * Lanjutkan (langkah 7). Milik Shell.
 * Penekanan tombol inilah SATU-SATUNYA titik di mana pelajaran ditandai selesai:
 * Lumens diberikan, streak diperbarui, dan event lesson_completed terbit (FR-014).
 */
export function Step7_Continue({
  onLanjutkan,
  lumensDidapat,
}: {
  onLanjutkan: () => void;
  lumensDidapat: number;
}) {
  return (
    <section
      style={{
        maxWidth: '46rem',
        margin: '0 auto',
        padding: spacing.lg,
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.size.xl,
          color: color.ink,
          marginBottom: spacing.sm,
        }}
      >
        Pelajaran selesai.
      </p>
      <p
        style={{
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.base,
          color: color.inkMuted,
          marginBottom: spacing.xl,
        }}
      >
        +{lumensDidapat} Lumens
      </p>
      <button
        type="button"
        onClick={onLanjutkan}
        style={{
          background: color.teal,
          color: color.ivory,
          border: 'none',
          borderRadius: radius.pill,
          padding: `${spacing.md} ${spacing.xl}`,
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.base,
          fontWeight: typography.weight.semibold,
          cursor: 'pointer',
        }}
      >
        Lanjutkan
      </button>
    </section>
  );
}
