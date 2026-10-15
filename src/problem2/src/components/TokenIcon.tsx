import { useState } from 'react';

interface TokenIconProps {
  symbol: string;
  iconUrl: string;
  size?: number;
}

/**
 * Renders a token's SVG icon from the Switcheo token-icons repo, falling back
 * to a coloured monogram chip when the image is missing.
 */
export function TokenIcon({ symbol, iconUrl, size = 28 }: TokenIconProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !iconUrl) {
    return (
      <span
        className="rounded-full inline-grid place-items-center text-white font-bold leading-none shrink-0"
        style={{
          width: size,
          height: size,
          background: colorFor(symbol),
          fontSize: size * 0.4,
        }}
        aria-hidden
      >
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    );
  }

  return (
    <img
      className="rounded-full object-contain shrink-0 bg-surface-container-high"
      src={iconUrl}
      alt={symbol}
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/** Deterministic pleasant colour derived from the symbol. */
function colorFor(symbol: string): string {
  let hash = 0;
  for (let i = 0; i < symbol.length; i++) {
    hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 60%, 50%)`;
}
