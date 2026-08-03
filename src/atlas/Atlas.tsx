import { useState } from 'react';
import { color, radius, shadow, spacing, typography } from '../design/tokens';
import type { Siswa } from '../progress/store';

export function Atlas({
  siswa,
  onPilihModul,
  onKembali,
}: {
  siswa: Siswa;
  onPilihModul: (moduleId: string) => void;
  onKembali?: () => void;
}) {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(1);

  const nodes = [
    { id: 'math-slope', title: 'Reading Bar Charts & Slopes', status: 'completed', isChecked: true, level: 1 },
    { id: 'physics-motion', title: 'Analyzing Bar Charts & Velocity', status: 'active', isCurrent: true, level: 1 },
    { id: 'econ-supply-demand', title: 'Pie Charts & Supply Demand', status: 'locked', level: 1 },
    { id: 'history-causal-chain', title: 'Histograms & Causal Chain', status: 'locked', level: 1 },
  ] as const;

  const nodeAktif = nodes[selectedNodeIndex] || nodes[1];

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', background: color.surface, paddingBottom: spacing.xxl, position: 'relative' }}>
      <main
        style={{
          maxWidth: '68rem',
          margin: '0 auto',
          padding: `${spacing.xl} ${spacing.lg}`,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: spacing.xxl,
          alignItems: 'start',
        }}
      >
        {/* LEFT COURSE INFO CARD (Screenshot 1) */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
          {onKembali && (
            <button
              type="button"
              onClick={onKembali}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.sm,
                color: color.orange,
                fontWeight: typography.weight.semibold,
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              ← Kembali ke Beranda
            </button>
          )}

          <div
            style={{
              background: color.surface,
              border: `1px solid ${color.border}`,
              borderRadius: radius.lg,
              padding: spacing.xl,
              boxShadow: shadow.lifted,
            }}
          >
            {/* 3D Cover Illustration */}
            <div
              style={{
                width: '100%',
                height: '9rem',
                background: 'linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 50%, #EFF6FF 100%)',
                borderRadius: radius.md,
                border: `1px solid ${color.orangeBorder}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '4rem',
                marginBottom: spacing.lg,
                boxShadow: shadow.soft,
              }}
            >
              📒
            </div>

            <h2
              style={{
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.xl,
                fontWeight: typography.weight.bold,
                color: color.ink,
                margin: `0 0 ${spacing.xs}`,
              }}
            >
              Exploring Data Visually
            </h2>

            <p
              style={{
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.sm,
                color: color.inkMuted,
                lineHeight: 1.5,
                margin: `0 0 ${spacing.lg}`,
              }}
            >
              Build a solid foundation in data analysis with visualizations and data transformations.
            </p>

            <div
              style={{
                display: 'flex',
                gap: spacing.md,
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.xs,
                color: color.inkFaint,
                fontWeight: typography.weight.medium,
              }}
            >
              <span>📚 29 Lessons</span>
              <span>⚡ Streak {siswa.streakCount}d</span>
              <span>◆ {siswa.lumens} Lumens</span>
            </div>
          </div>
        </aside>

        {/* CENTER STEPPING-STONE PATHWAY (Screenshot 1) */}
        <section
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: '32rem',
            position: 'relative',
          }}
        >
          {/* LEVEL BANNER HEADER */}
          <div
            style={{
              background: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
              border: `1px solid ${color.orangeBorder}`,
              borderRadius: radius.pill,
              padding: `${spacing.sm} ${spacing.xxl}`,
              textAlign: 'center',
              boxShadow: shadow.soft,
              marginBottom: spacing.xxl,
            }}
          >
            <span
              style={{
                display: 'block',
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.bold,
                color: color.orange,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              LEVEL 1
            </span>
            <span
              style={{
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.sm,
                fontWeight: typography.weight.bold,
                color: color.ink,
              }}
            >
              Bar Charts and Pie Charts
            </span>
          </div>

          {/* STEPPING STONE DISK NODES PATHWAY */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3.5rem', width: '100%', position: 'relative' }}>
            {nodes.map((node, index) => {
              const isSelected = index === selectedNodeIndex;
              return (
                <div
                  key={node.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    width: '100%',
                  }}
                >
                  {/* Connecting Line between nodes */}
                  {index < nodes.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '4px',
                        height: '3.5rem',
                        background: node.status === 'completed' ? color.orange : color.border,
                        zIndex: 0,
                      }}
                    />
                  )}

                  {/* Node Button (3D Disk Ring + Badge) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: spacing.lg, position: 'relative', zIndex: 1 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedNodeIndex(index)}
                      style={{
                        width: '5.5rem',
                        height: '3.2rem',
                        borderRadius: '50%',
                        background:
                          node.status === 'completed'
                            ? 'linear-gradient(180deg, #FF8300 0%, #D97706 100%)'
                            : node.status === 'active'
                            ? 'linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)'
                            : 'linear-gradient(180deg, #F3F4F6 0%, #E5E7EB 100%)',
                        border: `3px solid ${node.status === 'active' ? color.orange : node.status === 'completed' ? '#D97706' : color.border}`,
                        boxShadow: isSelected
                          ? '0 0 0 6px rgba(255, 131, 0, 0.25), 0 8px 16px rgba(0,0,0,0.1)'
                          : '0 6px 12px rgba(0,0,0,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'transform 150ms ease',
                      }}
                    >
                      {/* Top 3D Badge Icon */}
                      {node.status === 'completed' && (
                        <div
                          style={{
                            width: '2.2rem',
                            height: '2.2rem',
                            borderRadius: radius.pill,
                            background: color.orange,
                            border: '2px solid #FFFFFF',
                            color: '#FFFFFF',
                            fontSize: typography.size.sm,
                            fontWeight: typography.weight.bold,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '-1rem',
                            boxShadow: shadow.soft,
                          }}
                        >
                          ✓
                        </div>
                      )}

                      {node.status === 'active' && (
                        <div
                          style={{
                            width: '2.4rem',
                            height: '2.4rem',
                            borderRadius: radius.md,
                            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                            border: '2px solid #FFFFFF',
                            color: '#FFFFFF',
                            fontSize: '1.2rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginTop: '-1.5rem',
                            boxShadow: shadow.lifted,
                          }}
                        >
                          🟩
                        </div>
                      )}

                      {node.status === 'locked' && (
                        <div
                          style={{
                            width: '2rem',
                            height: '2rem',
                            borderRadius: radius.pill,
                            background: color.surfaceMuted,
                            color: color.inkFaint,
                            fontSize: typography.size.xs,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          🔒
                        </div>
                      )}
                    </button>

                    {/* Node Text Label on Right */}
                    <span
                      style={{
                        fontFamily: typography.fontFamilyUI,
                        fontSize: typography.size.sm,
                        fontWeight: isSelected ? typography.weight.bold : typography.weight.medium,
                        color: node.status === 'locked' ? color.inkFaint : color.ink,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {node.title}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* FLOATING ACTION CARD DRAWER AT BOTTOM (Screenshot 1) */}
      <div
        style={{
          position: 'fixed',
          bottom: spacing.lg,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 90,
          width: 'calc(100% - 2rem)',
          maxWidth: '24rem',
          background: color.surface,
          border: `1px solid ${color.border}`,
          borderRadius: radius.lg,
          padding: spacing.lg,
          boxShadow: shadow.floating,
          textAlign: 'center',
        }}
      >
        <h3
          style={{
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.base,
            fontWeight: typography.weight.bold,
            color: color.ink,
            margin: `0 0 ${spacing.md}`,
          }}
        >
          {(nodeAktif || nodes[1]).title}
        </h3>

        <button
          type="button"
          onClick={() => onPilihModul((nodeAktif || nodes[1]).id)}
          style={{
            width: '100%',
            background: color.orange,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: radius.pill,
            padding: `${spacing.md} ${spacing.xl}`,
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.base,
            fontWeight: typography.weight.bold,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(255, 131, 0, 0.4)',
            transition: 'transform 150ms ease',
          }}
        >
          Start
        </button>
      </div>
    </div>
  );
}
