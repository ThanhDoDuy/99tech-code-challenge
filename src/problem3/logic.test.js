import test from 'node:test';
import assert from 'node:assert';

import {
  getPriority,
  selectFormattedBalances,
  usdValueOf,
  DEFAULT_PRIORITY,
} from './logic.js';

test('getPriority maps known chains and falls back for unknown', () => {
  assert.strictEqual(getPriority('Osmosis'), 100);
  assert.strictEqual(getPriority('Ethereum'), 50);
  assert.strictEqual(getPriority('Arbitrum'), 30);
  assert.strictEqual(getPriority('Zilliqa'), 20);
  assert.strictEqual(getPriority('Neo'), 20);
  assert.strictEqual(getPriority('Dogechain'), DEFAULT_PRIORITY);
});

test('selectFormattedBalances drops non-positive amounts (fix #2)', () => {
  const input = [
    { currency: 'ETH', amount: 0, blockchain: 'Ethereum' },
    { currency: 'ATOM', amount: -5, blockchain: 'Osmosis' },
    { currency: 'ARB', amount: 3, blockchain: 'Arbitrum' },
  ];
  const out = selectFormattedBalances(input);
  assert.deepStrictEqual(
    out.map((b) => b.currency),
    ['ARB'],
  );
});

test('selectFormattedBalances drops unknown blockchains (fix #2/#3)', () => {
  const input = [
    { currency: 'FOO', amount: 10, blockchain: 'Unknownchain' },
    { currency: 'ETH', amount: 1, blockchain: 'Ethereum' },
  ];
  const out = selectFormattedBalances(input);
  assert.deepStrictEqual(
    out.map((b) => b.currency),
    ['ETH'],
  );
});

test('selectFormattedBalances sorts by priority descending (fix #4)', () => {
  const input = [
    { currency: 'ZIL', amount: 1, blockchain: 'Zilliqa' }, // 20
    { currency: 'OSMO', amount: 1, blockchain: 'Osmosis' }, // 100
    { currency: 'ARB', amount: 1, blockchain: 'Arbitrum' }, // 30
    { currency: 'ETH', amount: 1, blockchain: 'Ethereum' }, // 50
  ];
  const out = selectFormattedBalances(input);
  assert.deepStrictEqual(
    out.map((b) => b.currency),
    ['OSMO', 'ETH', 'ARB', 'ZIL'],
  );
});

test('equal priorities keep all items (comparator is total, fix #4)', () => {
  const input = [
    { currency: 'ZIL', amount: 1, blockchain: 'Zilliqa' }, // 20
    { currency: 'NEO', amount: 2, blockchain: 'Neo' }, // 20
  ];
  const out = selectFormattedBalances(input);
  assert.strictEqual(out.length, 2);
});

test('formatted uses two decimals (fix #12)', () => {
  const out = selectFormattedBalances([
    { currency: 'ETH', amount: 1.23456, blockchain: 'Ethereum' },
  ]);
  assert.strictEqual(out[0].formatted, '1.23');
});

test('usdValueOf multiplies by price and guards missing prices (fix #13)', () => {
  const eth = { currency: 'ETH', amount: 2, blockchain: 'Ethereum' };
  assert.strictEqual(usdValueOf(eth, { ETH: 1500 }), 3000);
  // Missing price → 0, not NaN.
  assert.strictEqual(usdValueOf(eth, {}), 0);
});
