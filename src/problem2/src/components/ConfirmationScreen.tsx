import { useState } from 'react';
import type { SwapReceipt } from '../types';
import { TokenIcon } from './TokenIcon';
import { formatAmount, formatUsd, shortHash } from '../utils/format';

interface ConfirmationScreenProps {
  receipt: SwapReceipt;
  onDone: () => void;
}

export function ConfirmationScreen({ receipt, onDone }: ConfirmationScreenProps) {
  const [copied, setCopied] = useState(false);

  const when = new Date(receipt.timestamp);
  const timeLabel = when.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="flex flex-col w-full pb-space-xl animate-[rise_0.4s_ease]">
      {/* Success badge */}
      <div className="relative w-full flex flex-col items-center pt-space-md pb-space-lg overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full bg-primary/20 animate-ping opacity-60" />
          <div className="absolute w-28 h-28 rounded-full bg-primary/10 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center shadow-xl shadow-primary/20">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary-container via-primary to-primary-fixed flex items-center justify-center">
              <span
                className="material-symbols-outlined text-on-primary text-[38px]"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
              >
                check
              </span>
            </div>
          </div>
        </div>
        <div className="relative z-10 text-center mt-space-md px-space-md">
          <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
            Transaction Confirmed
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Settled at live market rate
          </p>
        </div>
      </div>

      {/* Flow card */}
      <div className="w-full bg-surface-container rounded-xl p-space-md shadow-md mb-space-md relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-space-sm pt-space-xs pb-space-sm">
          <AssetWell
            label="Sold"
            symbol={receipt.from.symbol}
            iconUrl={receipt.from.iconUrl}
            amount={receipt.amountIn}
            usd={receipt.usdValue}
          />
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-high text-primary shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </div>
          <AssetWell
            label="Received"
            symbol={receipt.to.symbol}
            iconUrl={receipt.to.iconUrl}
            amount={receipt.amountOut}
            usd={receipt.amountOut * receipt.to.price}
            highlight
          />
        </div>
        <div className="mt-space-sm flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm bg-surface-container-lowest/40 rounded px-space-sm py-1">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            Just now
          </span>
          <span className="font-label-mono text-body-sm">{timeLabel}</span>
        </div>
      </div>

      {/* Telemetry */}
      <div className="w-full bg-surface-container rounded-xl p-space-md shadow-md space-y-space-sm mb-space-lg">
        <DetailRow label="Execution Status">
          <span className="flex items-center gap-1.5 bg-primary/10 px-2.5 py-0.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-label-md text-label-md text-primary font-medium">
              Completed
            </span>
          </span>
        </DetailRow>
        <div className="w-full h-px bg-surface-variant" />
        <DetailRow label="Conversion Rate">
          <span className="font-label-mono text-label-mono text-on-surface">
            1 {receipt.from.symbol} = {formatAmount(receipt.rate)}{' '}
            {receipt.to.symbol}
          </span>
        </DetailRow>
        <DetailRow label="Network Fee">
          <span className="font-label-mono text-label-mono text-on-surface">
            {formatUsd(receipt.networkFeeUsd)}
          </span>
        </DetailRow>
        <DetailRow label="Price Impact">
          <span className="font-label-mono text-label-mono text-primary font-medium flex items-center gap-1">
            &lt; 0.01%
            <span className="material-symbols-outlined text-[14px]">verified</span>
          </span>
        </DetailRow>
        <div className="w-full h-px bg-surface-variant" />
        <DetailRow label="Tx Hash">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(receipt.txHash);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="flex items-center gap-1 bg-surface-container-high hover:bg-surface-bright px-2 py-1 rounded transition-colors active:scale-95"
          >
            <span
              className={`font-label-mono text-label-mono ${
                copied ? 'text-primary' : 'text-on-surface'
              }`}
            >
              {shortHash(receipt.txHash)}
            </span>
            <span className="material-symbols-outlined text-[15px] text-outline">
              {copied ? 'check' : 'content_copy'}
            </span>
          </button>
        </DetailRow>
      </div>

      {/* Actions */}
      <div className="w-full flex flex-col gap-space-sm">
        <button
          type="button"
          onClick={onDone}
          className="w-full h-[52px] rounded-xl bg-primary hover:bg-primary-container text-on-primary font-headline-md text-body-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.99] transition-all"
        >
          <span>Done</span>
          <span className="material-symbols-outlined text-[20px]">
            check_circle
          </span>
        </button>
      </div>
    </div>
  );
}

function AssetWell({
  label,
  symbol,
  iconUrl,
  amount,
  usd,
  highlight,
}: {
  label: string;
  symbol: string;
  iconUrl: string;
  amount: number;
  usd: number;
  highlight?: boolean;
}) {
  return (
    <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col items-start min-w-0">
      <div className="flex items-center gap-1.5 mb-1 w-full min-w-0">
        <TokenIcon symbol={symbol} iconUrl={iconUrl} size={22} />
        <span
          className={`font-label-md text-label-md font-medium ${
            highlight ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          {label}
        </span>
      </div>
      <p
        className={`font-headline-lg-mobile text-headline-lg-mobile truncate w-full font-semibold ${
          highlight ? 'text-primary' : 'text-on-surface'
        }`}
      >
        {formatAmount(amount)}{' '}
        <span className="font-label-md text-label-md font-normal">{symbol}</span>
      </p>
      <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
        ≈ {formatUsd(usd)}
      </span>
    </div>
  );
}

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between min-w-0">
      <span className="font-body-md text-body-md text-on-surface-variant">
        {label}
      </span>
      {children}
    </div>
  );
}
