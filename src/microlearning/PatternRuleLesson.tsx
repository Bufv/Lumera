import { useState, useEffect, useRef } from 'react';
import { Icon } from '../design/Icon';
import type { MicroLessonCompletion, MicroLessonDefinition } from './types';
import './PatternRuleLesson.css';

interface FlyingParticle {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  type: 'token';
  label?: string;
}

export interface PatternRuleLessonProps {
  lesson: MicroLessonDefinition;
  lumens?: number;
  reducedMotion?: boolean;
  onExit?: () => void;
  onComplete: (payload: MicroLessonCompletion) => void;
}

// ------------------------------------------------------------ 3D Object Primitives
export function MathCube({
  highlight = false,
  dimmed = false,
  size = 26,
  ariaLabel,
}: {
  highlight?: boolean;
  dimmed?: boolean;
  size?: number;
  ariaLabel?: string;
}) {
  const src = highlight ? '/assets/math_cube_highlight.png' : '/assets/math_cube_purple.png';
  return (
    <img
      src={src}
      alt={ariaLabel ?? 'Balok kubus ungu'}
      className={`rule-cube ${highlight ? 'rule-cube--highlight' : ''} ${dimmed ? 'rule-cube--dimmed' : ''}`}
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

export function MathDiamond({
  size = 20,
  dimmed = false,
  highlight = false,
}: {
  size?: number;
  dimmed?: boolean;
  highlight?: boolean;
}) {
  return (
    <img
      src="/assets/math_diamond_gold.png"
      alt="Wajik emas"
      className={`rule-diamond ${dimmed ? 'rule-diamond--dimmed' : ''} ${highlight ? 'rule-diamond--highlight' : ''}`}
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

export function PatternRuleLesson({
  lesson,
  reducedMotion = false,
  onExit,
  onComplete,
}: PatternRuleLessonProps) {
  // Current Step: 1 to 9 (pedagogical states) and 10 (completion)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [maxUnlockedStep, setMaxUnlockedStep] = useState<number>(1);
  const [hintsVisible, setHintsVisible] = useState<boolean>(false);
  const [hintTier, setHintTier] = useState<number>(1);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [stepValidated, setStepValidated] = useState<boolean>(false);

  useEffect(() => {
    if (currentStep < maxUnlockedStep) {
      setStepValidated(true);
    }
  }, [currentStep, maxUnlockedStep]);

  // -------------------------------- State 1: Step Friction
  const [step1SimCount, setStep1SimCount] = useState<number>(7);
  const [step1SteppingDone, setStep1SteppingDone] = useState<boolean>(false);

  const handleStep1Iterate = () => {
    if (step1SimCount < 15) {
      setStep1SimCount((c) => c + 2);
    } else {
      setStep1SteppingDone(true);
      setStepValidated(true);
    }
  };

  // -------------------------------- State 2: Synchronized Slider
  const [state2SliderN, setState2SliderN] = useState<number>(3);

  // -------------------------------- State 3: Table Relationship
  const [state3Step5Input, setState3Step5Input] = useState<string>('');

  const verifyStep3 = () => {
    setAttemptsCount((c) => c + 1);
    if (state3Step5Input.trim() === '9') {
      setStepValidated(true);
      setErrorMessage(null);
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Setiap langkah bertambah 2. Berapa jumlah setelah 7?');
    }
  };

  // -------------------------------- State 4: Decompose Structure
  const [step4SplitStep2, setStep4SplitStep2] = useState<boolean>(false);
  const [step4SplitStep3, setStep4SplitStep3] = useState<boolean>(false);
  const [step4SplitStep4, setStep4SplitStep4] = useState<boolean>(false);

  const allDecomposed = step4SplitStep2 && step4SplitStep3 && step4SplitStep4;

  // -------------------------------- State 5: Words Rule Builder
  const [step5Slot1, setStep5Slot1] = useState<string | null>(null);
  const [step5Slot2, setStep5Slot2] = useState<string | null>(null);

  // Trajectory Flight Engine
  const cardRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef<boolean>(true);
  const [flyingParticles, setFlyingParticles] = useState<FlyingParticle[]>([]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const triggerFlight = (
    originEl: HTMLElement,
    targetSelector: string,
    type: 'token',
    label?: string,
    onLanded?: () => void,
  ) => {
    if (reducedMotion || !cardRef.current) {
      onLanded?.();
      return;
    }

    const cardRect = cardRef.current.getBoundingClientRect();
    const originRect = originEl.getBoundingClientRect();

    // In unit test / headless environments or if reduced motion is on, execute immediately
    if (originRect.width === 0 && originRect.height === 0) {
      onLanded?.();
      return;
    }

    const targetEl = cardRef.current.querySelector(targetSelector) as HTMLElement | null;
    const targetRect = targetEl?.getBoundingClientRect();

    const startX = originRect.left - cardRect.left + originRect.width / 2;
    const startY = originRect.top - cardRect.top + originRect.height / 2;
    const targetX = targetRect
      ? targetRect.left - cardRect.left + targetRect.width / 2
      : startX;
    const targetY = targetRect
      ? targetRect.top - cardRect.top + targetRect.height / 2
      : startY - 120;

    const id = Date.now() + Math.random();
    setFlyingParticles((prev) => [
      ...prev,
      { id, startX, startY, targetX, targetY, type, label },
    ]);

    setTimeout(() => {
      if (isMountedRef.current) {
        onLanded?.();
        setFlyingParticles((prev) => prev.filter((p) => p.id !== id));
      }
    }, 160);
  };

  useEffect(() => {
    setFlyingParticles([]);
  }, [currentStep]);

  const handlePlaceWordToken = (token: string, event?: React.MouseEvent<HTMLElement>) => {
    const targetSlot = !step5Slot1
      ? '.rule-builder-slot:nth-of-type(1)'
      : !step5Slot2
        ? '.rule-builder-slot:nth-of-type(2)'
        : null;

    const commit = () => {
      if (!step5Slot1) setStep5Slot1(token);
      else if (!step5Slot2) setStep5Slot2(token);
      setErrorMessage(null);
    };

    if (event && targetSlot && !reducedMotion) {
      triggerFlight(event.currentTarget, targetSlot, 'token', token, commit);
    } else {
      commit();
    }
  };

  const verifyStep5 = () => {
    setAttemptsCount((c) => c + 1);
    const valid =
      (step5Slot1 === 'nomor langkah' && step5Slot2 === 'satu kurang dari nomor langkah') ||
      (step5Slot1 === 'satu kurang dari nomor langkah' && step5Slot2 === 'nomor langkah');
    if (valid) {
      setStepValidated(true);
      setErrorMessage(null);
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Ingat pembagian balok: bagian pertama adalah nomor langkah, dan bagian kedua adalah satu kurang dari nomor langkah.');
    }
  };

  // -------------------------------- State 6: Symbolic Compression
  const [step6Stage, setStep6Stage] = useState<number>(1);

  // -------------------------------- State 7: Test the Rule
  const [state7Prediction, setState7Prediction] = useState<string>('');

  const verifyStep7 = () => {
    setAttemptsCount((c) => c + 1);
    if (state7Prediction.trim() === '11') {
      setStepValidated(true);
      setErrorMessage(null);
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Hitung: 2 × 6 − 1 = 12 − 1 = ?');
    }
  };

  // -------------------------------- State 8: Payoff Step 20 & 50
  const [state8Input20, setState8Input20] = useState<string>('');
  const [state8Input50, setState8Input50] = useState<string>('');

  const verifyStep8 = () => {
    setAttemptsCount((c) => c + 1);
    const ok20 = state8Input20.trim() === '39';
    const ok50 = state8Input50.trim() === '99';

    if (ok20 && ok50) {
      setStepValidated(true);
      setErrorMessage(null);
    } else if (!ok20) {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Untuk Langkah 20: 2(20) − 1 = 40 − 1 = 39.');
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Untuk Langkah 50: 2(50) − 1 = 100 − 1 = 99.');
    }
  };

  // -------------------------------- State 9: Transfer (Gold Diamonds 4, 7, 10 -> 3n + 1)
  const [state9SelectedRule, setState9SelectedRule] = useState<string | null>(null);
  const [state9Input10, setState9Input10] = useState<string>('');
  const [state9Input20, setState9Input20] = useState<string>('');

  const verifyStep9 = () => {
    setAttemptsCount((c) => c + 1);
    const ruleOk = state9SelectedRule === '3n + 1';
    const val10Ok = state9Input10.trim() === '31';
    const val20Ok = state9Input20.trim() === '61';

    if (ruleOk && val10Ok && val20Ok) {
      setStepValidated(true);
      setErrorMessage(null);
    } else if (!ruleOk) {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Setiap langkah bertambah 3 balok dengan 1 balok tetap: 3n + 1.');
    } else if (!val10Ok) {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Langkah 10: 3(10) + 1 = 30 + 1 = 31.');
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Langkah 20: 3(20) + 1 = 60 + 1 = 61.');
    }
  };

  // -------------------------------- Navigation & Hints
  const handleOpenHint = () => {
    setHintsVisible(true);
  };

  const getStepHints = (): string[] => {
    switch (currentStep) {
      case 1:
        return [
          'Menambah 2 secara berulang memang bisa, tetapi butuh waktu lama.',
          'Klik tombol lanjutkan untuk melihat proses penambahan manual.',
        ];
      case 2:
        return [
          'Geser slider untuk melihat bagaimana nomor langkah dan jumlah balok bertambah bersamaan.',
          'Perhatikan tabel di sebelah kanan: setiap langkah memiliki jumlah balok tertentu.',
        ];
      case 3:
        return [
          'Dari Langkah 4 (7) ke Langkah 5, polanya bertambah 2 balok.',
          '7 + 2 = 9.',
        ];
      case 4:
        return [
          'Bandingkan jumlah dengan nomor langkahnya.',
          'Pada Langkah 4 ada 7 benda. Coba pisahkan menjadi 4 dan 3.',
          'Bagian pertama sama dengan nomor langkah, bagian kedua selalu berkurang 1.',
        ];
      case 5:
        return [
          'Susun aturan: Jumlah = nomor langkah + satu kurang dari nomor langkah.',
          'Klik kartu untuk memasukkannya ke dalam kotak.',
        ];
      case 6:
        return [
          'n mewakili nomor langkah apa pun.',
          'n + (n − 1) disederhanakan menjadi 2n − 1.',
        ];
      case 7:
        return [
          'Untuk n = 6: kalikan 6 dengan 2, lalu kurangi 1.',
          '2(6) − 1 = 12 − 1 = 11.',
        ];
      case 8:
        return [
          'Langkah 20: 2(20) − 1 = 39.',
          'Langkah 50: 2(50) − 1 = 100 − 1 = 99.',
        ];
      case 9:
        return [
          'Cari bagian yang berulang: setiap langkah bertambah kelompok 3.',
          'Ada 1 balok tetap yang selalu ada di ujung.',
          'Aturan umumnya: 3n + 1. Langkah 10 = 31, Langkah 20 = 61.',
        ];
      default:
        return ['Lanjutkan dengan menekan tombol aksi.'];
    }
  };

  const handleNextStep = () => {
    setErrorMessage(null);
    setHintsVisible(false);
    setHintTier(1);
    setStepValidated(false);
    const next = currentStep + 1;
    setCurrentStep(next);
    setMaxUnlockedStep((m) => Math.max(m, next));
  };

  const handleStepSelect = (step: number) => {
    setCurrentStep(step);
  };

  const handleFinalCompletion = () => {
    onComplete({
      lessonId: lesson.id,
      mistakes: mistakesCount,
      attempts: attemptsCount || 9,
    });
  };

  const highestUnlocked = Math.max(currentStep, maxUnlockedStep);

  return (
    <main className="rule-focus-layout" aria-label="Fokus Pelajaran 1.2: Aturan di Balik Pola">
      {/* -------------------------------- Minimal Top Chrome */}
      <header className="rule-focus-header">
        <button
          type="button"
          className="rule-focus-close-btn"
          onClick={onExit}
          aria-label="Tutup dan kembali ke kurikulum Aljabar"
        >
          <Icon name="close" width={18} height={18} />
        </button>

        {/* 9-Segment Progress Indicator */}
        <div className="rule-progress-bar" aria-label="Navigasi langkah pelajaran">
          {Array.from({ length: 9 }).map((_, idx) => {
            const stepNum = idx + 1;
            const isFilled = stepNum < currentStep || currentStep === 10;
            const isCurrent = stepNum === currentStep && currentStep <= 9;
            const isUnlocked = stepNum <= highestUnlocked;

            return (
              <button
                key={idx}
                type="button"
                className={`rule-progress-segment ${isFilled ? 'rule-progress-segment--completed' : ''} ${isCurrent ? 'rule-progress-segment--active' : ''} ${isUnlocked ? 'rule-progress-segment--clickable' : ''}`}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    handleStepSelect(stepNum);
                  }
                }}
                aria-label={
                  isCurrent
                    ? `Langkah ${stepNum} (sedang aktif)`
                    : isUnlocked
                      ? `Buka langkah ${stepNum}`
                      : `Langkah ${stepNum} (terkunci)`
                }
              />
            );
          })}
        </div>

        <div
          role="progressbar"
          aria-valuenow={Math.min(currentStep, 9)}
          aria-valuemin={1}
          aria-valuemax={9}
          aria-label={`Langkah ${Math.min(currentStep, 9)} dari 9`}
          style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}
        />

        <div className="rule-step-indicator" aria-hidden="true">
          {currentStep <= 9 ? `${currentStep} / 9` : '✓'}
        </div>
      </header>

      {/* -------------------------------- Central Workspace */}
      <section className="rule-workspace-container">
        <div className="rule-workspace-card" ref={cardRef}>
          {/* ============================================================ STATE 1: CREATE THE NEED FOR A RULE */}
          {currentStep === 1 && (
            <div className="rule-step-panel rule-step-need">
              <header className="rule-instruction-block">
                <h2 className="rule-instruction-title">Masalahnya terlalu jauh</h2>
                <p className="rule-instruction-sub">Kalau ini Langkah 20, berapa banyak balok yang dibutuhkan?</p>
              </header>

              <div className="rule-pattern-row">
                <div className="rule-pattern-group">
                  <div className="rule-objects-cluster">
                    <MathCube size={26} />
                  </div>
                  <span className="rule-group-label">Langkah 1</span>
                  <span className="rule-quantity-tag">1</span>
                </div>

                <div className="rule-pattern-group">
                  <div className="rule-objects-cluster">
                    <MathCube size={26} />
                    <MathCube size={26} />
                    <MathCube size={26} />
                  </div>
                  <span className="rule-group-label">Langkah 2</span>
                  <span className="rule-quantity-tag">3</span>
                </div>

                <div className="rule-pattern-group">
                  <div className="rule-objects-cluster">
                    <MathCube size={26} />
                    <MathCube size={26} />
                    <MathCube size={26} />
                    <MathCube size={26} />
                    <MathCube size={26} />
                  </div>
                  <span className="rule-group-label">Langkah 3</span>
                  <span className="rule-quantity-tag">5</span>
                </div>

                <div className="rule-pattern-group">
                  <div className="rule-objects-cluster">
                    <MathCube size={26} />
                    <MathCube size={26} />
                    <MathCube size={26} />
                    <MathCube size={26} />
                    <MathCube size={26} />
                    <MathCube size={26} />
                    <MathCube size={26} />
                  </div>
                  <span className="rule-group-label">Langkah 4</span>
                  <span className="rule-quantity-tag">7</span>
                </div>

                <div className="rule-pattern-group rule-pattern-group--target">
                  <div className="rule-objects-placeholder">
                    <span>?</span>
                  </div>
                  <span className="rule-group-label">Langkah 20</span>
                  <span className="rule-quantity-tag">?</span>
                </div>
              </div>

              {/* Friction Step Action */}
              <div className="rule-friction-box">
                {!step1SteppingDone ? (
                  <button
                    type="button"
                    className="rule-friction-btn"
                    onClick={handleStep1Iterate}
                  >
                    <span>+ Lanjutkan satu-satu (+2): <strong>{step1SimCount} balok</strong></span>
                  </button>
                ) : (
                  <div className="rule-friction-callout" aria-live="polite">
                    <strong>Bisa. Tapi ada cara yang lebih cepat daripada menambah 16 kali!</strong>
                    <span className="rule-friction-sub">Kita bisa mencari aturan yang langsung menghubungkan nomor langkah ke jumlah balok.</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ STATE 2: STEP NUMBER AND VALUE */}
          {currentStep === 2 && (
            <div className="rule-step-panel rule-step-sync">
              <header className="rule-instruction-block">
                <h2 className="rule-instruction-title">Nomor langkah dan jumlah</h2>
                <p className="rule-instruction-sub">Geser untuk melihat hubungan antara nomor langkah dan jumlah balok.</p>
              </header>

              {/* Step Slider */}
              <div className="rule-slider-box">
                <div className="rule-slider-labels">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`rule-slider-tick ${state2SliderN === num ? 'is-active' : ''}`}
                      onClick={() => setState2SliderN(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min={1}
                  max={6}
                  value={state2SliderN}
                  onChange={(e) => setState2SliderN(Number(e.target.value))}
                  className="rule-step-slider"
                  aria-label="Pilih nomor langkah"
                />
              </div>

              <div className="rule-sync-grid">
                {/* Visual View */}
                <div className="rule-sync-card">
                  <span className="rule-sync-card-title">Pola Langkah {state2SliderN}</span>
                  <div className="rule-objects-cluster">
                    {Array.from({ length: 2 * state2SliderN - 1 }).map((_, idx) => (
                      <MathCube key={idx} size={24} />
                    ))}
                  </div>
                  <span className="rule-quantity-tag">Jumlah: {2 * state2SliderN - 1} balok</span>
                </div>

                {/* Table View */}
                <div className="rule-sync-card">
                  <span className="rule-sync-card-title">Tabel Hubungan</span>
                  <table className="rule-mini-table">
                    <thead>
                      <tr>
                        <th>Langkah</th>
                        <th>Jumlah</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { step: 1, val: 1 },
                        { step: 2, val: 3 },
                        { step: 3, val: 5 },
                        { step: 4, val: 7 },
                        { step: 5, val: 9 },
                        { step: 6, val: 11 },
                      ].map((row) => (
                        <tr
                          key={row.step}
                          className={state2SliderN === row.step ? 'is-selected-row' : ''}
                        >
                          <td>{row.step}</td>
                          <td><strong>{row.val}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ STATE 3: TABLE AS A RELATIONSHIP */}
          {currentStep === 3 && (
            <div className="rule-step-panel rule-step-table-rel">
              <header className="rule-instruction-block">
                <h2 className="rule-instruction-title">Apa yang terjadi selanjutnya?</h2>
                <p className="rule-instruction-sub">Isi jumlah pada baris berikutnya.</p>
              </header>

              <div className="rule-table-layout">
                <table className="rule-large-table">
                  <thead>
                    <tr>
                      <th>Langkah</th>
                      <th>Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>1</td><td>1</td></tr>
                    <tr><td>2</td><td>3</td></tr>
                    <tr><td>3</td><td>5</td></tr>
                    <tr><td>4</td><td>7</td></tr>
                    <tr className="is-active-input-row">
                      <td>5</td>
                      <td>
                        {!stepValidated ? (
                          <div className="rule-inline-input-wrap">
                            <input
                              type="text"
                              inputMode="numeric"
                              className="rule-number-input"
                              placeholder="?"
                              value={state3Step5Input}
                              onChange={(e) => setState3Step5Input(e.target.value)}
                              aria-label="Jumlah untuk Langkah 5"
                            />
                          </div>
                        ) : (
                          <strong className="rule-val-revealed">9</strong>
                        )}
                      </td>
                    </tr>
                    {stepValidated && (
                      <tr className="is-distant-row">
                        <td>20</td>
                        <td><span className="rule-question-badge">?</span></td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {stepValidated && (
                  <aside className="rule-insight-aside" aria-live="polite">
                    <div className="rule-insight-icon">💡</div>
                    <div className="rule-insight-text">
                      <strong>Bisakah jumlah diketahui langsung dari nomor langkahnya?</strong>
                      <p>Tanpa harus mengisi Langkah 6 sampai Langkah 19 satu per satu.</p>
                    </div>
                  </aside>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ STATE 4: DECOMPOSE THE VISUAL STRUCTURE */}
          {currentStep === 4 && (
            <div className="rule-step-panel rule-step-decompose">
              <header className="rule-instruction-block">
                <h2 className="rule-instruction-title">Pisahkan polanya</h2>
                <p className="rule-instruction-sub">Ketuk setiap kelompok untuk memisahkan balok sesuai nomor langkahnya.</p>
              </header>

              <div className="rule-decompose-rows">
                {/* Step 2: 3 cubes (2 + 1) */}
                <div
                  className={`rule-decompose-row ${step4SplitStep2 ? 'is-split' : ''}`}
                  onClick={() => setStep4SplitStep2(true)}
                  role="button"
                  tabIndex={0}
                  aria-label="Pisahkan Langkah 2: 3 balok"
                >
                  <span className="rule-decompose-label">Langkah 2</span>
                  <div className="rule-decompose-objects">
                    <div className="rule-cluster-part">
                      <MathCube size={26} />
                      <MathCube size={26} />
                    </div>
                    {step4SplitStep2 && <span className="rule-divider-bar">+</span>}
                    <div className="rule-cluster-part">
                      <MathCube size={26} highlight={step4SplitStep2} />
                    </div>
                  </div>
                  <span className="rule-decompose-eq">{step4SplitStep2 ? '= 2 + 1' : '3 balok'}</span>
                </div>

                {/* Step 3: 5 cubes (3 + 2) */}
                <div
                  className={`rule-decompose-row ${step4SplitStep3 ? 'is-split' : ''}`}
                  onClick={() => setStep4SplitStep3(true)}
                  role="button"
                  tabIndex={0}
                  aria-label="Pisahkan Langkah 3: 5 balok"
                >
                  <span className="rule-decompose-label">Langkah 3</span>
                  <div className="rule-decompose-objects">
                    <div className="rule-cluster-part">
                      <MathCube size={26} />
                      <MathCube size={26} />
                      <MathCube size={26} />
                    </div>
                    {step4SplitStep3 && <span className="rule-divider-bar">+</span>}
                    <div className="rule-cluster-part">
                      <MathCube size={26} highlight={step4SplitStep3} />
                      <MathCube size={26} highlight={step4SplitStep3} />
                    </div>
                  </div>
                  <span className="rule-decompose-eq">{step4SplitStep3 ? '= 3 + 2' : '5 balok'}</span>
                </div>

                {/* Step 4: 7 cubes (4 + 3) */}
                <div
                  className={`rule-decompose-row ${step4SplitStep4 ? 'is-split' : ''}`}
                  onClick={() => setStep4SplitStep4(true)}
                  role="button"
                  tabIndex={0}
                  aria-label="Pisahkan Langkah 4: 7 balok"
                >
                  <span className="rule-decompose-label">Langkah 4</span>
                  <div className="rule-decompose-objects">
                    <div className="rule-cluster-part">
                      <MathCube size={26} />
                      <MathCube size={26} />
                      <MathCube size={26} />
                      <MathCube size={26} />
                    </div>
                    {step4SplitStep4 && <span className="rule-divider-bar">+</span>}
                    <div className="rule-cluster-part">
                      <MathCube size={26} highlight={step4SplitStep4} />
                      <MathCube size={26} highlight={step4SplitStep4} />
                      <MathCube size={26} highlight={step4SplitStep4} />
                    </div>
                  </div>
                  <span className="rule-decompose-eq">{step4SplitStep4 ? '= 4 + 3' : '7 balok'}</span>
                </div>
              </div>

              {allDecomposed && (
                <div className="rule-structural-discovery" aria-live="polite">
                  <div className="rule-discovery-badge">
                    <strong>Bagian pertama = nomor langkah</strong>
                    <span>Bagian kedua = satu kurang dari nomor langkah</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ STATE 5: BUILD THE RULE IN WORDS */}
          {currentStep === 5 && (
            <div className="rule-step-panel rule-step-words">
              <header className="rule-instruction-block">
                <h2 className="rule-instruction-title">Tulis aturan dalam kata-kata</h2>
                <p className="rule-instruction-sub">Susun bagian-bagian berikut dari pola yang kamu temukan.</p>
              </header>

              <div className="rule-equation-builder">
                <div className="rule-builder-fixed">Jumlah</div>
                <span className="rule-builder-sign">=</span>

                {/* Slot 1 */}
                <div
                  className={`rule-builder-slot ${step5Slot1 ? 'has-token' : ''}`}
                  onClick={() => step5Slot1 && setStep5Slot1(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Kotak pertama: ${step5Slot1 ?? 'kosong'}`}
                >
                  {step5Slot1 ? <span>{step5Slot1}</span> : <span className="rule-slot-ph">[ klik pilihan ]</span>}
                </div>

                <span className="rule-builder-sign">+</span>

                {/* Slot 2 */}
                <div
                  className={`rule-builder-slot ${step5Slot2 ? 'has-token' : ''}`}
                  onClick={() => step5Slot2 && setStep5Slot2(null)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Kotak kedua: ${step5Slot2 ?? 'kosong'}`}
                >
                  {step5Slot2 ? <span>{step5Slot2}</span> : <span className="rule-slot-ph">[ klik pilihan ]</span>}
                </div>
              </div>

              {/* Word Tokens */}
              <div className="rule-tokens-tray" role="group" aria-label="Pilihan frasa">
                {[
                  'nomor langkah',
                  'satu kurang dari nomor langkah',
                  'dua kali langkah',
                ].map((token) => (
                  <button
                    key={token}
                    type="button"
                    className={`rule-phrase-token ${step5Slot1 === token || step5Slot2 === token ? 'is-placed' : ''}`}
                    onClick={(e) => handlePlaceWordToken(token, e)}
                  >
                    {token}
                  </button>
                ))}
              </div>

              {stepValidated && (
                <div className="rule-intro-n-box" aria-live="polite">
                  <div className="rule-intro-n-pill">
                    <span className="rule-symbol-n">n</span>
                    <span>Kita bisa memakai <strong>n</strong> untuk mewakili nomor langkah apa pun.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ STATE 6: COMPRESS THE RULE */}
          {currentStep === 6 && (
            <div className="rule-step-panel rule-step-compress">
              <header className="rule-instruction-block">
                <h2 className="rule-instruction-title">Dari kata ke bentuk matematika</h2>
                <p className="rule-instruction-sub">Bagaimana jika nomor langkahnya belum ditentukan?</p>
              </header>

              <div className="rule-compression-flow">
                {/* Word Expression */}
                <div className="rule-compress-step">
                  <span className="rule-compress-label">Dalam kata-kata:</span>
                  <div className="rule-expr-box">nomor langkah + (satu kurang dari nomor langkah)</div>
                </div>

                <div className="rule-compress-arrow">↓ ganti dengan n</div>

                {/* Stage 1: n + (n - 1) */}
                <div className="rule-compress-step">
                  <div className="rule-expr-box rule-expr-box--highlight">
                    <span className="rule-var">n</span> + (<span className="rule-var">n</span> − 1)
                  </div>
                </div>

                {step6Stage >= 2 && (
                  <>
                    <div className="rule-compress-arrow">↓ kumpulkan n</div>
                    <div className="rule-compress-step">
                      <div className="rule-expr-box rule-expr-box--final">
                        <strong>2n − 1</strong>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {step6Stage === 1 ? (
                <button
                  type="button"
                  className="rule-compress-action-btn"
                  onClick={() => setStep6Stage(2)}
                >
                  Sederhanakan n + n − 1 →
                </button>
              ) : (
                <div className="rule-compress-conclusion" aria-live="polite">
                  <p>✨ <strong>Dengan 2n − 1</strong>, kita bisa mencari jumlah balok pada langkah mana pun secara langsung!</p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ STATE 7: TEST THE RULE */}
          {currentStep === 7 && (
            <div className="rule-step-panel rule-step-test">
              <header className="rule-instruction-block">
                <h2 className="rule-instruction-title">Uji aturan</h2>
                <p className="rule-instruction-sub">Apakah aturan 2n − 1 selalu bekerja pada langkah apa pun?</p>
              </header>

              <div className="rule-tester-grid">
                {/* n = 1 */}
                <div className="rule-test-card">
                  <span className="rule-test-step-title">Langkah 1 (n = 1)</span>
                  <div className="rule-formula-eval">
                    <span>2(1) − 1</span>
                    <span className="rule-eval-arrow">=</span>
                    <strong>1</strong>
                  </div>
                  <span className="rule-test-status">✓ Sesuai (1 balok)</span>
                </div>

                {/* n = 3 */}
                <div className="rule-test-card">
                  <span className="rule-test-step-title">Langkah 3 (n = 3)</span>
                  <div className="rule-formula-eval">
                    <span>2(3) − 1</span>
                    <span className="rule-eval-arrow">=</span>
                    <strong>5</strong>
                  </div>
                  <span className="rule-test-status">✓ Sesuai (5 balok)</span>
                </div>

                {/* n = 6 Challenge */}
                <div className="rule-test-card rule-test-card--interactive">
                  <span className="rule-test-step-title">Langkah 6 (n = 6)</span>
                  <div className="rule-formula-eval">
                    <span>2(6) − 1</span>
                    <span className="rule-eval-arrow">=</span>
                    {!stepValidated ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        className="rule-number-input rule-number-input--small"
                        placeholder="?"
                        value={state7Prediction}
                        onChange={(e) => setState7Prediction(e.target.value)}
                        aria-label="Prediksi hasil untuk n=6"
                      />
                    ) : (
                      <strong className="rule-val-revealed">11</strong>
                    )}
                  </div>
                  <span className="rule-test-status">
                    {stepValidated ? '✓ Terbukti benar!' : 'Prediksi hasilnya'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ STATE 8: PAY OFF THE OPENING PROBLEM */}
          {currentStep === 8 && (
            <div className="rule-step-panel rule-step-payoff">
              <header className="rule-instruction-block">
                <h2 className="rule-instruction-title">Gunakan untuk langkah jauh</h2>
                <p className="rule-instruction-sub">Berapa jumlah balok pada Langkah 20 dan Langkah 50?</p>
              </header>

              <div className="rule-payoff-grid">
                {/* Step 20 */}
                <div className="rule-payoff-card">
                  <span className="rule-payoff-badge">Langkah 20 (n = 20)</span>
                  <div className="rule-payoff-formula">2(20) − 1 = 40 − 1</div>
                  <div className="rule-payoff-input-row">
                    <label htmlFor="input-step-20">Jumlah balok:</label>
                    <input
                      id="input-step-20"
                      type="text"
                      inputMode="numeric"
                      className="rule-number-input"
                      placeholder="?"
                      value={state8Input20}
                      onChange={(e) => setState8Input20(e.target.value)}
                    />
                  </div>
                </div>

                {/* Step 50 */}
                <div className="rule-payoff-card">
                  <span className="rule-payoff-badge">Langkah 50 (n = 50)</span>
                  <div className="rule-payoff-formula">2(50) − 1 = 100 − 1</div>
                  <div className="rule-payoff-input-row">
                    <label htmlFor="input-step-50">Jumlah balok:</label>
                    <input
                      id="input-step-50"
                      type="text"
                      inputMode="numeric"
                      className="rule-number-input"
                      placeholder="?"
                      value={state8Input50}
                      onChange={(e) => setState8Input50(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {stepValidated && (
                <div className="rule-payoff-success" aria-live="polite">
                  <p>🎉 <strong>Luar biasa!</strong> Kita melompat langsung ke Langkah 20 (<strong>39</strong>) dan Langkah 50 (<strong>99</strong>) tanpa perlu menggambar puluhan balok!</p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ STATE 9: TRANSFER TO A NEW GENERAL RULE */}
          {currentStep === 9 && (
            <div className="rule-step-panel rule-step-transfer">
              <header className="rule-instruction-block">
                <h2 className="rule-instruction-title">Terapkan pada pola baru</h2>
                <p className="rule-instruction-sub">Perhatikan pola wajik emas berikut: setiap langkah bertambah kelompok 3 dengan 1 wajik tetap.</p>
              </header>

              {/* Visual Gold Diamonds */}
              <div className="rule-pattern-row">
                <div className="rule-pattern-group">
                  <div className="rule-objects-cluster">
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} highlight />
                  </div>
                  <span className="rule-group-label">Langkah 1</span>
                  <span className="rule-quantity-tag">4</span>
                </div>

                <div className="rule-pattern-group">
                  <div className="rule-objects-cluster">
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} highlight />
                  </div>
                  <span className="rule-group-label">Langkah 2</span>
                  <span className="rule-quantity-tag">7</span>
                </div>

                <div className="rule-pattern-group">
                  <div className="rule-objects-cluster">
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} />
                    <MathDiamond size={18} highlight />
                  </div>
                  <span className="rule-group-label">Langkah 3</span>
                  <span className="rule-quantity-tag">10</span>
                </div>
              </div>

              {/* Rule Selection */}
              <div className="rule-transfer-builder">
                <span className="rule-transfer-prompt">Pilih aturan untuk Langkah n:</span>
                <div className="rule-transfer-choices" role="radiogroup" aria-label="Pilihan aturan pola wajik">
                  {['3n + 1', '3n − 1', '4n + 1'].map((ruleOption) => (
                    <button
                      key={ruleOption}
                      type="button"
                      className={`rule-choice-pill ${state9SelectedRule === ruleOption ? 'is-selected' : ''}`}
                      onClick={() => setState9SelectedRule(ruleOption)}
                      role="radio"
                      aria-checked={state9SelectedRule === ruleOption}
                    >
                      {ruleOption}
                    </button>
                  ))}
                </div>

                {/* Calculation challenges for Step 10 and Step 20 */}
                <div className="rule-transfer-calc-grid">
                  <div className="rule-transfer-calc-card">
                    <span>Langkah 10: <strong>3(10) + 1</strong> =</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="rule-number-input rule-number-input--small"
                      placeholder="?"
                      value={state9Input10}
                      onChange={(e) => setState9Input10(e.target.value)}
                      aria-label="Hasil untuk Langkah 10"
                    />
                  </div>

                  <div className="rule-transfer-calc-card">
                    <span>Langkah 20: <strong>3(20) + 1</strong> =</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="rule-number-input rule-number-input--small"
                      placeholder="?"
                      value={state9Input20}
                      onChange={(e) => setState9Input20(e.target.value)}
                      aria-label="Hasil untuk Langkah 20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ STATE 10: COMPLETION */}
          {currentStep === 10 && (
            <div className="rule-step-panel rule-step-complete">
              {/* Floating Medallion */}
              <div className="rule-complete-emblem-wrap">
                <div className="rule-complete-emblem" aria-hidden="true">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#fbbf24" stroke="#d97706" />
                  </svg>
                </div>
              </div>

              <h2 className="rule-complete-title">Hebat!</h2>
              <p className="rule-complete-sub">Kamu sudah menguasai Aturan di Balik Pola.</p>

              {/* Reward Badge */}
              <div className="rule-reward-chip">
                <span className="rule-reward-sparkle">✦</span>
                <span>+25 Lumens</span>
              </div>

              {/* Flow Pillars */}
              <div className="rule-pillars-row">
                <div className="rule-pillar-card">
                  <div className="rule-pillar-icon-box rule-pillar-icon-box--step">
                    <span>n</span>
                  </div>
                  <div className="rule-pillar-text">
                    <span className="rule-pillar-label">Input</span>
                    <strong>LANGKAH</strong>
                  </div>
                </div>

                <span className="rule-pillar-arrow" aria-hidden="true">→</span>

                <div className="rule-pillar-card">
                  <div className="rule-pillar-icon-box rule-pillar-icon-box--rule">
                    <span>⚙️</span>
                  </div>
                  <div className="rule-pillar-text">
                    <span className="rule-pillar-label">Hubungan</span>
                    <strong>ATURAN</strong>
                  </div>
                </div>

                <span className="rule-pillar-arrow" aria-hidden="true">→</span>

                <div className="rule-pillar-card">
                  <div className="rule-pillar-icon-box rule-pillar-icon-box--val">
                    <span>#</span>
                  </div>
                  <div className="rule-pillar-text">
                    <span className="rule-pillar-label">Hasil</span>
                    <strong>JUMLAH</strong>
                  </div>
                </div>
              </div>

              {/* Takeaway */}
              <div className="rule-complete-takeaway-box">
                <p className="rule-complete-takeaway">
                  “Sekarang kamu tidak perlu menggambar setiap langkah untuk mengetahui jumlahnya.”
                </p>
              </div>

              {/* Integrated Primary CTA */}
              <div className="rule-complete-cta-wrap">
                <button
                  type="button"
                  className="rule-primary-btn rule-primary-btn--ready rule-complete-main-cta"
                  onClick={handleFinalCompletion}
                >
                  Lanjut ke 1.3 — Dari Kotak ke x →
                </button>
              </div>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="rule-error-banner" role="alert">
              <Icon name="info" width={16} height={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Flying Trajectory Particles Overlay */}
          <div className="focus-flight-overlay" aria-hidden="true">
            {flyingParticles.map((p) => (
              <div
                key={p.id}
                className="flying-particle flying-particle--token"
                style={
                  {
                    '--start-x': `${p.startX}px`,
                    '--start-y': `${p.startY}px`,
                    '--target-x': `${p.targetX}px`,
                    '--target-y': `${p.targetY}px`,
                  } as React.CSSProperties
                }
              >
                <span>{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- Contextual Hint Drawer */}
      {hintsVisible && (
        <aside className="rule-hint-drawer" role="complementary" aria-label="Petunjuk pelajaran">
          <div className="rule-hint-inner">
            <header className="rule-hint-header">
              <div className="rule-hint-title">
                <Icon name="sparkles" width={16} height={16} />
                <span>Petunjuk ({hintTier}/{getStepHints().length})</span>
              </div>
              <button
                type="button"
                className="rule-hint-close-btn"
                onClick={() => setHintsVisible(false)}
                aria-label="Tutup petunjuk"
              >
                <Icon name="close" width={16} height={16} />
              </button>
            </header>
            <p className="rule-hint-text">{getStepHints()[hintTier - 1]}</p>
            {hintTier < getStepHints().length && (
              <button
                type="button"
                className="rule-hint-next-btn"
                onClick={() => setHintTier((t) => t + 1)}
              >
                Buka petunjuk berikutnya →
              </button>
            )}
          </div>
        </aside>
      )}

      {/* -------------------------------- Stable Bottom Action Area */}
      <footer className="rule-lesson-footer">
        <div className="rule-footer-inner">
          {/* Left: Hint trigger */}
          {currentStep <= 9 ? (
            <button
              type="button"
              className="rule-hint-trigger-btn"
              onClick={handleOpenHint}
              aria-label="Buka petunjuk"
            >
              <Icon name="sparkles" width={16} height={16} />
              <span>Petunjuk</span>
            </button>
          ) : (
            <div />
          )}

          {/* Right: Primary Step Action */}
          {currentStep === 1 && (
            <button
              type="button"
              className={`rule-primary-btn ${stepValidated ? 'rule-primary-btn--ready' : 'rule-primary-btn--disabled'}`}
              disabled={!stepValidated}
              onClick={handleNextStep}
            >
              Lanjut →
            </button>
          )}

          {currentStep === 2 && (
            <button
              type="button"
              className="rule-primary-btn rule-primary-btn--ready"
              onClick={handleNextStep}
            >
              Lanjut →
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="button"
              className={`rule-primary-btn ${state3Step5Input.trim() ? 'rule-primary-btn--ready' : 'rule-primary-btn--disabled'}`}
              disabled={!state3Step5Input.trim()}
              onClick={stepValidated ? handleNextStep : verifyStep3}
            >
              {stepValidated ? 'Lanjut →' : 'Periksa'}
            </button>
          )}

          {currentStep === 4 && (
            <button
              type="button"
              className={`rule-primary-btn ${allDecomposed ? 'rule-primary-btn--ready' : 'rule-primary-btn--disabled'}`}
              disabled={!allDecomposed}
              onClick={handleNextStep}
            >
              Lanjut →
            </button>
          )}

          {currentStep === 5 && (
            <button
              type="button"
              className={`rule-primary-btn ${step5Slot1 && step5Slot2 ? 'rule-primary-btn--ready' : 'rule-primary-btn--disabled'}`}
              disabled={!step5Slot1 || !step5Slot2}
              onClick={stepValidated ? handleNextStep : verifyStep5}
            >
              {stepValidated ? 'Lanjut →' : 'Periksa'}
            </button>
          )}

          {currentStep === 6 && (
            <button
              type="button"
              className={`rule-primary-btn ${step6Stage >= 2 ? 'rule-primary-btn--ready' : 'rule-primary-btn--disabled'}`}
              disabled={step6Stage < 2}
              onClick={handleNextStep}
            >
              Lanjut →
            </button>
          )}

          {currentStep === 7 && (
            <button
              type="button"
              className={`rule-primary-btn ${state7Prediction.trim() ? 'rule-primary-btn--ready' : 'rule-primary-btn--disabled'}`}
              disabled={!state7Prediction.trim()}
              onClick={stepValidated ? handleNextStep : verifyStep7}
            >
              {stepValidated ? 'Lanjut →' : 'Periksa'}
            </button>
          )}

          {currentStep === 8 && (
            <button
              type="button"
              className={`rule-primary-btn ${state8Input20.trim() && state8Input50.trim() ? 'rule-primary-btn--ready' : 'rule-primary-btn--disabled'}`}
              disabled={!state8Input20.trim() || !state8Input50.trim()}
              onClick={stepValidated ? handleNextStep : verifyStep8}
            >
              {stepValidated ? 'Lanjut →' : 'Periksa'}
            </button>
          )}

          {currentStep === 9 && (
            <button
              type="button"
              className={`rule-primary-btn ${state9SelectedRule && state9Input10.trim() && state9Input20.trim() ? 'rule-primary-btn--ready' : 'rule-primary-btn--disabled'}`}
              disabled={!state9SelectedRule || !state9Input10.trim() || !state9Input20.trim()}
              onClick={stepValidated ? handleNextStep : verifyStep9}
            >
              {stepValidated ? 'Lanjut →' : 'Periksa'}
            </button>
          )}
        </div>
      </footer>
    </main>
  );
}
