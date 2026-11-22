// The Gilded Vault — local static server for play-testing.
// Serves game/ at http://localhost:8080 with no network requests.
//   node serve.ts

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const root = join(here, 'game');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
};

const server = createServer((req, res) => {
  const url = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const path = url === '/' ? '/index.html' : url;
  const file = join(root, path);
  if (!file.startsWith(root) || !existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  const ext = path.slice(path.lastIndexOf('.'));
  res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
});

server.listen(8080, () => {
  console.log('The Gilded Vault at http://localhost:8080');
});
