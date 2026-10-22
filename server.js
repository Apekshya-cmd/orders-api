const http = require('node:http');

const CODES = { SAVE10: 0.9, SAVE20: 0.2 };

function calculateDiscount(price, code) {
  const rate = Object.hasOwn(CODES, code) ? CODES[code] : 0;
  return Math.round(price * (1 - rate) * 100) / 100;
}

function createServer() {
  return http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    const send = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(body));
    };

    if (url.pathname === '/health') {
      return send(200, { status: 'ok' });
    }
    if (url.pathname === '/discount') {
      const price = Number(url.searchParams.get('price'));
      const code = url.searchParams.get('code');
      if (!Number.isFinite(price) || price < 0) {
        return send(400, { error: 'invalid price' });
      }
      return send(200, { price, code, total: calculateDiscount(price, code) });
    }
    if (url.pathname === '/') {
      return send(200, {
        app: 'orders-api',
        env: process.env.APP_ENV || 'local',
        version: process.env.APP_VERSION || 'dev',
      });
    }
    return send(404, { error: 'not found' });
  });
}

if (require.main === module) {
  const port = process.env.PORT || 3000;
  createServer().listen(port, () => console.log(`orders-api listening on ${port}`));
}

module.exports = { calculateDiscount, createServer };
