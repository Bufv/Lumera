import { useState } from 'react';
import { color, radius, shadow, spacing, typography } from '../design/tokens';
import { semuaModul } from '../shell/registry';
import { pilihUsulan, type Usulan } from '../progress/suggestions';
import type { Siswa } from '../progress/store';

export function Beranda({
  siswa,
  onMulai,
  onBukaAtlas,
  onBukaCourses,
}: {
  siswa: Siswa;
  onMulai: (moduleId: string) => void;
  onBukaAtlas: () => void;
  onBukaCourses: () => void;
}) {
  const modul = semuaModul().map((m) => ({
    id: m.id,
    judul: m.judul,
    subjectWorldId: m.subjectWorldId,
  }));
  const usulanList = pilihUsulan(modul, siswa, 5);
  const [modulTerpilihIndex, setModulTerpilihIndex] = useState(0);

  const modulAktif: Usulan | undefined = usulanList[modulTerpilihIndex] || usulanList[0];

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', background: color.surface, paddingBottom: spacing.xxl }}>
      <main
        style={{
          maxWidth: '68rem',
          margin: '0 auto',
          padding: `${spacing.xl} ${spacing.lg}`,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: spacing.xl,
        }}
      >
        {/* LEFT SIDEBAR WIDGETS (Screenshot 2) */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          {/* Widget 1: Search Bar with "Ask" button */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              background: color.surface,
              border: `1px solid ${color.border}`,
              borderRadius: radius.pill,
              padding: `${spacing.xs} ${spacing.xs} ${spacing.xs} ${spacing.md}`,
            }}
          >
            <span style={{ color: color.inkMuted, marginRight: spacing.xs }} aria-hidden>
              🔍
            </span>
            <input
              type="text"
              placeholder="What do you want to learn?"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.sm,
                color: color.ink,
              }}
            />
            <button
              type="button"
              style={{
                background: color.surfaceMuted,
                border: `1px solid ${color.border}`,
                borderRadius: radius.pill,
                padding: `${spacing.xs} ${spacing.md}`,
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.semibold,
                color: color.inkMuted,
                cursor: 'pointer',
              }}
            >
              Ask
            </button>
          </div>

          {/* Widget 2: Streak Card */}
          <div
            style={{
              background: color.surface,
              border: `1px solid ${color.border}`,
              borderRadius: radius.lg,
              padding: spacing.lg,
              boxShadow: shadow.soft,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xs }}>
                <span
                  style={{
                    fontFamily: typography.fontFamilyUI,
                    fontSize: typography.size.xxl,
                    fontWeight: typography.weight.bold,
                    color: color.ink,
                  }}
                >
                  {siswa.streakCount}
                </span>
                <span style={{ color: color.orange, fontSize: typography.size.xl }} aria-hidden>
                  ⚡
                </span>
              </div>
              <span style={{ fontSize: typography.size.sm, color: color.inkFaint }}>🗂️ 0/3</span>
            </div>
            <p
              style={{
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.sm,
                color: color.inkMuted,
                margin: `${spacing.xs} 0 ${spacing.md}`,
              }}
            >
              Solve <strong>3 problems</strong> to start a streak
            </p>
            {/* Days of the week tracker */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {['M', 'T', 'W', 'Th', 'F'].map((day, idx) => (
                <div key={day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: spacing.xs }}>
                  <div
                    style={{
                      width: '2rem',
                      height: '2rem',
                      borderRadius: radius.pill,
                      background: idx === 0 && siswa.streakCount > 0 ? color.orangeSoft : color.surfaceMuted,
                      border: `1px solid ${idx === 0 && siswa.streakCount > 0 ? color.orange : color.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: idx === 0 && siswa.streakCount > 0 ? color.orange : color.inkFaint,
                      fontSize: typography.size.xs,
                    }}
                  >
                    ⚡
                  </div>
                  <span style={{ fontFamily: typography.fontFamilyUI, fontSize: typography.size.xs, color: color.inkMuted }}>
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Unlock Premium Banner Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FEF3C7 0%, #EEF2FF 50%, #F3E8FF 100%)',
              border: `1px solid ${color.purple}22`,
              borderRadius: radius.lg,
              padding: spacing.lg,
              boxShadow: shadow.soft,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', gap: spacing.md, alignItems: 'center', marginBottom: spacing.sm }}>
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: radius.md,
                  background: 'linear-gradient(135deg, #8B5CF6, #3B82F6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  fontSize: '1.25rem',
                  boxShadow: shadow.soft,
                }}
              >
                💎
              </div>
              <h3
                style={{
                  fontFamily: typography.fontFamilyUI,
                  fontSize: typography.size.sm,
                  fontWeight: typography.weight.bold,
                  color: color.ink,
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                Unlock all learning with Premium
                <br />
                <span style={{ fontWeight: typography.weight.regular, color: color.inkMuted }}>to get smarter, faster</span>
              </h3>
            </div>
            <button
              type="button"
              onClick={() => alert('Fitur Premium Lumera sedang dikembangkan!')}
              style={{
                width: '100%',
                background: 'linear-gradient(90deg, #8B5CF6 0%, #FF8300 100%)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: radius.pill,
                padding: `${spacing.sm} ${spacing.md}`,
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
                cursor: 'pointer',
                boxShadow: shadow.soft,
                marginTop: spacing.xs,
              }}
            >
              Explore Premium
            </button>
          </div>

          {/* Widget 4: League Status Card */}
          <div
            style={{
              background: color.surface,
              border: `1px solid ${color.border}`,
              borderRadius: radius.lg,
              padding: spacing.lg,
              boxShadow: shadow.soft,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '3.5rem',
                height: '3.5rem',
                margin: '0 auto spacing.sm',
                borderRadius: radius.md,
                background: color.cobaltSoft,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
              }}
            >
              🛡️
            </div>
            <h3
              style={{
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.base,
                fontWeight: typography.weight.bold,
                color: color.ink,
                margin: `${spacing.xs} 0 0`,
              }}
            >
              So close
            </h3>
            <p
              style={{
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.xs,
                color: color.inkMuted,
                margin: `${spacing.xs} 0 ${spacing.md}`,
              }}
            >
              You previously finished #28 and fell back to the Xenon League
            </p>
            <button
              type="button"
              onClick={onBukaCourses}
              style={{
                width: '100%',
                background: color.surface,
                border: `1px solid ${color.border}`,
                borderRadius: radius.pill,
                padding: `${spacing.sm} ${spacing.md}`,
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.semibold,
                color: color.ink,
                cursor: 'pointer',
              }}
            >
              Continue
            </button>
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT AREA (Screenshot 2 Hero Card + Selector Carousel) */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg }}>
          {!modulAktif ? (
            <p style={{ fontFamily: typography.fontFamilyUI, color: color.inkMuted }}>Belum ada pelajaran tersedia.</p>
          ) : (
            <>
              {/* Active Hero Course Card */}
              <div
                style={{
                  background: color.surface,
                  border: `1px solid ${color.border}`,
                  borderRadius: radius.lg,
                  padding: spacing.xxl,
                  boxShadow: shadow.lifted,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    fontFamily: typography.fontFamilyUI,
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.bold,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: color.orange,
                    marginBottom: spacing.xs,
                  }}
                >
                  LEVEL 1
                </span>

                <h2
                  style={{
                    fontFamily: typography.fontFamilyUI,
                    fontSize: typography.size.xxl,
                    fontWeight: typography.weight.bold,
                    color: color.ink,
                    margin: `0 0 ${spacing.lg}`,
                  }}
                >
                  {modulAktif.judul}
                </h2>

                {/* 3D Colorful Cover Artwork Illustration */}
                <div
                  style={{
                    width: '14rem',
                    height: '11rem',
                    background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 50%, #EFF6FF 100%)',
                    borderRadius: radius.lg,
                    border: `1px solid ${color.orangeBorder}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: spacing.xl,
                    boxShadow: shadow.soft,
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      fontSize: '4.5rem',
                      filter: 'drop-shadow(0 8px 16px rgba(255, 131, 0, 0.2))',
                    }}
                  >
                    📒
                  </div>
                </div>

                {/* Topics / Warm Up Checklist */}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '22rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: spacing.sm,
                    marginBottom: spacing.xl,
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, padding: `${spacing.xs} 0` }}>
                    <span style={{ fontSize: '1.25rem' }}>🟢</span>
                    <span
                      style={{
                        fontFamily: typography.fontFamilyUI,
                        fontSize: typography.size.sm,
                        fontWeight: typography.weight.semibold,
                        color: color.ink,
                      }}
                    >
                      Warm Up
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md, padding: `${spacing.xs} 0` }}>
                    <span style={{ fontSize: '1.25rem' }}>⚪</span>
                    <span
                      style={{
                        fontFamily: typography.fontFamilyUI,
                        fontSize: typography.size.sm,
                        color: color.inkMuted,
                      }}
                    >
                      Langkah Interaktif & Eksplorasi
                    </span>
                  </div>
                </div>

                {/* Prominent Vibrant Orange Action Button (Brilliant Style) */}
                <button
                  type="button"
                  onClick={() => onMulai(modulAktif.moduleId)}
                  style={{
                    width: '100%',
                    maxWidth: '24rem',
                    background: color.orange,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: radius.pill,
                    padding: `${spacing.md} ${spacing.xl}`,
                    fontFamily: typography.fontFamilyUI,
                    fontSize: typography.size.lg,
                    fontWeight: typography.weight.bold,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(255, 131, 0, 0.4)',
                    transition: 'transform 150ms ease, background 150ms ease',
                  }}
                >
                  Start
                </button>
              </div>

              {/* Bottom Thumbnail Selector Carousel (Horizontal Cards) */}
              <div style={{ marginTop: spacing.md }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
                  <h3
                    style={{
                      fontFamily: typography.fontFamilyUI,
                      fontSize: typography.size.sm,
                      fontWeight: typography.weight.bold,
                      color: color.inkMuted,
                      margin: 0,
                    }}
                  >
                    MODUL PILIHAN
                  </h3>
                  <button
                    type="button"
                    onClick={onBukaAtlas}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontFamily: typography.fontFamilyUI,
                      fontSize: typography.size.xs,
                      fontWeight: typography.weight.semibold,
                      color: color.orange,
                      cursor: 'pointer',
                    }}
                  >
                    Lihat Semua di Atlas →
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                    gap: spacing.md,
                  }}
                >
                  {usulanList.map((item, idx) => {
                    const isSelected = idx === modulTerpilihIndex;
                    return (
                      <button
                        key={item.moduleId}
                        type="button"
                        onClick={() => setModulTerpilihIndex(idx)}
                        style={{
                          background: isSelected ? color.orangeSoft : color.surface,
                          border: `2px solid ${isSelected ? color.orange : color.border}`,
                          borderRadius: radius.md,
                          padding: spacing.md,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: spacing.xs,
                          cursor: 'pointer',
                          boxShadow: shadow.soft,
                          transition: 'all 150ms ease',
                        }}
                      >
                        <span style={{ fontSize: '2rem' }}>
                          {idx === 0 ? '📒' : idx === 1 ? '🚀' : idx === 2 ? '📊' : '💡'}
                        </span>
                        <span
                          style={{
                            fontFamily: typography.fontFamilyUI,
                            fontSize: typography.size.xs,
                            fontWeight: isSelected ? typography.weight.bold : typography.weight.medium,
                            color: color.ink,
                            textAlign: 'center',
                            lineHeight: 1.2,
                          }}
                        >
                          {item.judul}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
