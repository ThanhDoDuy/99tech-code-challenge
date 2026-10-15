/** A single price record as returned by the Switcheo prices endpoint. */
export interface PriceRecord {
  currency: string;
  date: string;
  price: number;
}

/** A token that has a known price and can be swapped. */
export interface Token {
  /** Symbol, e.g. "ETH". Used as the unique id. */
  symbol: string;
  /** USD price per unit. */
  price: number;
  /** URL to the token's SVG icon. */
  iconUrl: string;
}

/** Record of a completed swap, shown on the confirmation screen. */
export interface SwapReceipt {
  from: Token;
  to: Token;
  amountIn: number;
  amountOut: number;
  rate: number;
  usdValue: number;
  networkFeeUsd: number;
  timestamp: number;
  txHash: string;
}

/** A manual wallet edit (treated as an "admin" adjustment in history). */
export interface AdminChange {
  action: 'add' | 'remove' | 'set';
  symbol: string;
  /** Resulting balance (0 for remove). */
  amount: number;
  /** Balance before the change. */
  previousAmount: number;
}

/** An entry in the activity history: either a swap or an admin adjustment. */
export type HistoryEntry =
  | { id: string; type: 'swap'; timestamp: number; receipt: SwapReceipt }
  | ({ id: string; type: 'admin'; timestamp: number } & AdminChange);
