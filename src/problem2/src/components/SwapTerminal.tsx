import { useEffect, useMemo, useState } from 'react';
import type { SwapReceipt, Token } from '../types';
import { TokenIcon } from './TokenIcon';
import { TokenSelectorSheet } from './TokenSelectorSheet';
import { formatAmount, formatUsd, mockTxHash } from '../utils/format';
import { useWallet } from '../wallet/WalletContext';

interface SwapTerminalProps {
  tokens: Token[];
  loading: boolean;
  error: string | null;
  onComplete: (receipt: SwapReceipt) => void;
}

type SubmitState = 'idle' | 'loading' | 'success';

const SLIPPAGE = 0.005; // 0.5%
const NETWORK_FEE_USD = 2.15;

export function SwapTerminal({
  tokens,
  loading,
  error,
  onComplete,
}: SwapTerminalProps) {
  const { balanceOf, applySwap, recordSwap } = useWallet();

  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [amount, setAmount] = useState('');
  const [touched, setTouched] = useState(false);
  const [submit, setSubmit] = useState<SubmitState>('idle');
  const [picking, setPicking] = useState<'from' | 'to' | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (tokens.length === 0) return;
    setFromToken((p) => p ?? tokens.find((t) => t.symbol === 'ETH') ?? tokens[0]);
    setToToken(
      (p) => p ?? tokens.find((t) => t.symbol === 'USDC') ?? tokens[1] ?? tokens[0],
    );
  }, [tokens]);

  const amountNumber = Number(amount);
  const rate = fromToken && toToken ? fromToken.price / toToken.price : 0;
  const receiveAmount =
    rate * (Number.isFinite(amountNumber) ? amountNumber : 0);
  const fromBalance = fromToken ? balanceOf(fromToken.symbol) : 0;
  const toBalance = toToken ? balanceOf(toToken.symbol) : 0;
  const payUsd = fromToken ? amountNumber * fromToken.price : 0;
  const receiveUsd = toToken ? receiveAmount * toToken.price : 0;
  const minReceived = receiveAmount * (1 - SLIPPAGE);

  const validationError = useMemo(() => {
    if (!amount.trim()) return 'Enter an amount';
    if (Number.isNaN(amountNumber)) return 'Enter a valid number';
    if (amountNumber <= 0) return 'Amount must be greater than 0';
    if (fromToken && toToken && fromToken.symbol === toToken.symbol)
      return 'Select two different tokens';
    if (amountNumber > fromBalance)
      return `Insufficient ${fromToken?.symbol ?? ''} balance`;
    return null;
  }, [amount, amountNumber, fromToken, toToken, fromBalance]);

  function switchDirection() {
    setFromToken(toToken);
    setToToken(fromToken);
  }

  function pickToken(token: Token) {
    if (picking === 'from') {
      if (token.symbol === toToken?.symbol) setToToken(fromToken);
      setFromToken(token);
    } else if (picking === 'to') {
      if (token.symbol === fromToken?.symbol) setFromToken(toToken);
      setToToken(token);
    }
    setPicking(null);
  }

  async function handleSwap() {
    setTouched(true);
    if (validationError || !fromToken || !toToken) return;

    setSubmit('loading');
    await new Promise((r) => setTimeout(r, 1600));

    applySwap(fromToken.symbol, toToken.symbol, amountNumber, receiveAmount);

    const receipt: SwapReceipt = {
      from: fromToken,
      to: toToken,
      amountIn: amountNumber,
      amountOut: receiveAmount,
      rate,
      usdValue: payUsd,
      networkFeeUsd: NETWORK_FEE_USD,
      timestamp: Date.now(),
      txHash: mockTxHash(),
    };

    recordSwap(receipt);

    setSubmit('success');
    setAmount('');
    setTouched(false);
    setTimeout(() => {
      setSubmit('idle');
      onComplete(receipt);
    }, 500);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-on-surface-variant">
        <span className="material-symbols-outlined text-[36px] text-primary animate-spin">
          progress_activity
        </span>
        <p className="font-body-md text-body-md">Loading live market prices…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center px-6">
        <span className="material-symbols-outlined text-[36px] text-error">
          error
        </span>
        <p className="font-body-md text-body-md text-error">{error}</p>
      </div>
    );
  }

  const showError = touched && validationError;

  // State-aware CTA.
  let ctaLabel = 'Swap Tokens';
  let ctaIcon = 'bolt';
  let ctaDisabled = false;
  let ctaClass =
    'bg-primary-container text-on-primary-container shadow-lg shadow-primary-container/20 hover:brightness-110 active:scale-[0.98]';
  if (submit === 'loading') {
    ctaLabel = 'Fetching optimal route…';
    ctaIcon = 'progress_activity';
    ctaDisabled = true;
    ctaClass = 'bg-surface-container-high text-on-surface-variant cursor-wait';
  } else if (submit === 'success') {
    ctaLabel = 'Transaction broadcasted!';
    ctaIcon = 'done_all';
    ctaClass = 'bg-primary-container text-on-primary-container';
  } else if (touched && validationError) {
    ctaLabel = validationError;
    ctaIcon = 'error';
    ctaDisabled = true;
    ctaClass = 'bg-surface-container-high text-error cursor-not-allowed';
  }

  return (
    <>
      {/* Meta bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
              Swap Tokens
            </span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-label-md text-label-md text-primary font-medium">
                Live rates
              </span>
            </div>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Best price across market pools
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="relative w-full rounded-2xl bg-surface-container p-3 sm:p-4 shadow-xl">
        {/* You pay */}
        <div className="rounded-xl bg-surface-container-low p-3.5 transition-colors focus-within:bg-surface-container-high">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="font-label-md text-label-md text-on-surface-variant font-medium">
              You pay
            </span>
            {fromToken && (
              <div className="flex items-center gap-1.5">
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Balance:{' '}
                  <span className="font-label-mono text-label-mono font-medium text-on-surface">
                    {formatAmount(fromBalance)}
                  </span>{' '}
                  {fromToken.symbol}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAmount(String(fromBalance));
                    setTouched(true);
                  }}
                  className="px-1.5 py-0.5 rounded bg-primary-container/20 hover:bg-primary-container/30 active:scale-95 transition-all text-primary font-label-md text-label-md font-semibold tracking-wider"
                >
                  MAX
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              inputMode="decimal"
              placeholder="0.0"
              value={amount}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '' || /^\d*\.?\d*$/.test(v)) setAmount(v);
              }}
              onBlur={() => setTouched(true)}
              autoComplete="off"
              className="flex-1 min-w-0 bg-transparent font-numeric-display-mobile text-numeric-display-mobile sm:font-numeric-display sm:text-numeric-display font-semibold text-on-surface placeholder:text-outline focus:outline-none tracking-tight"
            />
            <TokenPill token={fromToken} onClick={() => setPicking('from')} />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1">
            <span className="font-label-mono text-label-mono text-on-surface-variant">
              ≈ {formatUsd(payUsd)}
            </span>
          </div>
        </div>

        {/* Switch */}
        <div className="relative flex justify-center -my-2.5 z-10 pointer-events-none">
          <button
            type="button"
            aria-label="Switch tokens"
            onClick={switchDirection}
            className="pointer-events-auto w-10 h-10 rounded-xl bg-surface-container-high hover:bg-surface-bright active:scale-90 transition-all flex items-center justify-center text-primary shadow-lg group"
          >
            <span className="material-symbols-outlined text-[20px] transition-transform duration-300 group-hover:rotate-180">
              swap_vert
            </span>
          </button>
        </div>

        {/* You receive */}
        <div className="rounded-xl bg-surface-container-low p-3.5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                You receive (est.)
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-primary/80" />
            </div>
            {toToken && (
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Balance:{' '}
                <span className="font-label-mono text-label-mono font-medium text-on-surface">
                  {formatAmount(toBalance)}
                </span>{' '}
                {toToken.symbol}
              </span>
            )}
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="flex-1 min-w-0 truncate font-numeric-display-mobile text-numeric-display-mobile sm:font-numeric-display sm:text-numeric-display font-semibold text-on-surface tracking-tight">
              {receiveAmount > 0 ? formatAmount(receiveAmount) : '0.0'}
            </span>
            <TokenPill token={toToken} onClick={() => setPicking('to')} />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1">
            <span className="font-label-mono text-label-mono text-on-surface-variant">
              ≈ {formatUsd(receiveUsd)}
            </span>
          </div>
        </div>

        {/* Details accordion */}
        {fromToken && toToken && (
          <div className="mt-3 rounded-xl bg-surface-container-low overflow-hidden">
            <button
              type="button"
              onClick={() => setDetailsOpen((o) => !o)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-left hover:bg-surface-container transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  sync_alt
                </span>
                <span className="font-label-mono text-label-mono text-on-surface font-medium">
                  1 {fromToken.symbol} = {formatAmount(rate)} {toToken.symbol}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="font-label-md text-label-md font-medium flex items-center gap-1 text-primary">
                  <span className="material-symbols-outlined text-[15px]">
                    local_gas_station
                  </span>
                  {formatUsd(NETWORK_FEE_USD)}
                </span>
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
                    detailsOpen ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </div>
            </button>
            {detailsOpen && (
              <div className="px-3.5 pb-3 pt-1 space-y-2 font-body-sm text-body-sm">
                <div className="h-px w-full bg-surface-container-high my-1" />
                <Row label="Network Fee">
                  ~{formatUsd(NETWORK_FEE_USD)}{' '}
                  <span className="text-outline">(12 Gwei)</span>
                </Row>
                <Row label="Price Impact">
                  <span className="text-primary font-semibold">&lt; 0.01%</span>
                </Row>
                <Row label="Slippage Tolerance">
                  <span className="px-1.5 py-0.5 rounded bg-surface-container font-label-md text-label-md text-secondary mr-1">
                    Auto
                  </span>
                  0.5%
                </Row>
                <Row label="Minimum Received">
                  {formatAmount(minReceived)} {toToken.symbol}
                </Row>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={handleSwap}
          disabled={ctaDisabled}
          className={`mt-4 w-full h-14 rounded-xl font-headline-md text-headline-md font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${ctaClass}`}
        >
          <span
            className={`material-symbols-outlined text-[22px] ${
              submit === 'loading' ? 'animate-spin' : ''
            }`}
          >
            {ctaIcon}
          </span>
          <span>{ctaLabel}</span>
        </button>

        {/* Trust badges */}
        <div className="mt-3.5 flex items-center justify-between px-1 text-on-surface-variant">
          <div className="flex items-center gap-1 font-label-md text-label-md">
            <span className="material-symbols-outlined text-[16px] text-primary">
              verified_user
            </span>
            <span>MEV Protection</span>
          </div>
          <div className="flex items-center gap-1 font-label-md text-label-md text-outline">
            <span className="material-symbols-outlined text-[16px]">speed</span>
            <span>Execution &lt; 400ms</span>
          </div>
        </div>
      </div>

      {/* Hidden visual error (kept subtle; CTA already shows it) */}
      {showError && (
        <p className="sr-only" role="alert">
          {validationError}
        </p>
      )}

      {/* Token selector */}
      {picking && (
        <TokenSelectorSheet
          tokens={tokens}
          excludeSymbol={picking === 'from' ? toToken?.symbol : fromToken?.symbol}
          onSelect={pickToken}
          onClose={() => setPicking(null)}
        />
      )}
    </>
  );
}

function TokenPill({
  token,
  onClick,
}: {
  token: Token | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright active:scale-95 transition-all"
    >
      {token ? (
        <>
          <TokenIcon symbol={token.symbol} iconUrl={token.iconUrl} size={24} />
          <span className="font-headline-md text-headline-md font-semibold text-on-surface leading-none">
            {token.symbol}
          </span>
        </>
      ) : (
        <span className="font-headline-md text-headline-md font-semibold text-on-surface-variant">
          Select
        </span>
      )}
      <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
        expand_more
      </span>
    </button>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between text-on-surface-variant">
      <span>{label}</span>
      <span className="font-label-mono text-label-mono text-on-surface font-medium">
        {children}
      </span>
    </div>
  );
}
