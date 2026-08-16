import { formatNumber } from './numeric';
import type { MicroSceneProps } from './types';

const W = 760;
const H = 390;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function metric(model: MicroSceneProps['model'], key: string): number {
  const value = model.metrics[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function value(model: MicroSceneProps['model'], key: string): number {
  const result = model.values[key];
  return typeof result === 'number' && Number.isFinite(result) ? result : 0;
}

function linePath(
  start: number,
  end: number,
  steps: number,
  point: (x: number) => [number, number],
): string {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const x = start + ((end - start) * index) / steps;
    const [px, py] = point(x);
    return `${index === 0 ? 'M' : 'L'} ${px.toFixed(2)} ${py.toFixed(2)}`;
  }).join(' ');
}

function CandidateChip({ props }: { props: MicroSceneProps }) {
  const candidate = props.answer.validity === 'valid' ? props.answer : props.prediction;
  const valid = candidate.validity === 'valid' && candidate.value !== null;
  return (
    <g
      className="micro-scene__candidate"
      transform="translate(548 26)"
      data-candidate={valid ? String(candidate.value) : candidate.validity}
    >
      <rect width="180" height="42" rx="21" fill={valid ? '#F0EEFF' : '#F4F3F0'} />
      <circle cx="22" cy="21" r="7" fill={valid ? '#6D5CE7' : '#A4A8B5'} />
      <text x="38" y="18" className="micro-scene__caption">
        Nilai yang kamu uji
      </text>
      <text x="38" y="33" className="micro-scene__candidate-value">
        {valid ? formatNumber(candidate.value ?? 0) : 'belum lengkap'}
      </text>
    </g>
  );
}

