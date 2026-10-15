// Pure logic extracted from the refactored WalletPage, so it can be unit
// tested without React / the host app's hooks and components.
// This mirrors the filter → sort → format pipeline in WalletPage.tsx.

export const BLOCKCHAIN_PRIORITY = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};
export const DEFAULT_PRIORITY = -99;

export const getPriority = (blockchain) =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;

/**
 * Filter to known-chain, positive balances, sort by priority (desc), and add a
 * formatted string. Returns plain data (no JSX) so it is easy to assert on.
 */
export const selectFormattedBalances = (balances) =>
  balances
    .filter(
      (b) => getPriority(b.blockchain) > DEFAULT_PRIORITY && b.amount > 0,
    )
    .sort((lhs, rhs) => getPriority(rhs.blockchain) - getPriority(lhs.blockchain))
    .map((b) => ({ ...b, formatted: b.amount.toFixed(2) }));

/** USD value for a balance given a prices map, guarding missing prices. */
export const usdValueOf = (balance, prices) =>
  (prices[balance.currency] ?? 0) * balance.amount;
