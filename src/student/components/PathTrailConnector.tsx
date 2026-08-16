export interface PathTrailConnectorProps {
  completedStep?: number;
}

export function PathTrailConnector({ completedStep: _completedStep = 1 }: PathTrailConnectorProps) {
  return (
    <svg
      className="learning-path-trail-svg"
      viewBox="0 0 540 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Violet Progress Gradient */}
        <linearGradient id="pathProgressGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6D5CE7" />
          <stop offset="100%" stopColor="#5143C8" />
        </linearGradient>
      </defs>

      {/* 1. Completed & Active Path Segment (Node 1 -> Node 2 -> Node 3) */}
      <path
        d="M 100 100
           C 100 180, 180 180, 180 260
           C 180 340, 80 340, 80 420"
        stroke="url(#pathProgressGrad)"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* 2. Optional Side Challenge Dashed Branch (Node 3 -> Challenge) */}
      <path
        d="M 80 420
           C 180 440, 280 475, 380 480"
        stroke="#BDB4F5"
        strokeWidth="2.5"
        strokeDasharray="6 6"
        strokeLinecap="round"
      />

      {/* 3. Future Path to Locked Node 4 (Node 3 -> Node 4) */}
      <path
        d="M 80 420
           C 80 500, 130 500, 130 580"
        stroke="#E2E8F0"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* 4. Continuing Trail to Level 2 (Node 4 -> Next Level) */}
      <path
        d="M 130 580
           C 130 630, 130 630, 130 680"
        stroke="#E2E8F0"
        strokeWidth="3.5"
        strokeDasharray="4 6"
        strokeLinecap="round"
      />
    </svg>
  );
}
