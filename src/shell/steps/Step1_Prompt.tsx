import { color, spacing, typography } from '../../design/tokens';

export function Step1_Prompt({ prompt, judul }: { prompt: string; judul: string }) {
  return (
    <div style={{ maxWidth: '46rem', margin: '0 auto', padding: spacing.lg }}>
      <p
        style={{
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.sm,
          color: color.inkMuted,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: spacing.sm,
        }}
      >
        {judul}
      </p>
      <p
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.size.xl,
          lineHeight: typography.lineHeight.normal,
          color: color.ink,
        }}
      >
        {prompt}
      </p>
    </div>
  );
}
