import { color, radius, spacing, typography } from '../design/tokens';
import type { Siswa } from '../progress/store';

export type TabLayar = 'beranda' | 'courses' | 'atlas' | 'progres';

export function HeaderNav({
  tabAktif,
  siswa,
  onPilihTab,
  onBukaProgres,
}: {
  tabAktif: TabLayar;
  siswa: Siswa;
  onPilihTab: (tab: TabLayar) => void;
  onBukaProgres: () => void;
}) {
  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: color.surface,
        borderBottom: `1px solid ${color.border}`,
        height: '4rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${spacing.lg}`,
      }}
    >
      {/* Left branding and Navigation Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.xl }}>
        <button
          type="button"
          onClick={() => onPilihTab('beranda')}
          aria-label="Lumera Home"
          style={{
            background: 'transparent',
            border: 'none',
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.xl,
            fontWeight: typography.weight.bold,
            color: color.ink,
            letterSpacing: '-0.02em',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          Lumera
        </button>

        <nav style={{ display: 'flex', gap: spacing.md, height: '4rem' }}>
          <button
            type="button"
            onClick={() => onPilihTab('beranda')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              background: 'transparent',
              border: 'none',
              borderBottom: tabAktif === 'beranda' ? `2px solid ${color.ink}` : '2px solid transparent',
              fontFamily: typography.fontFamilyUI,
              fontSize: typography.size.sm,
              fontWeight: tabAktif === 'beranda' ? typography.weight.semibold : typography.weight.medium,
              color: tabAktif === 'beranda' ? color.ink : color.inkMuted,
              cursor: 'pointer',
              padding: `0 ${spacing.sm}`,
              transition: 'all 150ms ease',
            }}
          >
            <span aria-hidden>🏠</span> Home
          </button>

          <button
            type="button"
            onClick={() => onPilihTab('courses')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              background: 'transparent',
              border: 'none',
              borderBottom: tabAktif === 'courses' ? `2px solid ${color.ink}` : '2px solid transparent',
              fontFamily: typography.fontFamilyUI,
              fontSize: typography.size.sm,
              fontWeight: tabAktif === 'courses' ? typography.weight.semibold : typography.weight.medium,
              color: tabAktif === 'courses' ? color.ink : color.inkMuted,
              cursor: 'pointer',
              padding: `0 ${spacing.sm}`,
              transition: 'all 150ms ease',
            }}
          >
            <span aria-hidden>📚</span> Courses
          </button>

          <button
            type="button"
            onClick={() => onPilihTab('atlas')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing.xs,
              background: 'transparent',
              border: 'none',
              borderBottom: tabAktif === 'atlas' ? `2px solid ${color.ink}` : '2px solid transparent',
              fontFamily: typography.fontFamilyUI,
              fontSize: typography.size.sm,
              fontWeight: tabAktif === 'atlas' ? typography.weight.semibold : typography.weight.medium,
              color: tabAktif === 'atlas' ? color.ink : color.inkMuted,
              cursor: 'pointer',
              padding: `0 ${spacing.sm}`,
              transition: 'all 150ms ease',
            }}
          >
            <span aria-hidden>🗺️</span> Atlas
          </button>
        </nav>
      </div>

      {/* Right controls: Premium CTA, Key Badge, Streak Badge, Menu */}
      <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
        {/* Go Premium pill button */}
        <button
          type="button"
          onClick={() => alert('Fitur Premium Lumera sedang dikembangkan!')}
          style={{
            background: color.indigoSoft,
            border: `1px solid ${color.indigo}33`,
            borderRadius: radius.pill,
            padding: `${spacing.xs} ${spacing.md}`,
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.xs,
            fontWeight: typography.weight.semibold,
            color: color.indigo,
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
        >
          Go Premium
        </button>

        {/* Key Badge */}
        <button
          type="button"
          onClick={onBukaProgres}
          title="Kunci & Level Lumera"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
            background: color.surface,
            border: `1px solid ${color.border}`,
            borderRadius: radius.pill,
            padding: `${spacing.xs} ${spacing.md}`,
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            color: color.ink,
            cursor: 'pointer',
          }}
        >
          <span style={{ color: color.gold }}>2</span>
          <span aria-hidden>🔑</span>
        </button>

        {/* Streak / Energy Lightning Badge */}
        <button
          type="button"
          onClick={onBukaProgres}
          title={`Streak ${siswa.streakCount} hari`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing.xs,
            background: color.surface,
            border: `1px solid ${color.border}`,
            borderRadius: radius.pill,
            padding: `${spacing.xs} ${spacing.md}`,
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.semibold,
            color: color.ink,
            cursor: 'pointer',
          }}
        >
          <span>{siswa.streakCount}</span>
          <span style={{ color: color.orange }} aria-hidden>⚡</span>
        </button>

        {/* User Menu Button */}
        <button
          type="button"
          aria-label="Menu pengguna"
          onClick={onBukaProgres}
          style={{
            background: 'transparent',
            border: 'none',
            fontSize: typography.size.lg,
            color: color.inkMuted,
            cursor: 'pointer',
            padding: spacing.xs,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          ☰
        </button>
      </div>
    </header>
  );
}
