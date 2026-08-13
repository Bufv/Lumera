import { useState } from 'react';
import { color, radius, spacing, typography } from '../../design/tokens';

/** Input jawaban numerik yang dipakai beberapa modul. Menerima koma maupun titik desimal. */
export function NumericAnswer({
  label,
  satuan,
  placeholder,
  disabled,
  onSubmit,
}: {
  label: string;
  satuan?: string;
  placeholder?: string;
  disabled: boolean;
  onSubmit: (n: number) => void;
}) {
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
          htmlFor="jawaban-numerik"
          style={{
            display: 'block',
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.sm,
            color: color.inkMuted,
            marginBottom: spacing.xs,
          }}
        >
          {label}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm }}>
          <input
            id="jawaban-numerik"
            type="text"
            inputMode="decimal"
            value={teks}
            disabled={disabled}
            onChange={(e) => setTeks(e.target.value)}
            placeholder={placeholder}
            style={{
              flex: 1,
              padding: spacing.md,
              border: `1px solid ${color.border}`,
              borderRadius: radius.sm,
              fontFamily: typography.fontFamilyUI,
              fontSize: typography.size.base,
              background: disabled ? color.surfaceMuted : color.surface,
              color: color.ink,
            }}
          />
          {satuan ? (
            <span
              style={{
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.base,
                color: color.inkMuted,
              }}
            >
              {satuan}
            </span>
          ) : null}
        </div>
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
