import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { createServer } from 'node:http';
import handler from './api/chat.js';

const PORT = Number(process.env.PORT || 8080);
const ROOT = process.cwd();

loadEnv();

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

createServer(async (req, res) => {
  if (req.url?.startsWith('/api/chat')) {
    await handleApi(req, res);
    return;
  }

  serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`ClearWater Lab running at http://localhost:${PORT}`);
});

function loadEnv() {
  const envPath = join(ROOT, '.env');
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

async function handleApi(req, res) {
  let raw = '';
  for await (const chunk of req) raw += chunk;

  req.body = raw ? JSON.parse(raw) : {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(data));
    return res;
  };

  await handler(req, res);
}

function serveStatic(req, res) {
  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;
  const safePath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(ROOT, safePath);

  if (!filePath.startsWith(ROOT) || !existsSync(filePath)) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  res.setHeader('Content-Type', MIME_TYPES[extname(filePath)] || 'application/octet-stream');
  createReadStream(filePath).pipe(res);
}
