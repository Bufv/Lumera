import { color, radius, spacing, typography } from '../design/tokens';
import { SUBJECT_WORLDS, type SubjectWorld } from './subject-worlds';
import type { Siswa } from '../progress/store';
import { ambilModul } from '../shell/registry';

/**
 * Lumera Atlas — homepage peta pengetahuan (FR-001, FR-002).
 *
 * Node melayang dengan garis penghubung bercahaya lembut, BUKAN grid tombol statis.
 * Status tiap node diambil dari mastery siswa (US1 skenario 3).
 */

function statusNode(w: SubjectWorld, siswa: Siswa) {
  const modulId = w.moduleIds[0];
  if (!modulId) return { dimulai: false, persen: 0 };
  const rec = siswa.mastery.find((m) => m.moduleId === modulId);
  return { dimulai: Boolean(rec), persen: rec?.masteryPersen ?? 0 };
}

export function Atlas({
  siswa,
  onPilihModul,
  onLihatProgres,
  onKembali,
}: {
  siswa: Siswa;
  onPilihModul: (moduleId: string) => void;
  onLihatProgres: () => void;
  onKembali?: () => void;
}) {
  return (
    <div style={{ minHeight: '100vh', background: color.ivory }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: spacing.lg,
          maxWidth: '60rem',
          margin: '0 auto',
        }}
      >
        <div>
          {onKembali && (
            <button
              type="button"
              onClick={onKembali}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                marginBottom: spacing.xs,
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.sm,
                color: color.teal,
                cursor: 'pointer',
              }}
            >
              ← Beranda
            </button>
          )}
          <h1
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.size.xxl,
              color: color.ink,
              margin: 0,
            }}
          >
            Lumera Atlas
          </h1>
          <p
            style={{
              fontFamily: typography.fontFamilyUI,
              fontSize: typography.size.sm,
              color: color.inkMuted,
              margin: `${spacing.xs} 0 0`,
            }}
          >
            Belajar dengan mencoba, bukan menghafal.
          </p>
        </div>
        <button
          type="button"
          onClick={onLihatProgres}
          style={{
            background: 'transparent',
            border: `1px solid ${color.border}`,
            borderRadius: radius.pill,
            padding: `${spacing.sm} ${spacing.md}`,
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.sm,
            color: color.inkMuted,
            cursor: 'pointer',
          }}
        >
          <span style={{ color: color.gold, marginRight: spacing.xs }}>◆</span>
          {siswa.lumens} · {siswa.streakCount} hari
        </button>
      </header>

      <div style={{ maxWidth: '60rem', margin: '0 auto', padding: spacing.lg }}>
        <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 2', minHeight: '20rem' }}>
          {/* koneksi antar node */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            aria-hidden
          >
            <defs>
              <linearGradient id="tautan" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={color.teal} stopOpacity="0.10" />
                <stop offset="50%" stopColor={color.teal} stopOpacity="0.38" />
                <stop offset="100%" stopColor={color.teal} stopOpacity="0.10" />
              </linearGradient>
            </defs>
            {SUBJECT_WORLDS.flatMap((w) =>
              w.connections
                .filter((id) => id > w.id) // gambar tiap tautan sekali saja
                .map((id) => {
                  const lain = SUBJECT_WORLDS.find((x) => x.id === id);
                  if (!lain) return null;
                  return (
                    <line
                      key={`${w.id}-${id}`}
                      x1={w.x}
                      y1={w.y}
                      x2={lain.x}
                      y2={lain.y}
                      stroke="url(#tautan)"
                      strokeWidth={0.6}
                    />
                  );
                }),
            )}
          </svg>

          {/* node subject world */}
          {SUBJECT_WORLDS.map((w) => {
            const { dimulai, persen } = statusNode(w, siswa);
            const modulId = w.moduleIds[0];
            const modul = modulId ? ambilModul(modulId) : undefined;

            return (
              <button
                key={w.id}
                type="button"
                onClick={() => modulId && onPilihModul(modulId)}
                disabled={!modul}
                aria-label={`${w.nama} — ${dimulai ? `penguasaan ${persen} persen` : 'belum dimulai'}`}
                style={{
                  position: 'absolute',
                  left: `${w.x}%`,
                  top: `${w.y}%`,
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: spacing.sm,
                  background: 'transparent',
                  border: 'none',
                  cursor: modul ? 'pointer' : 'not-allowed',
                  padding: spacing.sm,
                }}
              >
                <span
                  style={{
                    width: dimulai ? '4.5rem' : '3.5rem',
                    height: dimulai ? '4.5rem' : '3.5rem',
                    borderRadius: radius.pill,
                    background: dimulai ? color.tealSoft : color.surface,
                    border: `2px solid ${dimulai ? color.teal : color.border}`,
                    boxShadow: dimulai
                      ? `0 0 0 6px ${color.tealSoft}55`
                      : '0 1px 3px rgba(31,41,51,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: typography.fontFamilyUI,
                    fontSize: typography.size.sm,
                    color: dimulai ? color.teal : color.inkFaint,
                    transition: 'all 200ms ease',
                  }}
                >
                  {dimulai ? `${persen}%` : ''}
                </span>
                <span
                  style={{
                    fontFamily: typography.fontFamilyUI,
                    fontSize: typography.size.sm,
                    color: color.ink,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {w.nama}
                </span>
                <span
                  style={{
                    fontFamily: typography.fontFamilyUI,
                    fontSize: typography.size.xs,
                    color: color.inkFaint,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {modul?.judul ?? 'segera hadir'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
