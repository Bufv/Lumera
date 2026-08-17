import { useEffect, useRef, useState } from 'react';
import { Icon } from '../design/Icon';
import { useReducedMotion } from '../shared/useReducedMotion';
import { FocusLessonShell } from './FocusLessonShell';
import type { MicroLessonDefinition, MicroLessonPlayerProps } from './types';
import './FromBoxToXLesson.css';

export interface FromBoxToXLessonProps extends Omit<MicroLessonPlayerProps, 'lessonId'> {
  lesson: MicroLessonDefinition;
}

interface FlyingParticle {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  type: 'notebook' | 'unit';
}

// ------------------------------------------------------------ 3D Rendered Primitives (Zero Drop Shadow Assets)

export function Notebook3D({
  label = 'x',
  size = 56,
  dimmed = false,
  highlight = false,
}: {
  label?: string;
  size?: number;
  dimmed?: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`lumera-3d-notebook-wrap ${dimmed ? 'is-dimmed' : ''} ${highlight ? 'is-highlight' : ''}`}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-label={`Buku tulis bertag ${label}`}
    >
      <img
        src="/assets/math_notebook_3d.jpg"
        alt={`Buku tulis bertag ${label}`}
        className="lumera-3d-notebook-img"
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        loading="lazy"
      />
      {label && <span className="lumera-3d-notebook-badge">{label}</span>}
    </div>
  );
}

