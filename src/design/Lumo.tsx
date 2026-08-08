import type { CSSProperties } from 'react';

/** Lumo mengikuti maskot kucing amber pada mockup docs/sample. */
export function Lumo({
  size = 64,
  title,
  style,
}: {
  size?: number;
  ekspresi?: 'senang' | 'berpikir' | 'intip';
  title?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      src="/assets/lumera_logo.png"
      alt={title || 'Lumo, maskot Lumera'}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
