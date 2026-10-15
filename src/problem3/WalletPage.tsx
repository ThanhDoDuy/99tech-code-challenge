// Refactored version of the messy WalletPage. See README.md for the rationale.
//
// Assumes these exist in the host app (as in the original snippet):
//   - React, useMemo
//   - BoxProps, WalletRow, classes
//   - useWalletBalances(), usePrices()
import React, { useMemo } from 'react';

/** The blockchains we know how to prioritise. */
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  // (3) `blockchain` is actually used, so it must be on the type — and typed,
  // not `any`.
  blockchain: Blockchain;
}

// (5) A formatted balance is just a balance plus the display string.
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

// (14) An empty interface that only extends BoxProps adds nothing.
type Props = BoxProps;

// (10, 11) Pure, data-only helper → module scope (not re-created each render),
// and a lookup table instead of a switch (clearer, O(1)).
const BLOCKCHAIN_PRIORITY: Record<Blockchain, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};
const DEFAULT_PRIORITY = -99;

const getPriority = (blockchain: Blockchain): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;

const WalletPage: React.FC<Props> = (props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  const sortedBalances = useMemo(() => {
    return (
      balances
        // (1) `balancePriority`, not the undefined `lhsPriority`.
        // (2) Keep balances with a known chain AND a positive amount.
        .filter(
          (balance) =>
            getPriority(balance.blockchain) > DEFAULT_PRIORITY &&
            balance.amount > 0,
        )
        // (4) Comparator returns a number in every case (equal → 0).
        // (9) Subtracting priorities is concise and total.
        .sort(
          (lhs, rhs) =>
            getPriority(rhs.blockchain) - getPriority(lhs.blockchain),
        )
    );
    // (6) `prices` is not used here — don't depend on it.
  }, [balances]);

  // (7) Memoized, and (5) this is the array the rows actually use.
  const formattedBalances = useMemo<FormattedWalletBalance[]>(
    () =>
      sortedBalances.map((balance) => ({
        ...balance,
        // (12) Be explicit about decimals.
        formatted: balance.amount.toFixed(2),
      })),
    [sortedBalances],
  );

  // (7) Memoized; depends on the formatted data and prices.
  const rows = useMemo(
    () =>
      formattedBalances.map((balance) => {
        // (13) Guard against a missing price.
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
        return (
          <WalletRow
            className={classes.row}
            // (8) Stable key instead of the array index.
            key={balance.currency}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.formatted}
          />
        );
      }),
    [formattedBalances, prices],
  );

  return (
    <div {...rest}>
      {rows}
      {children}
    </div>
  );
};

export default WalletPage;
