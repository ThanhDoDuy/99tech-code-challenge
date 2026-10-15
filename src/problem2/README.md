# Problem 2 — 99Tech Swap

A currency swap single-page app built with **Vite + React + TypeScript +
Tailwind CSS**. Users swap assets from one currency to another at live market
rates.

> The provided skeletal files (`index.html` / `script.js` / `style.css`) were
> intentionally replaced with a Vite project, as allowed by the task
> ("feel free to totally disregard the provided files").

## Run

From this folder:

```bash
npm install
npm run dev        # dev server → http://localhost:5173
npm run build      # type-check (tsc) + production build
npm run preview    # preview the production build
```

Or from the repo root: `npm run problem2:install`, `npm run problem2:dev`, …

## Features

- **Live prices** from `https://interview.switcheo.com/prices.json`. Tokens
  without a price are omitted; duplicate currencies collapse to their most
  recent record.
- **Token icons** from the
  [Switcheo token-icons repo](https://github.com/Switcheo/token-icons), with a
  coloured monogram fallback when an icon is missing.
- **Swap terminal** — amount input with numeric validation, live exchange rate,
  USD values for both sides, one-click direction switch, a details accordion
  (network fee, price impact, slippage, minimum received) and a state-aware CTA
  (idle → loading → success / insufficient balance).
- **Token selector** bottom-sheet with search, quick chips and wallet balances;
  the opposite side's token is disabled to prevent same-token swaps.
- **Mock wallet** persisted to `localStorage`: balances, a MAX button, and
  swaps that actually move holdings. Editable in the **Assets** tab (add /
  remove / adjust amounts, sortable).
- **Activity history** of swaps (tap to reopen the receipt) and admin
  adjustments (manual wallet edits), also persisted.
- **Confirmation screen** with a mock transaction hash and telemetry.
- Simulated backend via a timed loading state (per the task hint).

## Structure

```
src/
  App.tsx                     # tab routing (Swap / History / Assets) + confirmation
  components/
    Header.tsx  BottomNav.tsx
    SwapTerminal.tsx          # swap form: state, validation, rate math, submit
    TokenSelectorSheet.tsx    # searchable token picker
    ConfirmationScreen.tsx    # post-swap receipt
    AssetsScreen.tsx          # wallet view/edit with sort
    HistoryScreen.tsx         # swap + admin activity log
    TokenIcon.tsx             # icon with graceful fallback
  wallet/WalletContext.tsx    # balances + history state, localStorage persistence
  hooks/useTokens.ts          # load tokens on mount
  api/tokens.ts               # fetch + normalise prices into Token[]
  utils/format.ts             # number / USD / hash formatting
  data/wallet.ts              # initial demo balances
  types.ts                    # shared types
```

## Tech notes

- **Vite** for dev/build (bonus), **Tailwind CSS** for styling with a custom
  Material-3-style dark theme.
- Prices and balances are mocked where a real backend would exist; the submit
  button uses a timed delay to simulate network latency.
