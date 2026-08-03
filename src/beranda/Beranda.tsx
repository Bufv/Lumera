import { color, radius, shadow, spacing, typography } from '../design/tokens';
import { semuaModul } from '../shell/registry';
import { pilihUsulan, type AlasanUsulan, type Usulan } from '../progress/suggestions';
import type { Siswa } from '../progress/store';

/**
 * Beranda harian — layar "lanjutkan dari sini".
 *
 * Penerapan celah utama dari docs/ux-inspirasi-brilliant.md: menyatukan streak,
 * Lumens, dan 1–3 pelajaran usulan yang dipilih berdasarkan mastery. Semua data
 * dibaca dari progres yang SUDAH dicatat instrumentasi — tidak ada sumber baru.
 */

const labelAlasan: Record<AlasanUsulan, string> = {
  ulang: 'Ayo tuntaskan',
  baru: 'Baru untukmu',
  pertahankan: 'Jaga penguasaan',
};

function sapaan(siswa: Siswa): string {
  if (siswa.streakCount <= 0) return 'Selamat datang di Lumera.';
  if (siswa.streakCount === 1) return 'Awal yang baik — hari pertamamu.';
  return `Kamu konsisten ${siswa.streakCount} hari. Lanjutkan iramanya.`;
}

function ChipAlasan({ alasan }: { alasan: AlasanUsulan }) {
  const warna =
    alasan === 'ulang' ? color.gold : alasan === 'baru' ? color.teal : color.inkFaint;
  const latar =
    alasan === 'ulang' ? color.goldSoft : alasan === 'baru' ? color.tealSoft : color.surfaceMuted;
  return (
    <span
      style={{
        fontFamily: typography.fontFamilyUI,
        fontSize: typography.size.xs,
        fontWeight: typography.weight.medium,
        color: warna,
        background: latar,
        borderRadius: radius.pill,
        padding: `${spacing.xs} ${spacing.sm}`,
        whiteSpace: 'nowrap',
      }}
    >
      {labelAlasan[alasan]}
    </span>
  );
}

function BarMastery({ persen }: { persen: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={persen}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Penguasaan ${persen} persen`}
      style={{
        height: '0.4rem',
        width: '100%',
        background: color.surfaceMuted,
        borderRadius: radius.pill,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${persen}%`,
          height: '100%',
          background: color.teal,
          borderRadius: radius.pill,
        }}
      />
    </div>
  );
}

