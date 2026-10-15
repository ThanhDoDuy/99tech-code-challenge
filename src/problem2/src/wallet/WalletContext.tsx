import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AdminChange, HistoryEntry, SwapReceipt } from '../types';
import { INITIAL_BALANCES } from '../data/wallet';

interface WalletContextValue {
  /** Current holdings keyed by token symbol. */
  balances: Record<string, number>;
  /** Balance for a single symbol (0 when not held). */
  balanceOf: (symbol: string) => number;
  /** Set (or clear) the balance of a token. */
  setBalance: (symbol: string, amount: number) => void;
  /** Remove a token from the wallet entirely. */
  removeToken: (symbol: string) => void;
  /** Move value from one token to another after a swap. */
  applySwap: (
    from: string,
    to: string,
    amountIn: number,
    amountOut: number,
  ) => void;
  /** Activity history, newest first. */
  history: HistoryEntry[];
  /** Append a completed swap to history. */
  recordSwap: (receipt: SwapReceipt) => void;
  /** Append one or more admin (manual edit) adjustments to history. */
  recordAdmin: (changes: AdminChange[]) => void;
}

const WalletContext = createContext<WalletContextValue | null>(null);

const BAL_KEY = 'swap.balances';
const HIST_KEY = 'swap.history';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function newId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [balances, setBalances] = useState<Record<string, number>>(() =>
    load(BAL_KEY, { ...INITIAL_BALANCES }),
  );
  const [history, setHistory] = useState<HistoryEntry[]>(() =>
    load<HistoryEntry[]>(HIST_KEY, []),
  );

  // Persist to localStorage so the wallet & history survive reloads.
  useEffect(() => {
    try {
      localStorage.setItem(BAL_KEY, JSON.stringify(balances));
    } catch {
      /* ignore quota / private-mode errors */
    }
  }, [balances]);

  useEffect(() => {
    try {
      localStorage.setItem(HIST_KEY, JSON.stringify(history));
    } catch {
      /* ignore */
    }
  }, [history]);

  const balanceOf = useCallback(
    (symbol: string) => balances[symbol] ?? 0,
    [balances],
  );

  const setBalance = useCallback((symbol: string, amount: number) => {
    setBalances((prev) => ({ ...prev, [symbol]: Math.max(0, amount) }));
  }, []);

  const removeToken = useCallback((symbol: string) => {
    setBalances((prev) => {
      const next = { ...prev };
      delete next[symbol];
      return next;
    });
  }, []);

  const applySwap = useCallback(
    (from: string, to: string, amountIn: number, amountOut: number) => {
      setBalances((prev) => {
        const next = { ...prev };
        next[from] = Math.max(0, (next[from] ?? 0) - amountIn);
        next[to] = (next[to] ?? 0) + amountOut;
        return next;
      });
    },
    [],
  );

  const recordSwap = useCallback((receipt: SwapReceipt) => {
    setHistory((prev) => [
      { id: newId(), type: 'swap', timestamp: receipt.timestamp, receipt },
      ...prev,
    ]);
  }, []);

  const recordAdmin = useCallback((changes: AdminChange[]) => {
    if (changes.length === 0) return;
    const now = Date.now();
    setHistory((prev) => [
      ...changes.map((c) => ({
        id: newId(),
        type: 'admin' as const,
        timestamp: now,
        ...c,
      })),
      ...prev,
    ]);
  }, []);

  const value = useMemo(
    () => ({
      balances,
      balanceOf,
      setBalance,
      removeToken,
      applySwap,
      history,
      recordSwap,
      recordAdmin,
    }),
    [
      balances,
      balanceOf,
      setBalance,
      removeToken,
      applySwap,
      history,
      recordSwap,
      recordAdmin,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within a WalletProvider');
  return ctx;
}
