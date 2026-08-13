import { scaleLinear } from 'd3-scale';
import { color, radius, spacing, typography } from '../../design/tokens';
import type { VisualModelProps } from '../../shell/types';
import { yPadaGaris, type SlopeState } from './scoring';

const W = 420;
const H = 300;
const PAD = 36;

/**
 * Slot langkah 2 — grafik SVG. D3 dipakai HANYA untuk skala (R-003); DOM tetap milik React.
 * Titik bantu bisa digeser siswa: interaksinya nyata, bukan gambar diam (Prinsip I).
 */
export function SlopeVisualModel({ state, onStateChange }: VisualModelProps<SlopeState>) {
  const x = scaleLinear().domain([0, 10]).range([PAD, W - PAD]);
  const y = scaleLinear().domain([0, 10]).range([H - PAD, PAD]);

  const yPenunjuk = yPadaGaris(state, state.penunjukX);

  return (
    <div style={{ maxWidth: '46rem', margin: '0 auto', padding: spacing.md }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', background: color.surface, borderRadius: radius.md }}
        role="img"
        aria-label={`Garis melalui titik (${state.x1}, ${state.y1}) dan (${state.x2}, ${state.y2})`}
      >
        {/* kisi */}
        {[0, 2, 4, 6, 8, 10].map((t) => (
          <g key={t}>
            <line x1={x(t)} y1={PAD} x2={x(t)} y2={H - PAD} stroke={color.border} strokeWidth={1} />
            <line x1={PAD} y1={y(t)} x2={W - PAD} y2={y(t)} stroke={color.border} strokeWidth={1} />
            <text x={x(t)} y={H - PAD + 16} fontSize={10} fill={color.inkFaint} textAnchor="middle">
              {t}
            </text>
            <text x={PAD - 10} y={y(t) + 3} fontSize={10} fill={color.inkFaint} textAnchor="end">
              {t}
            </text>
          </g>
        ))}

        {/* sumbu */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={color.inkMuted} strokeWidth={1.5} />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke={color.inkMuted} strokeWidth={1.5} />

        {/* garis */}
        <line
          x1={x(state.x1)}
          y1={y(state.y1)}
          x2={x(state.x2)}
          y2={y(state.y2)}
          stroke={color.teal}
          strokeWidth={2.5}
        />
        <circle cx={x(state.x1)} cy={y(state.y1)} r={4} fill={color.teal} />
        <circle cx={x(state.x2)} cy={y(state.y2)} r={4} fill={color.teal} />

        {/* titik bantu yang digeser siswa */}
        <line
          x1={x(state.penunjukX)}
          y1={H - PAD}
          x2={x(state.penunjukX)}
          y2={y(yPenunjuk)}
          stroke={color.cobalt}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <circle cx={x(state.penunjukX)} cy={y(yPenunjuk)} r={5} fill={color.cobalt} />
      </svg>

      <div style={{ marginTop: spacing.md }}>
        <label
          htmlFor="penunjuk"
          style={{
            display: 'block',
            fontFamily: typography.fontFamilyUI,
            fontSize: typography.size.sm,
            color: color.inkMuted,
            marginBottom: spacing.xs,
          }}
        >
          Geser untuk menelusuri garis — x = {state.penunjukX.toFixed(1)}, y ={' '}
          {yPenunjuk.toFixed(2)}
        </label>
        <input
          id="penunjuk"
          type="range"
          min={state.x1}
          max={state.x2}
          step={0.5}
          value={state.penunjukX}
          onChange={(e) => onStateChange({ ...state, penunjukX: Number(e.target.value) })}
          style={{ width: '100%' }}
        />
      </div>
    </div>
  );
}