function SceneFrame({ props, children }: { props: MicroSceneProps; children: React.ReactNode }) {
  return (
    <svg
      className="micro-scene"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${props.lesson.title}. ${props.model.signature}`}
      data-testid="micro-scene"
      data-model-signature={props.model.signature}
      data-reduced-motion={props.reducedMotion ? 'true' : 'false'}
    >
      <title>{props.lesson.title}</title>
      <desc>{props.model.signature}</desc>
      <defs>
        <linearGradient id="micro-violet" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#8B7DEC" />
          <stop offset="1" stopColor="#5143C8" />
        </linearGradient>
        <linearGradient id="micro-blue" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#99C1FF" />
          <stop offset="1" stopColor="#3B82F6" />
        </linearGradient>
        <linearGradient id="micro-amber" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#FFEBAF" />
          <stop offset="1" stopColor="#F4B725" />
        </linearGradient>
        <filter id="micro-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#15172A" floodOpacity="0.12" />
        </filter>
        <pattern id="micro-grid" width="28" height="28" patternUnits="userSpaceOnUse">
          <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#E4E6EE" strokeWidth="1" />
        </pattern>
      </defs>
      <rect
        x="4"
        y="4"
        width="752"
        height="382"
        rx="28"
        fill="#FFFFFF"
        stroke="#E4E6EE"
        strokeWidth="2"
      />
      <rect x="24" y="24" width="112" height="34" rx="17" fill="#FFF7DC" />
      <text x="80" y="46" textAnchor="middle" className="micro-scene__eyebrow">
        {props.lesson.course} {props.lesson.number}
      </text>
      {children}
      <CandidateChip props={props} />
    </svg>
  );
}

function GrowingPattern(props: MicroSceneProps) {
  const n = Math.round(value(props.model, 'n'));
  const count = metric(props.model, 'count');
  const gap = 24;
  return (
    <SceneFrame props={props}>
      <text x="380" y="98" textAnchor="middle" className="micro-scene__label">
        Langkah n = {n}
      </text>
      <g transform="translate(380 210)" filter="url(#micro-shadow)">
        <rect
          x="-16"
          y="-16"
          width="32"
          height="32"
          rx="8"
          fill="url(#micro-amber)"
          stroke="#D99A0B"
        />
        {Array.from({ length: n }, (_, index) => {
          const distance = (index + 1) * gap;
          return (
            <g key={index}>
              <rect
                x={-distance - 10}
                y="-11"
                width="21"
                height="21"
                rx="5"
                fill="url(#micro-blue)"
              />
              <rect
                x={distance - 10}
                y="-11"
                width="21"
                height="21"
                rx="5"
                fill="url(#micro-violet)"
              />
            </g>
          );
        })}
      </g>
      <path
        d="M 168 285 C 250 332, 510 332, 592 285"
        fill="none"
        stroke="#DED9FB"
        strokeWidth="3"
        strokeDasharray={props.hintLevel > 0 ? '0' : '7 8'}
      />
      <g transform="translate(278 308)">
        <rect width="204" height="54" rx="16" fill="#FAF9FF" stroke="#BDB4F5" />
        <text x="102" y="23" textAnchor="middle" className="micro-scene__caption">
          satu pusat + dua lengan
        </text>
        <text x="102" y="43" textAnchor="middle" className="micro-scene__metric">
          {formatNumber(count)} ubin
        </text>
      </g>
      {props.hintLevel > 1 ? (
        <text x="380" y="275" textAnchor="middle" className="micro-scene__hint">
          1 + n + n
        </text>
      ) : null}
    </SceneFrame>
  );
}

function LinearRule(props: MicroSceneProps) {
  const a = Math.round(value(props.model, 'a'));
  const n = Math.round(value(props.model, 'n'));
  const b = Math.round(value(props.model, 'b'));
  const output = metric(props.model, 'output');
  const repeated = a * n;
  return (
    <SceneFrame props={props}>
      <g transform="translate(60 92)">
        <text x="0" y="0" className="micro-scene__label">
          Bentuk
        </text>
        <rect x="0" y="18" width="390" height="194" rx="22" fill="#FAF9FF" stroke="#DED9FB" />
        {Array.from({ length: repeated }, (_, index) => {
          const column = index % 10;
          const row = Math.floor(index / 10);
          return (
            <rect
              key={index}
              x={24 + column * 31}
              y={43 + row * 31}
              width="23"
              height="23"
              rx="5"
              fill={index % a === 0 ? '#8B7DEC' : '#6D5CE7'}
            />
          );
        })}
        {Array.from({ length: b }, (_, index) => (
          <circle key={index} cx={42 + index * 32} cy="184" r="10" fill="#F4B725" />
        ))}
        <text x="24" y="202" className="micro-scene__caption">
          violet: a × n · emas: b tetap
        </text>
      </g>
      <g transform="translate(485 98)">
        <text x="0" y="0" className="micro-scene__label">
          Aturan hidup
        </text>
        <rect x="0" y="18" width="215" height="78" rx="18" fill="#15172A" />
        <text x="108" y="50" textAnchor="middle" className="micro-scene__formula-light">
          {a} × {n} + {b}
        </text>
        <text x="108" y="78" textAnchor="middle" className="micro-scene__metric-light">
          = {formatNumber(output)}
        </text>
        {[n - 1, n, n + 1].map((rowN, index) => (
          <g key={rowN} transform={`translate(0 ${116 + index * 42})`}>
            <rect width="215" height="34" rx="10" fill={index === 1 ? '#F0EEFF' : '#F4F3F0'} />
            <text x="22" y="23" className="micro-scene__caption">
              n = {rowN}
            </text>
            <text x="193" y="23" textAnchor="end" className="micro-scene__metric">
              {a * rowN + b}
            </text>
          </g>
        ))}
      </g>
    </SceneFrame>
  );
}

function Balance(props: MicroSceneProps) {
  const left = metric(props.model, 'left');
  const difference = metric(props.model, 'difference');
  const angle = clamp(difference * 2.4, -11, 11);
  return (
    <SceneFrame props={props}>
      <text x="380" y="94" textAnchor="middle" className="micro-scene__formula">
        x + 3 = 8
      </text>
      <g transform={`translate(380 218) rotate(${angle})`} className="micro-scene__moving">
        <rect x="-260" y="-5" width="520" height="10" rx="5" fill="#25293A" />
        <line x1="-205" y1="0" x2="-205" y2="72" stroke="#667085" strokeWidth="4" />
        <line x1="205" y1="0" x2="205" y2="72" stroke="#667085" strokeWidth="4" />
        <path d="M -280 72 Q -205 112 -130 72 Z" fill="#F0EEFF" stroke="#6D5CE7" strokeWidth="3" />
        <path d="M 130 72 Q 205 112 280 72 Z" fill="#E4EEFF" stroke="#3B82F6" strokeWidth="3" />
        <g transform="translate(-232 38)">
          <rect x="0" y="0" width="54" height="42" rx="10" fill="url(#micro-violet)" />
          <text x="27" y="28" textAnchor="middle" className="micro-scene__formula-light">
            x
          </text>
          {[0, 1, 2].map((index) => (
            <circle key={index} cx={76 + index * 23} cy="59" r="9" fill="#F4B725" />
          ))}
        </g>
        <g transform="translate(151 45)">
          {Array.from({ length: 8 }, (_, index) => (
            <circle
              key={index}
              cx={(index % 4) * 27}
              cy={Math.floor(index / 4) * 25}
              r="9"
              fill="#3B82F6"
            />
          ))}
        </g>
      </g>
      <path d="M 350 310 L 380 230 L 410 310 Z" fill="#25293A" />
      <rect x="310" y="310" width="140" height="12" rx="6" fill="#25293A" />
      <g transform="translate(255 337)">
        <rect
          width="250"
          height="36"
          rx="18"
          fill={Math.abs(difference) < 0.001 ? '#E0FAE9' : '#FFF7DC'}
        />
        <text x="125" y="24" textAnchor="middle" className="micro-scene__metric">
          {Math.abs(difference) < 0.001
            ? 'Seimbang'
            : `${formatNumber(left)} dibanding 8 · selisih ${formatNumber(Math.abs(difference))}`}
        </text>
      </g>
    </SceneFrame>
  );
}

function ExpressionMachine(props: MicroSceneProps) {
  const a = Math.round(value(props.model, 'a'));
  const x = Math.round(value(props.model, 'x'));
  const b = Math.round(value(props.model, 'b'));
  const total = metric(props.model, 'total');
  return (
    <SceneFrame props={props}>
      <g transform="translate(42 100)">
        <text x="0" y="0" className="micro-scene__label">
          Cerita benda
        </text>
        {Array.from({ length: a }, (_, group) => (
          <g key={group} transform={`translate(${group * 102} 28)`}>
            <rect width="86" height="100" rx="18" fill="#FAF9FF" stroke="#BDB4F5" strokeWidth="2" />
            {Array.from({ length: x }, (_, index) => (
              <rect
                key={index}
                x={14 + (index % 3) * 22}
                y={16 + Math.floor(index / 3) * 25}
                width="17"
                height="17"
                rx="4"
                fill="#6D5CE7"
              />
            ))}
            <text x="43" y="88" textAnchor="middle" className="micro-scene__caption">
              nilai {x}
            </text>
          </g>
        ))}
        <g transform="translate(4 158)">
          {Array.from({ length: b }, (_, index) => (
            <circle key={index} cx={14 + index * 28} cy="14" r="11" fill="#F4B725" />
          ))}
        </g>
      </g>
      <path d="M 460 198 L 516 198" stroke="#A4A8B5" strokeWidth="4" strokeLinecap="round" />
      <path
        d="M 504 184 L 520 198 L 504 212"
        fill="none"
        stroke="#A4A8B5"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g transform="translate(536 118)" filter="url(#micro-shadow)">
        <rect width="182" height="166" rx="24" fill="#15172A" />
        <text x="91" y="35" textAnchor="middle" className="micro-scene__caption-light">
          MESIN EKSPRESI
        </text>
        <text x="91" y="83" textAnchor="middle" className="micro-scene__formula-light">
          {a}x + {b}
        </text>
        <line x1="24" y1="104" x2="158" y2="104" stroke="#3E4557" />
        <text x="91" y="139" textAnchor="middle" className="micro-scene__metric-light">
          x={x} → {formatNumber(total)}
        </text>
      </g>
    </SceneFrame>
  );
}

function GraphAxes({ labelX = 't', labelY = 's' }: { labelX?: string; labelY?: string }) {
  return (
    <g>
      <rect x="0" y="0" width="430" height="240" rx="20" fill="url(#micro-grid)" />
      <line x1="40" y1="205" x2="408" y2="205" stroke="#667085" strokeWidth="2" />
      <line x1="40" y1="18" x2="40" y2="205" stroke="#667085" strokeWidth="2" />
      <text x="410" y="225" className="micro-scene__caption">
        {labelX}
      </text>
      <text x="22" y="24" className="micro-scene__caption">
        {labelY}
      </text>
    </g>
  );
}

function AverageRate(props: MicroSceneProps) {
  const t1 = value(props.model, 't1');
  const t2 = value(props.model, 't2');
  const rate = metric(props.model, 'rate');
  const graphX = (t: number) => 40 + (clamp(t, 0, 6) / 6) * 368;
  const graphY = (s: number) => 205 - (clamp(s, 0, 36) / 36) * 178;
  const path = linePath(0, 6, 60, (t) => [graphX(t), graphY(t * t)]);
  const x1 = graphX(t1);
  const y1 = graphY(t1 * t1);
  const x2 = graphX(t2);
  const y2 = graphY(t2 * t2);
  const collapsed = Boolean(props.model.metrics.collapsed);
  const tangentDx = 56;
  const tangentDy = -(rate * tangentDx * 178) / (6 * 36);
  return (
    <SceneFrame props={props}>
      <g transform="translate(38 92)">
        <GraphAxes />
        <path d={path} fill="none" stroke="#6D5CE7" strokeWidth="5" strokeLinecap="round" />
        <line
          x1={collapsed ? x1 - tangentDx : x1}
          y1={collapsed ? y1 - tangentDy : y1}
          x2={collapsed ? x1 + tangentDx : x2}
          y2={collapsed ? y1 + tangentDy : y2}
          stroke="#F4B725"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx={x1} cy={y1} r="8" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="3" />
        <circle
          cx={x2}
          cy={y2}
          r="8"
          fill="#6D5CE7"
          stroke="#FFFFFF"
          strokeWidth="3"
          opacity={collapsed ? 0.35 : 1}
        />
      </g>
      <g transform="translate(505 119)">
        <text x="0" y="0" className="micro-scene__label">
          Perjalanan s(t)=t²
        </text>
        <rect x="0" y="22" width="208" height="90" rx="20" fill="#F2F7FF" />
        <text x="20" y="52" className="micro-scene__caption">
          t₁={formatNumber(t1)} → s₁={formatNumber(t1 * t1)}
        </text>
        <text x="20" y="78" className="micro-scene__caption">
          t₂={formatNumber(t2)} → s₂={formatNumber(t2 * t2)}
        </text>
        <text x="20" y="101" className="micro-scene__caption">
          {collapsed ? 'interval menyusut ke satu saat' : `Δt = ${formatNumber(t2 - t1)}`}
        </text>
        <rect x="0" y="132" width="208" height="78" rx="20" fill="#15172A" />
        <text x="104" y="160" textAnchor="middle" className="micro-scene__caption-light">
          LAJU RATA-RATA
        </text>
        <text x="104" y="194" textAnchor="middle" className="micro-scene__formula-light">
          {formatNumber(rate)}
        </text>
      </g>
    </SceneFrame>
  );
}

function SecantLimit(props: MicroSceneProps) {
  const x = value(props.model, 'x');
  const h = value(props.model, 'h');
  const x2 = x + h;
  const slope = metric(props.model, 'slope');
  const gx = (input: number) => 215 + input * 48;
  const gy = (output: number) => 218 - output * 11;
  const path = linePath(-4, 4, 80, (input) => [gx(input), gy(input * input)]);
  const px = gx(x);
  const py = gy(x * x);
  const qx = gx(x2);
  const qy = gy(x2 * x2);
  const limitState = Boolean(props.model.metrics.limitState);
  const dx = 86;
  const dy = -(slope * dx * 11) / 48;
  return (
    <SceneFrame props={props}>
      <g transform="translate(38 90)">
        <rect width="454" height="254" rx="22" fill="url(#micro-grid)" />
        <line x1="23" y1="218" x2="431" y2="218" stroke="#667085" strokeWidth="2" />
        <line x1="215" y1="18" x2="215" y2="238" stroke="#667085" strokeWidth="2" />
        <path d={path} fill="none" stroke="#6D5CE7" strokeWidth="5" strokeLinecap="round" />
        <line
          x1={limitState ? px - dx : px}
          y1={limitState ? py - dy : py}
          x2={limitState ? px + dx : qx}
          y2={limitState ? py + dy : qy}
          stroke="#F4B725"
          strokeWidth="4"
        />
        <circle cx={px} cy={py} r="8" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="3" />
        <circle
          cx={qx}
          cy={qy}
          r={limitState ? 14 : 8}
          fill={limitState ? 'none' : '#F4B725'}
          stroke="#F4B725"
          strokeWidth="3"
        />
      </g>
      <g transform="translate(520 112)">
        <text x="0" y="0" className="micro-scene__label">
          Jarak h
        </text>
        <rect y="18" width="192" height="102" rx="20" fill={limitState ? '#E0FAE9' : '#FFF7DC'} />
        <text x="96" y="56" textAnchor="middle" className="micro-scene__formula">
          h = {formatNumber(h)}
        </text>
        <text x="96" y="86" textAnchor="middle" className="micro-scene__caption">
          {limitState ? 'keadaan limit' : `titik kedua x+h=${formatNumber(x2)}`}
        </text>
        <rect y="142" width="192" height="80" rx="20" fill="#15172A" />
        <text x="96" y="170" textAnchor="middle" className="micro-scene__caption-light">
          KEMIRINGAN
        </text>
        <text x="96" y="204" textAnchor="middle" className="micro-scene__formula-light">
          {formatNumber(slope)}
        </text>
      </g>
    </SceneFrame>
  );
}

function InstantSpeed(props: MicroSceneProps) {
  const t = value(props.model, 't');
  const position = metric(props.model, 'position');
  const speed = metric(props.model, 'speed');
  const gx = (input: number) => 42 + (input / 6) * 368;
  const gy = (output: number) => 205 - (output / 36) * 178;
  const path = linePath(0, 6, 60, (input) => [gx(input), gy(input * input)]);
  const px = gx(t);
  const py = gy(position);
  const dx = 64;
  const dy = -(speed * dx * 178) / (6 * 36);
  const needleAngle = -125 + (clamp(speed, 0, 12) / 12) * 250;
  return (
    <SceneFrame props={props}>
      <g transform="translate(38 92)">
        <GraphAxes />
        <path d={path} fill="none" stroke="#6D5CE7" strokeWidth="5" />
        <line
          x1={px - dx}
          y1={py - dy}
          x2={px + dx}
          y2={py + dy}
          stroke="#F4B725"
          strokeWidth="4"
        />
        <circle cx={px} cy={py} r="9" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="3" />
      </g>
      <g transform="translate(609 226)">
        <path
          d="M -92 0 A 92 92 0 0 1 92 0"
          fill="none"
          stroke="#E4E6EE"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M -92 0 A 92 92 0 0 1 92 0"
          fill="none"
          stroke="#6D5CE7"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${clamp(speed / 12, 0, 1) * 289} 289`}
        />
        <g transform={`rotate(${needleAngle})`} className="micro-scene__moving">
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="-70"
            stroke="#F4B725"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </g>
        <circle r="12" fill="#25293A" />
        <text x="0" y="45" textAnchor="middle" className="micro-scene__formula">
          {formatNumber(speed)}
        </text>
        <text x="0" y="66" textAnchor="middle" className="micro-scene__caption">
          kecepatan pada t={formatNumber(t)}
        </text>
      </g>
    </SceneFrame>
  );
}

