import './BrilliantLevelBanner.css';

export interface BrilliantLevelBannerProps {
  levelNumber?: number;
  levelTitle: string;
}

export function BrilliantLevelBanner({
  levelNumber = 1,
  levelTitle = 'Visualize Fractions',
}: BrilliantLevelBannerProps) {
  return (
    <div className="brilliant-level-banner-wrap">
      {/* Top 3D Oblong Pill Banner */}
      <div className="brilliant-level-pill">
        <span className="brilliant-level-kicker">LEVEL {levelNumber}</span>
        <h2 className="brilliant-level-heading">{levelTitle}</h2>
      </div>
      {/* 3D Blue Bottom Bar Shelf */}
      <div className="brilliant-level-shelf" />
    </div>
  );
}
