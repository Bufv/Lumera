import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { LessonStage, type LessonStageTone } from './LessonStage';
import { formatNumber, parseReactiveNumber } from './numeric';
import type { MicroLessonDefinition, MicroLessonPlayerProps, ReactiveNumber } from './types';

const EMPTY: ReactiveNumber = { raw: '', value: null, validity: 'empty' };

interface AlgebraBalanceLessonProps extends Omit<MicroLessonPlayerProps, 'lessonId'> {
  lesson: MicroLessonDefinition;
}

interface BalanceInstrumentProps {
  constant: 3 | 4;
  rightTotal: 8 | 10;
  xWeight: number;
  xDraft?: ReactiveNumber;
  editable?: boolean;
  leftRemoved?: number;
  rightRemoved?: number;
  whyActive?: boolean;
  onXChange?: (raw: string) => void;
  onLeftUnitAction?: () => void;
  leftUnitActionLabel?: string;
}

interface BalanceDragState {
  index: number;
  pointerId: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function parseWholeNumber(raw: string, max: number): ReactiveNumber {
  const parsed = parseReactiveNumber(raw, 0, max);
  if (parsed.validity === 'valid' && parsed.value !== null && !Number.isInteger(parsed.value)) {
    return { ...parsed, validity: 'outOfRange' };
  }
  return parsed;
}

function activateWithKeyboard(event: KeyboardEvent<SVGGElement>, action?: () => void) {
  if (!action || !['Enter', ' ', 'ArrowDown', 'ArrowRight'].includes(event.key)) return;
  event.preventDefault();
  action();
}

function BalanceInstrument({
  constant,
  rightTotal,
  xWeight,
  xDraft = EMPTY,
  editable = false,
  leftRemoved = 0,
  rightRemoved = 0,
  whyActive = false,
  onXChange,
  onLeftUnitAction,
  leftUnitActionLabel = 'Singkirkan satu unit dari sisi kiri',
}: BalanceInstrumentProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<BalanceDragState | null>(null);
  const draggingRef = useRef<BalanceDragState | null>(null);
  const unitActionRef = useRef(onLeftUnitAction);
  unitActionRef.current = onLeftUnitAction;
  const suppressClickRef = useRef(false);
  const dragFrameRef = useRef<number | null>(null);
  const pendingDragRef = useRef<{ pointerId: number; clientX: number; clientY: number } | null>(
    null,
  );
  const leftUnits = Math.max(0, constant - leftRemoved);
  const rightUnits = Math.max(0, rightTotal - rightRemoved);
  const leftWeight = xWeight + leftUnits;
  const rightWeight = rightUnits;
  const angle = clamp((rightWeight - leftWeight) * 2.2, -10, 10);
  const balanced = Math.abs(leftWeight - rightWeight) < 0.001;
  const draftIncomplete = editable && xDraft.validity !== 'valid';

  const clearDrag = useCallback(() => {
    if (dragFrameRef.current !== null) cancelAnimationFrame(dragFrameRef.current);
    dragFrameRef.current = null;
    pendingDragRef.current = null;
    draggingRef.current = null;
    setDragging(null);
  }, []);

  const finishUnitDragAt = useCallback(
    (pointerId: number, clientX: number, clientY: number) => {
      const current = draggingRef.current;
      if (!current || current.pointerId !== pointerId) return;
      const dx = clientX - current.startX;
      const dy = clientY - current.startY;
      const movedToTray = dy > 42 && Math.hypot(dx, dy) > 52;
      clearDrag();
      if (!movedToTray) return;
      suppressClickRef.current = true;
      unitActionRef.current?.();
      requestAnimationFrame(() => {
        suppressClickRef.current = false;
      });
    },
    [clearDrag],
  );

  useEffect(() => {
    const finishFromWindow = (event: PointerEvent) => {
      finishUnitDragAt(event.pointerId, event.clientX, event.clientY);
    };
    const cancelFromWindow = (event: PointerEvent) => {
      if (draggingRef.current?.pointerId === event.pointerId) clearDrag();
    };
    window.addEventListener('pointerup', finishFromWindow);
    window.addEventListener('pointercancel', cancelFromWindow);
    return () => {
      window.removeEventListener('pointerup', finishFromWindow);
      window.removeEventListener('pointercancel', cancelFromWindow);
      if (dragFrameRef.current !== null) cancelAnimationFrame(dragFrameRef.current);
    };
  }, [clearDrag, finishUnitDragAt]);

  const startUnitDrag = (event: ReactPointerEvent<SVGGElement>, index: number) => {
    if (!onLeftUnitAction) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    const nextDrag: BalanceDragState = {
      index,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dx: 0,
      dy: 0,
    };
    draggingRef.current = nextDrag;
    setDragging(nextDrag);
  };

  const moveUnitDrag = (event: ReactPointerEvent<SVGGElement>) => {
    pendingDragRef.current = {
      pointerId: event.pointerId,
      clientX: event.clientX,
      clientY: event.clientY,
    };
    if (dragFrameRef.current !== null) return;
    dragFrameRef.current = requestAnimationFrame(() => {
      const pending = pendingDragRef.current;
      dragFrameRef.current = null;
      if (!pending) return;
      const bounds = svgRef.current?.getBoundingClientRect();
      const scaleX = bounds && bounds.width > 0 ? 560 / bounds.width : 1;
      const scaleY = bounds && bounds.height > 0 ? 310 / bounds.height : 1;
      const current = draggingRef.current;
      if (!current || current.pointerId !== pending.pointerId) return;
      const nextDrag: BalanceDragState = {
        ...current,
        dx: clamp((pending.clientX - current.startX) * scaleX, -120, 120),
        dy: clamp((pending.clientY - current.startY) * scaleY, -80, 120),
      };
      draggingRef.current = nextDrag;
      setDragging(nextDrag);
    });
  };

  const finishUnitDrag = (event: ReactPointerEvent<SVGGElement>) => {
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    finishUnitDragAt(event.pointerId, event.clientX, event.clientY);
  };

  const tapUnit = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onLeftUnitAction?.();
  };

