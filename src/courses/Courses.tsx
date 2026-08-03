import { color, radius, shadow, spacing, typography } from '../design/tokens';
import type { Siswa } from '../progress/store';

export function Courses({
  onMulaiModul,
  onBukaAtlas,
}: {
  siswa: Siswa;
  onMulaiModul: (moduleId: string) => void;
  onBukaAtlas: () => void;
}) {
  const categories = [
    {
      id: 'math-foundations',
      icon: '❌',
      tag: 'GRADES 4–7',
      title: 'Math Foundations',
      description: 'Strengthen pre-algebra skills in later elementary and early middle school',
      progress: '1% complete',
      courses: [
        { id: 'math-slope', badge: 'GR 4–5', isNew: true, title: 'Fractions & Slopes', graphic: '🎨', moduleId: 'math-slope' },
        { id: 'math-eq', badge: 'GR 5–6', title: 'Solving Equations', graphic: '⚖️', moduleId: 'math-slope' },
        { id: 'math-neg', badge: 'GR 6–7', title: 'Negative Numbers', graphic: '➕', moduleId: 'math-slope' },
        { id: 'math-coord', badge: 'GR 6–7', title: 'Coordinate Plane', graphic: '🎯', moduleId: 'math-slope' },
        { id: 'math-percents', badge: 'GR 6–7', title: 'Percents', graphic: '💵', moduleId: 'math-slope' },
      ],
    },
    {
      id: 'programming-cs',
      icon: '🥞',
      tag: 'FOUNDATIONAL',
      title: 'Programming & CS',
      description: 'Speak the language of computers through visual logic and algorithms',
      progress: '1% complete',
      courses: [
        { id: 'cs-logic', badge: 'ALL AGES', title: 'Thinking in Code', graphic: '💻', moduleId: 'history-causal-chain' },
        { id: 'cs-algo', badge: 'GR 6–8', title: 'Algorithms', graphic: '🤖', moduleId: 'history-causal-chain' },
        { id: 'cs-history', badge: 'FOUNDATIONAL', title: 'History & Causal Logic', graphic: '📜', moduleId: 'history-causal-chain' },
      ],
    },
    {
      id: 'data-analysis',
      icon: '📊',
      tag: 'INTERMEDIATE',
      title: 'Data Analysis & Econ',
      description: 'Know your stuff in supply, demand, probability, and visual data',
      progress: '1% complete',
      courses: [
        { id: 'econ-supply-demand', badge: 'INTERMEDIATE', isNew: true, title: 'Supply & Demand', graphic: '📈', moduleId: 'econ-supply-demand' },
        { id: 'data-prob', badge: 'INTERMEDIATE', title: 'Probability in Data', graphic: '⚽', moduleId: 'econ-supply-demand' },
        { id: 'data-cluster', badge: 'INTERMEDIATE', title: 'Clustering & Data', graphic: '🔮', moduleId: 'econ-supply-demand' },
      ],
    },
    {
      id: 'advanced-math',
      icon: '💎',
      tag: 'ADVANCED',
      title: 'Advanced Physics & Math',
      description: 'Dive into key ideas in velocity, acceleration, vectors, and beyond',
      progress: '11% complete',
      courses: [
        { id: 'physics-motion', badge: 'ADVANCED', isNew: true, title: 'Physics: Motion & Gravity', graphic: '🚀', moduleId: 'physics-motion' },
        { id: 'math-calculus', badge: 'GR 11–12', title: 'Vectors and Matrices', graphic: '⛈️', moduleId: 'physics-motion' },
      ],
    },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 4rem)', background: color.surface, paddingBottom: spacing.xxl }}>
      <main style={{ maxWidth: '68rem', margin: '0 auto', padding: `${spacing.xl} ${spacing.lg}` }}>
        {/* PAGE HEADER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xl }}>
          <div>
            <h1
              style={{
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.xxl,
                fontWeight: typography.weight.bold,
                color: color.ink,
                margin: 0,
              }}
            >
              Learning Paths
            </h1>
            <p
              style={{
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.sm,
                color: color.inkMuted,
                margin: `${spacing.xs} 0 0`,
              }}
            >
              Step-by-step paths to mastery
            </p>
          </div>

          {/* Search Box on Right */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: color.surface,
              border: `1px solid ${color.border}`,
              borderRadius: radius.pill,
              padding: `${spacing.xs} ${spacing.xs} ${spacing.xs} ${spacing.md}`,
              width: '18rem',
            }}
          >
            <span style={{ color: color.inkMuted, marginRight: spacing.xs }}>🔍</span>
            <input
              type="text"
              placeholder="What do you want to learn?"
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.xs,
              }}
            />
            <button
              type="button"
              style={{
                background: color.surfaceMuted,
                border: `1px solid ${color.border}`,
                borderRadius: radius.pill,
                padding: `${spacing.xs} ${spacing.sm}`,
                fontFamily: typography.fontFamilyUI,
                fontSize: typography.size.xs,
                fontWeight: typography.weight.semibold,
                color: color.inkMuted,
              }}
            >
              Ask
            </button>
          </div>
        </div>

        <h2
          style={{
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.lg,
            fontWeight: typography.weight.bold,
            color: color.ink,
            marginBottom: spacing.lg,
          }}
        >
          Your learning paths
        </h2>

        {/* CATEGORIES SECTIONS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xxl }}>
          {categories.map((cat) => (
            <section key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              {/* Category Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                  <div
                    style={{
                      width: '3rem',
                      height: '3rem',
                      borderRadius: radius.md,
                      background: color.indigoSoft,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.75rem',
                    }}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <span
                      style={{
                        fontFamily: typography.fontFamilyUI,
                        fontSize: typography.size.xs,
                        fontWeight: typography.weight.bold,
                        letterSpacing: '0.08em',
                        color: color.inkFaint,
                        textTransform: 'uppercase',
                      }}
                    >
                      {cat.tag}
                    </span>
                    <h3
                      style={{
                        fontFamily: typography.fontFamilyUI,
                        fontSize: typography.size.lg,
                        fontWeight: typography.weight.bold,
                        color: color.ink,
                        margin: 0,
                      }}
                    >
                      {cat.title}
                    </h3>
                    <p style={{ fontFamily: typography.fontFamilyUI, fontSize: typography.size.xs, color: color.inkMuted, margin: 0 }}>
                      {cat.description}
                    </p>
                  </div>
                </div>

                {/* Progress pill on right */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing.xs,
                    background: color.surfaceMuted,
                    border: `1px solid ${color.border}`,
                    borderRadius: radius.pill,
                    padding: `${spacing.xs} ${spacing.md}`,
                    fontFamily: typography.fontFamilyUI,
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.semibold,
                    color: color.inkMuted,
                  }}
                >
                  <span>{cat.progress}</span>
                  <span style={{ color: color.gold }}>⭐</span>
                </div>
              </div>

              {/* Category Container Backdrop Card (Grey Box containing cards) */}
              <div
                style={{
                  background: color.surfaceMuted,
                  border: `1px solid ${color.borderSubtle}`,
                  borderRadius: radius.lg,
                  padding: spacing.lg,
                  overflowX: 'auto',
                }}
              >
                <div style={{ display: 'flex', gap: spacing.md, minWidth: 'max-content' }}>
                  {cat.courses.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => onMulaiModul(course.moduleId)}
                      style={{
                        width: '11rem',
                        background: color.surface,
                        border: `1px solid ${color.border}`,
                        borderRadius: radius.md,
                        padding: spacing.md,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        cursor: 'pointer',
                        boxShadow: shadow.soft,
                        transition: 'transform 150ms ease, box-shadow 150ms ease',
                        textAlign: 'left',
                      }}
                    >
                      {/* Top Badges */}
                      <div style={{ display: 'flex', gap: spacing.xs, marginBottom: spacing.sm }}>
                        <span
                          style={{
                            fontFamily: typography.fontFamilyUI,
                            fontSize: '0.65rem',
                            fontWeight: typography.weight.bold,
                            color: color.inkFaint,
                            textTransform: 'uppercase',
                          }}
                        >
                          {course.badge}
                        </span>
                        {course.isNew && (
                          <span
                            style={{
                              fontFamily: typography.fontFamilyUI,
                              fontSize: '0.65rem',
                              fontWeight: typography.weight.bold,
                              background: color.correctSoft,
                              color: color.correct,
                              borderRadius: radius.sm,
                              padding: '0 4px',
                            }}
                          >
                            NEW
                          </span>
                        )}
                      </div>

                      {/* Graphic Icon Box */}
                      <div
                        style={{
                          width: '100%',
                          height: '6rem',
                          background: color.surfaceMuted,
                          borderRadius: radius.sm,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '3rem',
                          marginBottom: spacing.md,
                        }}
                      >
                        {course.graphic}
                      </div>

                      {/* Progress Line */}
                      <div
                        style={{
                          width: '100%',
                          height: '3px',
                          background: color.border,
                          borderRadius: radius.pill,
                          marginBottom: spacing.sm,
                          overflow: 'hidden',
                        }}
                      >
                        <div style={{ width: '20%', height: '100%', background: color.cobalt }} />
                      </div>

                      <span
                        style={{
                          fontFamily: typography.fontFamilyUI,
                          fontSize: typography.size.xs,
                          fontWeight: typography.weight.bold,
                          color: color.ink,
                          lineHeight: 1.3,
                        }}
                      >
                        {course.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Link to Stepping-Stone Atlas */}
        <div style={{ marginTop: spacing.xxl, textAlign: 'center' }}>
          <button
            type="button"
            onClick={onBukaAtlas}
            style={{
              background: color.orange,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: radius.pill,
              padding: `${spacing.md} ${spacing.xxl}`,
              fontFamily: typography.fontFamilyUI,
              fontSize: typography.size.base,
              fontWeight: typography.weight.bold,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 131, 0, 0.4)',
            }}
          >
            Buka Peta Stepping-Stone di Atlas 🗺️
          </button>
        </div>
      </main>
    </div>
  );
}
