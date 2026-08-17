import { useState, useEffect, useRef } from 'react';
import { Icon } from '../design/Icon';
import { CourseIdentityOverview } from './components/CourseIdentityOverview';
import { KnowledgeNodeTile } from './components/KnowledgeNodeTile';
import { SelectedLessonCard } from './components/SelectedLessonCard';
import {
  deriveCourseRoadmap,
  findLessonNode,
  getCourseProgress,
  type DerivedCourseLevel,
  type DerivedLessonNode,
  type LearningCourse,
  type LessonAvailability,
  type LessonNode,
} from './learningCatalog';
import './CourseRoadmapScreen.css';

export type CourseRoadmapView = 'roadmap' | 'list';

export interface CourseRoadmapScreenProps {
  course: LearningCourse;
  completedModuleIds?: readonly string[] | ReadonlySet<string>;
  demo?: boolean;
  activeModuleId?: string;
  view?: CourseRoadmapView;
  defaultView?: CourseRoadmapView;
  focusLessonId?: string;
  backLabel?: string;
  onBack?: () => void;
  onChangeView?: (view: CourseRoadmapView) => void;
  onOpenLesson: (lesson: LessonNode, course: LearningCourse) => void;
}

const STATUS_LABEL: Record<LessonAvailability, string> = {
  available: 'Siap dimulai',
  inProgress: 'Sedang berjalan',
  completed: 'Selesai',
  lockedByPrerequisite: 'Terkunci',
  comingSoon: 'Segera hadir',
  reviewPending: 'Menunggu tinjauan',
};

// Generous vertical coordinates (~230px gap) preventing any popout overlap
const NODE_POSITIONS = [
  { top: 20, left: 80 },   // Node 1: Pola yang Tumbuh
  { top: 250, left: 140 }, // Node 2: Aturan di Balik Pola
  { top: 480, left: 50 },  // Node 3: Dari Kotak ke x
  { top: 710, left: 90 },  // Node 4: Cerita Menjadi Aljabar
] as const;