  return (
    <div
      className="balance-instrument"
      data-testid="balance-instrument"
      data-left-weight={leftWeight}
      data-right-weight={rightWeight}
      data-beam-angle={angle}
      data-balanced={balanced ? 'true' : 'false'}
      data-paired-removed={Math.min(leftRemoved, rightRemoved)}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 560 310"
        role="group"
        aria-label={`Neraca interaktif: sisi kiri ${formatNumber(leftWeight)}, sisi kanan ${formatNumber(rightWeight)}`}
      >
        <line x1="280" y1="170" x2="280" y2="267" className="balance-stand" />
        <path d="M245 269 L280 169 L315 269 Z" className="balance-pivot" />
        <line x1="232" y1="271" x2="328" y2="271" className="balance-base" />

        <g className="balance-beam" transform={`translate(0 155) rotate(${angle} 280 0)`}>
          <rect x="78" y="-5" width="404" height="10" rx="5" />
          <line x1="132" y1="0" x2="132" y2="66" />
          <line x1="428" y1="0" x2="428" y2="66" />
          <path d="M55 66 Q132 105 209 66 Z" className="balance-pan balance-pan--left" />
          <path d="M351 66 Q428 105 505 66 Z" className="balance-pan balance-pan--right" />

          <g transform="translate(82 20)">
            <rect width="76" height="50" rx="12" className="balance-x-block" />
            {editable ? (
              <foreignObject x="7" y="6" width="62" height="38">
                <input
                  className={`balance-x-input balance-x-input--${xDraft.validity}`}
                  type="text"
                  inputMode="decimal"
                  aria-label="Nilai x pada neraca"
                  value={xDraft.raw}
                  placeholder="x"
                  onChange={(event) => onXChange?.(event.target.value)}
                />
              </foreignObject>
            ) : (
              <text x="38" y="34" textAnchor="middle" className="balance-x-label">
                x
              </text>
            )}
          </g>

          <g transform="translate(166 47)">
            {Array.from({ length: constant }, (_, index) => {
              const removed = index >= leftUnits;
              return (
                <g
                  key={index}
                  className={`balance-unit ${removed ? 'balance-unit--removed' : ''} ${dragging?.index === index ? 'balance-unit--dragging' : ''} ${whyActive ? `balance-unit--why-${index + 1}` : ''}`}
                  transform={`translate(${index * 24 + (dragging?.index === index ? dragging.dx : 0)} ${dragging?.index === index ? dragging.dy : 0})`}
                  role={!removed && onLeftUnitAction ? 'button' : undefined}
                  tabIndex={!removed && onLeftUnitAction ? 0 : undefined}
                  aria-label={!removed && onLeftUnitAction ? leftUnitActionLabel : undefined}
                  aria-keyshortcuts={
                    !removed && onLeftUnitAction ? 'ArrowDown ArrowRight Enter Space' : undefined
                  }
                  onClick={!removed ? tapUnit : undefined}
                  onKeyDown={(event) =>
                    activateWithKeyboard(event, !removed ? onLeftUnitAction : undefined)
                  }
                  onPointerDown={!removed ? (event) => startUnitDrag(event, index) : undefined}
                  onPointerMove={!removed ? moveUnitDrag : undefined}
                  onPointerUp={!removed ? finishUnitDrag : undefined}
                  onPointerCancel={!removed ? clearDrag : undefined}
                >
                  <rect
                    className="balance-unit-hit"
                    x="-16"
                    y="-16"
                    width="50"
                    height="50"
                    rx="11"
                  />
                  <rect className="balance-unit-shape" width="18" height="18" rx="5" />
                </g>
              );
            })}
          </g>

          <g transform="translate(376 37)">
            {Array.from({ length: rightTotal }, (_, index) => {
              const removed = index >= rightUnits;
              return (
                <rect
                  key={index}
                  x={(index % 5) * 22}
                  y={Math.floor(index / 5) * 22}
                  width="17"
                  height="17"
                  rx="5"
                  className={`balance-right-unit ${removed ? 'balance-unit--removed' : ''} ${whyActive && index >= rightUnits ? `balance-unit--why-${rightTotal - index}` : ''}`}
                />
              );
            })}
          </g>
        </g>

        <g transform="translate(200 282)" className="balance-tray">
          <path d="M0 0 H160 L148 22 H12 Z" />
          <text x="80" y="17" textAnchor="middle">
            wadah singkir
          </text>
        </g>
      </svg>

      <div className={`balance-reading ${balanced ? 'balance-reading--balanced' : ''}`}>
        <strong>
          {balanced
            ? 'Neraca mendatar'
            : leftWeight < rightWeight
              ? 'Sisi kanan lebih berat'
              : 'Sisi kiri lebih berat'}
        </strong>
        <span>
          {formatNumber(leftWeight)} dibanding {formatNumber(rightWeight)}
        </span>
      </div>
      {draftIncomplete ? (
        <p className="balance-draft" role="status">
          Angka “{xDraft.raw || 'kosong'}” belum lengkap; bentuk masih memakai nilai terakhir{' '}
          {formatNumber(xWeight)}.
        </p>
      ) : null}
    </div>
  );
}

