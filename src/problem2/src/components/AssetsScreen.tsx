import { useEffect, useMemo, useRef, useState } from 'react';
import type { AdminChange, Token } from '../types';
import { TokenIcon } from './TokenIcon';
import { TokenSelectorSheet } from './TokenSelectorSheet';
import { formatAmount, formatUsd } from '../utils/format';
import { useWallet } from '../wallet/WalletContext';

interface AssetsScreenProps {
  tokens: Token[];
}

type SortKey = 'value' | 'symbol' | 'amount';
type SortDir = 'asc' | 'desc';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'value', label: 'Value' },
  { key: 'symbol', label: 'Name' },
  { key: 'amount', label: 'Amount' },
];
const SORT_LABEL: Record<SortKey, string> = {
  value: 'Value',
  symbol: 'Name',
  amount: 'Amount',
};

export function AssetsScreen({ tokens }: AssetsScreenProps) {
  const { balances, setBalance, removeToken, recordAdmin } = useWallet();
  const [editing, setEditing] = useState(false);
  const [editOrder, setEditOrder] = useState<string[]>([]);
  const [snapshot, setSnapshot] = useState<Record<string, number>>({});
  const [sortBy, setSortBy] = useState<SortKey>('value');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [sortOpen, setSortOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sortOpen) return;
    function onDown(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node))
        setSortOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [sortOpen]);

  const tokenMap = useMemo(() => {
    const m = new Map<string, Token>();
    for (const t of tokens) m.set(t.symbol, t);
    return m;
  }, [tokens]);

  const holdings = useMemo(() => {
    const rows = Object.entries(balances)
      .map(([symbol, amount]) => {
        const token = tokenMap.get(symbol);
        const price = token?.price ?? 0;
        return { symbol, amount, price, value: amount * price, token };
      })
      .filter((h) => (editing ? true : h.amount > 0));

    if (editing) {
      const index = new Map(editOrder.map((s, i) => [s, i]));
      return rows.sort(
        (a, b) =>
          (index.get(a.symbol) ?? Number.MAX_SAFE_INTEGER) -
          (index.get(b.symbol) ?? Number.MAX_SAFE_INTEGER),
      );
    }
    const base: Record<SortKey, (a: typeof rows[number], b: typeof rows[number]) => number> = {
      value: (a, b) => a.value - b.value,
      amount: (a, b) => a.amount - b.amount,
      symbol: (a, b) => a.symbol.localeCompare(b.symbol),
    };
    const dir = sortDir === 'asc' ? 1 : -1;
    return rows.sort((a, b) => base[sortBy](a, b) * dir);
  }, [balances, tokenMap, editing, editOrder, sortBy, sortDir]);

  const total = holdings.reduce((s, h) => s + h.value, 0);
  const addableTokens = useMemo(
    () => tokens.filter((t) => balances[t.symbol] === undefined),
    [tokens, balances],
  );

  return (
    <div className="flex flex-col w-full animate-[rise_0.4s_ease]">
      {/* Portfolio header */}
      <div className="rounded-2xl bg-surface-container p-space-md shadow-xl mb-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-label-md text-label-md text-on-surface-variant font-medium uppercase tracking-wider">
              Total balance
            </p>
            <p className="font-numeric-display-mobile text-numeric-display-mobile font-semibold text-on-surface mt-1">
              {formatUsd(total)}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {!editing && holdings.length > 1 && (
              <>
                <div className="relative" ref={sortRef}>
                  <button
                    type="button"
                    onClick={() => setSortOpen((o) => !o)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-all font-label-md text-label-md font-semibold"
                  >
                    {SORT_LABEL[sortBy]}
                    <span
                      className={`material-symbols-outlined text-[16px] transition-transform ${
                        sortOpen ? 'rotate-180' : ''
                      }`}
                    >
                      expand_more
                    </span>
                  </button>
                  {sortOpen && (
                    <ul className="absolute right-0 top-[calc(100%+6px)] min-w-[130px] p-1.5 bg-surface-container-high rounded-xl shadow-2xl z-20 animate-[sheet_0.14s_ease]">
                      {SORT_OPTIONS.map((opt) => (
                        <li key={opt.key}>
                          <button
                            type="button"
                            onClick={() => {
                              setSortBy(opt.key);
                              setSortOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg font-label-lg text-label-lg transition-colors ${
                              opt.key === sortBy
                                ? 'bg-primary/20 text-primary font-semibold'
                                : 'text-on-surface hover:bg-surface-bright'
                            }`}
                          >
                            {opt.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  aria-label={sortDir === 'asc' ? 'Ascending' : 'Descending'}
                  onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
                  className="w-10 h-10 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {sortDir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                  </span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                if (!editing) {
                  // Entering edit: freeze order and snapshot balances.
                  setEditOrder(holdings.map((h) => h.symbol));
                  setSnapshot({ ...balances });
                } else {
                  // Leaving edit: diff against the snapshot and log admin changes.
                  recordAdmin(diffBalances(snapshot, balances));
                }
                setEditing((e) => !e);
              }}
              className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all font-label-md text-label-md font-semibold"
            >
              {editing ? 'Done' : 'Edit'}
            </button>
          </div>
        </div>
      </div>

      {/* Holdings */}
      <div className="rounded-2xl bg-surface-container p-2 shadow-xl">
        {holdings.length === 0 && (
          <p className="text-center text-on-surface-variant font-body-md text-body-md py-10 px-4">
            No tokens yet — tap Edit to add some.
          </p>
        )}
        <ul className="space-y-0.5">
          {holdings.map((h) => (
            <li
              key={h.symbol}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-high transition-colors"
            >
              <TokenIcon
                symbol={h.symbol}
                iconUrl={h.token?.iconUrl ?? ''}
                size={38}
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-label-lg text-label-lg text-on-surface font-semibold">
                  {h.symbol}
                </span>
                {editing ? (
                  <input
                    type="text"
                    inputMode="decimal"
                    value={h.amount}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '' || /^\d*\.?\d*$/.test(v))
                        setBalance(h.symbol, v === '' ? 0 : Number(v));
                    }}
                    className="mt-1 w-full max-w-[160px] bg-surface-container-low border border-surface-variant rounded-lg px-2 py-1 font-label-mono text-label-mono text-on-surface outline-none focus:border-primary"
                  />
                ) : (
                  <span className="font-label-mono text-label-mono text-on-surface-variant">
                    {formatAmount(h.amount)}
                  </span>
                )}
              </div>
              {editing ? (
                <button
                  type="button"
                  aria-label={`Remove ${h.symbol}`}
                  onClick={() => removeToken(h.symbol)}
                  className="w-8 h-8 rounded-lg bg-error-container/40 text-error hover:bg-error-container/60 transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    close
                  </span>
                </button>
              ) : (
                <span className="font-label-mono text-label-mono text-on-surface font-semibold shrink-0">
                  {formatUsd(h.value)}
                </span>
              )}
            </li>
          ))}
        </ul>

        {editing && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-surface-variant text-primary hover:bg-surface-container-high transition-colors font-label-lg text-label-lg font-semibold"
          >
            <span className="material-symbols-outlined text-[18px]">
              add_circle
            </span>
            Add token
          </button>
        )}
      </div>

      {adding && (
        <TokenSelectorSheet
          tokens={addableTokens}
          onSelect={(t) => {
            setBalance(t.symbol, 0);
            setEditOrder((o) => [...o, t.symbol]);
            setAdding(false);
          }}
          onClose={() => setAdding(false)}
        />
      )}
    </div>
  );
}

/** Compare a before/after balance map and produce admin change entries. */
function diffBalances(
  before: Record<string, number>,
  after: Record<string, number>,
): AdminChange[] {
  const changes: AdminChange[] = [];
  const symbols = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const symbol of symbols) {
    const prev = before[symbol];
    const next = after[symbol];
    const existedBefore = prev !== undefined;
    const existsNow = next !== undefined;

    if (existedBefore && !existsNow) {
      changes.push({ action: 'remove', symbol, amount: 0, previousAmount: prev });
    } else if (!existedBefore && existsNow) {
      changes.push({ action: 'add', symbol, amount: next, previousAmount: 0 });
    } else if (existedBefore && existsNow && prev !== next) {
      changes.push({ action: 'set', symbol, amount: next, previousAmount: prev });
    }
  }

  return changes;
}
