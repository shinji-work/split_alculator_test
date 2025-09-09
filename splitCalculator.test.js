import test from 'node:test';
import assert from 'node:assert/strict';
import { splitBill } from './splitCalculator.js';

test('splits evenly', () => {
  assert.deepEqual(splitBill(1000, 4), [250, 250, 250, 250]);
});

test('distributes remainder without overcharging', () => {
  assert.deepEqual(splitBill(1000, 3), [334, 333, 333]);
});

test('throws on invalid people count', () => {
  assert.throws(() => splitBill(1000, 0), /positive integer/);
});

test('throws on negative totals', () => {
  assert.throws(() => splitBill(-100, 3), /non-negative/);
});