function TutorCopy({ children, detail }: { children: ReactNode; detail?: ReactNode }) {
  return (
    <>
      <p>{children}</p>
      {detail ? <div className="micro-tutor__detail">{detail}</div> : null}
    </>
  );
}

export function AlgebraBalanceLesson({
  lesson,
  lumens,
  reducedMotion,
  onExit,
  onComplete,
}: AlgebraBalanceLessonProps) {
  const [step, setStep] = useState(1);
  const [choice, setChoice] = useState<'left' | 'right' | null>(null);
  const [xDraft, setXDraft] = useState<ReactiveNumber>(parseReactiveNumber('2', -4, 12));
  const [xWeight, setXWeight] = useState(2);
  const [exploredValues, setExploredValues] = useState<readonly number[]>([]);
  const [singleRemoved, setSingleRemoved] = useState(false);
  const [singleRemovedDraft, setSingleRemovedDraft] = useState<ReactiveNumber>(
    parseWholeNumber('0', 1),
  );
  const [pairedRemoved, setPairedRemoved] = useState(0);
  const [pairedRemovedDraft, setPairedRemovedDraft] = useState<ReactiveNumber>(
    parseWholeNumber('0', 3),
  );
  const [result, setResult] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [hintLevel, setHintLevel] = useState(0);
  const [transferResult, setTransferResult] = useState<'idle' | 'wrong' | 'correct'>('idle');
  const [transferHintLevel, setTransferHintLevel] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [whyActive, setWhyActive] = useState(false);
  const [tutorSignal, setTutorSignal] = useState(0);
  const completedRef = useRef(false);
  const exerciseHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    exerciseHeadingRef.current?.focus();
  }, [step]);

  const updateX = (raw: string, mode: 'explore' | 'predict' | 'assessment' | 'transfer') => {
    const parsed = parseReactiveNumber(raw, -4, 12);
    setXDraft(parsed);
    if (parsed.validity !== 'valid' || parsed.value === null) return;
    setXWeight(parsed.value);
    if (mode === 'explore') {
      setExploredValues((current) =>
        current.includes(parsed.value as number) ? current : [...current, parsed.value as number],
      );
    }
    if (mode === 'assessment') {
      setResult('idle');
      setWhyActive(false);
    }
    if (mode === 'transfer') {
      setTransferResult('idle');
      setWhyActive(false);
    }
  };

  const enterStep = (next: number) => {
    setStep(next);
    setWhyActive(false);
    if (next === 2) {
      setXDraft(parseReactiveNumber('2', -4, 12));
      setXWeight(2);
      setExploredValues([]);
    } else if (next === 3 || next === 6 || next === 7) {
      setXDraft(EMPTY);
      setXWeight(2);
    } else if (next === 4) {
      setSingleRemoved(false);
      setSingleRemovedDraft(parseWholeNumber('0', 1));
      setXWeight(5);
    } else if (next === 5) {
      setPairedRemoved(0);
      setPairedRemovedDraft(parseWholeNumber('0', 3));
      setXWeight(5);
    }
  };

  const check = (expected: number, transfer = false) => {
    if (xDraft.validity !== 'valid' || xDraft.value === null) return;
    setAttempts((current) => current + 1);
    const correct = Math.abs(xDraft.value - expected) < 0.001;
    if (transfer) setTransferResult(correct ? 'correct' : 'wrong');
    else setResult(correct ? 'correct' : 'wrong');
    if (correct) return;
    setMistakes((current) => current + 1);
    setTutorSignal((current) => current + 1);
    if (transfer) setTransferHintLevel((current) => Math.min(3, current + 1));
    else setHintLevel((current) => Math.min(3, current + 1));
  };

  const openWhy = () => {
    setWhyActive(true);
    setTutorSignal((current) => current + 1);
  };

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete({ lessonId: lesson.id, mistakes, attempts });
  };

  const activeScoredResult = step === 6 ? result : step === 7 ? transferResult : 'idle';
  const tone: LessonStageTone =
    activeScoredResult === 'correct'
      ? 'correct'
      : activeScoredResult === 'wrong' || (step === 1 && choice === 'left')
        ? 'wrong'
        : 'neutral';

  let exercise: ReactNode;
  let tutor: ReactNode;
  let dock: ReactNode;

  if (step === 1) {
    tutor = (
      <TutorCopy>
        Bandingkan tinggi kedua pan. Pan yang lebih rendah menanggung bobot lebih besar.
      </TutorCopy>
    );
    exercise = (
      <div className="balance-step">
        <span className="micro-kicker">Aljabar · 1.3</span>
        <h1 ref={exerciseHeadingRef} tabIndex={-1}>
          Sisi mana yang lebih berat?
        </h1>
        <p className="balance-step__lead">Neraca menunjukkan x = 2 pada persamaan x + 3 dan 8.</p>
        <BalanceInstrument constant={3} rightTotal={8} xWeight={2} />
        <div className="balance-choices" aria-label="Pilih sisi yang lebih berat">
          <button type="button" aria-pressed={choice === 'left'} onClick={() => setChoice('left')}>
            Kiri
          </button>
          <button
            type="button"
            aria-pressed={choice === 'right'}
            onClick={() => setChoice('right')}
          >
            Kanan
          </button>
        </div>
        {choice ? (
          <p className="balance-inline-feedback" role="status">
            {choice === 'right'
              ? 'Tepat—pan kanan lebih rendah.'
              : 'Lihat lagi: pan kanan berada lebih rendah.'}
          </p>
        ) : null}
      </div>
    );
    dock = (
      <button
        className="micro-button micro-button--primary"
        type="button"
        disabled={choice !== 'right'}
        onClick={() => enterStep(2)}
      >
        Lanjut
      </button>
    );
  } else if (step === 2) {
    tutor = (
      <TutorCopy>
        Setiap nilai x mengubah bobot sisi kiri. Angka yang belum lengkap tidak merusak bentuk
        terakhir.
      </TutorCopy>
    );
    exercise = (
      <div className="balance-step">
        <span className="micro-kicker">Eksplorasi</span>
        <h1 ref={exerciseHeadingRef} tabIndex={-1}>
          Ubah nilai x langsung pada balok.
        </h1>
        <p className="balance-step__lead">
          Coba sedikitnya dua nilai berbeda dan perhatikan pan bergerak.
        </p>
        <BalanceInstrument
          constant={3}
          rightTotal={8}
          xWeight={xWeight}
          xDraft={xDraft}
          editable
          onXChange={(raw) => updateX(raw, 'explore')}
        />
        <div className="balance-tried" aria-label="Nilai yang telah dicoba">
          {exploredValues.map((value) => (
            <span key={value}>{formatNumber(value)}</span>
          ))}
        </div>
      </div>
    );
    dock = (
      <button
        className="micro-button micro-button--primary"
        type="button"
        disabled={exploredValues.length < 2}
        onClick={() => enterStep(3)}
      >
        Lanjut
      </button>
    );
  } else if (step === 3) {
    tutor = (
      <TutorCopy>Cari nilai saat balok benar-benar mendatar. Prediksi ini belum dinilai.</TutorCopy>
    );
    exercise = (
      <div className="balance-step">
        <span className="micro-kicker">Prediksi</span>
        <h1 ref={exerciseHeadingRef} tabIndex={-1}>
          Nilai berapa yang membuat neraca mendatar?
        </h1>
        <BalanceInstrument
          constant={3}
          rightTotal={8}
          xWeight={xWeight}
          xDraft={xDraft}
          editable
          onXChange={(raw) => updateX(raw, 'predict')}
        />
      </div>
    );
    dock = (
      <button
        className="micro-button micro-button--primary"
        type="button"
        disabled={xDraft.validity !== 'valid'}
        onClick={() => enterStep(4)}
      >
        Kunci prediksi
      </button>
    );
  } else if (step === 4) {
    tutor = (
      <TutorCopy>
        {singleRemoved
          ? 'Kesetaraan pecah: sisi kiri berubah, sisi kanan tidak.'
          : 'Ubah satu sisi saja, lalu lihat apa yang terjadi pada kesetaraan.'}
      </TutorCopy>
    );
    const removeLeft = () => {
      setSingleRemoved(true);
      setSingleRemovedDraft(parseWholeNumber('1', 1));
    };
    const typeSingleRemoval = (raw: string) => {
      const parsed = parseWholeNumber(raw, 1);
      setSingleRemovedDraft(parsed);
      if (parsed.validity === 'valid' && parsed.value !== null) {
        setSingleRemoved(parsed.value === 1);
      }
    };
    exercise = (
      <div className="balance-step">
        <span className="micro-kicker">Uji kesetaraan</span>
        <h1 ref={exerciseHeadingRef} tabIndex={-1}>
          Singkirkan satu unit dari sisi kiri saja.
        </h1>
        <BalanceInstrument
          constant={3}
          rightTotal={8}
          xWeight={5}
          leftRemoved={singleRemoved ? 1 : 0}
          onLeftUnitAction={singleRemoved ? undefined : removeLeft}
        />
        <div className="balance-alternatives">
          <button
            className="balance-direct-button"
            type="button"
            disabled={singleRemoved}
            onClick={removeLeft}
          >
            Singkirkan 1 dari sisi kiri
          </button>
          <label className="balance-number-alternative">
            <span>atau ketik</span>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Jumlah unit kiri yang disingkirkan"
              aria-invalid={singleRemovedDraft.validity === 'outOfRange'}
              value={singleRemovedDraft.raw}
              onChange={(event) => typeSingleRemoval(event.target.value)}
            />
            <span>/ 1</span>
          </label>
        </div>
        <p className="balance-trace">{singleRemoved ? 'x + 2 ≠ 8' : 'x + 3 = 8'}</p>
      </div>
    );
    dock = (
      <button
        className="micro-button micro-button--primary"
        type="button"
        disabled={!singleRemoved}
        onClick={() => enterStep(5)}
      >
        Pulihkan dan lanjut
      </button>
    );
  } else if (step === 5) {
    tutor = <TutorCopy>Operasi yang sama pada kedua sisi menjaga neraca tetap sejajar.</TutorCopy>;
    const setPairCount = (value: number) => {
      const next = Math.min(3, Math.max(0, value));
      setPairedRemoved(next);
      setPairedRemovedDraft(parseWholeNumber(String(next), 3));
    };
    const removePair = () => setPairCount(pairedRemoved + 1);
    const typePairCount = (raw: string) => {
      const parsed = parseWholeNumber(raw, 3);
      setPairedRemovedDraft(parsed);
      if (parsed.validity === 'valid' && parsed.value !== null) {
        setPairedRemoved(parsed.value);
      }
    };
    exercise = (
      <div className="balance-step">
        <span className="micro-kicker">Jaga keseimbangan</span>
        <h1 ref={exerciseHeadingRef} tabIndex={-1}>
          Kurangi satu unit dari kedua sisi.
        </h1>
        <BalanceInstrument
          constant={3}
          rightTotal={8}
          xWeight={5}
          leftRemoved={pairedRemoved}
          rightRemoved={pairedRemoved}
          onLeftUnitAction={pairedRemoved < 3 ? removePair : undefined}
          leftUnitActionLabel="Kurangi satu unit dari kedua sisi"
        />
        <div className="balance-alternatives">
          <button
            className="balance-direct-button"
            type="button"
            disabled={pairedRemoved >= 3}
            onClick={removePair}
          >
            Kurangi 1 dari kedua sisi
          </button>
          <label className="balance-number-alternative">
            <span>atau ketik</span>
            <input
              type="text"
              inputMode="numeric"
              aria-label="Jumlah pasangan yang disingkirkan"
              aria-invalid={pairedRemovedDraft.validity === 'outOfRange'}
              value={pairedRemovedDraft.raw}
              onChange={(event) => typePairCount(event.target.value)}
            />
            <span>/ 3</span>
          </label>
        </div>
        <p className="balance-trace">
          {pairedRemoved === 3
            ? 'x + 3 − 3 = 8 − 3  →  x = 5'
            : `x + 3 − ${pairedRemoved} = 8 − ${pairedRemoved}`}
        </p>
      </div>
    );
    dock = (
      <button
        className="micro-button micro-button--primary"
        type="button"
        disabled={pairedRemoved !== 3}
        onClick={() => enterStep(6)}
      >
        Lanjut
      </button>
    );
  } else if (step === 6) {
    const hints = lesson.hints;
    tutor = (
      <TutorCopy
        detail={
          whyActive ? (
            <p className="balance-why-equation">
              x + 3 − 3 = 8 − 3<br />
              <strong>x = 5</strong>
            </p>
          ) : result === 'wrong' ? (
            <p>{hints[Math.max(0, hintLevel - 1)]}</p>
          ) : undefined
        }
      >
        {whyActive
          ? 'Kurangi 3 pada kedua sisi. Tiga pasangan menghilang, sementara neraca tetap mendatar.'
          : 'Sekarang tulis nilai yang kamu temukan. Hanya tombol Periksa yang menghitung percobaan.'}
      </TutorCopy>
    );
    exercise = (
      <div className="balance-step">
        <span className="micro-kicker">Periksa pemahaman</span>
        <h1 ref={exerciseHeadingRef} tabIndex={-1}>
          Berapa nilai x pada x + 3 = 8?
        </h1>
        <BalanceInstrument
          constant={3}
          rightTotal={8}
          xWeight={whyActive ? 5 : xWeight}
          xDraft={xDraft}
          editable={!whyActive && result !== 'correct'}
          leftRemoved={whyActive ? 3 : 0}
          rightRemoved={whyActive ? 3 : 0}
          whyActive={whyActive}
          onXChange={(raw) => updateX(raw, 'assessment')}
        />
        {result === 'wrong' ? (
          <p className="balance-inline-feedback" role="status">
            Belum tepat · petunjuk {hintLevel} dari 3 · coba lagi tanpa batas.
          </p>
        ) : null}
        {result === 'correct' ? (
          <p className="balance-inline-feedback balance-inline-feedback--correct" role="status">
            Tepat. Kedua sisi bernilai 8.
          </p>
        ) : null}
      </div>
    );
    dock =
      result === 'correct' ? (
        <>
          <button
            className="micro-button micro-button--secondary"
            type="button"
            aria-pressed={whyActive}
            onClick={openWhy}
          >
            Why?
          </button>
          <button
            className="micro-button micro-button--primary"
            type="button"
            onClick={() => enterStep(7)}
          >
            Lanjut
          </button>
        </>
      ) : (
        <button
          className="micro-button micro-button--check"
          type="button"
          disabled={xDraft.validity !== 'valid'}
          onClick={() => check(5)}
        >
          Periksa
        </button>
      );
  } else if (step === 7) {
    const transferHints = [
      'Pisahkan empat unit tetap dari x.',
      'Kurangi 4 pada kedua sisi.',
      'Hitung 10 − 4.',
    ];
    tutor = (
      <TutorCopy
        detail={
          whyActive ? (
            <p className="balance-why-equation">
              x + 4 − 4 = 10 − 4<br />
              <strong>x = 6</strong>
            </p>
          ) : transferResult === 'wrong' ? (
            <p>{transferHints[Math.max(0, transferHintLevel - 1)]}</p>
          ) : undefined
        }
      >
        {whyActive
          ? 'Gagasan yang sama bekerja lagi: operasi berpasangan mempertahankan kesetaraan.'
          : 'Ulangi gagasan yang sama dengan empat unit tetap.'}
      </TutorCopy>
    );
    exercise = (
      <div className="balance-step">
        <span className="micro-kicker">Transfer</span>
        <h1 ref={exerciseHeadingRef} tabIndex={-1}>
          Neraca baru: x + 4 = 10.
        </h1>
        <BalanceInstrument
          constant={4}
          rightTotal={10}
          xWeight={whyActive ? 6 : xWeight}
          xDraft={xDraft}
          editable={!whyActive && transferResult !== 'correct'}
          leftRemoved={whyActive ? 4 : 0}
          rightRemoved={whyActive ? 4 : 0}
          whyActive={whyActive}
          onXChange={(raw) => updateX(raw, 'transfer')}
        />
        {transferResult === 'wrong' ? (
          <p className="balance-inline-feedback" role="status">
            Belum tepat · petunjuk {transferHintLevel} dari 3 · coba lagi tanpa batas.
          </p>
        ) : null}
        {transferResult === 'correct' ? (
          <p className="balance-inline-feedback balance-inline-feedback--correct" role="status">
            Tepat. Hubungan yang sama bekerja pada angka baru.
          </p>
        ) : null}
      </div>
    );
    dock =
      transferResult === 'correct' ? (
        <>
          <button
            className="micro-button micro-button--secondary"
            type="button"
            aria-pressed={whyActive}
            onClick={openWhy}
          >
            Why?
          </button>
          <button
            className="micro-button micro-button--primary"
            type="button"
            onClick={() => enterStep(8)}
          >
            Lanjut
          </button>
        </>
      ) : (
        <button
          className="micro-button micro-button--check"
          type="button"
          disabled={xDraft.validity !== 'valid'}
          onClick={() => check(6, true)}
        >
          Periksa
        </button>
      );
  } else {
    tutor = (
      <TutorCopy>Kamu mengubah, menguji, dan menjaga kesetaraan—bukan sekadar menebak x.</TutorCopy>
    );
    exercise = (
      <div className="balance-complete">
        <span aria-hidden="true">✓</span>
        <p>Pelajaran 1.3 selesai</p>
        <h1 ref={exerciseHeadingRef} tabIndex={-1}>
          {lesson.title}
        </h1>
        <dl>
          <div>
            <dt>Percobaan</dt>
            <dd>{attempts}</dd>
          </div>
          <div>
            <dt>Kesalahan</dt>
            <dd>{mistakes}</dd>
          </div>
          <div>
            <dt>Lumens</dt>
            <dd>{lumens}</dd>
          </div>
        </dl>
      </div>
    );
    dock = (
      <button className="micro-button micro-button--primary" type="button" onClick={finish}>
        Lanjut
      </button>
    );
  }

  return (
    <LessonStage
      lessonId={lesson.id}
      title={lesson.title}
      step={step}
      totalSteps={8}
      lumens={lumens}
      reducedMotion={reducedMotion}
      tone={tone}
      tutor={tutor}
      tutorSignal={tutorSignal}
      onExit={onExit}
      dock={dock}
    >
      {exercise}
    </LessonStage>
  );
}