function QuadraticDerivative(props: MicroSceneProps) {
  const a = value(props.model, 'a');
  const b = value(props.model, 'b');
  const c = value(props.model, 'c');
  const x = value(props.model, 'x');
  const derivative = metric(props.model, 'derivative');
  const fx = (input: number) => a * input * input + b * input + c;
  const dx = (input: number) => 2 * a * input + b;
  const mapX = (input: number, origin: number) => origin + 174 + input * 38;
  const mapY = (output: number) => 235 - clamp(output, -10, 16) * 7;
  const original = linePath(-4, 4, 80, (input) => [mapX(input, 20), mapY(fx(input))]);
  const derivativePath = linePath(-4, 4, 40, (input) => [mapX(input, 386), mapY(dx(input))]);
  const px = mapX(x, 20);
  const py = mapY(fx(x));
  const dpx = mapX(x, 386);
  const dpy = mapY(derivative);
  return (
    <SceneFrame props={props}>
      <g transform="translate(20 82)">
        <rect width="340" height="270" rx="22" fill="url(#micro-grid)" />
        <line x1="22" y1="235" x2="318" y2="235" stroke="#667085" />
        <line x1="174" y1="18" x2="174" y2="252" stroke="#667085" />
        <text x="18" y="20" className="micro-scene__label">
          f(x)
        </text>
      </g>
      <path
        d={original}
        fill="none"
        stroke="#6D5CE7"
        strokeWidth="5"
        clipPath="inset(0 round 20px)"
      />
      <line
        x1={px - 55}
        y1={py + derivative * 18}
        x2={px + 55}
        y2={py - derivative * 18}
        stroke="#F4B725"
        strokeWidth="4"
      />
      <circle cx={px} cy={py} r="8" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="3" />
      <g transform="translate(386 82)">
        <rect width="354" height="270" rx="22" fill="#F2F7FF" stroke="#C7DCFF" />
        <line x1="20" y1="235" x2="334" y2="235" stroke="#667085" />
        <line x1="174" y1="18" x2="174" y2="252" stroke="#667085" />
        <text x="18" y="20" className="micro-scene__label">
          f′(x)
        </text>
      </g>
      <path d={derivativePath} fill="none" stroke="#3B82F6" strokeWidth="5" />
      <line
        x1={dpx}
        y1="100"
        x2={dpx}
        y2="317"
        stroke="#99C1FF"
        strokeWidth="2"
        strokeDasharray="5 6"
      />
      <circle cx={dpx} cy={dpy} r="9" fill="#F4B725" stroke="#FFFFFF" strokeWidth="3" />
      <g transform="translate(244 327)">
        <rect width="272" height="42" rx="21" fill="#15172A" />
        <text x="136" y="27" textAnchor="middle" className="micro-scene__formula-light">
          f′({formatNumber(x)}) = {formatNumber(derivative)}
        </text>
      </g>
    </SceneFrame>
  );
}

export function MicroScene(props: MicroSceneProps) {
  switch (props.model.kind) {
    case 'growing-pattern':
      return <GrowingPattern {...props} />;
    case 'linear-rule':
      return <LinearRule {...props} />;
    case 'balance':
      return <Balance {...props} />;
    case 'expression-machine':
      return <ExpressionMachine {...props} />;
    case 'average-rate':
      return <AverageRate {...props} />;
    case 'secant-limit':
      return <SecantLimit {...props} />;
    case 'instant-speed':
      return <InstantSpeed {...props} />;
    case 'quadratic-derivative':
      return <QuadraticDerivative {...props} />;
  }
}
