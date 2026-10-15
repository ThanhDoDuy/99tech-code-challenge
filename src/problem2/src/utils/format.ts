/** Format a number as a trimmed, locale-aware token amount. */
export function formatAmount(value: number, maxDecimals = 6): string {
  if (!Number.isFinite(value)) return '0';
  return value.toLocaleString('en-US', {
    maximumFractionDigits: maxDecimals,
  });
}

/** Format a USD value. */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return '$0.00';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value < 1 && value > 0 ? 6 : 2,
  });
}

/** Short pseudo transaction hash for the mock confirmation. */
export function shortHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

/** Generate a random-looking 0x hash (mock). */
export function mockTxHash(): string {
  const hex = '0123456789abcdef';
  let out = '0x';
  for (let i = 0; i < 40; i++) out += hex[Math.floor(Math.random() * 16)];
  return out;
}
