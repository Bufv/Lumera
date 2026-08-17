import { useState, useEffect, useRef } from 'react';
import { Icon } from '../design/Icon';
import type { MicroLessonCompletion, MicroLessonDefinition } from './types';
import './GrowingPatternLesson.css';

interface FlyingParticle {
  id: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  type: 'cube' | 'diamond' | 'circle' | 'chip';
  label?: string;
}

export interface GrowingPatternLessonProps {
  lesson: MicroLessonDefinition;
  lumens?: number;
  reducedMotion?: boolean;
  onExit: () => void;
  onComplete: (payload: MicroLessonCompletion) => void;
}

/* ------------------------------------------------------------ 2.5D Isometric SVG Primitives */

export function IsometricCube25D({
  highlight = false,
  dimmed = false,
  size = 28,
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
      className={`lumera-25d-cube ${highlight ? 'lumera-25d-cube--highlight' : ''} ${dimmed ? 'lumera-25d-cube--dimmed' : ''}`}
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

export function GoldDiamond25D({
  size = 26,
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
      className={`lumera-25d-diamond ${dimmed ? 'lumera-25d-diamond--dimmed' : ''} ${highlight ? 'lumera-25d-diamond--highlight' : ''}`}
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

export function EmeraldCircle25D({
  size = 24,
  dimmed = false,
}: {
  size?: number;
  dimmed?: boolean;
}) {
  return (
    <img
      src="/assets/math_circle_emerald.png"
      alt="Lingkaran hijau"
      className={`lumera-25d-circle ${dimmed ? 'lumera-25d-circle--dimmed' : ''}`}
      style={{ width: `${size}px`, height: `${size}px`, objectFit: 'contain' }}
      loading="lazy"
    />
  );
}

/* ------------------------------------------------------------ Main Component */

export function GrowingPatternLesson({
  lesson,
  reducedMotion = false,
  onExit,
  onComplete,
}: GrowingPatternLessonProps) {
  // Current Step: 1 to 9 (pedagogical states) and 10 (completion)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [hintsVisible, setHintsVisible] = useState<boolean>(false);
  const [hintTier, setHintTier] = useState<number>(1);
  const [mistakesCount, setMistakesCount] = useState<number>(0);

  // Step 2 State: Revealed counts on group tap
  const [revealedCounts, setRevealedCounts] = useState<{ [key: number]: boolean }>({});

  // Step 3 State: Discovered difference
  const [discoveredDiff, setDiscoveredDiff] = useState<{ [key: number]: boolean }>({});

  // Step 4 State: Gap chips (slot 0: 1->3, slot 1: 3->5)
  const [gapSlots, setGapSlots] = useState<(string | null)[]>([null, null]);

  // Step 5 State: Manipulative tray cubes added to step 4 (starts with 0, needs 2 to make 7)
  const [addedCubesStep5, setAddedCubesStep5] = useState<number>(0);

  // Step 7 State: Selected rule choice
  const [selectedChoiceStep7, setSelectedChoiceStep7] = useState<string | null>(null);
  const [choiceFeedbackStep7, setChoiceFeedbackStep7] = useState<string | null>(null);

  // Step 8 State: Transfer diamonds added (starts with 0, needs 3 to make 11)
  const [addedDiamondsStep8, setAddedDiamondsStep8] = useState<number>(0);

  // Step 9 State: Mastery circles added (starts with 0, needs 3 to make 13)
  const [addedCirclesStep9, setAddedCirclesStep9] = useState<number>(0);

  // Step Verification State (is current step answered correctly)
  const [stepValidated, setStepValidated] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    type: 'cube' | 'diamond' | 'circle' | 'chip',
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

    const targetEl =
      (cardRef.current.querySelector(targetSelector) as HTMLElement | null) ||
      (cardRef.current.querySelector('.focus-target-build-group .focus-objects-cluster') as HTMLElement | null);
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

  // Reset verification on step change
  useEffect(() => {
    setStepValidated(false);
    setErrorMessage(null);
    setHintsVisible(false);
    setHintTier(1);
    setFlyingParticles([]);
  }, [currentStep]);

  // Step 2 helper: auto-validate when all 3 counts revealed
  const handleRevealCount = (index: number) => {
    const next = { ...revealedCounts, [index]: true };
    setRevealedCounts(next);
    if (next[0] && next[1] && next[2]) {
      setStepValidated(true);
    }
  };

  // Step 3 helper: auto-validate when both transitions discovered
  const handleDiscoverDiff = (index: number) => {
    const next = { ...discoveredDiff, [index]: true };
    setDiscoveredDiff(next);
    if (next[0] && next[1]) {
      setStepValidated(true);
    }
  };

  // Step 4 helper: fill slot with chip
  const handlePlaceChip = (
    chipValue: string,
    slotIndex: number,
    event?: React.MouseEvent<HTMLElement>,
  ) => {
    const commit = () => {
      setGapSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = chipValue;
        return next;
      });
      setErrorMessage(null);
    };

    if (event && !reducedMotion) {
      const targetSlot = `.focus-chip-drop-slot:nth-of-type(${slotIndex === 0 ? 1 : 2})`;
      triggerFlight(event.currentTarget, targetSlot, 'chip', chipValue, commit);
    } else {
      commit();
    }
  };

  const verifyStep4 = () => {
    if (gapSlots[0] === '+2' && gapSlots[1] === '+2') {
      setStepValidated(true);
      setErrorMessage(null);
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Perhatikan berapa balok yang bertambah di setiap langkah.');
    }
  };

  // Step 5 helper: manipulate tray
  const handleAddCubeStep5 = (event?: React.MouseEvent<HTMLElement>) => {
    if (addedCubesStep5 < 4) {
      const commit = () => {
        setAddedCubesStep5((c) => Math.min(4, c + 1));
        setErrorMessage(null);
      };
      if (event && !reducedMotion) {
        triggerFlight(
          event.currentTarget,
          '.focus-target-build-group .focus-empty-cube-slot',
          'cube',
          undefined,
          commit,
        );
      } else {
        commit();
      }
    }
  };

  const handleRemoveCubeStep5 = () => {
    if (addedCubesStep5 > 0) {
      setAddedCubesStep5((c) => c - 1);
      setErrorMessage(null);
    }
  };

  const verifyStep5 = () => {
    if (addedCubesStep5 === 2) {
      setStepValidated(true);
      setErrorMessage(null);
    } else if (addedCubesStep5 < 2) {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Masih kurang. Langkah sebelumnya bertambah 2 balok.');
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Terlalu banyak. Tambahkan hanya balok yang bertambah dari pola sebelumnya.');
    }
  };

  // Step 7 helper: choice selection
  const handleSelectChoiceStep7 = (choiceId: string) => {
    setSelectedChoiceStep7(choiceId);
    setErrorMessage(null);
    if (choiceId === 'B') {
      setChoiceFeedbackStep7('Tepat! Aturan ini menjelaskan bagaimana pola terus bertambah.');
    } else if (choiceId === 'A') {
      setChoiceFeedbackStep7('Benar tentang bilangannya, tetapi apa yang menjelaskan perubahannya?');
    } else if (choiceId === 'C') {
      setChoiceFeedbackStep7('Benar, tetapi kita masih belum tahu seberapa besar perubahannya.');
    }
  };

  const verifyStep7 = () => {
    if (selectedChoiceStep7 === 'B') {
      setStepValidated(true);
      setErrorMessage(null);
    } else {
      setMistakesCount((c) => c + 1);
    }
  };

  // Step 8 helper: transfer gold diamonds
  const handleAddDiamondStep8 = (event?: React.MouseEvent<HTMLElement>) => {
    if (addedDiamondsStep8 < 5) {
      const commit = () => {
        setAddedDiamondsStep8((c) => Math.min(5, c + 1));
        setErrorMessage(null);
      };
      if (event && !reducedMotion) {
        triggerFlight(
          event.currentTarget,
          '.focus-target-build-group .focus-empty-diamond-slot',
          'diamond',
          undefined,
          commit,
        );
      } else {
        commit();
      }
    }
  };

  const handleRemoveDiamondStep8 = () => {
    if (addedDiamondsStep8 > 0) {
      setAddedDiamondsStep8((c) => c - 1);
      setErrorMessage(null);
    }
  };

  const verifyStep8 = () => {
    if (addedDiamondsStep8 === 3) {
      setStepValidated(true);
      setErrorMessage(null);
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Amati selisih dari 2 ke 5, dan 5 ke 8.');
    }
  };

  // Step 9 helper: mastery emerald circles
  const handleAddCircleStep9 = (event?: React.MouseEvent<HTMLElement>) => {
    if (addedCirclesStep9 < 5) {
      const commit = () => {
        setAddedCirclesStep9((c) => Math.min(5, c + 1));
        setErrorMessage(null);
      };
      if (event && !reducedMotion) {
        triggerFlight(
          event.currentTarget,
          '.focus-target-build-group .focus-empty-circle-slot',
          'circle',
          undefined,
          commit,
        );
      } else {
        commit();
      }
    }
  };

  const handleRemoveCircleStep9 = () => {
    if (addedCirclesStep9 > 0) {
      setAddedCirclesStep9((c) => c - 1);
      setErrorMessage(null);
    }
  };

  const verifyStep9 = () => {
    if (addedCirclesStep9 === 3) {
      setStepValidated(true);
      setErrorMessage(null);
    } else {
      setMistakesCount((c) => c + 1);
      setErrorMessage('Periksa kembali selisih antara 4, 7, dan 10.');
    }
  };

  // Next step navigation
  const handleNextStep = () => {
    if (currentStep < 9) {
      setCurrentStep((s) => s + 1);
    } else if (currentStep === 9) {
      setCurrentStep(10); // Completion
    }
  };

  // Final complete handler
  const handleFinalCompletion = () => {
    onComplete({
      lessonId: lesson.id,
      mistakes: mistakesCount,
      attempts: mistakesCount + 1,
    });
  };

  // Hint logic
  const handleOpenHint = () => {
    setHintsVisible(true);
  };

  const getStepHints = () => {
    switch (currentStep) {
      case 1:
      case 2:
        return ['Amati jumlah kubus pada setiap langkah dari kiri ke kanan.'];
      case 3:
      case 4:
        return [
          'Bandingkan Langkah 2 dengan Langkah 1: berapa kubus baru yang muncul?',
          'Setiap kali melangkah, selalu ada 2 kubus tambahan.',
        ];
      case 5:
        return [
          'Langkah 3 memiliki 5 kubus.',
          'Jika polanya bertambah 2, berapa total kubus di Langkah 4?',
        ];
      case 7:
        return ['Cari pilihan yang menjelaskan *bagaimana* bilangan berubah dari langkah ke langkah.'];
      case 8:
        return [
          'Hitung selisih: 5 − 2 = 3, dan 8 − 5 = 3.',
          'Tambahkan 3 wajik emas ke Langkah 3 untuk mendapatkan Langkah 4.',
        ];
      case 9:
        return [
          'Bandingkan dua langkah yang berdekatan: 7 − 4 = 3, dan 10 − 7 = 3.',
          'Tambahkan 3 lingkaran ke Langkah 3.',
        ];
      default:
        return ['Perhatikan perubahan dari satu langkah ke langkah berikutnya.'];
    }
  };

  return (
    <main
      className="growing-pattern-lesson focus-mode"
      data-step={currentStep}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
    >
      {/* -------------------------------- Minimal Top Chrome */}
      <header className="focus-lesson-header">
        <button
          type="button"
          className="focus-close-btn"
          onClick={onExit}
          aria-label="Tutup pelajaran"
        >
          <Icon name="close" width={18} height={18} />
        </button>

        {/* 9-Segmented Progress Indicator */}
        <div
          className="focus-segmented-progress"
          role="progressbar"
          aria-label={`Langkah ${Math.min(9, currentStep)} dari 9`}
          aria-valuenow={Math.min(9, currentStep)}
          aria-valuemin={1}
          aria-valuemax={9}
        >
          {Array.from({ length: 9 }).map((_, idx) => (
            <span
              key={idx}
              className={`focus-progress-segment ${idx + 1 < currentStep ? 'focus-progress-segment--completed' : idx + 1 === currentStep ? 'focus-progress-segment--active' : ''}`}
            />
          ))}
        </div>

        <div className="focus-step-indicator">
          {currentStep <= 9 ? `${currentStep} / 9` : '✓'}
        </div>
      </header>

      {/* -------------------------------- Central Learning Workspace */}
      <section className="focus-workspace-container">
        <div className="focus-workspace-card" ref={cardRef}>
          {/* ============================================================ STATE 1: OBSERVE */}
          {currentStep === 1 && (
            <div className="focus-step-panel focus-step-observe">
              <header className="focus-instruction-block">
                <h2 className="focus-instruction-title">Apa yang berubah?</h2>
                <p className="focus-instruction-sub">Amati bagaimana pola berikut tumbuh.</p>
              </header>

              <div className="focus-pattern-row">
                <div className="focus-pattern-group" tabIndex={0} role="button" aria-label="Langkah 1: 1 balok">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                  </div>
                  <span className="focus-step-caption">Langkah 1</span>
                </div>

                <div className="focus-pattern-group" tabIndex={0} role="button" aria-label="Langkah 2: 3 balok">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                  </div>
                  <span className="focus-step-caption">Langkah 2</span>
                </div>

                <div className="focus-pattern-group" tabIndex={0} role="button" aria-label="Langkah 3: 5 balok">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                  </div>
                  <span className="focus-step-caption">Langkah 3</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ STATE 2: SHAPE -> QUANTITY */}
          {currentStep === 2 && (
            <div className="focus-step-panel focus-step-quantity">
              <header className="focus-instruction-block">
                <h2 className="focus-instruction-title">Berapa banyak di setiap langkah?</h2>
                <p className="focus-instruction-sub">Ketuk setiap kelompok untuk memeriksa jumlahnya.</p>
              </header>

              <div className="focus-pattern-row">
                <button
                  type="button"
                  className={`focus-pattern-group-btn ${revealedCounts[0] ? 'is-revealed' : ''}`}
                  onClick={() => handleRevealCount(0)}
                  aria-label="Kelompok 1, ketuk untuk melihat jumlah"
                >
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                  </div>
                  <div className="focus-quantity-badge">{revealedCounts[0] ? '1' : '?'}</div>
                </button>

                <button
                  type="button"
                  className={`focus-pattern-group-btn ${revealedCounts[1] ? 'is-revealed' : ''}`}
                  onClick={() => handleRevealCount(1)}
                  aria-label="Kelompok 2, ketuk untuk melihat jumlah"
                >
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                  </div>
                  <div className="focus-quantity-badge">{revealedCounts[1] ? '3' : '?'}</div>
                </button>

                <button
                  type="button"
                  className={`focus-pattern-group-btn ${revealedCounts[2] ? 'is-revealed' : ''}`}
                  onClick={() => handleRevealCount(2)}
                  aria-label="Kelompok 3, ketuk untuk melihat jumlah"
                >
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                  </div>
                  <div className="focus-quantity-badge">{revealedCounts[2] ? '5' : '?'}</div>
                </button>
              </div>

              {stepValidated && (
                <div className="focus-relation-callout" aria-live="polite">
                  <span className="focus-relation-nums">1 → 3 → 5</span>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ STATE 3: FIND WHAT WAS ADDED */}
          {currentStep === 3 && (
            <div className="focus-step-panel focus-step-find-added">
              <header className="focus-instruction-block">
                <h2 className="focus-instruction-title">Bagian mana yang baru?</h2>
                <p className="focus-instruction-sub">Pilih bagian yang ditambahkan pada setiap langkah.</p>
              </header>

              <div className="focus-pattern-row">
                {/* Step 1: Base */}
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                  </div>
                  <span className="focus-quantity-tag">1</span>
                </div>

                {/* Transition 1->2 */}
                <div className="focus-transition-slot">
                  {discoveredDiff[0] && <span className="focus-diff-badge">+2</span>}
                </div>

                {/* Step 2: 1 base + 2 new */}
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                    <button
                      type="button"
                      className={`focus-growth-cluster-btn ${discoveredDiff[0] ? 'is-discovered' : ''}`}
                      onClick={() => handleDiscoverDiff(0)}
                      aria-label="Pilih 2 balok tambahan pada Langkah 2"
                    >
                      <IsometricCube25D highlight />
                      <IsometricCube25D highlight />
                    </button>
                  </div>
                  <span className="focus-quantity-tag">3</span>
                </div>

                {/* Transition 2->3 */}
                <div className="focus-transition-slot">
                  {discoveredDiff[1] && <span className="focus-diff-badge">+2</span>}
                </div>

                {/* Step 3: 3 base + 2 new */}
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <button
                      type="button"
                      className={`focus-growth-cluster-btn ${discoveredDiff[1] ? 'is-discovered' : ''}`}
                      onClick={() => handleDiscoverDiff(1)}
                      aria-label="Pilih 2 balok tambahan pada Langkah 3"
                    >
                      <IsometricCube25D highlight />
                      <IsometricCube25D highlight />
                    </button>
                  </div>
                  <span className="focus-quantity-tag">5</span>
                </div>
              </div>

              {stepValidated && (
                <div className="focus-relation-callout" aria-live="polite">
                  <span>Setiap langkah selalu menambah <strong>2 balok baru</strong>.</span>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ STATE 4: DESCRIBE THE CHANGE */}
          {currentStep === 4 && (
            <div className="focus-step-panel focus-step-describe">
              <header className="focus-instruction-block">
                <h2 className="focus-instruction-title">Bagaimana perubahan setiap langkah?</h2>
                <p className="focus-instruction-sub">Tarik atau ketuk perubahan yang tepat untuk mengisi kotak.</p>
              </header>

              {/* Visual Pattern Reference */}
              <div className="focus-pattern-row focus-pattern-row--mini">
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                  </div>
                  <span className="focus-quantity-tag">1</span>
                </div>
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                  </div>
                  <span className="focus-quantity-tag">3</span>
                </div>
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                  </div>
                  <span className="focus-quantity-tag">5</span>
                </div>
              </div>

              <div className="focus-sequence-chain">
                <span className="focus-seq-num">1</span>

                <div
                  className={`focus-chip-drop-slot ${gapSlots[0] ? 'has-chip' : ''}`}
                  onClick={() => gapSlots[0] && handlePlaceChip('', 0)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Slot perubahan 1 ke 3: ${gapSlots[0] ?? 'kosong'}`}
                >
                  {gapSlots[0] ? <span className="focus-chip-val">{gapSlots[0]}</span> : <span className="focus-chip-ph">+?</span>}
                </div>

                <span className="focus-seq-arrow">→</span>
                <span className="focus-seq-num">3</span>

                <div
                  className={`focus-chip-drop-slot ${gapSlots[1] ? 'has-chip' : ''}`}
                  onClick={() => gapSlots[1] && handlePlaceChip('', 1)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Slot perubahan 3 ke 5: ${gapSlots[1] ?? 'kosong'}`}
                >
                  {gapSlots[1] ? <span className="focus-chip-val">{gapSlots[1]}</span> : <span className="focus-chip-ph">+?</span>}
                </div>

                <span className="focus-seq-arrow">→</span>
                <span className="focus-seq-num">5</span>
              </div>

              {/* Draggable/Tappable Chips Tray */}
              <div className="focus-chips-tray" role="group" aria-label="Pilihan perubahan">
                {['+1', '+2', '+3'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="focus-selectable-chip"
                    onClick={(e) => {
                      if (!gapSlots[0]) handlePlaceChip(chip, 0, e);
                      else if (!gapSlots[1]) handlePlaceChip(chip, 1, e);
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {stepValidated && (
                <div className="focus-rule-statement" aria-live="polite">
                  <span>✨ Perubahannya sama setiap langkah (+2).</span>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ STATE 5: PREDICT BY BUILDING */}
          {currentStep === 5 && (
            <div className="focus-step-panel focus-step-predict-build">
              <header className="focus-instruction-block">
                <h2 className="focus-instruction-title">Bangun langkah berikutnya.</h2>
                <p className="focus-instruction-sub">Tambahkan balok untuk melengkapi Langkah 4.</p>
              </header>

              <div className="focus-pattern-row">
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                  </div>
                  <span className="focus-quantity-tag">1</span>
                </div>

                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                  </div>
                  <span className="focus-quantity-tag">3</span>
                </div>

                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                  </div>
                  <span className="focus-quantity-tag">5</span>
                </div>

                {/* Target Building Group: 5 base cubes + growth region */}
                <div className="focus-pattern-group focus-target-build-group">
                  <div className="focus-objects-cluster">
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />
                    <IsometricCube25D />

                    {/* Added growth cubes */}
                    {Array.from({ length: addedCubesStep5 }).map((_, idx) => (
                      <span key={idx} className="focus-added-pop">
                        <IsometricCube25D highlight />
                      </span>
                    ))}

                    {/* Empty placeholder slot */}
                    {addedCubesStep5 < 2 && (
                      <div className="focus-empty-cube-slot" aria-hidden="true" />
                    )}
                  </div>
                  <span className="focus-quantity-tag">
                    {stepValidated ? '7' : '?'}
                  </span>
                </div>
              </div>

              {/* Manipulative Tray */}
              {!stepValidated ? (
                <div className="focus-manipulative-tray" role="group" aria-label="Nampan balok tambahan">
                  <button
                    type="button"
                    className="focus-tray-action-btn"
                    onClick={handleAddCubeStep5}
                    aria-label="Tambah 1 balok ke pola"
                  >
                    <IsometricCube25D />
                    <span>+ Tambah balok</span>
                  </button>
                  {addedCubesStep5 > 0 && (
                    <button
                      type="button"
                      className="focus-tray-action-btn focus-tray-action-btn--remove"
                      onClick={handleRemoveCubeStep5}
                      aria-label="Hapus 1 balok dari pola"
                    >
                      <span>− Kurangi ({addedCubesStep5})</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="focus-relation-callout" aria-live="polite">
                  <strong>5 + 2 = 7</strong>
                  <span className="focus-seq-sub">1 → 3 → 5 → 7</span>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ STATE 6: CONCRETE -> ABSTRACT */}
          {currentStep === 6 && (
            <div className="focus-step-panel focus-step-abstract">
              <header className="focus-instruction-block">
                <h2 className="focus-instruction-title">Dari gambar ke bilangan.</h2>
                <p className="focus-instruction-sub">Perhatikan bagaimana polanya dapat dituliskan.</p>
              </header>

              <div className="focus-abstract-stage">
                {/* Dimmed representation of objects */}
                <div className="focus-abstract-cubes-row">
                  <div className="focus-abstract-col">
                    <IsometricCube25D dimmed />
                    <span className="focus-abstract-arrow">↓</span>
                    <span className="focus-abstract-num">1</span>
                  </div>
                  <span className="focus-abstract-bridge">+2</span>
                  <div className="focus-abstract-col">
                    <div className="focus-objects-cluster">
                      <IsometricCube25D dimmed />
                      <IsometricCube25D dimmed />
                      <IsometricCube25D dimmed />
                    </div>
                    <span className="focus-abstract-arrow">↓</span>
                    <span className="focus-abstract-num">3</span>
                  </div>
                  <span className="focus-abstract-bridge">+2</span>
                  <div className="focus-abstract-col">
                    <div className="focus-objects-cluster">
                      <IsometricCube25D dimmed />
                      <IsometricCube25D dimmed />
                      <IsometricCube25D dimmed />
                      <IsometricCube25D dimmed />
                      <IsometricCube25D dimmed />
                    </div>
                    <span className="focus-abstract-arrow">↓</span>
                    <span className="focus-abstract-num">5</span>
                  </div>
                  <span className="focus-abstract-bridge">+2</span>
                  <div className="focus-abstract-col">
                    <div className="focus-objects-cluster">
                      <IsometricCube25D dimmed />
                      <IsometricCube25D dimmed />
                      <IsometricCube25D dimmed />
                      <IsometricCube25D dimmed />
                      <IsometricCube25D dimmed />
                      <IsometricCube25D dimmed />
                      <IsometricCube25D dimmed />
                    </div>
                    <span className="focus-abstract-arrow">↓</span>
                    <span className="focus-abstract-num">7</span>
                  </div>
                </div>

                <div className="focus-rule-statement">
                  <span>Gambar dan bilangan menunjukkan perubahan yang sama.</span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ STATE 7: RULE VS COINCIDENCE */}
          {currentStep === 7 && (
            <div className="focus-step-panel focus-step-rule-choice">
              <header className="focus-instruction-block">
                <h2 className="focus-instruction-title">Apa yang menjelaskan bagaimana pola ini tumbuh?</h2>
                <p className="focus-instruction-sub">Pilih pernyataan yang paling tepat.</p>
              </header>

              <div className="focus-choices-grid" role="radiogroup" aria-label="Pilihan aturan pola">
                {[
                  { id: 'A', label: 'Semua bilangannya ganjil.' },
                  { id: 'B', label: 'Setiap langkah bertambah 2.' },
                  { id: 'C', label: 'Bilangannya semakin besar.' },
                ].map((choice) => (
                  <button
                    key={choice.id}
                    type="button"
                    className={`focus-choice-card ${selectedChoiceStep7 === choice.id ? 'is-selected' : ''}`}
                    onClick={() => handleSelectChoiceStep7(choice.id)}
                    role="radio"
                    aria-checked={selectedChoiceStep7 === choice.id}
                  >
                    <span>{choice.label}</span>
                    {selectedChoiceStep7 === choice.id && (
                      <span className="focus-choice-check" aria-hidden="true">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {choiceFeedbackStep7 && (
                <div className="focus-choice-feedback" aria-live="polite">
                  <p>{choiceFeedbackStep7}</p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ STATE 8: TRANSFER (GOLD DIAMONDS) */}
          {currentStep === 8 && (
            <div className="focus-step-panel focus-step-transfer">
              <header className="focus-instruction-block">
                <h2 className="focus-instruction-title">Pola baru. Bangun langkah berikutnya.</h2>
                <p className="focus-instruction-sub">Pola ini berbeda. Gunakan cara yang sama.</p>
              </header>

              <div className="focus-pattern-row focus-pattern-row--transfer">
                {/* Step 1: 2 diamonds */}
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                  </div>
                  <span className="focus-quantity-tag">2</span>
                </div>

                {/* Step 2: 5 diamonds */}
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                  </div>
                  <span className="focus-quantity-tag">5</span>
                </div>

                {/* Step 3: 8 diamonds */}
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                  </div>
                  <span className="focus-quantity-tag">8</span>
                </div>

                {/* Step 4: 8 base + added */}
                <div className="focus-pattern-group focus-target-build-group">
                  <div className="focus-objects-cluster">
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />
                    <GoldDiamond25D size={20} />

                    {Array.from({ length: addedDiamondsStep8 }).map((_, idx) => (
                      <span key={idx} className="focus-added-pop">
                        <GoldDiamond25D size={20} highlight />
                      </span>
                    ))}

                    {addedDiamondsStep8 < 3 && (
                      <div className="focus-empty-diamond-slot" aria-hidden="true" />
                    )}
                  </div>
                  <span className="focus-quantity-tag">
                    {stepValidated ? '11' : '?'}
                  </span>
                </div>
              </div>

              {/* Manipulative Tray */}
              {!stepValidated ? (
                <div className="focus-manipulative-tray">
                  <button
                    type="button"
                    className="focus-tray-action-btn focus-tray-action-btn--gold"
                    onClick={(e) => handleAddDiamondStep8(e)}
                  >
                    <GoldDiamond25D size={22} />
                    <span>+ Tambah wajik emas</span>
                  </button>
                  {addedDiamondsStep8 > 0 && (
                    <button
                      type="button"
                      className="focus-tray-action-btn focus-tray-action-btn--remove"
                      onClick={handleRemoveDiamondStep8}
                    >
                      <span>− Kurangi ({addedDiamondsStep8})</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="focus-relation-callout" aria-live="polite">
                  <strong>2 ── +3 ──→ 5 ── +3 ──→ 8 ── +3 ──→ 11</strong>
                  <span className="focus-seq-sub">✨ Aturannya berbeda, tetapi caramu menemukannya sama.</span>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ STATE 9: INDEPENDENT MASTERY */}
          {currentStep === 9 && (
            <div className="focus-step-panel focus-step-mastery">
              <header className="focus-instruction-block">
                <h2 className="focus-instruction-title">Lengkapi pola berikut.</h2>
                <p className="focus-instruction-sub">Gunakan apa yang sudah kamu pelajari.</p>
              </header>

              <div className="focus-pattern-row focus-pattern-row--mastery">
                {/* Step 1: 4 circles */}
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    {Array.from({ length: 4 }).map((_, idx) => (
                      <EmeraldCircle25D key={idx} size={18} />
                    ))}
                  </div>
                  <span className="focus-quantity-tag">4</span>
                </div>

                {/* Step 2: 7 circles */}
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    {Array.from({ length: 7 }).map((_, idx) => (
                      <EmeraldCircle25D key={idx} size={18} />
                    ))}
                  </div>
                  <span className="focus-quantity-tag">7</span>
                </div>

                {/* Step 3: 10 circles */}
                <div className="focus-pattern-group">
                  <div className="focus-objects-cluster">
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <EmeraldCircle25D key={idx} size={18} />
                    ))}
                  </div>
                  <span className="focus-quantity-tag">10</span>
                </div>

                {/* Step 4: 10 base + added */}
                <div className="focus-pattern-group focus-target-build-group">
                  <div className="focus-objects-cluster">
                    {Array.from({ length: 10 }).map((_, idx) => (
                      <EmeraldCircle25D key={idx} size={18} />
                    ))}
                    {Array.from({ length: addedCirclesStep9 }).map((_, idx) => (
                      <span key={idx} className="focus-added-pop">
                        <EmeraldCircle25D size={18} />
                      </span>
                    ))}
                    {addedCirclesStep9 < 3 && (
                      <div className="focus-empty-circle-slot" aria-hidden="true" />
                    )}
                  </div>
                  <span className="focus-quantity-tag">
                    {stepValidated ? '13' : '?'}
                  </span>
                </div>
              </div>

              {/* Tray */}
              {!stepValidated ? (
                <div className="focus-manipulative-tray">
                  <button
                    type="button"
                    className="focus-tray-action-btn focus-tray-action-btn--emerald"
                    onClick={(e) => handleAddCircleStep9(e)}
                  >
                    <EmeraldCircle25D />
                    <span>+ Tambah lingkaran</span>
                  </button>
                  {addedCirclesStep9 > 0 && (
                    <button
                      type="button"
                      className="focus-tray-action-btn focus-tray-action-btn--remove"
                      onClick={handleRemoveCircleStep9}
                    >
                      <span>− Kurangi ({addedCirclesStep9})</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="focus-relation-callout" aria-live="polite">
                  <strong>4 ── +3 ──→ 7 ── +3 ──→ 10 ── +3 ──→ 13</strong>
                  <span className="focus-seq-sub">🎯 Hebat! Kamu menguasai cara menemukan aturan pertumbuhan pola!</span>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ STATE 10: COMPLETION */}
          {currentStep === 10 && (
            <div className="focus-step-panel focus-step-complete">
              {/* Glowing Violet/Gold Milestone Emblem */}
              <div className="focus-complete-emblem-wrap">
                <div className="focus-complete-emblem" aria-hidden="true">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="#fbbf24" stroke="#d97706" />
                  </svg>
                </div>
              </div>

              <h2 className="focus-complete-title">Bagus sekali!</h2>
              <p className="focus-complete-sub">Kamu sudah menyelesaikan 1.1 Pola yang Tumbuh.</p>

              {/* Reward Badge */}
              <div className="focus-reward-chip">
                <span className="focus-reward-sparkle">✦</span>
                <span>+25 Lumens</span>
              </div>

              {/* 3 Precision SVG Pillar Cards */}
              <div className="focus-pillars-row">
                <div className="focus-pillar-card focus-pillar-card--observe">
                  <div className="focus-pillar-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6d5ce7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div className="focus-pillar-text">
                    <span className="focus-pillar-label">Langkah 1</span>
                    <strong>Lihat Perubahan</strong>
                  </div>
                </div>

                <span className="focus-pillar-arrow" aria-hidden="true">→</span>

                <div className="focus-pillar-card focus-pillar-card--predict">
                  <div className="focus-pillar-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                  </div>
                  <div className="focus-pillar-text">
                    <span className="focus-pillar-label">Langkah 2</span>
                    <strong>Buat Prediksi</strong>
                  </div>
                </div>

                <span className="focus-pillar-arrow" aria-hidden="true">→</span>

                <div className="focus-pillar-card focus-pillar-card--prove">
                  <div className="focus-pillar-icon-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <div className="focus-pillar-text">
                    <span className="focus-pillar-label">Langkah 3</span>
                    <strong>Buktikan Pola</strong>
                  </div>
                </div>
              </div>

              {/* Takeaway quote box */}
              <div className="focus-complete-takeaway-box">
                <p className="focus-complete-takeaway">
                  “Kamu bisa menemukan aturan pertumbuhan bahkan pada pola yang belum pernah kamu lihat.”
                </p>
              </div>

              {/* Primary Integrated Action CTA inside Card */}
              <div className="focus-complete-cta-wrap">
                <button
                  type="button"
                  className="focus-primary-btn focus-primary-btn--ready focus-complete-main-cta"
                  onClick={handleFinalCompletion}
                >
                  Lanjut ke 1.2 →
                </button>
              </div>
            </div>
          )}

          {/* Error notice if present */}
          {errorMessage && (
            <div className="focus-error-banner" role="alert">
              <Icon name="info" width={16} height={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Flying Trajectory Particles Overlay */}
          <div className="focus-flight-overlay" aria-hidden="true">
            {flyingParticles.map((p) => (
              <div
                key={p.id}
                className={`flying-particle flying-particle--${p.type}`}
                style={
                  {
                    '--start-x': `${p.startX}px`,
                    '--start-y': `${p.startY}px`,
                    '--target-x': `${p.targetX}px`,
                    '--target-y': `${p.targetY}px`,
                  } as React.CSSProperties
                }
              >
                {p.type === 'cube' && <IsometricCube25D size={28} highlight />}
                {p.type === 'diamond' && <GoldDiamond25D size={26} highlight />}
                {p.type === 'circle' && <EmeraldCircle25D size={24} />}
                {p.type === 'chip' && <span className="flying-chip-label">{p.label}</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------- Contextual Hint Drawer */}
      {hintsVisible && (
        <aside className="focus-hint-drawer" role="complementary" aria-label="Petunjuk pelajaran">
          <div className="focus-hint-inner">
            <header className="focus-hint-header">
              <div className="focus-hint-title">
                <Icon name="sparkles" width={16} height={16} />
                <span>Petunjuk ({hintTier}/{getStepHints().length})</span>
              </div>
              <button
                type="button"
                className="focus-hint-close-btn"
                onClick={() => setHintsVisible(false)}
                aria-label="Tutup petunjuk"
              >
                <Icon name="close" width={16} height={16} />
              </button>
            </header>
            <p className="focus-hint-text">{getStepHints()[hintTier - 1]}</p>
            {hintTier < getStepHints().length && (
              <button
                type="button"
                className="focus-hint-next-btn"
                onClick={() => setHintTier((t) => t + 1)}
              >
                Buka petunjuk berikutnya →
              </button>
            )}
          </div>
        </aside>
      )}

      {/* -------------------------------- Stable Bottom Action Area */}
      <footer className="focus-lesson-footer">
        <div className="focus-footer-inner">
          {/* Left: Quiet Hint Action */}
          {currentStep <= 9 ? (
            <button
              type="button"
              className="focus-hint-trigger-btn"
              onClick={handleOpenHint}
              aria-label="Buka petunjuk"
            >
              <Icon name="sparkles" width={16} height={16} />
              <span>Petunjuk</span>
            </button>
          ) : (
            <div />
          )}

          {/* Right: Primary Learning Action */}
          {currentStep === 1 && (
            <button
              type="button"
              className="focus-primary-btn focus-primary-btn--ready"
              onClick={handleNextStep}
            >
              Lanjut →
            </button>
          )}

          {currentStep === 2 && (
            <button
              type="button"
              className={`focus-primary-btn ${stepValidated ? 'focus-primary-btn--ready' : 'focus-primary-btn--disabled'}`}
              disabled={!stepValidated}
              onClick={handleNextStep}
            >
              Lanjut →
            </button>
          )}

          {currentStep === 3 && (
            <button
              type="button"
              className={`focus-primary-btn ${stepValidated ? 'focus-primary-btn--ready' : 'focus-primary-btn--disabled'}`}
              disabled={!stepValidated}
              onClick={handleNextStep}
            >
              Lanjut →
            </button>
          )}

          {currentStep === 4 && (
            <button
              type="button"
              className="focus-primary-btn focus-primary-btn--ready"
              onClick={stepValidated ? handleNextStep : verifyStep4}
            >
              {stepValidated ? 'Lanjut →' : 'Periksa'}
            </button>
          )}

          {currentStep === 5 && (
            <button
              type="button"
              className="focus-primary-btn focus-primary-btn--ready"
              onClick={stepValidated ? handleNextStep : verifyStep5}
            >
              {stepValidated ? 'Lanjut →' : 'Periksa'}
            </button>
          )}

          {currentStep === 6 && (
            <button
              type="button"
              className="focus-primary-btn focus-primary-btn--ready"
              onClick={handleNextStep}
            >
              Lanjut →
            </button>
          )}

          {currentStep === 7 && (
            <button
              type="button"
              className={`focus-primary-btn ${selectedChoiceStep7 ? 'focus-primary-btn--ready' : 'focus-primary-btn--disabled'}`}
              disabled={!selectedChoiceStep7}
              onClick={stepValidated ? handleNextStep : verifyStep7}
            >
              {stepValidated ? 'Lanjut →' : 'Periksa'}
            </button>
          )}

          {currentStep === 8 && (
            <button
              type="button"
              className="focus-primary-btn focus-primary-btn--ready"
              onClick={stepValidated ? handleNextStep : verifyStep8}
            >
              {stepValidated ? 'Lanjut →' : 'Periksa'}
            </button>
          )}

          {currentStep === 9 && (
            <button
              type="button"
              className="focus-primary-btn focus-primary-btn--ready"
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
