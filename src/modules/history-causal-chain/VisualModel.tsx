import { color, radius, spacing, typography } from '../../design/tokens';
import type { VisualModelProps } from '../../shell/types';
import type { CausalChainState } from './scoring';
import { PERISTIWA } from '../../content/history-causal-chain';

/**
 * Slot langkah 2 — menampilkan rantai yang sedang disusun sebagai konteks.
 * Penyusunannya sendiri ada di slot langkah 3 (UserAction).
 */
export function CausalChainVisualModel({ state }: VisualModelProps<CausalChainState>) {
  return (
    <div style={{ maxWidth: '46rem', margin: '0 auto', padding: spacing.md }}>
      <p
        style={{
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.sm,
          color: color.inkMuted,
          marginBottom: spacing.md,
          textAlign: 'center',
        }}
      >
        Rantai sebab-akibat yang sedang kamu susun
      </p>
      <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {state.urutan.map((id, i) => {
          const p = PERISTIWA.find((x) => x.id === id);
          return (
            <li key={id} style={{ position: 'relative' }}>
              <div
                style={{
                  background: color.surface,
                  border: `1px solid ${color.border}`,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  fontFamily: typography.fontFamilyUI,
                  fontSize: typography.size.base,
                  color: color.ink,
                }}
              >
                <span style={{ color: color.teal, marginRight: spacing.sm }}>{i + 1}.</span>
                {p?.teks ?? id}
              </div>
              {i < state.urutan.length - 1 ? (
                <div
                  aria-hidden
                  style={{
                    textAlign: 'center',
                    color: color.inkFaint,
                    fontSize: typography.size.sm,
                    padding: `${spacing.xs} 0`,
                  }}
                >
                  ↓ menyebabkan
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
