import './LevelTransitionMarker.css';

export interface LevelTransitionMarkerProps {
  nextLevelNumber?: number;
  nextLevelTitle?: string;
}

export function LevelTransitionMarker({
  nextLevelNumber = 2,
  nextLevelTitle = 'Bahasa Aljabar',
}: LevelTransitionMarkerProps) {
  return (
    <div className="level-transition-marker" aria-label="Level Berikutnya">
      <span className="level-transition-pill">BERIKUTNYA</span>
      <div className="level-transition-info">
        <span className="level-transition-sub">LEVEL {nextLevelNumber}</span>
        <h3 className="level-transition-title">{nextLevelTitle}</h3>
      </div>
    </div>
  );
}
