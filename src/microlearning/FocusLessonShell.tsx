import React from 'react';
import { Icon } from '../design/Icon';
import './FocusLessonShell.css';

export interface FocusLessonShellProps {
  lessonId: string;
  currentStep: number;
  totalSteps?: number;
  maxUnlockedStep?: number;
  onStepSelect?: (step: number) => void;
  title?: string;
  onExit?: () => void;
  hintsVisible?: boolean;
  hintTier?: number;
  hintContent?: React.ReactNode;
  onOpenHints?: () => void;
  onCloseHints?: () => void;
  stepValidated?: boolean;
  nextLabel?: string;
  onNextStep?: () => void;
  cardRef?: React.RefObject<HTMLDivElement | null>;
  children: React.ReactNode;
  extraFooterAction?: React.ReactNode;
  hideFooter?: boolean;
}

/**
 * FocusLessonShell:
 * Komponen shell standar terpadu untuk seluruh microlearning mode fokus Lumera (1.1, 1.2, 1.3, dst).
 * Menjamin keseragaman header 64px, bilah progres segmen interaktif, kartu workspace 28px, footer 80px, dan drawer petunjuk.
 */
export function FocusLessonShell({
  lessonId,
  currentStep,
  totalSteps = 9,
  maxUnlockedStep,
  onStepSelect,
  title = 'Mode Fokus',
  onExit,
  hintsVisible = false,
  hintTier = 1,
  hintContent,
  onOpenHints,
  onCloseHints,
  stepValidated = false,
  nextLabel = 'Lanjut →',
  onNextStep,
  cardRef,
  children,
  extraFooterAction,
  hideFooter = false,
}: FocusLessonShellProps) {
  const isCompletedState = currentStep > totalSteps;
  const highestUnlocked = Math.max(currentStep, maxUnlockedStep ?? currentStep);

  return (
    <main
      className="focus-lesson-shell focus-mode"
      data-lesson-id={lessonId}
      data-step={currentStep}
      aria-label={`${title} - Langkah ${Math.min(totalSteps, currentStep)} dari ${totalSteps}`}
    >
      {/* -------------------------------- Sticky Top Header (64px) */}
      <header className="focus-lesson-header">
        <button
          type="button"
          className="focus-close-btn"
          onClick={onExit}
          aria-label="Tutup dan kembali ke kurikulum Aljabar"
        >
          <Icon name="close" width={18} height={18} />
        </button>

        <div className="focus-segmented-progress" aria-label="Navigasi langkah pelajaran">
          {Array.from({ length: totalSteps }).map((_, i) => {
            const stepNum = i + 1;
            const isCompleted = stepNum < currentStep;
            const isActive = stepNum === currentStep;
            const isUnlocked = stepNum <= highestUnlocked;

            return (
              <button
                key={i}
                type="button"
                className={`focus-progress-segment ${
                  isActive
                    ? 'focus-progress-segment--active'
                    : isCompleted
                      ? 'focus-progress-segment--completed'
                      : ''
                } ${isUnlocked && onStepSelect ? 'focus-progress-segment--clickable' : ''}`}
                disabled={!isUnlocked || !onStepSelect}
                onClick={() => {
                  if (isUnlocked && onStepSelect) {
                    onStepSelect(stepNum);
                  }
                }}
                aria-label={
                  isActive
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
          aria-valuenow={Math.min(totalSteps, currentStep)}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-label={`Kemajuan pelajaran langkah ${Math.min(totalSteps, currentStep)} dari ${totalSteps}`}
          style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', border: 0 }}
        />

        <div className="focus-step-indicator" aria-hidden="true">
          {!isCompletedState ? `${currentStep} / ${totalSteps}` : '✓'}
        </div>
      </header>

      {/* -------------------------------- Central Workspace Container */}
      <div className="focus-workspace-container">
        <section className="focus-workspace-card" ref={cardRef}>
          {children}

          {/* -------------------------------- Contextual Hint Drawer */}
          {hintsVisible && !isCompletedState && (
            <aside
              className="focus-hint-drawer"
              aria-label="Petunjuk pelajaran"
            >
              <header className="focus-hint-header">
                <div className="focus-hint-title">
                  <Icon name="sparkles" width={16} height={16} />
                  <span>Petunjuk ({hintTier}/3)</span>
                </div>
                <button
                  type="button"
                  className="focus-hint-close"
                  onClick={onCloseHints}
                  aria-label="Tutup petunjuk"
                >
                  <Icon name="close" width={16} height={16} />
                </button>
              </header>
              <div className="focus-hint-content">{hintContent}</div>
            </aside>
          )}
        </section>
      </div>

      {/* -------------------------------- Fixed Bottom Footer (80px) */}
      {!hideFooter && (
        <footer className="focus-lesson-footer">
          <div className="focus-footer-inner">
            {!isCompletedState && onOpenHints ? (
              <button
                type="button"
                className="focus-hint-trigger-btn"
                onClick={onOpenHints}
                aria-label="Buka petunjuk bantuan"
              >
                <Icon name="sparkles" width={16} height={16} />
                <span>Petunjuk</span>
              </button>
            ) : (
              extraFooterAction || <div />
            )}

            <button
              type="button"
              className={`focus-primary-btn ${
                stepValidated || isCompletedState
                  ? 'focus-primary-btn--ready'
                  : 'focus-primary-btn--disabled'
              }`}
              disabled={!stepValidated && !isCompletedState}
              onClick={onNextStep}
            >
              <span>{nextLabel}</span>
            </button>
          </div>
        </footer>
      )}
    </main>
  );
}
