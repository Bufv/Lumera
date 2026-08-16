import { Icon } from '../../design/Icon';
import './SelectedLessonCard.css';

export interface SelectedLessonCardProps {
  title: string;
  duration?: string;
  description?: string;
  actionLabel?: string;
  onStartLesson?: () => void;
  disabled?: boolean;
}

export function SelectedLessonCard({
  title = 'Melanjutkan Pola',
  duration = '± 5 menit',
  actionLabel = 'Mulai',
  onStartLesson,
  disabled = false,
}: SelectedLessonCardProps) {
  return (
    <div
      className="selected-lesson-card"
      role="region"
      aria-label="Pelajaran Terpilih"
    >
      {/* Upward Pointer Arrow matching node tile */}
      <div className="selected-lesson-pointer" aria-hidden="true" />

      {/* Lesson Details */}
      <div className="selected-lesson-body">
        <strong className="selected-lesson-title">{title}</strong>
        <div className="selected-lesson-meta">
          <Icon name="clock" width={14} height={14} />
          <span>{duration}</span>
        </div>
      </div>

      {/* Lumera Vibrant Orange CTA Button */}
      <button
        type="button"
        className="selected-lesson-cta-btn"
        onClick={onStartLesson}
        disabled={disabled}
        aria-label={`${actionLabel} ${title}`}
      >
        <span>{actionLabel}</span>
        <Icon name="arrow" width={16} height={16} />
      </button>
    </div>
  );
}
