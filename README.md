# 99Tech Code Challenge

Solutions for the 99Tech code challenge.

| Problem | Topic | Stack |
| --- | --- | --- |
| [Problem 2](src/problem2) | Currency swap form ("99Tech Swap") | Vite + React + TypeScript + Tailwind |
| [Problem 3](src/problem3) | Messy React — code review + refactor | React + TypeScript (analysis) |
| [Problem 4](src/problem4) | Three ways to sum to `n` | Node.js (built-in test runner) |
| [Problem 5](src/problem5) | A CRUD server | Express + TypeScript + SQLite |
| [Problem 6](src/problem6) | Architecture — scoreboard API spec | Specification + diagrams |

```
src/
├── problem2/          # currency swap SPA (own package.json)
│   ├── src/
│   ├── package.json
│   └── README.md
├── problem3/          # messy-react analysis + refactor
│   ├── messy.tsx      # original code (reference)
│   ├── WalletPage.tsx # refactored version
│   ├── logic.js       # pure logic extracted for tests
│   ├── logic.test.js
│   └── README.md      # list of issues + explanations
├── problem4/          # sum-to-n implementations + tests
│   ├── index.js
│   └── index.test.js
├── problem5/          # Express + TypeScript + SQLite CRUD API (own package.json)
│   ├── src/
│   ├── package.json
│   └── README.md
└── problem6/          # scoreboard API architecture spec
    └── README.md      # spec + Mermaid flow/sequence diagrams
```

> All commands below can be run **from the repository root**.

---

## Problem 2 — Currency Swap

A polished currency swap app with live prices, a token picker, a mock wallet
with history, and a swap confirmation flow. Built with **Vite** (bonus) +
React + TypeScript + Tailwind.

Run it from the repo root:

```bash
npm run problem2:install    # install Problem 2 dependencies (first time only)
npm run problem2:dev        # start the dev server → http://localhost:5173
```

Other commands:

```bash
npm run problem2:build      # type-check + production build
npm run problem2:preview    # preview the production build
```

> You can also work inside the folder directly:
> `cd src/problem2 && npm install && npm run dev`.

### Highlights

- **Live prices** from `https://interview.switcheo.com/prices.json` (tokens
  without a price are omitted; duplicates collapse to the latest record).
- **Token icons** from the
  [Switcheo token-icons repo](https://github.com/Switcheo/token-icons), with a
  coloured monogram fallback.
- **Searchable token picker**, input validation, live exchange rate, USD values,
  swap-direction toggle and a simulated (mocked) backend submit.
- **Mock wallet** (persisted to `localStorage`): edit holdings, MAX button,
  "insufficient balance" checks, and swaps that actually move balances.
- **Activity history** of swaps and admin (manual edit) adjustments.

See [src/problem2/README.md](src/problem2/README.md) for the full breakdown.

---

## Problem 3 — Messy React

A code-review exercise: list the computational inefficiencies and anti-patterns
in a given `WalletPage` component and provide a refactor. No build step — it's a
written analysis plus a cleaned-up component.

- [src/problem3/README.md](src/problem3/README.md) — the full list of issues
  (correctness bugs, React/performance anti-patterns, typing) with explanations.
- [src/problem3/messy.tsx](src/problem3/messy.tsx) — the original code.
- [src/problem3/WalletPage.tsx](src/problem3/WalletPage.tsx) — the refactored
  version, annotated with the fix numbers.

A few fixes have unit tests over the extracted pure logic:

```bash
npm run test:problem3
```

---

## Problem 4 — Sum to n

Three implementations (`sumToNA` formula, `sumToNB` loop, `sumToNC` recursion),
each handling negative `n`. Covered by Node's built-in test runner — no install
needed.

```bash
npm run test:problem4
```

Expected: 28 passing tests (3 methods × 8 cases + a cross-check across all three).

---

## Problem 5 — A CRUD Server

An Express + TypeScript backend exposing CRUD endpoints over a `resources`
collection, persisted in SQLite. Includes list filtering, request validation
(Zod) and centralised error handling.

Run it from the repo root:

```bash
npm run problem5:install    # install dependencies (first time only)
npm run problem5:dev        # start with auto-reload → http://localhost:3000
```

Production:

```bash
npm run problem5:build      # compile TypeScript → dist/
npm run problem5:start      # run the compiled server
```

Endpoints: `POST/GET/PUT/DELETE /resources` (+ `GET /resources/:id`,
`GET /health`). See [src/problem5/README.md](src/problem5/README.md) for the
full API, filters and `curl` examples.

---

## Problem 6 — Architecture

A written specification for a **scoreboard** software module on the API service:
top-10 leaderboard, live updates, and protection against unauthorised score
increases. No code — it's a spec to hand to a backend team, including Mermaid
flow and sequence diagrams plus suggestions for improvement.

See [src/problem6/README.md](src/problem6/README.md).
