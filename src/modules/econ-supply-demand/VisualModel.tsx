import { scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { color, radius, spacing, typography } from '../../design/tokens';
import type { VisualModelProps } from '../../shell/types';
import {
  hargaDemand,
  hargaSupply,
  hitungEkuilibrium,
  type SupplyDemandState,
} from './scoring';

const W = 440;
const H = 340;
const PAD = 44;
const Q_MAX = 20;
const P_MAX = 60;

/**
 * Slot langkah 2 — kurva supply/demand yang bergeser mengikuti slider,
 * dengan titik ekuilibrium ikut berpindah secara nyata (Prinsip I).
 * D3 hanya menghitung skala dan path; render tetap milik React (R-003).
 */
export function SupplyDemandVisualModel({
  state,
  onStateChange,
}: VisualModelProps<SupplyDemandState>) {
  const x = scaleLinear().domain([0, Q_MAX]).range([PAD, W - PAD]);
  const y = scaleLinear().domain([0, P_MAX]).range([H - PAD, PAD]);

  const titikQ = Array.from({ length: Q_MAX + 1 }, (_, i) => i);

  const garis = (hargaUntuk: (q: number) => number) =>
    line<number>()
      .x((q) => x(q))
      .y((q) => y(hargaUntuk(q)))(titikQ) ?? '';

  const pathDemand = garis((q) => hargaDemand(state, q));
  const pathSupply = garis((q) => hargaSupply(state, q));

  const e = hitungEkuilibrium(state);
  const ekuilibriumTampak = e.kuantitas >= 0 && e.kuantitas <= Q_MAX && e.harga >= 0 && e.harga <= P_MAX;

  const slider = (
    label: string,
    nilai: number,
    min: number,
    max: number,
    step: number,
    set: (n: number) => void,
  ) => (
    <div style={{ flex: 1, minWidth: '12rem' }}>
      <label
        style={{
          display: 'block',
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.sm,
          color: color.inkMuted,
          marginBottom: spacing.xs,
        }}
      >
        {label}: {nilai}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={nilai}
        onChange={(ev) => set(Number(ev.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: '46rem', margin: '0 auto', padding: spacing.md }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', background: color.surface, borderRadius: radius.md }}
        role="img"
        aria-label="Kurva penawaran dan permintaan dengan titik ekuilibrium"
      >
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={color.inkMuted} strokeWidth={1.5} />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke={color.inkMuted} strokeWidth={1.5} />
        <text x={W - PAD} y={H - PAD + 20} fontSize={11} fill={color.inkMuted} textAnchor="end">
          Kuantitas
        </text>
        <text x={PAD - 8} y={PAD - 12} fontSize={11} fill={color.inkMuted} textAnchor="start">
          Harga
        </text>

        {[0, 10, 20, 30, 40, 50, 60].map((p) => (
          <g key={p}>
            <line x1={PAD} y1={y(p)} x2={W - PAD} y2={y(p)} stroke={color.border} strokeWidth={1} />
            <text x={PAD - 8} y={y(p) + 3} fontSize={10} fill={color.inkFaint} textAnchor="end">
              {p}
            </text>
          </g>
        ))}

        <path d={pathDemand} fill="none" stroke={color.cobalt} strokeWidth={2.5} />
        <path d={pathSupply} fill="none" stroke={color.gold} strokeWidth={2.5} />

        {ekuilibriumTampak ? (
          <>
            <line
              x1={x(e.kuantitas)}
              y1={H - PAD}
              x2={x(e.kuantitas)}
              y2={y(e.harga)}
              stroke={color.inkFaint}
              strokeDasharray="3 3"
            />
            <line
              x1={PAD}
              y1={y(e.harga)}
              x2={x(e.kuantitas)}
              y2={y(e.harga)}
              stroke={color.inkFaint}
              strokeDasharray="3 3"
            />
            <circle cx={x(e.kuantitas)} cy={y(e.harga)} r={6} fill={color.teal} />
          </>
        ) : null}

        <text x={W - PAD - 4} y={y(hargaDemand(state, Q_MAX)) - 6} fontSize={11} fill={color.cobalt} textAnchor="end">
          Permintaan
        </text>
        <text x={W - PAD - 4} y={y(hargaSupply(state, Q_MAX)) - 6} fontSize={11} fill={color.gold} textAnchor="end">
          Penawaran
        </text>
      </svg>

      <p
        style={{
          fontFamily: typography.fontFamilyUI,
          fontSize: typography.size.sm,
          color: color.inkMuted,
          textAlign: 'center',
          marginTop: spacing.sm,
        }}
      >
        Ekuilibrium: Q = {e.kuantitas.toFixed(2)}, P = {e.harga.toFixed(2)}
      </p>

      <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap', marginTop: spacing.md }}>
        {slider('Geser permintaan (intercept)', state.demandIntercept, 20, 60, 1, (n) =>
          onStateChange({ ...state, demandIntercept: n }),
        )}
        {slider('Geser penawaran (intercept)', state.supplyIntercept, 0, 30, 1, (n) =>
          onStateChange({ ...state, supplyIntercept: n }),
        )}
      </div>
    </div>
  );
}