export function CourseRoadmapScreen({
  course,
  completedModuleIds = [],
  demo = false,
  activeModuleId,
  view,
  defaultView,
  focusLessonId,
  onBack,
  onChangeView,
  onOpenLesson,
}: CourseRoadmapScreenProps) {
  const currentView = view ?? defaultView ?? 'roadmap';
  const completedSet =
    completedModuleIds instanceof Set ? completedModuleIds : new Set(completedModuleIds);
  const derivedCourse = deriveCourseRoadmap(course, completedSet, demo, activeModuleId);
  const courseProgress = getCourseProgress(course, completedSet);

  // Level 1 lessons
  const level1 = derivedCourse.levels[0];
  const level1Lessons = level1 ? level1.lessons : [];
  const futureLevels = derivedCourse.levels.slice(1);

  // Popout state: null initially, opens ONLY on click
  const [openedLessonId, setOpenedLessonId] = useState<string | null>(null);
  const lastOpenedIndexRef = useRef<number>(0);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const listButtonRefs = useRef<Map<string, HTMLButtonElement | null>>(new Map());

  // Focus target lesson if focusLessonId is passed
  useEffect(() => {
    if (!focusLessonId) return;
    if (currentView === 'roadmap') {
      const targetIndex = level1Lessons.findIndex(
        (l) => l.id === focusLessonId || l.moduleId === focusLessonId || l.slug === focusLessonId,
      );
      if (targetIndex >= 0) {
        buttonRefs.current[targetIndex]?.focus();
      }
    } else {
      const btn = listButtonRefs.current.get(focusLessonId);
      if (btn) {
        btn.focus();
      } else {
        for (const level of derivedCourse.levels) {
          const matched = level.lessons.find(
            (l) => l.id === focusLessonId || l.moduleId === focusLessonId || l.slug === focusLessonId,
          );
          if (matched) {
            listButtonRefs.current.get(matched.id)?.focus();
            break;
          }
        }
      }
    }
  }, [focusLessonId, currentView, level1Lessons, derivedCourse.levels]);

  // Close popout on Escape and restore focus to the triggering button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (openedLessonId) {
          setOpenedLessonId(null);
          const btn = buttonRefs.current[lastOpenedIndexRef.current];
          btn?.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openedLessonId]);

  const handleStartLesson = (lesson: DerivedLessonNode) => {
    if (lesson.moduleId) {
      setOpenedLessonId(null);
      onOpenLesson(lesson, course);
    }
  };

  const toggleLessonPopout = (lessonId: string, index: number) => {
    lastOpenedIndexRef.current = index;
    setOpenedLessonId((current) => (current === lessonId ? null : lessonId));
  };

  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = Math.min(index + 1, level1Lessons.length - 1);
      buttonRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = Math.max(index - 1, 0);
      buttonRefs.current[prevIndex]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      buttonRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      buttonRefs.current[level1Lessons.length - 1]?.focus();
    }
  };

  return (
    <main className="student-page course-learning-path-screen" data-view={currentView}>
      <div className="course-learning-path-container">
        {/* Top Bar with 'Kembali ke Belajar' & View Switcher */}
        <div className="course-path-top-bar">
          {onBack && (
            <button
              type="button"
              className="learning-roadmap__back-btn"
              onClick={onBack}
              aria-label="Kembali ke Belajar"
            >
              <Icon name="arrow" width={16} height={16} />
              <span>Kembali ke Belajar</span>
            </button>
          )}

          {onChangeView && (
            <div className="course-view-switch" role="group" aria-label="Pilih tampilan kursus">
              <button
                type="button"
                data-active={currentView === 'roadmap'}
                aria-pressed={currentView === 'roadmap'}
                onClick={() => onChangeView('roadmap')}
              >
                <Icon name="route" width={15} height={15} />
                Jalur
              </button>
              <button
                type="button"
                data-active={currentView === 'list'}
                aria-pressed={currentView === 'list'}
                onClick={() => onChangeView('list')}
              >
                <Icon name="list" width={15} height={15} />
                Daftar
              </button>
            </div>
          )}
        </div>

        {/* 2-Column Unified Layout: Left Course Card + Right Content (Roadmap / List) */}
        <div className="course-path-layout-2col">
          {/* -------------------------------- LEFT: Enclosed Course Identity Card */}
          <div className="course-path-left-col">
            <CourseIdentityOverview
              title={course.title}
              slug={course.slug}
              subject="Matematika"
              phase={`Fase ${course.phase}`}
              gradeRange={course.gradeBand}
              description={course.description}
              progressPercent={courseProgress.percent}
              totalLevels={course.levels.length || 6}
              totalLessons={course.levels.reduce((acc, l) => acc + l.lessons.length, 0) || 24}
            />
          </div>

          {/* -------------------------------- RIGHT: Knowledge Path Journey OR List View */}
          <div className="course-path-right-col">
            {currentView === 'roadmap' ? (
              <>
                {level1 && (
                  <div className="course-level-header">
                    <span className="course-level-tag">LEVEL 1</span>
                    <h2 className="course-level-title">{level1.title}</h2>
                  </div>
                )}

                {/* Journey Canvas */}
                <div className="learning-path-canvas">
                  {level1Lessons.map((lesson, index) => {
                    const pos = NODE_POSITIONS[index] ?? { top: 20 + index * 230, left: 80 };
                    const isOpened = openedLessonId === lesson.id;
                    const isLocked = lesson.availability === 'lockedByPrerequisite';
                    const isReviewPending = lesson.availability === 'reviewPending';
                    const isCompleted = lesson.availability === 'completed';
                    const isInProgress = lesson.availability === 'inProgress';

                    const nodeType = isCompleted
                      ? 'completed'
                      : isInProgress
                        ? 'current'
                        : isLocked
                          ? 'locked'
                          : 'available';

                    const subtitle = isReviewPending
                      ? 'menunggu tinjauan'
                      : isCompleted
                        ? 'Selesai'
                        : isInProgress
                          ? 'Sedang dipelajari'
                          : isLocked
                            ? 'Terkunci'
                            : 'Siap dimulai';

                    const actionLabel = isCompleted
                      ? 'Ulangi pelajaran'
                      : isInProgress
                        ? 'Lanjutkan pelajaran'
                        : 'Mulai pelajaran';

                    let prerequisiteWarning: string | undefined;
                    if (isLocked && lesson.unmetPrerequisiteIds.length > 0) {
                      const prereq = findLessonNode(course.id, lesson.unmetPrerequisiteIds[0] ?? '');
                      prerequisiteWarning = `Selesaikan “${prereq?.title ?? 'Pola yang Tumbuh'}” terlebih dahulu`;
                    }

                    const reviewPendingWarning = isReviewPending
                      ? 'Modul ini belum tersedia di luar mode demo'
                      : undefined;

                    return (
                      <div
                        key={lesson.id}
                        className="path-node-wrapper"
                        style={{
                          top: `${pos.top}px`,
                          left: `${pos.left}px`,
                          zIndex: isOpened ? 60 : 5,
                        }}
                      >
                        <KnowledgeNodeTile
                          buttonRef={(el) => {
                            buttonRefs.current[index] = el;
                          }}
                          type={nodeType}
                          number={lesson.label}
                          title={lesson.title}
                          subtitle={subtitle}
                          selected={isOpened}
                          onClick={() => toggleLessonPopout(lesson.id, index)}
                          onKeyDown={(e) => handleButtonKeyDown(e, index)}
                          popup={
                            <SelectedLessonCard
                              title={lesson.title}
                              duration="± 5 menit"
                              actionLabel={actionLabel}
                              prerequisiteWarning={prerequisiteWarning}
                              reviewPendingWarning={reviewPendingWarning}
                              onClose={() => setOpenedLessonId(null)}
                              onStartLesson={() => handleStartLesson(lesson)}
                            />
                          }
                        />
                      </div>
                    );
                  })}

                  {/* Optional Side Challenge Node */}
                  <div
                    className="path-node-wrapper challenge-node-wrap"
                    style={{ top: '550px', left: '340px', zIndex: 6 }}
                  >
                    <KnowledgeNodeTile
                      type="challenge"
                      title="Tantangan"
                      subtitle="Coba pola lain"
                      onClick={() => {
                        if (level1Lessons[1]) handleStartLesson(level1Lessons[1]);
                      }}
                    />
                  </div>
                </div>

                {/* Future Coming Soon Levels (Levels 2–6) */}
                <div className="course-future-levels-section">
                  {futureLevels.map((level) => (
                    <section key={level.id} className="course-future-level-block">
                      <header className="course-future-level-header">
                        <strong>
                          Level {level.number} · {level.title}
                        </strong>
                      </header>
                      <div className="course-future-level-grid">
                        {level.lessons.map((lesson) => (
                          <article
                            key={lesson.id}
                            className="course-future-lesson-card"
                            aria-label={`${lesson.label} ${lesson.title}, segera hadir`}
                          >
                            <span className="course-future-lesson-num">{lesson.label}</span>
                            <span className="course-future-lesson-title">{lesson.title}</span>
                            <span className="course-future-lesson-badge">Segera hadir</span>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              </>
            ) : (
              /* List View (Daftar) */
              <div className="course-roadmap-list-view course-rows" data-view="list">
                {derivedCourse.levels.map((level: DerivedCourseLevel) => {
                  const selesaiLevel = level.lessons.filter((l) => l.availability === 'completed').length;
                  return (
                    <section key={level.id} className="course-roadmap-list-level course-rows__level">
                      <header className="course-roadmap-list-level-header">
                        <h2>{level.title}</h2>
                        <small>
                          {selesaiLevel} / {level.lessons.length} selesai
                        </small>
                      </header>
                      <ul>
                        {level.lessons.map((lesson: DerivedLessonNode, index: number) => {
                          const dapatDibuka =
                            Boolean(lesson.moduleId) &&
                            lesson.availability !== 'comingSoon';
                          const isOpened = openedLessonId === lesson.id;
                          const isLocked = lesson.availability === 'lockedByPrerequisite';
                          const isReviewPending = lesson.availability === 'reviewPending';
                          const isCompleted = lesson.availability === 'completed';
                          const isInProgress = lesson.availability === 'inProgress';

                          const statusText =
                            lesson.availability === 'comingSoon'
                              ? 'segera hadir'
                              : STATUS_LABEL[lesson.availability];

                          const actionLabel = isCompleted
                            ? 'Ulangi pelajaran'
                            : isInProgress
                              ? 'Lanjutkan pelajaran'
                              : 'Mulai pelajaran';

                          let prerequisiteWarning: string | undefined;
                          if (isLocked && lesson.unmetPrerequisiteIds.length > 0) {
                            const prereq = findLessonNode(course.id, lesson.unmetPrerequisiteIds[0] ?? '');
                            prerequisiteWarning = `Selesaikan “${prereq?.title ?? 'Pola yang Tumbuh'}” terlebih dahulu`;
                          }

                          const reviewPendingWarning = isReviewPending
                            ? 'Modul ini belum tersedia di luar mode demo'
                            : undefined;

                          return (
                            <li key={lesson.id} className="course-roadmap-list-item">
                              <button
                                ref={(el) => {
                                  listButtonRefs.current.set(lesson.id, el);
                                  if (lesson.moduleId) listButtonRefs.current.set(lesson.moduleId, el);
                                  listButtonRefs.current.set(lesson.slug, el);
                                }}
                                type="button"
                                className="course-roadmap-list-row course-row"
                                data-status={lesson.availability}
                                data-selected={isOpened}
                                disabled={!dapatDibuka}
                                aria-disabled={!dapatDibuka}
                                aria-label={`${lesson.label} ${lesson.title}, ${statusText}`}
                                onClick={() => {
                                  if (dapatDibuka) {
                                    toggleLessonPopout(lesson.id, index);
                                  }
                                }}
                              >
                                <span className="course-row-ambient-glow" aria-hidden="true" />
                                <span className="course-row__nomor">
                                  {lesson.label}
                                </span>
                                <span className="course-row__ikon" aria-hidden="true">
                                  {lesson.availability === 'completed' && (
                                    <Icon name="check" width={14} height={14} />
                                  )}
                                  {(lesson.availability === 'available' ||
                                    lesson.availability === 'inProgress') && (
                                    <Icon name="play" width={13} height={13} />
                                  )}
                                  {(lesson.availability === 'lockedByPrerequisite' ||
                                    lesson.availability === 'comingSoon' ||
                                    lesson.availability === 'reviewPending') && (
                                    <Icon name="lock" width={13} height={13} />
                                  )}
                                </span>
                                <span className="course-row__judul">{lesson.title}</span>
                                <span className="course-row__status">
                                  {STATUS_LABEL[lesson.availability]}
                                </span>
                                {dapatDibuka ? <Icon name="chevron" width={16} height={16} /> : <span />}
                              </button>
                              {isOpened && (
                                <div className="course-roadmap-list-popout-wrap">
                                  <SelectedLessonCard
                                    title={lesson.title}
                                    duration="± 5 menit"
                                    actionLabel={actionLabel}
                                    prerequisiteWarning={prerequisiteWarning}
                                    reviewPendingWarning={reviewPendingWarning}
                                    onClose={() => setOpenedLessonId(null)}
                                    onStartLesson={() => handleStartLesson(lesson)}
                                  />
                                </div>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </section>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
