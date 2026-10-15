import type { PriceRecord, Token } from '../types';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';
const ICON_BASE =
  'https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens';

/** URL of the SVG icon for a token symbol. */
export function iconUrl(symbol: string): string {
  return `${ICON_BASE}/${symbol.toUpperCase()}.svg`;
}

/**
 * Fetch live prices and reduce them to a list of swappable tokens.
 *
 * - Tokens without a price are omitted (per the task requirements).
 * - When a currency appears multiple times, the most recent record wins.
 * - The result is sorted alphabetically for a predictable picker order.
 */
export async function fetchTokens(): Promise<Token[]> {
  const res = await fetch(PRICES_URL);
  if (!res.ok) {
    throw new Error(`Failed to load prices (${res.status})`);
  }

  const records: PriceRecord[] = await res.json();

  const latestBySymbol = new Map<string, PriceRecord>();
  for (const record of records) {
    if (!record.price || record.price <= 0) continue; // omit priceless tokens

    const existing = latestBySymbol.get(record.currency);
    if (!existing || new Date(record.date) > new Date(existing.date)) {
      latestBySymbol.set(record.currency, record);
    }
  }

  return Array.from(latestBySymbol.values())
    .map((record) => ({
      symbol: record.currency,
      price: record.price,
      iconUrl: iconUrl(record.currency),
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}
