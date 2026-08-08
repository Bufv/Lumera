import type { SVGProps } from 'react';

export type IconName =
  | 'arrow'
  | 'bar-chart'
  | 'bookmark'
  | 'book'
  | 'brain'
  | 'check'
  | 'chevron'
  | 'clock'
  | 'close'
  | 'code'
  | 'flame'
  | 'globe'
  | 'graduation'
  | 'grid'
  | 'home'
  | 'info'
  | 'list'
  | 'pages'
  | 'lock'
  | 'math'
  | 'play'
  | 'route'
  | 'science'
  | 'search'
  | 'sparkles'
  | 'target';

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.9,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...props,
  };

  if (name === 'search') {
    return (
      <svg {...common}>
        <circle cx="10.7" cy="10.7" r="6.7" />
        <path d="m16 16 4.2 4.2" />
      </svg>
    );
  }
  if (name === 'flame') {
    return (
      <svg {...common}>
        <path d="M13.2 2.5c.8 3.2-1.9 4.4-3.3 6.5-1.6 2.3-2.1 4.5-.9 7.1.5-2.3 1.9-3.6 3.4-5.2.2 2.4 2.3 3.5 2.3 6.1 0 2.5-1.7 4.5-4.4 4.5-4 0-6.5-3.2-6.5-7.1 0-4.6 3.6-7.1 5.8-9.8.1 1.7.8 2.8 1.6 3.5.8-1.8 1.7-3.5 2-5.6Z" />
        <path d="M12.6 14.3c1.8 1.5 2.4 2.7 2.1 4.2-.3 1.7-1.6 2.8-3.2 2.8-1.7 0-2.9-1.2-2.9-2.8 0-1.7 1.5-2.7 4-4.2Z" />
      </svg>
    );
  }
  if (name === 'arrow') {
    return (
      <svg {...common}>
        <path d="M4 12h15" />
        <path d="m14 6 6 6-6 6" />
      </svg>
    );
  }
  if (name === 'chevron') {
    return (
      <svg {...common}>
        <path d="m9 5 7 7-7 7" />
      </svg>
    );
  }
  if (name === 'check') {
    return (
      <svg {...common}>
        <path d="m5 12.5 4.2 4.2L19 7" />
      </svg>
    );
  }
  if (name === 'close') {
    return (
      <svg {...common} strokeWidth={2.2}>
        <path d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }
  if (name === 'clock') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.5 2" />
      </svg>
    );
  }
  if (name === 'play') {
    return (
      <svg {...common}>
        <path d="m8 5 10.5 7L8 19Z" />
      </svg>
    );
  }
  if (name === 'info') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5" />
        <path d="M12 8h.01" />
      </svg>
    );
  }
  if (name === 'bookmark') {
    return (
      <svg {...common}>
        <path d="M6.5 4.5A1.5 1.5 0 0 1 8 3h8a1.5 1.5 0 0 1 1.5 1.5V21L12 17.5 6.5 21Z" />
      </svg>
    );
  }
  if (name === 'lock') {
    return (
      <svg {...common}>
        <rect x="5" y="10" width="14" height="10" rx="2.5" />
        <path d="M8.5 10V7.5a3.5 3.5 0 0 1 7 0V10" />
      </svg>
    );
  }
  if (name === 'home') {
    return (
      <svg {...common}>
        <path d="m3 11 9-7 9 7" />
        <path d="M5.5 9.5V20h13V9.5" />
        <path d="M9.5 20v-6h5v6" />
      </svg>
    );
  }
  if (name === 'route') {
    return (
      <svg {...common}>
        <circle cx="5" cy="18" r="2" />
        <circle cx="19" cy="6" r="2" />
        <path d="M7 18h2.5a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3H17" />
      </svg>
    );
  }
  if (name === 'graduation') {
    return (
      <svg {...common}>
        <path d="M2.6 8.6 12 4.3l9.4 4.3L12 12.9Z" />
        <path d="M6.6 10.7v4.6c0 1.7 2.4 3 5.4 3s5.4-1.3 5.4-3v-4.6" />
        <path d="M21.4 8.9v5.4" />
      </svg>
    );
  }
  if (name === 'grid') {
    return (
      <svg {...common}>
        <rect x="4" y="4" width="7" height="7" rx="2" />
        <rect x="13" y="4" width="7" height="7" rx="2" />
        <rect x="4" y="13" width="7" height="7" rx="2" />
        <rect x="13" y="13" width="7" height="7" rx="2" />
      </svg>
    );
  }
  if (name === 'pages') {
    return (
      <svg {...common}>
        <rect x="3.5" y="5" width="17" height="14" rx="2.4" />
        <path d="M8.6 5v14" />
        <path d="M11.6 9.4h5.6M11.6 13.4h5.6" />
      </svg>
    );
  }
  if (name === 'list') {
    return (
      <svg {...common}>
        <path d="M9 6h11M9 12h11M9 18h11" />
        <circle cx="4" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="4" cy="12" r="1" fill="currentColor" stroke="none" />
        <circle cx="4" cy="18" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (name === 'book') {
    return (
      <svg {...common}>
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z" />
        <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5Z" />
      </svg>
    );
  }
  if (name === 'math') {
    return (
      <svg {...common}>
        <path d="M3 12h3l2.5 7L13 5h8" />
        <path d="m15.5 11 5 6m0-6-5 6" />
      </svg>
    );
  }
  if (name === 'science') {
    return (
      <svg {...common}>
        <path d="M9 3h6M10 3v6l-5 8.5A2.3 2.3 0 0 0 7 21h10a2.3 2.3 0 0 0 2-3.5L14 9V3" />
        <path d="M7.5 15h9" />
      </svg>
    );
  }
  if (name === 'code') {
    return (
      <svg {...common}>
        <path d="m8 6-5 6 5 6M16 6l5 6-5 6M14 4l-4 16" />
      </svg>
    );
  }
  if (name === 'globe') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9S14.3 18.5 12 21c-2.3-2.5-3.5-5.5-3.5-9S9.7 5.5 12 3Z" />
      </svg>
    );
  }
  if (name === 'bar-chart') {
    return (
      <svg {...common}>
        <path d="M5 20V10M12 20V4M19 20v-7" />
      </svg>
    );
  }
  if (name === 'target') {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="12" cy="12" r=".8" fill="currentColor" />
        <path d="m14.8 9.2 5-5" />
      </svg>
    );
  }
  if (name === 'brain') {
    return (
      <svg {...common}>
        <path d="M9.5 4.5A3 3 0 0 0 4.8 7a3.2 3.2 0 0 0-.2 5.8A3.5 3.5 0 0 0 9.5 18v-13.5ZM14.5 4.5A3 3 0 0 1 19.2 7a3.2 3.2 0 0 1 .2 5.8 3.5 3.5 0 0 1-4.9 5.2v-13.5Z" />
        <path d="M9.5 8H7.7M14.5 8h1.8M9.5 13H7.8M14.5 13h1.7" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="m12 3 1.5 5.2L19 10l-5.5 1.8L12 17l-1.5-5.2L5 10l5.5-1.8Z" />
      <path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7Z" />
    </svg>
  );
}
