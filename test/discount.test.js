const test = require('node:test');
const assert = require('node:assert');
const { calculateDiscount } = require('../server');

test('SAVE10 takes 10 percent off', () => {
  assert.strictEqual(calculateDiscount(100, 'SAVE10'), 90);
});

test('SAVE20 takes 20 percent off', () => {
  assert.strictEqual(calculateDiscount(100, 'SAVE20'), 80);
});

test('unknown code gives no discount', () => {
  assert.strictEqual(calculateDiscount(100, 'NOPE'), 100);
});

test('object property names are not treated as codes', () => {
  assert.strictEqual(calculateDiscount(100, 'constructor'), 100);
});
