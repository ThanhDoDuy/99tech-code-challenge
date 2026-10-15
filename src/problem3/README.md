# Problem 3 — Messy React

Analysis of the inefficiencies / anti-patterns in the original `WalletPage`
component, and a refactored version.

- [`messy.tsx`](messy.tsx) — the original code, kept for reference.
- [`WalletPage.tsx`](WalletPage.tsx) — the refactored version.

---

## Issues found

### A. Correctness bugs (these break at runtime or compile)

1. **`lhsPriority` is undefined.** In the `filter` callback the code computes
   `const balancePriority = getPriority(balance.blockchain)` but then checks
   `if (lhsPriority > -99)`. `lhsPriority` was never declared → `ReferenceError`
   at runtime (and a TypeScript error). It should be `balancePriority`.

2. **The filter logic is inverted.** The intent is clearly "keep balances that
   have a known blockchain **and** a positive amount". The code instead keeps a
   balance only when `balance.amount <= 0`, i.e. it keeps empty/negative
   balances and discards the ones with funds. The condition should be
   `amount > 0`.

3. **`balance.blockchain` doesn't exist on the type.** `WalletBalance` only
   declares `currency` and `amount`, yet the code reads `balance.blockchain`.
   Either the field is missing from the interface or the priority should be
   derived from something else. Fixed by adding `blockchain` to `WalletBalance`
   (typed as a union, not `any`).

4. **The sort comparator is incomplete.** When `leftPriority === rightPriority`
   it returns `undefined` instead of `0`. A comparator that doesn't return a
   number for every branch is undefined behaviour and can sort inconsistently
   across engines.

5. **`rows` maps over the wrong array and lies about the type.** It iterates
   `sortedBalances` (which are `WalletBalance`, with **no** `formatted` field)
   but types the item as `FormattedWalletBalance` and reads `balance.formatted`,
   which is `undefined` at runtime. `formattedBalances` — the array that
   actually has `formatted` — is computed and then never used. The rows should
   be built from `formattedBalances`.

### B. React / performance anti-patterns

6. **Wrong `useMemo` dependencies.** `sortedBalances` lists `[balances, prices]`
   but `prices` is not used in that computation. Any price tick re-sorts the
   list for no reason. Drop `prices` from the deps.

7. **`formattedBalances` and `rows` are recomputed on every render.** They are
   plain `.map()` calls in the component body with no memoization, so they run
   on every render even when nothing relevant changed. Wrap them in `useMemo`.

8. **Using the array index as the React `key`.** `key={index}` is an
   anti-pattern: when the list is filtered/sorted/reordered, React reuses the
   wrong DOM nodes, causing subtle rendering/state bugs. Use a stable id such as
   `balance.currency` (or `blockchain + currency` if currencies can repeat).

9. **The list is iterated more times than necessary.** `getPriority` is called
   twice per comparison inside `sort`, and the data is walked three times
   (filter → sort → format → render). It's cheap here, but the priority can be
   computed once per item; and merging the "format" + "render" passes avoids an
   extra allocation.

### C. Typing / clarity

10. **`getPriority(blockchain: any)`.** `any` disables type checking — a typo in
    a blockchain name is silently allowed. Use a `Blockchain` union type so the
    compiler catches invalid values.

11. **`getPriority` is re-created every render.** It doesn't depend on props or
    state, so it belongs outside the component (module scope). As a bonus, a
    lookup table (`Record<Blockchain, number>`) is clearer and O(1) versus the
    `switch`.

12. **`toFixed()` with no argument** rounds to **0** decimals. That's almost
    certainly unintended for a token amount; be explicit (e.g. `toFixed(2)`),
    ideally with locale-aware formatting.

13. **`prices[balance.currency]` can be `undefined`** → `usdValue` becomes
    `NaN`. Guard with `?? 0` (or skip the row).

14. **Empty `interface Props extends BoxProps {}`** adds nothing — use `BoxProps`
    directly (`type Props = BoxProps`). Also `children` is destructured but
    never rendered; either render it or drop it.

---

## Summary of fixes

| # | Fix |
| --- | --- |
| 1 | `lhsPriority` → `balancePriority` |
| 2 | Keep `amount > 0`, not `<= 0` |
| 3 | Add `blockchain` to `WalletBalance` (typed union) |
| 4 | Comparator returns a number in every branch (subtract priorities) |
| 5 | Build rows from `formattedBalances`, not `sortedBalances` |
| 6 | Remove unused `prices` from `useMemo` deps |
| 7 | Memoize `formattedBalances` and `rows` |
| 8 | Stable `key` (`currency`) instead of array index |
| 9 | Compute priority once; merge format + render passes |
| 10–11 | Type `Blockchain`; move `getPriority`/lookup table to module scope |
| 12 | `toFixed(2)` (explicit decimals) |
| 13 | Guard missing price with `?? 0` |
| 14 | `type Props = BoxProps`; handle/remove `children` |

See [`WalletPage.tsx`](WalletPage.tsx) for the refactored implementation.