export function Beranda({
  siswa,
  onMulai,
  onBukaAtlas,
  onLihatProgres,
}: {
  siswa: Siswa;
  onMulai: (moduleId: string) => void;
  onBukaAtlas: () => void;
  onLihatProgres: () => void;
}) {
  const modul = semuaModul().map((m) => ({
    id: m.id,
    judul: m.judul,
    subjectWorldId: m.subjectWorldId,
  }));
  const usulan = pilihUsulan(modul, siswa, 3);
  const [utama, ...berikutnya] = usulan;

  return (
    <div style={{ minHeight: '100vh', background: color.ivory }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: spacing.lg,
          maxWidth: '46rem',
          margin: '0 auto',
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: typography.fontFamily,
              fontSize: typography.size.xxl,
              color: color.ink,
              margin: 0,
            }}
          >
            Beranda
          </h1>
          <p
            style={{
              fontFamily: typography.fontFamilyUI,
              fontSize: typography.size.sm,
              color: color.inkMuted,
              margin: `${spacing.xs} 0 0`,
            }}
          >
            {sapaan(siswa)}
          </p>
        </div>
        <button
          type="button"
          onClick={onLihatProgres}
          aria-label={`${siswa.lumens} Lumens, streak ${siswa.streakCount} hari — lihat progres`}
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

      <main style={{ maxWidth: '46rem', margin: '0 auto', padding: `0 ${spacing.lg} ${spacing.xxl}` }}>
        {!utama ? (
          <p
            style={{
              fontFamily: typography.fontFamilyUI,
              fontSize: typography.size.base,
              color: color.inkMuted,
            }}
          >
            Belum ada pelajaran tersedia.
          </p>
        ) : (
          <>
            {/* Usulan utama — kartu menonjol dengan satu ajakan jelas. */}
            <section
              aria-label="Usulan hari ini"
              style={{
                background: color.surface,
                border: `1px solid ${color.border}`,
                borderRadius: radius.lg,
                boxShadow: shadow.lifted,
                padding: spacing.xl,
                marginBottom: spacing.lg,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: spacing.md,
                }}
              >
                <span
                  style={{
                    fontFamily: typography.fontFamilyUI,
                    fontSize: typography.size.xs,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: color.inkFaint,
                  }}
                >
                  Lanjutkan hari ini
                </span>
                <ChipAlasan alasan={utama.alasan} />
              </div>

              <h2
                style={{
                  fontFamily: typography.fontFamily,
                  fontSize: typography.size.xl,
                  color: color.ink,
                  margin: `${spacing.sm} 0 ${spacing.xs}`,
                }}
              >
                {utama.judul}
              </h2>
              <p
                style={{
                  fontFamily: typography.fontFamilyUI,
                  fontSize: typography.size.sm,
                  color: color.inkMuted,
                  margin: 0,
                }}
              >
                {utama.subjectWorldNama}
              </p>

              {utama.masteryPersen !== null && (
                <div style={{ margin: `${spacing.md} 0` }}>
                  <BarMastery persen={utama.masteryPersen} />
                </div>
              )}

              <button
                type="button"
                onClick={() => onMulai(utama.moduleId)}
                style={{
                  marginTop: spacing.lg,
                  background: color.teal,
                  color: color.surface,
                  border: 'none',
                  borderRadius: radius.pill,
                  padding: `${spacing.md} ${spacing.xl}`,
                  fontFamily: typography.fontFamilyUI,
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.semibold,
                  cursor: 'pointer',
                }}
              >
                {utama.alasan === 'baru' ? 'Mulai' : 'Lanjutkan'}
              </button>
            </section>

            {/* Usulan berikutnya — daftar ringkas. */}
            {berikutnya.length > 0 && (
              <section aria-label="Usulan berikutnya">
                <h3
                  style={{
                    fontFamily: typography.fontFamilyUI,
                    fontSize: typography.size.sm,
                    fontWeight: typography.weight.semibold,
                    color: color.inkMuted,
                    margin: `0 0 ${spacing.sm}`,
                  }}
                >
                  Berikutnya
                </h3>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: spacing.sm }}>
                  {berikutnya.map((u: Usulan) => (
                    <li key={u.moduleId}>
                      <button
                        type="button"
                        onClick={() => onMulai(u.moduleId)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: spacing.md,
                          background: color.surface,
                          border: `1px solid ${color.border}`,
                          borderRadius: radius.md,
                          boxShadow: shadow.soft,
                          padding: `${spacing.md} ${spacing.lg}`,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <span>
                          <span
                            style={{
                              display: 'block',
                              fontFamily: typography.fontFamily,
                              fontSize: typography.size.base,
                              color: color.ink,
                            }}
                          >
                            {u.judul}
                          </span>
                          <span
                            style={{
                              fontFamily: typography.fontFamilyUI,
                              fontSize: typography.size.xs,
                              color: color.inkFaint,
                            }}
                          >
                            {u.subjectWorldNama}
                            {u.masteryPersen !== null && ` · ${u.masteryPersen}%`}
                          </span>
                        </span>
                        <ChipAlasan alasan={u.alasan} />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}

        <button
          type="button"
          onClick={onBukaAtlas}
          style={{
            marginTop: spacing.xl,
            background: 'transparent',
            border: 'none',
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.sm,
            color: color.teal,
            fontWeight: typography.weight.medium,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Jelajahi semua di Atlas →
        </button>
      </main>
    </div>
  );
}
