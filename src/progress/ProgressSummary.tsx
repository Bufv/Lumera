import { color, radius, spacing, typography } from '../design/tokens';
import type { Siswa } from './store';
import { semuaModul } from '../shell/registry';

/**
 * Ringkasan progres (US8). Nada sengaja tenang — Prinsip V melarang perayaan
 * meledak-ledak, jadi angka disajikan apa adanya tanpa konfeti.
 */
export function ProgressSummary({ siswa }: { siswa: Siswa }) {
  const modul = semuaModul();

  const kartu = (label: string, nilai: string) => (
    <div
      style={{
        flex: 1,
        minWidth: '8rem',
        background: color.surface,
        border: `1px solid ${color.border}`,
        borderRadius: radius.md,
        padding: spacing.md,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: typography.fontFamily,
          fontSize: typography.size.xxl,
          color: color.ink,
        }}
      >
        {nilai}
      </div>
      <div
        style={{
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.xs,
          color: color.inkMuted,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
    </div>
  );

  return (
    <section style={{ maxWidth: '46rem', margin: '0 auto', padding: spacing.lg }}>
      <h2
        style={{
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.sm,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: color.inkMuted,
          marginBottom: spacing.md,
        }}
      >
        Progres kamu
      </h2>

      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
        {kartu('Lumens', String(siswa.lumens))}
        {kartu('Streak', `${siswa.streakCount} hari`)}
        {kartu('Modul selesai', String(siswa.modulSelesai.length))}
      </div>

      <h3
        style={{
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.sm,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: color.inkMuted,
          margin: `${spacing.xl} 0 ${spacing.md}`,
        }}
      >
        Penguasaan per modul
      </h3>

      {modul.length === 0 ? (
        <p style={{ fontFamily: typography.fontFamilyUI, color: color.inkMuted }}>
          Belum ada modul terdaftar.
        </p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {modul.map((m) => {
            const rec = siswa.mastery.find((x) => x.moduleId === m.id);
            const persen = rec?.masteryPersen ?? 0;
            return (
              <li key={m.id} style={{ marginBottom: spacing.md }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontFamily: typography.fontFamilyUI,
                    fontSize: typography.size.sm,
                    color: color.ink,
                    marginBottom: spacing.xs,
                  }}
                >
                  <span>{m.judul}</span>
                  <span style={{ color: rec ? color.teal : color.inkFaint }}>
                    {rec ? `${persen}%` : 'belum dimulai'}
                  </span>
                </div>
                <div
                  style={{
                    height: '6px',
                    background: color.border,
                    borderRadius: radius.pill,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${persen}%`,
                      height: '100%',
                      background: color.teal,
                      transition: 'width 200ms ease',
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
