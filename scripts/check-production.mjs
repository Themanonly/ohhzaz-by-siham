import { spawn } from 'node:child_process';
import { once } from 'node:events';

const port = 3027;
const base = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], { stdio: 'inherit' });
let ended = false;
server.once('exit', () => { ended = true; });
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (ended) throw new Error('Production server exited before verification');
    try { ready = (await fetch(base + '/fr')).ok; } catch {}
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  if (!ready) throw new Error('Production server did not become ready');
  const check = spawn(process.execPath, ['scripts/smoke-check.mjs', base], { stdio: 'inherit' });
  const [code] = await once(check, 'exit');
  if (code !== 0) throw new Error('Production checks failed');
} finally {
  if (!ended) server.kill();
}
