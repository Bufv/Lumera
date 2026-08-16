import { useState, useEffect } from 'react';
import { Icon } from '../design/Icon';
import { CourseIdentityOverview } from './components/CourseIdentityOverview';
import { KnowledgeNodeTile } from './components/KnowledgeNodeTile';
import { SelectedLessonCard } from './components/SelectedLessonCard';
import {
  deriveCourseRoadmap,
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

// Generous vertical coordinates (~180px gap) preventing any popout overlap
const NODE_POSITIONS = [
  { top: 20, left: 80 },   // Node 1: Menemukan Pola
  { top: 200, left: 140 }, // Node 2: Melanjutkan Pola (Current)
  { top: 380, left: 50 },  // Node 3: Menyatakan Aturan Pola
  { top: 560, left: 90 },  // Node 4: Dari Pola ke Simbol (Locked)
] as const;

export function CourseRoadmapScreen({
  course,
  completedModuleIds = [],
  demo = false,
  activeModuleId,
  view = 'roadmap',
  onBack,
  onChangeView,
  onOpenLesson,
}: CourseRoadmapScreenProps) {
  const completedSet =
    completedModuleIds instanceof Set ? completedModuleIds : new Set(completedModuleIds);
  const derivedCourse = deriveCourseRoadmap(course, completedSet, demo, activeModuleId);

  // Level 1 lessons
  const level1 = derivedCourse.levels[0];
  const lessons = level1 ? level1.lessons : [];

  const lesson0 = lessons[0];
  const lesson1 = lessons[1];
  const lesson2 = lessons[2];
  const lesson3 = lessons[3];

  const pos0 = NODE_POSITIONS[0] ?? { top: 20, left: 80 };
  const pos1 = NODE_POSITIONS[1] ?? { top: 200, left: 140 };
  const pos2 = NODE_POSITIONS[2] ?? { top: 380, left: 50 };
  const pos3 = NODE_POSITIONS[3] ?? { top: 560, left: 90 };

  // Popout state: null initially, opens ONLY on click
  const [openedLessonId, setOpenedLessonId] = useState<string | null>(null);

  // Close popout on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenedLessonId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleStartLesson = (lesson: DerivedLessonNode) => {
    if (lesson.moduleId) {
      setOpenedLessonId(null);
      onOpenLesson(lesson, course);
    }
  };

  const toggleLessonPopout = (lessonId: string) => {
    setOpenedLessonId((current) => (current === lessonId ? null : lessonId));
  };

  return (
    <main className="student-page course-learning-path-screen" data-view={view}>
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
                data-active={view === 'roadmap'}
                aria-pressed={view === 'roadmap'}
                onClick={() => onChangeView('roadmap')}
              >
                <Icon name="route" width={15} height={15} />
                Jalur
              </button>
              <button
                type="button"
                data-active={view === 'list'}
                aria-pressed={view === 'list'}
                onClick={() => onChangeView('list')}
              >
                <Icon name="list" width={15} height={15} />
                Daftar
              </button>
            </div>
          )}
        </div>

        {view === 'roadmap' ? (
          <div className="course-path-layout-2col">
            {/* -------------------------------- LEFT: Enclosed Course Identity Card */}
            <div className="course-path-left-col">
              <CourseIdentityOverview
                title={course.title}
                subject="Matematika"
                phase={`Fase ${course.phase}`}
                gradeRange={course.gradeBand}
                description={course.description}
                progressPercent={18}
                totalLevels={course.levels.length || 6}
                totalLessons={course.levels.reduce((acc, l) => acc + l.lessons.length, 0) || 24}
              />
            </div>

            {/* -------------------------------- RIGHT: Knowledge Path Journey (No ribbon lines) */}
            <div className="course-path-right-col">
              {/* Journey Canvas */}
              <div className="learning-path-canvas">
                {/* Node 1: Menemukan Pola (Completed) */}
                {lesson0 && (
                  <div
                    className="path-node-wrapper"
                    style={{
                      top: `${pos0.top}px`,
                      left: `${pos0.left}px`,
                      zIndex: openedLessonId === lesson0.id ? 60 : 5,
                    }}
                  >
                    <KnowledgeNodeTile
                      type="completed"
                      number={1}
                      title={lesson0.title}
                      selected={openedLessonId === lesson0.id}
                      onClick={() => toggleLessonPopout(lesson0.id)}
                      popup={
                        <SelectedLessonCard
                          title={lesson0.title}
                          duration="± 5 menit"
                          actionLabel="Ulangi"
                          onStartLesson={() => handleStartLesson(lesson0)}
                        />
                      }
                    />
                  </div>
                )}

                {/* Node 2: Melanjutkan Pola (Current / Active) */}
                {lesson1 && (
                  <div
                    className="path-node-wrapper"
                    style={{
                      top: `${pos1.top}px`,
                      left: `${pos1.left}px`,
                      zIndex: openedLessonId === lesson1.id ? 60 : 5,
                    }}
                  >
                    <KnowledgeNodeTile
                      type="current"
                      number={2}
                      title={lesson1.title}
                      subtitle="Sedang dipelajari"
                      selected={openedLessonId === lesson1.id}
                      onClick={() => toggleLessonPopout(lesson1.id)}
                      popup={
                        <SelectedLessonCard
                          title={lesson1.title}
                          duration="± 5 menit"
                          actionLabel={lesson1.availability === 'inProgress' ? 'Lanjutkan' : 'Mulai'}
                          onStartLesson={() => handleStartLesson(lesson1)}
                        />
                      }
                    />
                  </div>
                )}

                {/* Node 3: Menyatakan Aturan Pola (Available / Next) */}
                {lesson2 && (
                  <div
                    className="path-node-wrapper"
                    style={{
                      top: `${pos2.top}px`,
                      left: `${pos2.left}px`,
                      zIndex: openedLessonId === lesson2.id ? 60 : 5,
                    }}
                  >
                    <KnowledgeNodeTile
                      type="available"
                      number={3}
                      title={lesson2.title}
                      subtitle="Berikutnya"
                      selected={openedLessonId === lesson2.id}
                      onClick={() => toggleLessonPopout(lesson2.id)}
                      popup={
                        <SelectedLessonCard
                          title={lesson2.title}
                          duration="± 5 menit"
                          actionLabel="Mulai"
                          onStartLesson={() => handleStartLesson(lesson2)}
                        />
                      }
                    />
                  </div>
                )}

                {/* Optional Side Challenge Node */}
                <div
                  className="path-node-wrapper challenge-node-wrap"
                  style={{ top: '440px', left: '330px', zIndex: 6 }}
                >
                  <KnowledgeNodeTile
                    type="challenge"
                    title="Tantangan"
                    subtitle="Coba pola lain"
                    onClick={() => {
                      if (lesson1) handleStartLesson(lesson1);
                    }}
                  />
                </div>

                {/* Node 4: Dari Pola ke Simbol (Locked) */}
                {lesson3 && (
                  <div
                    className="path-node-wrapper"
                    style={{
                      top: `${pos3.top}px`,
                      left: `${pos3.left}px`,
                      zIndex: 5,
                    }}
                  >
                    <KnowledgeNodeTile
                      type="locked"
                      number={4}
                      title={lesson3.title}
                      subtitle="Terkunci"
                      disabled
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* List View (Daftar) */
          <div className="course-roadmap-list-view course-rows" data-view="list">
            {derivedCourse.levels.map((level: DerivedCourseLevel) => {
              const selesaiLevel = level.lessons.filter((l) => l.availability === 'completed').length;
              return (
                <section key={level.id} className="course-roadmap-list-level course-rows__level">
                  <header>
                    <strong>
                      Level {level.number} · {level.title}
                    </strong>
                    <small>
                      {selesaiLevel} / {level.lessons.length} selesai
                    </small>
                  </header>
                  <ul>
                    {level.lessons.map((lesson: DerivedLessonNode, index: number) => {
                      const dapatDibuka = Boolean(lesson.moduleId) && lesson.availability !== 'lockedByPrerequisite' && lesson.availability !== 'comingSoon';
                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            className="course-roadmap-list-row course-row"
                            data-status={lesson.availability}
                            disabled={!dapatDibuka}
                            aria-disabled={!dapatDibuka}
                            onClick={() => {
                              if (dapatDibuka) onOpenLesson(lesson, course);
                            }}
                          >
                            <span className="course-row__nomor">
                              {String(index + 1).padStart(2, '0')}
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
    </main>
  );
}
