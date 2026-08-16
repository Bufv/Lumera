import { useEffect, useRef, useState, type ReactNode } from 'react';

export type LessonStageTone = 'neutral' | 'correct' | 'wrong';

interface LessonStageProps {
  lessonId: string;
  title: string;
  step: number;
  totalSteps: number;
  lumens: number;
  reducedMotion: boolean;
  tone?: LessonStageTone;
  tutorTitle?: string;
  tutor: ReactNode;
  tutorSignal?: number;
  onExit: () => void;
  children: ReactNode;
  dock?: ReactNode;
}

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function LessonStage({
  lessonId,
  title,
  step,
  totalSteps,
  lumens,
  reducedMotion,
  tone = 'neutral',
  tutorTitle = 'Jejak Nalar',
  tutor,
  tutorSignal = 0,
  onExit,
  children,
  dock,
}: LessonStageProps) {
  const [tutorExpanded, setTutorExpanded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerPanelRef = useRef<HTMLElement>(null);
  const drawerCloseRef = useRef<HTMLButtonElement>(null);
  const drawerToggleRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const previousTutorSignal = useRef(tutorSignal);
  const progress = Math.max(0, Math.min(100, (step / totalSteps) * 100));

  useEffect(() => {
    setTutorExpanded(false);
    setDrawerOpen(false);
  }, [step]);

  useEffect(() => {
    if (tutorSignal === previousTutorSignal.current) return;
    previousTutorSignal.current = tutorSignal;
    if (window.matchMedia?.('(max-width: 900px)').matches) {
      setDrawerOpen(true);
    } else {
      setTutorExpanded(true);
    }
  }, [tutorSignal]);

  useEffect(() => {
    if (!drawerOpen) return;
    const backgroundRegions = [headerRef.current, workspaceRef.current].filter(
      (region): region is HTMLElement => region !== null,
    );
    backgroundRegions.forEach((region) => region.setAttribute('inert', ''));
    drawerCloseRef.current?.focus();

    const containFocus = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setDrawerOpen(false);
        requestAnimationFrame(() => drawerToggleRef.current?.focus());
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        drawerPanelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      );
      const first = focusable.at(0);
      const last = focusable.at(-1);
      if (!first || !last) {
        event.preventDefault();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', containFocus);
    return () => {
      document.removeEventListener('keydown', containFocus);
      backgroundRegions.forEach((region) => region.removeAttribute('inert'));
    };
  }, [drawerOpen]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    requestAnimationFrame(() => drawerToggleRef.current?.focus());
  };

  const openTutor = () => {
    if (window.matchMedia?.('(max-width: 900px)').matches) {
      setDrawerOpen(true);
    } else {
      setTutorExpanded(true);
    }
  };

  const tutorContent = (
    <div className="micro-tutor__inner">
      <div className="micro-tutor__heading">
        <span aria-hidden="true">{step.toString().padStart(2, '0')}</span>
        <div>
          <p>{tutorTitle}</p>
          <strong>{title}</strong>
        </div>
      </div>
      <div className="micro-tutor__copy">{tutor}</div>
    </div>
  );

  return (
    <main
      className="micro-lesson micro-lesson--prototype"
      data-lesson-id={lessonId}
      data-stage-tone={tone}
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
    >
      <header ref={headerRef} className="micro-lesson__header">
        <button
          className="micro-icon-button"
          type="button"
          onClick={onExit}
          aria-label="Tutup pelajaran"
        >
          ×
        </button>
        <div
          className="micro-progress"
          role="progressbar"
          aria-label={`Bagian ${step} dari ${totalSteps}`}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuenow={step}
        >
          <div className="micro-progress__track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <span>
            {step}/{totalSteps}
          </span>
        </div>
        <div className="micro-lumens" aria-label={`${lumens} Lumens`}>
          <span aria-hidden="true">✦</span>
          {lumens}
        </div>
      </header>

      <div
        ref={workspaceRef}
        className={`micro-lesson__workspace ${tutorExpanded ? 'micro-lesson__workspace--tutor-open' : ''}`}
      >
        <aside
          className={`micro-tutor-rail ${tutorExpanded ? 'micro-tutor-rail--expanded' : ''}`}
          aria-label={tutorTitle}
        >
          {tutorExpanded ? (
            <>
              <button
                className="micro-tutor-rail__close"
                type="button"
                onClick={() => setTutorExpanded(false)}
                aria-label="Tutup Jejak Nalar"
              >
                ×
              </button>
              {tutorContent}
            </>
          ) : (
            <button
              className="micro-tutor-rail__trigger"
              type="button"
              onClick={openTutor}
              aria-expanded="false"
              aria-label="Buka Jejak Nalar"
            >
              <span aria-hidden="true">?</span>
              <span>Jejak</span>
            </button>
          )}
        </aside>

        <section className="micro-stage" aria-label={`Pelajaran ${title}`} data-tone={tone}>
          <section className="micro-stage__exercise">
            <button
              ref={drawerToggleRef}
              className="micro-tutor-toggle"
              type="button"
              onClick={openTutor}
              aria-haspopup="dialog"
              aria-expanded={drawerOpen}
            >
              <span aria-hidden="true">?</span>
              Jejak Nalar
            </button>
            <div className="micro-stage__exercise-inner">{children}</div>
          </section>

          <footer className="micro-lesson__footer">
            <div className="micro-dock">
              {dock ?? <span className="micro-dock__status">Lanjutkan dari bidang latihan.</span>}
            </div>
          </footer>
        </section>
      </div>

      {drawerOpen ? (
        <div className="micro-tutor-drawer">
          <button
            className="micro-tutor-drawer__backdrop"
            type="button"
            onClick={closeDrawer}
            aria-label="Tutup Jejak Nalar"
          />
          <section
            ref={drawerPanelRef}
            className="micro-tutor-drawer__panel"
            role="dialog"
            aria-modal="true"
            aria-label={tutorTitle}
          >
            <button
              ref={drawerCloseRef}
              className="micro-icon-button micro-tutor-drawer__close"
              type="button"
              onClick={closeDrawer}
              aria-label="Tutup Jejak Nalar"
            >
              ×
            </button>
            {tutorContent}
          </section>
        </div>
      ) : null}
    </main>
  );
}
