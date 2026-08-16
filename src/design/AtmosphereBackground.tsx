import { memo } from 'react';
import './AtmosphereBackground.css';

export const AtmosphereBackground = memo(function AtmosphereBackground() {
  return (
    <div className="lumera-ambient-canvas" aria-hidden="true">
      <div className="lumera-ambient-orb lumera-ambient-orb--gold" />
      <div className="lumera-ambient-orb lumera-ambient-orb--indigo" />
      <div className="lumera-ambient-orb lumera-ambient-orb--amber" />
      <div className="lumera-ambient-orb lumera-ambient-orb--blue" />
      <div className="lumera-grain-overlay" />
    </div>
  );
});
