import test from 'node:test';
import assert from 'node:assert';

import { sumToNA, sumToNB, sumToNC } from './index.js';

const fns = { sumToNA, sumToNB, sumToNC };

const cases = [
  { n: 0, expected: 0 },
  { n: 1, expected: 1 },
  { n: 5, expected: 15 },
  { n: 10, expected: 55 },
  { n: 100, expected: 5050 },
  { n: -1, expected: -1 },
  { n: -5, expected: -15 },
  { n: -10, expected: -55 },
];

for (const [name, fn] of Object.entries(fns)) {
  test(name, async (t) => {
    for (const { n, expected } of cases) {
      await t.test(`${name}(${n}) === ${expected}`, () => {
        const actual = fn(n);
        assert.strictEqual(
          actual,
          expected,
          `${name}(${n}) expected ${expected} but got ${actual}`,
        );
      });
    }
  });
}

test('all three methods agree with each other', () => {
  for (let n = -50; n <= 50; n++) {
    assert.strictEqual(sumToNA(n), sumToNB(n), `A vs B mismatch at n=${n}`);
    assert.strictEqual(sumToNB(n), sumToNC(n), `B vs C mismatch at n=${n}`);
  }
});
