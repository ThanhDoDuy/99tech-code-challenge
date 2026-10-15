import { useMemo, useState } from 'react';
import type { HistoryEntry, SwapReceipt, Token } from '../types';
import { TokenIcon } from './TokenIcon';
import { ConfirmationScreen } from './ConfirmationScreen';
import { formatAmount, formatUsd } from '../utils/format';
import { useWallet } from '../wallet/WalletContext';

interface HistoryScreenProps {
  tokens: Token[];
}

export function HistoryScreen({ tokens }: HistoryScreenProps) {
  const { history } = useWallet();
  const [detail, setDetail] = useState<SwapReceipt | null>(null);

  const tokenMap = useMemo(() => {
    const m = new Map<string, Token>();
    for (const t of tokens) m.set(t.symbol, t);
    return m;
  }, [tokens]);

  // Already newest-first, but guard against stored ordering.
  const entries = useMemo(
    () => [...history].sort((a, b) => b.timestamp - a.timestamp),
    [history],
  );

  if (detail) {
    return (
      <ConfirmationScreen receipt={detail} onDone={() => setDetail(null)} />
    );
  }

  return (
    <div className="flex flex-col w-full animate-[rise_0.4s_ease]">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex flex-col">
          <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
            Activity
          </span>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Swaps and admin adjustments
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-surface-container p-2 shadow-xl">
        {entries.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-on-surface-variant">
            <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[26px]">
                receipt_long
              </span>
            </div>
            <p className="font-body-md text-body-md">No activity yet.</p>
            <p className="font-body-sm text-body-sm">
              Your swaps and wallet edits will show up here.
            </p>
          </div>
        )}

        <ul className="space-y-0.5">
          {entries.map((entry) =>
            entry.type === 'swap' ? (
              <SwapRow
                key={entry.id}
                entry={entry}
                onClick={() => setDetail(entry.receipt)}
              />
            ) : (
              <AdminRow key={entry.id} entry={entry} tokenMap={tokenMap} />
            ),
          )}
        </ul>
      </div>
    </div>
  );
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function SwapRow({
  entry,
  onClick,
}: {
  entry: Extract<HistoryEntry, { type: 'swap' }>;
  onClick: () => void;
}) {
  const { receipt } = entry;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-high active:scale-[0.99] transition-all text-left"
      >
        {/* Paired token icons */}
        <div className="relative shrink-0 w-[46px] h-9">
          <div className="absolute left-0 top-0">
            <TokenIcon
              symbol={receipt.from.symbol}
              iconUrl={receipt.from.iconUrl}
              size={28}
            />
          </div>
          <div className="absolute right-0 bottom-0 ring-2 ring-surface-container rounded-full">
            <TokenIcon
              symbol={receipt.to.symbol}
              iconUrl={receipt.to.iconUrl}
              size={28}
            />
          </div>
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
            Swap {receipt.from.symbol} → {receipt.to.symbol}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {timeAgo(receipt.timestamp)}
          </span>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-label-mono text-label-mono text-primary font-semibold">
            +{formatAmount(receipt.amountOut)} {receipt.to.symbol}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            −{formatAmount(receipt.amountIn)} {receipt.from.symbol}
          </span>
        </div>
      </button>
    </li>
  );
}

function AdminRow({
  entry,
  tokenMap,
}: {
  entry: Extract<HistoryEntry, { type: 'admin' }>;
  tokenMap: Map<string, Token>;
}) {
  const token = tokenMap.get(entry.symbol);
  const title =
    entry.action === 'add'
      ? `Added ${entry.symbol}`
      : entry.action === 'remove'
        ? `Removed ${entry.symbol}`
        : `Adjusted ${entry.symbol}`;

  const right =
    entry.action === 'remove'
      ? 'Removed'
      : `${formatAmount(entry.amount)} ${entry.symbol}`;

  return (
    <li className="flex items-center gap-3 p-3 rounded-xl">
      <div className="relative shrink-0">
        <TokenIcon
          symbol={entry.symbol}
          iconUrl={token?.iconUrl ?? ''}
          size={36}
        />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-secondary-container flex items-center justify-center ring-2 ring-surface-container">
          <span className="material-symbols-outlined text-secondary text-[10px]">
            manage_accounts
          </span>
        </div>
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="font-label-lg text-label-lg text-on-surface font-semibold truncate">
          {title}
        </span>
        <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
          <span className="text-secondary font-medium">Admin</span>·{' '}
          {timeAgo(entry.timestamp)}
        </span>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span
          className={`font-label-mono text-label-mono font-semibold ${
            entry.action === 'remove' ? 'text-error' : 'text-on-surface'
          }`}
        >
          {right}
        </span>
        {entry.action === 'set' && (
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            was {formatAmount(entry.previousAmount)}
          </span>
        )}
        {entry.action === 'add' && token && (
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {formatUsd(entry.amount * token.price)}
          </span>
        )}
      </div>
    </li>
  );
}
