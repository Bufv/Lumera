import type { ReactNode } from 'react';
import { color, radius, spacing, typography } from '../design/tokens';
import { LESSON_STEPS, type LessonStep } from './types';

/**
 * Layout UI pelajaran sesuai FR-011:
 * tombol tutup kiri atas, progress dots tengah atas, Lumens kanan atas,
 * area interaksi tengah, bilah umpan balik paling bawah.
 */
export function LessonChrome({
  langkahAktif,
  lumens,
  onTutup,
  children,
  bilahUmpanBalik,
  kontrolJawaban,
}: {
  langkahAktif: LessonStep;
  lumens: number;
  onTutup: () => void;
  children: ReactNode;
  bilahUmpanBalik?: ReactNode;
  kontrolJawaban?: ReactNode;
}) {
  const indeksAktif = LESSON_STEPS.indexOf(langkahAktif);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: color.surface,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'center',
          gap: spacing.md,
          padding: spacing.md,
          borderBottom: `1px solid ${color.border}`,
        }}
      >
        {/* kiri atas */}
        <div style={{ justifySelf: 'start' }}>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup pelajaran"
            style={{
              background: 'transparent',
              border: `1px solid ${color.border}`,
              borderRadius: radius.pill,
              width: '2.2rem',
              height: '2.2rem',
              cursor: 'pointer',
              color: color.ink,
              fontSize: typography.size.lg,
              lineHeight: 1,
              fontWeight: typography.weight.bold,
            }}
          >
            ×
          </button>
        </div>

        {/* tengah atas — progress dots */}
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={LESSON_STEPS.length}
          aria-valuenow={indeksAktif + 1}
          aria-label={`Langkah ${indeksAktif + 1} dari ${LESSON_STEPS.length}`}
          style={{ display: 'flex', gap: spacing.xs, justifySelf: 'center' }}
        >
          {LESSON_STEPS.map((s, i) => (
            <span
              key={s}
              style={{
                width: i === indeksAktif ? '1.5rem' : '0.5rem',
                height: '0.5rem',
                borderRadius: radius.pill,
                background: i <= indeksAktif ? color.orange : color.border,
                transition: `all 200ms ease`,
              }}
            />
          ))}
        </div>

        {/* kanan atas — Lumens & Streak */}
        <div
          style={{
            justifySelf: 'end',
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            color: color.ink,
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          <span style={{ color: color.gold }}>◆</span>
          {lumens} Lumens
        </div>
      </header>

      {/* tengah — area interaksi/simulasi */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%' }}>{children}</div>
      </main>

      {/* bawah — kontrol jawaban */}
      {kontrolJawaban ? (
        <div
          style={{
            padding: spacing.md,
            maxWidth: '46rem',
            margin: '0 auto',
            width: '100%',
          }}
        >
          {kontrolJawaban}
        </div>
      ) : null}

      {/* paling bawah — bilah umpan balik */}
      {bilahUmpanBalik ? (
        <div
          style={{
            borderTop: `1px solid ${color.border}`,
            background: color.surfaceMuted,
            padding: spacing.md,
          }}
        >
          <div style={{ maxWidth: '46rem', margin: '0 auto' }}>{bilahUmpanBalik}</div>
        </div>
      ) : null}
    </div>
  );
}
