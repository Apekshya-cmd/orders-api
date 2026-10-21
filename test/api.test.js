const test = require('node:test');
const assert = require('node:assert');
const { createServer } = require('../server');

test('API endpoints work together', async (t) => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  t.after(() => {
    server.closeAllConnections();
    server.close();
  });
  const base = `http://127.0.0.1:${server.address().port}`;

  const health = await fetch(`${base}/health`);
  assert.strictEqual(health.status, 200);
  assert.deepStrictEqual(await health.json(), { status: 'ok' });

  const discount = await fetch(`${base}/discount?price=100&code=SAVE10`);
  assert.strictEqual((await discount.json()).total, 90);

  const bad = await fetch(`${base}/discount?price=abc`);
  assert.strictEqual(bad.status, 400);
});
