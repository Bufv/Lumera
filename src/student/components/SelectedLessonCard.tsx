import { useEffect, useRef } from 'react';
import { Icon } from '../../design/Icon';
import './SelectedLessonCard.css';

export interface SelectedLessonCardProps {
  title: string;
  duration?: string;
  description?: string;
  actionLabel?: string;
  prerequisiteWarning?: string;
  reviewPendingWarning?: string;
  onStartLesson?: () => void;
  onClose?: () => void;
  disabled?: boolean;
}

export function SelectedLessonCard({
  title = 'Pola yang Tumbuh',
  duration = '± 5 menit',
  description,
  actionLabel,
  prerequisiteWarning,
  reviewPendingWarning,
  onStartLesson,
  onClose,
  disabled = false,
}: SelectedLessonCardProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Focus the close button for accessibility when dialog opens
    closeButtonRef.current?.focus();
  }, []);

  return (
    <div
      className="selected-lesson-card"
      role="dialog"
      aria-label={title}
    >
      {/* Upward Pointer Arrow matching node tile */}
      <div className="selected-lesson-pointer" aria-hidden="true" />

      {/* Lesson Details */}
      <div className="selected-lesson-body">
        <strong className="selected-lesson-title">{title}</strong>
        {description && <p className="selected-lesson-desc">{description}</p>}
        {prerequisiteWarning && (
          <p className="selected-lesson-warning">{prerequisiteWarning}</p>
        )}
        {reviewPendingWarning && (
          <p className="selected-lesson-warning">{reviewPendingWarning}</p>
        )}
        {!prerequisiteWarning && !reviewPendingWarning && duration && (
          <div className="selected-lesson-meta">
            <Icon name="clock" width={14} height={14} />
            <span>{duration}</span>
          </div>
        )}
      </div>

      {/* Action Button (only if lesson can be started) */}
      {actionLabel && onStartLesson && !prerequisiteWarning && !reviewPendingWarning && (
        <button
          type="button"
          className="selected-lesson-cta-btn"
          onClick={onStartLesson}
          disabled={disabled}
        >
          <span>{actionLabel}</span>
          <Icon name="arrow" width={16} height={16} />
        </button>
      )}

      {/* Close button for accessibility */}
      {onClose && (
        <button
          ref={closeButtonRef}
          type="button"
          className="selected-lesson-close-btn"
          aria-label={`Tutup rincian ${title}`}
          onClick={onClose}
        >
          <Icon name="close" width={14} height={14} />
        </button>
      )}
    </div>
  );
}
