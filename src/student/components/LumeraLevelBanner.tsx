import './LumeraLevelBanner.css';

export interface LumeraLevelBannerProps {
  levelNumber?: number;
  levelTitle: string;
}

export function LumeraLevelBanner({
  levelNumber = 1,
  levelTitle = 'Pola Menjadi Aljabar',
}: LumeraLevelBannerProps) {
  return (
    <div className="lumera-level-banner-wrap">
      {/* 3D Oblong Pill Banner with Lumera Purple Accent & Depth */}
      <div className="lumera-level-pill">
        <span className="lumera-level-kicker">LEVEL {levelNumber}</span>
        <h2 className="lumera-level-heading">{levelTitle}</h2>
      </div>
      {/* 3D Violet Shelf Shadow Depth */}
      <div className="lumera-level-shelf" />
    </div>
  );
}
