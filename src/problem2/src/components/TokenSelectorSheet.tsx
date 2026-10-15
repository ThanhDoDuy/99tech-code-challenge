import { useEffect, useMemo, useRef, useState } from 'react';
import type { Token } from '../types';
import { TokenIcon } from './TokenIcon';
import { formatAmount, formatUsd } from '../utils/format';
import { useWallet } from '../wallet/WalletContext';

interface TokenSelectorSheetProps {
  tokens: Token[];
  /** Symbol selected on the opposite side (disabled). */
  excludeSymbol?: string;
  onSelect: (token: Token) => void;
  onClose: () => void;
}

const QUICK = ['ETH', 'USDC', 'USDT', 'WBTC', 'ATOM', 'SWTH'];

/** Full-screen bottom-sheet token picker (real tokens + wallet balances). */
export function TokenSelectorSheet({
  tokens,
  excludeSymbol,
  onSelect,
  onClose,
}: TokenSelectorSheetProps) {
  const { balanceOf } = useWallet();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q
      ? tokens.filter((t) => t.symbol.toLowerCase().includes(q))
      : tokens;
    // Sort: held tokens first (by USD value), then the rest alphabetically.
    return [...list].sort((a, b) => {
      const va = balanceOf(a.symbol) * a.price;
      const vb = balanceOf(b.symbol) * b.price;
      if (vb !== va) return vb - va;
      return a.symbol.localeCompare(b.symbol);
    });
  }, [tokens, query, balanceOf]);

  const quickTokens = QUICK.map((s) => tokens.find((t) => t.symbol === s)).filter(
    (t): t is Token => Boolean(t),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-surface-container-lowest/80 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-[480px] bg-surface-container rounded-t-[28px] sm:rounded-[24px] shadow-[0_-12px_40px_rgba(0,0,0,0.6)] overflow-hidden animate-[sheet_0.25s_ease] max-h-[88vh] flex flex-col">
        {/* Pull handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-surface-variant" />
        </div>

        {/* Header */}
        <div className="px-space-md py-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              Select a token
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-md text-body-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mr-1 animate-pulse" />
              Live
            </span>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-container-high hover:bg-surface-bright active:scale-95 text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-space-md pb-space-sm">
          <div className="relative flex items-center w-full rounded-xl bg-surface-container-low focus-within:bg-surface-container-lowest focus-within:shadow-[0_0_0_2px] focus-within:shadow-primary/30 transition-all">
            <span className="material-symbols-outlined text-[20px] text-outline ml-3.5 pointer-events-none">
              search
            </span>
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="Search token symbol"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-3 text-on-surface placeholder:text-outline font-body-md text-body-md outline-none"
            />
            {query && (
              <button
                type="button"
                aria-label="Clear"
                onClick={() => setQuery('')}
                className="pr-3 text-outline hover:text-on-surface active:scale-90 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  cancel
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Quick chips */}
        <div className="pb-space-sm">
          <div className="flex items-center gap-space-xs px-space-md overflow-x-auto no-scrollbar">
            {quickTokens.map((t) => (
              <button
                key={t.symbol}
                type="button"
                disabled={t.symbol === excludeSymbol}
                onClick={() => onSelect(t)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container-high hover:bg-surface-bright active:scale-95 transition-all shrink-0 disabled:opacity-35 disabled:cursor-not-allowed"
              >
                <TokenIcon symbol={t.symbol} iconUrl={t.iconUrl} size={20} />
                <span className="font-label-lg text-label-lg text-on-surface">
                  {t.symbol}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Column header */}
        <div className="px-space-md py-2 flex items-center justify-between text-outline">
          <span className="font-label-md text-label-md uppercase tracking-wider">
            Token
          </span>
          <span className="font-label-md text-label-md uppercase tracking-wider">
            Your balance
          </span>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-space-sm pb-space-md space-y-1">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center mb-2 text-outline">
                <span className="material-symbols-outlined text-[24px]">
                  search_off
                </span>
              </div>
              <p className="font-label-lg text-label-lg text-on-surface">
                No tokens found
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Try a different symbol.
              </p>
            </div>
          )}

          {filtered.map((t) => {
            const bal = balanceOf(t.symbol);
            const disabled = t.symbol === excludeSymbol;
            return (
              <button
                key={t.symbol}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(t)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-surface-container-high active:scale-[0.99] transition-all disabled:opacity-35 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <TokenIcon symbol={t.symbol} iconUrl={t.iconUrl} size={34} />
                  <div className="flex flex-col min-w-0 items-start">
                    <span className="font-label-lg text-label-lg text-on-surface truncate">
                      {t.symbol}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {formatUsd(t.price)}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span
                    className={`font-label-mono text-label-mono font-semibold tracking-tight ${
                      bal > 0 ? 'text-on-surface' : 'text-outline'
                    }`}
                  >
                    {formatAmount(bal)} {t.symbol}
                  </span>
                  <span
                    className={`font-body-sm text-body-sm ${
                      bal > 0 ? 'text-on-surface-variant' : 'text-outline'
                    }`}
                  >
                    {formatUsd(bal * t.price)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
