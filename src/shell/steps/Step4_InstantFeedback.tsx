import { color, radius, spacing, typography } from '../../design/tokens';
import type { AttemptResult } from '../types';

/**
 * Umpan balik instan (langkah 4, FR-005). Milik Shell — modul tidak bisa mengubahnya.
 * Nadanya sengaja tenang: Prinsip V melarang perayaan meledak-ledak.
 */
export function Step4_InstantFeedback({ hasil }: { hasil: AttemptResult }) {
  const benar = hasil.benar;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        background: benar ? color.correctSoft : color.incorrectSoft,
        borderLeft: `3px solid ${benar ? color.correct : color.incorrect}`,
        borderRadius: radius.sm,
        padding: spacing.md,
        fontFamily: typography.fontFamilyUI,
        fontSize: typography.size.base,
        color: color.ink,
      }}
    >
      <strong style={{ color: benar ? color.correct : color.incorrect }}>
        {benar ? 'Tepat.' : 'Belum tepat.'}
      </strong>{' '}
      {benar
        ? 'Perhatikan alasannya di langkah berikutnya.'
        : `Percobaan ke-${hasil.nomorPercobaan}. Lihat penjelasannya, lalu coba lagi.`}
    </div>
  );
}