export function UnitCoin3D({
  size = 36,
  dimmed = false,
}: {
  size?: number;
  dimmed?: boolean;
}) {
  return (
    <img
      src="/assets/math_coin_unit_3d.jpg"
      alt="Koin unit bernilai 1"
      className={`lumera-3d-coin-img ${dimmed ? 'is-dimmed' : ''}`}
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

export function MysteryBox3D({
  size = 56,
  dimmed = false,
}: {
  size?: number;
  dimmed?: boolean;
}) {
  return (
    <img
      src="/assets/math_mystery_box_3d.jpg"
      alt="Kotak nilai belum diketahui"
      className={`lumera-3d-box-img ${dimmed ? 'is-dimmed' : ''}`}
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

// ------------------------------------------------------------ Pedagogical Hints Definition

const STEP_HINTS: Record<number, { tier1: string; tier2: string; tier3: string }> = {
  1: {
    tier1: 'Berapa ditambah 3 yang menghasilkan 8?',
    tier2: 'Coba kurangi total (8) dengan harga barang lain (3).',
    tier3: '8 − 3 = 5. Jadi harga buku tulis adalah 5.',
  },
  2: {
    tier1: 'Kotak mewakili sesuatu yang belum kita isi nilainya.',
    tier2: 'Kotak ini adalah pengganti nilai buku yang belum kita ketahui.',
    tier3: 'Pilih "Nilai yang belum diketahui".',
  },
  3: {
    tier1: 'Dalam aljabar, huruf seperti x menggantikan peran kotak.',
    tier2: 'Kotak mewakili 5, maka x di sini juga bernilai 5.',
    tier3: 'x adalah simbol untuk mewakili nilai yang belum diketahui.',
  },
  4: {
    tier1: 'Geser slider untuk mencoba berbagai nilai x.',
    tier2: 'Perhatikan bagaimana hasil persamaan x + 3 berubah saat x digeser.',
    tier3: 'Nilai x tidak selalu 5; x bisa mewakili nilai apa pun.',
  },
  5: {
    tier1: 'Tiga buku tulis masing-masing berharga x.',
    tier2: 'x + x + x dapat ditulis sebagai perkalian 3 × x.',
    tier3: '3x berarti 3 kali nilai x, atau x + x + x.',
  },
  6: {
    tier1: 'Ada bagian yang memiliki x dan bagian angka biasa.',
    tier2: 'Saat x berubah, 3x ikut berubah tetapi 2 tetap sama.',
    tier3: '3x adalah bagian variabel (berubah), 2 adalah bagian tetap.',
  },
  7: {
    tier1: 'Ketuk setiap bagian pada ekspresi 3x + 2 untuk melihat namanya.',
    tier2: 'x adalah Variabel, 3 adalah Koefisien, 2 adalah Konstanta.',
    tier3: 'Bagian yang dipisahkan tanda tambah (3x dan 2) disebut Suku.',
  },
  8: {
    tier1: '4x + 3 berarti 4 buku tulis (x) dan 3 koin unit (1).',
    tier2: 'Gunakan tombol baki untuk menambahkan buku dan koin.',
    tier3: 'Untuk bagian kedua: 2 buku dan 5 koin ditulis sebagai 2x + 5.',
  },
  9: {
    tier1: 'Huruf p memainkan peran yang sama persis seperti x.',
    tier2: '5 adalah koefisien, p adalah variabel, 4 adalah konstanta.',
    tier3: '5p berarti p dijumlahkan sebanyak 5 kali (p + p + p + p + p).',
  },
};

// ------------------------------------------------------------ Main Component

export function FromBoxToXLesson({
  lesson,
  reducedMotion: reducedMotionProp = false,
  onExit,
  onComplete,
}: FromBoxToXLessonProps) {
  const isReducedMotion = useReducedMotion(reducedMotionProp);

  // Current Step: 1 to 9 (pedagogical states) and 10 (completion)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hintsVisible, setHintsVisible] = useState<boolean>(false);
  const [hintTier, setHintTier] = useState<number>(1);
  const [mistakesCount, setMistakesCount] = useState<number>(0);
  const [stepValidated, setStepValidated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Step 1: Scrubber State
  const [step1Price, setStep1Price] = useState<number>(0);

  // Step 2: Conceptual Choice
  const [step2Choice, setStep2Choice] = useState<string | null>(null);

  // Step 4: Range Slider
  const [step4SliderX, setStep4SliderX] = useState<number>(2);
  const [step4Explored, setStep4Explored] = useState<boolean>(false);

  // Step 5: Compression
  const [step5Stage, setStep5Stage] = useState<'add' | 'multiply' | 'compressed'>('add');
  const [step5Choice, setStep5Choice] = useState<string | null>(null);

  // Step 6: Dynamic Expression Slider
  const [step6SliderX, setStep6SliderX] = useState<number>(3);

  // Step 7: Inspectable tokens
  const [inspectedTokens, setInspectedTokens] = useState<{ [key: string]: boolean }>({});

  // Step 8: Reconstruction
  const [step8Phase, setStep8Phase] = useState<'build' | 'identify'>('build');
  const [step8Notebooks, setStep8Notebooks] = useState<number>(0);
  const [step8Units, setStep8Units] = useState<number>(0);
  const [step8IdentifyChoice, setStep8IdentifyChoice] = useState<string | null>(null);

  // Step 9: Transfer
  const [step9Choice, setStep9Choice] = useState<string | null>(null);

  // Trajectory Flight Engine
  const cardRef = useRef<HTMLDivElement>(null);
  const [flyingParticles, setFlyingParticles] = useState<FlyingParticle[]>([]);

  const triggerFlight = (
    originEl: HTMLElement | null,
    targetSelector: string,
    type: 'notebook' | 'unit',
    onLanded?: () => void,
  ) => {
    if (!originEl || !cardRef.current || isReducedMotion) {
      onLanded?.();
      return;
    }

    const cardRect = cardRef.current.getBoundingClientRect();
    const originRect = originEl.getBoundingClientRect();
    const targetEl = cardRef.current.querySelector(targetSelector);
    const targetRect = targetEl ? targetEl.getBoundingClientRect() : cardRect;

    if (originRect.width === 0 && originRect.height === 0) {
      onLanded?.();
      return;
    }

    const startX = originRect.left + originRect.width / 2 - cardRect.left;
    const startY = originRect.top + originRect.height / 2 - cardRect.top;
    const targetX = targetRect.left + targetRect.width / 2 - cardRect.left;
    const targetY = targetRect.top + targetRect.height / 2 - cardRect.top;

    const particleId = Date.now() + Math.random();
    setFlyingParticles((prev) => [
      ...prev,
      { id: particleId, startX, startY, targetX, targetY, type },
    ]);

    setTimeout(() => {
      setFlyingParticles((prev) => prev.filter((p) => p.id !== particleId));
      onLanded?.();
    }, 160);
  };

  // Reset verification on step change
  useEffect(() => {
    setStepValidated(false);
    setErrorMessage(null);
    setHintsVisible(false);
    setHintTier(1);
    setFlyingParticles([]);

    // Auto-validate non-blocking reading steps
    if (currentStep === 3) {
      setStepValidated(true);
    }
  }, [currentStep]);

  // -------------------------------- Step 1 Handler
  const handleStep1Change = (delta: number) => {
    const next = Math.max(0, Math.min(10, step1Price + delta));
    setStep1Price(next);
    if (next === 5) {
      setStepValidated(true);
      setErrorMessage(null);
    } else {
      setStepValidated(false);
    }
  };

  // -------------------------------- Step 2 Handler
  const handleStep2Select = (choice: string) => {
    setStep2Choice(choice);
    if (choice === 'unknown') {
      setStepValidated(true);
      setErrorMessage(null);
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage(
        choice === 'zero'
          ? 'Bukan nol, karena 0 + 3 = 3, bukan 8.'
          : 'Kotak mewakili nilai nyata yang membuat persamaan benar.',
      );
    }
  };

  // -------------------------------- Step 4 Handler
  const handleStep4Slider = (val: number) => {
    setStep4SliderX(val);
    setStep4Explored(true);
    setStepValidated(true);
  };

  // -------------------------------- Step 5 Handler
  const handleStep5Select = (choice: string) => {
    setStep5Choice(choice);
    if (choice === 'xxx') {
      setStepValidated(true);
      setErrorMessage(null);
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage('3 menunjukkan berapa banyak x yang ada, yaitu x + x + x.');
    }
  };

  // -------------------------------- Step 6 Handler
  const handleStep6Slider = (val: number) => {
    setStep6SliderX(val);
    setStepValidated(true);
  };

  // -------------------------------- Step 7 Handler
  const handleInspectToken = (tokenKey: string) => {
    const next = { ...inspectedTokens, [tokenKey]: true };
    setInspectedTokens(next);
    if (next.variable && next.coefficient && next.constant) {
      setStepValidated(true);
    }
  };

  // -------------------------------- Step 8 Handlers
  const handleAddStep8Notebook = (e: React.MouseEvent<HTMLElement>) => {
    if (step8Notebooks < 6) {
      const commit = () => {
        const next = step8Notebooks + 1;
        setStep8Notebooks(next);
        if (next === 4 && step8Units === 3) {
          setStep8Phase('identify');
        }
      };
      triggerFlight(e.currentTarget, '.focus-build-staging-area', 'notebook', commit);
    }
  };

  const handleRemoveStep8Notebook = () => {
    if (step8Notebooks > 0) {
      setStep8Notebooks((n) => n - 1);
    }
  };

  const handleAddStep8Unit = (e: React.MouseEvent<HTMLElement>) => {
    if (step8Units < 6) {
      const commit = () => {
        const next = step8Units + 1;
        setStep8Units(next);
        if (step8Notebooks === 4 && next === 3) {
          setStep8Phase('identify');
        }
      };
      triggerFlight(e.currentTarget, '.focus-build-staging-area', 'unit', commit);
    }
  };

  const handleRemoveStep8Unit = () => {
    if (step8Units > 0) {
      setStep8Units((u) => u - 1);
    }
  };

  const handleResetStep8 = () => {
    setStep8Notebooks(0);
    setStep8Units(0);
  };

  const handleStep8Identify = (choice: string) => {
    setStep8IdentifyChoice(choice);
    if (choice === '2x+5') {
      setStepValidated(true);
      setErrorMessage(null);
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Ada 2 buku (2x) dan 5 unit koin (+ 5).');
    }
  };

  // -------------------------------- Step 9 Handlers
  const handleStep9Select = (choice: string) => {
    setStep9Choice(choice);
    if (choice === 'ppppp') {
      setStepValidated(true);
      setErrorMessage(null);
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage('5p berarti ada 5 buah p yang dijumlahkan (p + p + p + p + p).');
    }
  };

  // -------------------------------- Navigation
  const handleNextStep = () => {
    if (currentStep < 9) {
      setCurrentStep((s) => s + 1);
    } else if (currentStep === 9) {
      setCurrentStep(10);
    } else if (currentStep === 10) {
      onComplete?.({
        lessonId: lesson.id,
        mistakes: mistakesCount,
        attempts: 9,
      });
    }
  };

  const handleOpenHints = () => {
    if (!hintsVisible) {
      setHintsVisible(true);
    } else {
      setHintTier((t) => Math.min(3, t + 1));
    }
  };

  const currentHintText =
    hintTier === 1
      ? STEP_HINTS[currentStep]?.tier1
      : hintTier === 2
        ? STEP_HINTS[currentStep]?.tier2
        : STEP_HINTS[currentStep]?.tier3;

  return (
    <FocusLessonShell
      lessonId={lesson.id}
      currentStep={currentStep}
      totalSteps={9}
      title="Aljabar 1.3: Dari Kotak ke x"
      onExit={onExit}
      hintsVisible={hintsVisible}
      hintTier={hintTier}
      hintContent={currentHintText}
      onOpenHints={handleOpenHints}
      onCloseHints={() => setHintsVisible(false)}
      stepValidated={stepValidated}
      nextLabel={currentStep === 10 ? 'Lanjut ke Tantangan →' : 'Lanjut →'}
      onNextStep={handleNextStep}
      cardRef={cardRef}
    >
        {/* ============================================================ STATE 1: UNKNOWN CONTEXT */}
        {currentStep === 1 && (
          <div className="focus-step-panel focus-step-1">
            <header className="focus-instruction-block">
              <h1 className="focus-instruction-title">Ada nilai yang belum kita tahu</h1>
              <p className="focus-instruction-sub">
                Berapa harga buku tulis agar total belanjanya tepat?
              </p>
            </header>

            <div className="focus-desk-scene">
              <div className="focus-desk-item-card">
                <Notebook3D label={step1Price === 5 ? 'Rp5 rb' : 'Rp ?'} size={68} />
                <span style={{ fontWeight: 800, fontSize: 14 }}>Buku Tulis</span>
              </div>

              <div className="focus-desk-receipt">
                <div className="focus-receipt-row">
                  <span>Buku Tulis</span>
                  <strong>{step1Price > 0 ? `Rp${step1Price} ribu` : 'Rp ? ribu'}</strong>
                </div>
                <div className="focus-receipt-row">
                  <span>Barang Lain</span>
                  <span>+ Rp3 ribu</span>
                </div>
                <div className="focus-receipt-row focus-receipt-row--total">
                  <span>Total Tagihan</span>
                  <span>= Rp8 ribu</span>
                </div>
              </div>
            </div>

            <div className="focus-stepper-control">
              <button
                type="button"
                className="focus-stepper-btn"
                onClick={() => handleStep1Change(-1)}
                disabled={step1Price <= 0}
                aria-label="Kurangi harga buku"
              >
                −
              </button>
              <span className="focus-stepper-value" aria-label={`Harga buku tulis: ${step1Price}`}>
                Rp{step1Price} ribu
              </span>
              <button
                type="button"
                className="focus-stepper-btn"
                onClick={() => handleStep1Change(1)}
                disabled={step1Price >= 10}
                aria-label="Tambah harga buku"
              >
                +
              </button>
            </div>

            {stepValidated && (
              <div className="focus-live-calc-callout" style={{ marginTop: 20 }} aria-live="polite">
                <span>5 + 3 = 8. Harga buku tulis adalah <strong>Rp5 ribu</strong>!</span>
              </div>
            )}
          </div>
        )}

        {/* ============================================================ STATE 2: BOX PLACEHOLDER */}
        {currentStep === 2 && (
          <div className="focus-step-panel focus-step-2">
            <header className="focus-instruction-block">
              <h1 className="focus-instruction-title">Kita butuh pengganti nilai</h1>
              <p className="focus-instruction-sub">
                Nilai yang belum kita ketahui ditulis dengan kotak pengganti.
              </p>
            </header>

            <div className="focus-equation-display" style={{ alignItems: 'center' }}>
              <MysteryBox3D size={52} />
              <span style={{ fontSize: 24, fontWeight: 800 }}>+</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <UnitCoin3D size={32} />
                <UnitCoin3D size={32} />
                <UnitCoin3D size={32} />
              </div>
              <span style={{ fontSize: 24, fontWeight: 800 }}>=</span>
              <span style={{ fontSize: 28, fontWeight: 800, color: '#6d5ce7' }}>8</span>
            </div>

            <p style={{ fontWeight: 700, marginBottom: 14 }}>Kotak ini berarti apa?</p>

            <div className="focus-conceptual-choices" role="group" aria-label="Pilihan arti kotak">
              <button
                type="button"
                className={`focus-choice-btn ${step2Choice === 'unknown' ? 'is-selected-correct' : ''}`}
                onClick={() => handleStep2Select('unknown')}
              >
                <span>Nilai yang belum diketahui</span>
                {step2Choice === 'unknown' && <Icon name="check" width={18} height={18} />}
              </button>

              <button
                type="button"
                className={`focus-choice-btn ${step2Choice === 'zero' ? 'is-selected-wrong' : ''}`}
                onClick={() => handleStep2Select('zero')}
              >
                <span>Angka nol</span>
              </button>

              <button
                type="button"
                className={`focus-choice-btn ${step2Choice === 'empty' ? 'is-selected-wrong' : ''}`}
                onClick={() => handleStep2Select('empty')}
              >
                <span>Tempat kosong tanpa arti</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ STATE 3: FROM BOX TO X */}
        {currentStep === 3 && (
          <div className="focus-step-panel focus-step-3">
            <header className="focus-instruction-block">
              <h1 className="focus-instruction-title">Dari kotak ke huruf x</h1>
              <p className="focus-instruction-sub">
                Matematika sering memakai huruf untuk mewakili nilai yang belum diketahui.
              </p>
            </header>

            <div className="focus-morph-container">
              <div className="focus-morph-row" style={{ alignItems: 'center' }}>
                <MysteryBox3D size={48} />
                <span style={{ fontSize: 22, fontWeight: 800 }}>+ 3 = 8</span>
              </div>
              <span className="focus-morph-arrow">↓</span>
              <div className="focus-morph-row" style={{ alignItems: 'center' }}>
                <Notebook3D label="x" size={48} />
                <span style={{ fontSize: 22, fontWeight: 800 }}>+ 3 = 8</span>
              </div>
            </div>

            <div className="focus-solution-badge">
              <Icon name="check" width={18} height={18} />
              <span>
                Pada persamaan ini, <strong className="focus-math-var">x = 5</strong>
              </span>
            </div>
          </div>
        )}

        {/* ============================================================ STATE 4: X CAN VARY */}
        {currentStep === 4 && (
          <div className="focus-step-panel focus-step-4">
            <header className="focus-instruction-block">
              <h1 className="focus-instruction-title">x bisa bernilai berbeda</h1>
              <p className="focus-instruction-sub">
                Geser nilai x untuk melihat bagaimana persamaannya merespons.
              </p>
            </header>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
              <Notebook3D label={`x = ${step4SliderX}`} size={64} />
            </div>

            <div className="focus-slider-panel">
              <div className="focus-slider-header">
                <span>Nilai x yang dipilih:</span>
                <span className="focus-slider-val-badge">x = {step4SliderX}</span>
              </div>

              <input
                type="range"
                className="focus-native-slider"
                min="0"
                max="10"
                value={step4SliderX}
                onChange={(e) => handleStep4Slider(Number(e.target.value))}
                aria-label="Pilih nilai x"
              />

              <div className="focus-live-calc-callout" aria-live="polite">
                <span>
                  <strong className="focus-math-var">x</strong> + 3 = {step4SliderX} + 3 ={' '}
                  <strong style={{ color: '#6d5ce7' }}>{step4SliderX + 3}</strong>
                </span>
              </div>
            </div>

            {step4Explored && (
              <p style={{ color: '#64748b', fontSize: 14, fontWeight: 700 }}>
                x tidak selalu bernilai 5; x bisa mewakili nilai apa pun!
              </p>
            )}
          </div>
        )}

        {/* ============================================================ STATE 5: REPEATED COPIES (3x) */}
        {currentStep === 5 && (
          <div className="focus-step-panel focus-step-5">
            <header className="focus-instruction-block">
              <h1 className="focus-instruction-title">Beberapa x yang sama</h1>
              <p className="focus-instruction-sub">
                Tiga buku tulis dengan nilai yang sama dapat ditulis lebih singkat.
              </p>
            </header>

            <div className="focus-notebooks-row">
              <Notebook3D label="x" size={54} />
              <Notebook3D label="x" size={54} />
              <Notebook3D label="x" size={54} />
            </div>

            <div className="focus-compression-chain">
              <span
                className={`focus-compression-step ${step5Stage === 'add' ? 'is-highlighted' : ''}`}
                onClick={() => setStep5Stage('multiply')}
              >
                x + x + x
              </span>
              <span>→</span>
              <span
                className={`focus-compression-step ${step5Stage === 'multiply' ? 'is-highlighted' : ''}`}
                onClick={() => setStep5Stage('compressed')}
              >
                3 × x
              </span>
              <span>→</span>
              <span
                className={`focus-compression-step ${step5Stage === 'compressed' ? 'is-highlighted' : ''}`}
              >
                3x
              </span>
            </div>

            <p style={{ fontWeight: 700, marginBottom: 12 }}>Apa arti sebenarnya dari 3x?</p>

            <div className="focus-conceptual-choices" role="group" aria-label="Pilihan arti 3x">
              <button
                type="button"
                className={`focus-choice-btn ${step5Choice === 'xxx' ? 'is-selected-correct' : ''}`}
                onClick={() => handleStep5Select('xxx')}
              >
                <span>x + x + x</span>
                {step5Choice === 'xxx' && <Icon name="check" width={18} height={18} />}
              </button>

              <button
                type="button"
                className={`focus-choice-btn ${step5Choice === '3+x' ? 'is-selected-wrong' : ''}`}
                onClick={() => handleStep5Select('3+x')}
              >
                <span>3 + x</span>
              </button>

              <button
                type="button"
                className={`focus-choice-btn ${step5Choice === 'x+3' ? 'is-selected-wrong' : ''}`}
                onClick={() => handleStep5Select('x+3')}
              >
                <span>x + 3</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ STATE 6: VARIABLE PART + FIXED PART */}
        {currentStep === 6 && (
          <div className="focus-step-panel focus-step-6">
            <header className="focus-instruction-block">
              <h1 className="focus-instruction-title">Variabel dan bagian tetap</h1>
              <p className="focus-instruction-sub">
                Tiga buku tulis (3x) dan dua koin tetap (+ 2).
              </p>
            </header>

            <div className="focus-notebooks-row" style={{ alignItems: 'center' }}>
              <Notebook3D label="x" size={50} />
              <Notebook3D label="x" size={50} />
              <Notebook3D label="x" size={50} />
              <span style={{ fontSize: 24, fontWeight: 800, margin: '0 6px' }}>+</span>
              <UnitCoin3D size={32} />
              <UnitCoin3D size={32} />
            </div>

            <div className="focus-slider-panel">
              <div className="focus-slider-header">
                <span>Nilai x:</span>
                <span className="focus-slider-val-badge">x = {step6SliderX}</span>
              </div>

              <input
                type="range"
                className="focus-native-slider"
                min="1"
                max="8"
                value={step6SliderX}
                onChange={(e) => handleStep6Slider(Number(e.target.value))}
                aria-label="Pilih nilai x pada 3x + 2"
              />

              <div className="focus-live-calc-callout" aria-live="polite">
                <span>
                  3(<strong className="focus-math-var">{step6SliderX}</strong>) + 2 ={' '}
                  <strong style={{ color: '#6d5ce7' }}>{3 * step6SliderX + 2}</strong>
                </span>
              </div>
            </div>

            <p style={{ color: '#64748b', fontSize: 13.5, fontWeight: 700, margin: 0 }}>
              Bagian <strong>3x</strong> berubah saat x berubah, sedangkan <strong>2</strong> tetap.
            </p>
          </div>
        )}

        {/* ============================================================ STATE 7: VOCABULARY INSPECTION */}
        {currentStep === 7 && (
          <div className="focus-step-panel focus-step-7">
            <header className="focus-instruction-block">
              <h1 className="focus-instruction-title">Kenali nama bagian-bagiannya</h1>
              <p className="focus-instruction-sub">
                Ketuk angka atau huruf pada ekspresi untuk melihat namanya.
              </p>
            </header>

            <div className="focus-inspectable-canvas">
              <div className="focus-large-expression">
                <button
                  type="button"
                  className={`focus-inspect-token-btn ${inspectedTokens.coefficient ? 'is-active-inspect' : ''}`}
                  onClick={() => handleInspectToken('coefficient')}
                  aria-label="Koefisien: 3"
                >
                  3
                </button>
                <button
                  type="button"
                  className={`focus-inspect-token-btn ${inspectedTokens.variable ? 'is-active-inspect' : ''}`}
                  onClick={() => handleInspectToken('variable')}
                  aria-label="Variabel: x"
                >
                  <span className="focus-math-var">x</span>
                </button>
                <span>+</span>
                <button
                  type="button"
                  className={`focus-inspect-token-btn ${inspectedTokens.constant ? 'is-active-inspect' : ''}`}
                  onClick={() => handleInspectToken('constant')}
                  aria-label="Konstanta: 2"
                >
                  2
                </button>
              </div>

              <div className="focus-inspect-cards-grid">
                <div
                  className={`focus-inspect-card ${inspectedTokens.coefficient ? 'is-active' : ''}`}
                  onClick={() => handleInspectToken('coefficient')}
                >
                  <div className="focus-inspect-card-symbol">3</div>
                  <div className="focus-inspect-card-name">KOEFISIEN</div>
                  <p className="focus-inspect-card-desc">
                    Angka di depan variabel yang menunjukkan berapa banyak x.
                  </p>
                </div>

                <div
                  className={`focus-inspect-card ${inspectedTokens.variable ? 'is-active' : ''}`}
                  onClick={() => handleInspectToken('variable')}
                >
                  <div className="focus-inspect-card-symbol">
                    <span className="focus-math-var">x</span>
                  </div>
                  <div className="focus-inspect-card-name">VARIABEL</div>
                  <p className="focus-inspect-card-desc">
                    Huruf yang mewakili nilai yang belum diketahui atau dapat berubah.
                  </p>
                </div>

                <div
                  className={`focus-inspect-card ${inspectedTokens.constant ? 'is-active' : ''}`}
                  onClick={() => handleInspectToken('constant')}
                >
                  <div className="focus-inspect-card-symbol">2</div>
                  <div className="focus-inspect-card-name">KONSTANTA</div>
                  <p className="focus-inspect-card-desc">
                    Nilai bilangan tetap yang tidak bergantung pada variabel.
                  </p>
                </div>
              </div>

              <div className="focus-terms-footer">
                <strong>3x</strong> dan <strong>2</strong> disebut <strong>SUKU</strong> (bagian
                yang dipisahkan oleh tanda + atau −).
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ STATE 8: RECONSTRUCTION */}
        {currentStep === 8 && (
          <div className="focus-step-panel focus-step-8">
            {step8Phase === 'build' ? (
              <>
                <header className="focus-instruction-block">
                  <h1 className="focus-instruction-title">Bangun bentuk aljabar</h1>
                  <p className="focus-instruction-sub">
                    Tambahkan buku tulis dan unit koin untuk membentuk ekspresi berikut.
                  </p>
                </header>

                <div className="focus-build-target-banner">4x + 3</div>

                <div
                  className="focus-build-staging-area"
                  aria-label={`Area pembangunan: ${step8Notebooks} buku tulis dan ${step8Units} unit koin`}
                >
                  {Array.from({ length: step8Notebooks }).map((_, i) => (
                    <Notebook3D key={`nb-${i}`} label="x" size={44} />
                  ))}
                  {step8Units > 0 && <span style={{ fontWeight: 800, fontSize: 20 }}>+</span>}
                  {Array.from({ length: step8Units }).map((_, i) => (
                    <UnitCoin3D key={`u-${i}`} size={30} />
                  ))}
                  {step8Notebooks === 0 && step8Units === 0 && (
                    <span style={{ color: '#94a3b8', fontSize: 14 }}>
                      Ketuk tombol di bawah untuk menambah benda
                    </span>
                  )}
                </div>

                <div className="focus-manipulative-tray">
                  <div className="focus-tray-action-group">
                    <button
                      type="button"
                      className="focus-tray-action-btn focus-tray-action-btn--add"
                      onClick={handleAddStep8Notebook}
                      disabled={step8Notebooks >= 6}
                    >
                      + Tambah Buku (x)
                    </button>
                    {step8Notebooks > 0 && (
                      <button
                        type="button"
                        className="focus-tray-action-btn focus-tray-action-btn--remove"
                        onClick={handleRemoveStep8Notebook}
                        aria-label="Kurangi 1 buku tulis"
                      >
                        − Buku
                      </button>
                    )}
                  </div>

                  <div className="focus-tray-action-group">
                    <button
                      type="button"
                      className="focus-tray-action-btn focus-tray-action-btn--add"
                      onClick={handleAddStep8Unit}
                      disabled={step8Units >= 6}
                    >
                      + Tambah Koin (1)
                    </button>
                    {step8Units > 0 && (
                      <button
                        type="button"
                        className="focus-tray-action-btn focus-tray-action-btn--remove"
                        onClick={handleRemoveStep8Unit}
                        aria-label="Kurangi 1 koin unit"
                      >
                        − Koin
                      </button>
                    )}
                  </div>

                  {(step8Notebooks > 0 || step8Units > 0) && (
                    <button
                      type="button"
                      className="focus-tray-reset-btn"
                      onClick={handleResetStep8}
                      aria-label="Reset baki benda"
                    >
                      Reset Baki
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <header className="focus-instruction-block">
                  <h1 className="focus-instruction-title">Tulis bentuk aljabarnya</h1>
                  <p className="focus-instruction-sub">
                    Berapa bentuk aljabar yang tepat untuk susunan benda berikut?
                  </p>
                </header>

                <div className="focus-notebooks-row" style={{ alignItems: 'center' }}>
                  <Notebook3D label="x" size={50} />
                  <Notebook3D label="x" size={50} />
                  <span style={{ fontSize: 24, fontWeight: 800, margin: '0 6px' }}>+</span>
                  <UnitCoin3D size={30} />
                  <UnitCoin3D size={30} />
                  <UnitCoin3D size={30} />
                  <UnitCoin3D size={30} />
                  <UnitCoin3D size={30} />
                </div>

                <div
                  className="focus-conceptual-choices"
                  role="group"
                  aria-label="Pilihan bentuk aljabar"
                >
                  <button
                    type="button"
                    className={`focus-choice-btn ${step8IdentifyChoice === '2x+5' ? 'is-selected-correct' : ''}`}
                    onClick={() => handleStep8Identify('2x+5')}
                  >
                    <span>2x + 5</span>
                    {step8IdentifyChoice === '2x+5' && (
                      <Icon name="check" width={18} height={18} />
                    )}
                  </button>

                  <button
                    type="button"
                    className={`focus-choice-btn ${step8IdentifyChoice === '5x+2' ? 'is-selected-wrong' : ''}`}
                    onClick={() => handleStep8Identify('5x+2')}
                  >
                    <span>5x + 2</span>
                  </button>

                  <button
                    type="button"
                    className={`focus-choice-btn ${step8IdentifyChoice === '2x+3' ? 'is-selected-wrong' : ''}`}
                    onClick={() => handleStep8Identify('2x+3')}
                  >
                    <span>2x + 3</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ============================================================ STATE 9: TRANSFER (5p + 4) */}
        {currentStep === 9 && (
          <div className="focus-step-panel focus-step-9">
            <header className="focus-instruction-block">
              <h1 className="focus-instruction-title">Hurufnya bisa berbeda</h1>
              <p className="focus-instruction-sub">
                Aljabar tidak selalu memakai x. Perhatikan bentuk <strong>5p + 4</strong>.
              </p>
            </header>

            <div className="focus-notebooks-row" style={{ alignItems: 'center', marginBottom: 16 }}>
              <Notebook3D label="p" size={46} />
              <Notebook3D label="p" size={46} />
              <Notebook3D label="p" size={46} />
              <Notebook3D label="p" size={46} />
              <Notebook3D label="p" size={46} />
              <span style={{ fontSize: 22, fontWeight: 800, margin: '0 4px' }}>+</span>
              <UnitCoin3D size={28} />
              <UnitCoin3D size={28} />
              <UnitCoin3D size={28} />
              <UnitCoin3D size={28} />
            </div>

            <div className="focus-transfer-cluster">
              <span className="focus-inspect-card-symbol">p = Variabel</span>
              <span>•</span>
              <span className="focus-inspect-card-symbol">5 = Koefisien</span>
              <span>•</span>
              <span className="focus-inspect-card-symbol">4 = Konstanta</span>
            </div>

            <p style={{ fontWeight: 700, marginBottom: 12 }}>Apa arti sebenarnya dari 5p?</p>

            <div className="focus-conceptual-choices" role="group" aria-label="Pilihan arti 5p">
              <button
                type="button"
                className={`focus-choice-btn ${step9Choice === 'ppppp' ? 'is-selected-correct' : ''}`}
                onClick={() => handleStep9Select('ppppp')}
              >
                <span>p + p + p + p + p</span>
                {step9Choice === 'ppppp' && <Icon name="check" width={18} height={18} />}
              </button>

              <button
                type="button"
                className={`focus-choice-btn ${step9Choice === '5+p' ? 'is-selected-wrong' : ''}`}
                onClick={() => handleStep9Select('5+p')}
              >
                <span>5 + p</span>
              </button>

              <button
                type="button"
                className={`focus-choice-btn ${step9Choice === 'p+5' ? 'is-selected-wrong' : ''}`}
                onClick={() => handleStep9Select('p+5')}
              >
                <span>p + 5</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ STATE 10: COMPLETION */}
        {currentStep === 10 && (
          <div className="focus-completion-card">
            <div className="focus-completion-emblem">
              <Icon name="check" width={32} height={32} />
            </div>

            <h1 className="focus-instruction-title">Luar Biasa! Kamu Menguasai Bentuk Aljabar</h1>
            <p className="focus-instruction-sub" style={{ maxWidth: 480 }}>
              Sekarang kamu tahu bahwa huruf mewakili nilai, angka di depannya adalah koefisien, dan
              bagian tetap adalah konstanta.
            </p>

            <div className="focus-summary-chain">
              <span>Nilai tak diketahui</span>
              <span>→</span>
              <span>x</span>
              <span>→</span>
              <span>3x</span>
              <span>→</span>
              <span>3x + 2</span>
            </div>
          </div>
        )}

        {/* Error notice if present */}
        {errorMessage && (
          <div
            style={{
              marginTop: 16,
              color: '#dc2626',
              fontSize: 14,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
            role="alert"
          >
            <Icon name="info" width={16} height={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Flying Trajectory Particles Overlay */}
        <div className="focus-flight-overlay" aria-hidden="true">
          {flyingParticles.map((p) => (
            <div
              key={p.id}
              className="flying-particle"
              style={
                {
                  '--start-x': `${p.startX}px`,
                  '--start-y': `${p.startY}px`,
                  '--target-x': `${p.targetX}px`,
                  '--target-y': `${p.targetY}px`,
                } as React.CSSProperties
              }
            >
              {p.type === 'notebook' ? (
                <Notebook3D label="x" size={40} />
              ) : (
                <UnitCoin3D size={28} />
              )}
            </div>
          ))}
        </div>
    </FocusLessonShell>
  );
}
