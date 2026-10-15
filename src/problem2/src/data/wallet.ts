/**
 * Initial mock wallet holdings.
 *
 * There is no real backend / wallet connection in this challenge, so we seed a
 * demo wallet. Balances live in React state (see WalletContext) and change as
 * the user swaps or edits their holdings.
 */
export const INITIAL_BALANCES: Record<string, number> = {
  ETH: 4.2,
  USDC: 12500,
  USDT: 8300,
  ATOM: 240,
  OSMO: 1800,
  SWTH: 95000,
};
