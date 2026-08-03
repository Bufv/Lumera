import { useState } from 'react';
import { color, radius, spacing, typography } from '../../design/tokens';
import type { UserActionProps } from '../../shell/types';
import type { SlopeState } from './scoring';

/** Slot langkah 3 — input kemiringan. */
export function SlopeUserAction({ onSubmit, disabled }: UserActionProps<SlopeState, number>) {
  const [teks, setTeks] = useState('');
  const angka = Number(teks.replace(',', '.'));
  const valid = teks.trim() !== '' && Number.isFinite(angka);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid && !disabled) onSubmit(angka);
      }}
      style={{
        maxWidth: '46rem',
        margin: '0 auto',
        padding: spacing.md,
        display: 'flex',
        gap: spacing.sm,
        alignItems: 'flex-end',
      }}
    >
      <div style={{ flex: 1 }}>
        <label
          htmlFor="jawaban-kemiringan"
          style={{
            display: 'block',
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.sm,
            color: color.inkMuted,
            marginBottom: spacing.xs,
          }}
        >
          Berapa kemiringan garis ini?
        </label>
        <input
          id="jawaban-kemiringan"
          type="text"
          inputMode="decimal"
          value={teks}
          disabled={disabled}
          onChange={(e) => setTeks(e.target.value)}
          placeholder="contoh: 1.5"
          style={{
            width: '100%',
            padding: spacing.md,
            border: `1px solid ${color.border}`,
            borderRadius: radius.sm,
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.base,
            background: disabled ? color.surfaceMuted : color.surface,
            color: color.ink,
          }}
        />
      </div>
      <button
        type="submit"
        disabled={!valid || disabled}
        style={{
          background: valid && !disabled ? color.teal : color.border,
          color: valid && !disabled ? color.ivory : color.inkFaint,
          border: 'none',
          borderRadius: radius.pill,
          padding: `${spacing.md} ${spacing.lg}`,
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.base,
          fontWeight: typography.weight.semibold,
          cursor: valid && !disabled ? 'pointer' : 'not-allowed',
        }}
      >
        Periksa
      </button>
    </form>
  );
}
