const http = require('http');
const fs = require('fs');
const path = require('path');
const { generatePlan } = require('./lib/plan');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 3000);
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1_000_000) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const requested = clean === '/' ? '/index.html' : clean;
  const normalized = path.normalize(requested).replace(/^([.][.][/\\])+/, '');
  const full = path.join(ROOT, normalized);
  if (!full.startsWith(ROOT)) return null;
  return full;
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/api/health') {
    return sendJson(res, 200, { ok: true, service: 'healthy-life', runtime: 'node' });
  }

  if (req.url === '/api/plan') {
    if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Usa POST.' });
    try {
      const raw = await readBody(req);
      const body = raw ? JSON.parse(raw) : {};
      return sendJson(res, 200, generatePlan(body));
    } catch (error) {
      return sendJson(res, 400, { ok: false, error: 'Solicitud inválida.' });
    }
  }

  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405);
    return res.end('Method Not Allowed');
  }

  const filePath = safePath(req.url || '/');
  if (!filePath) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 - No encontrado');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Healthy Life listo en http://localhost:${PORT}`);
});
