import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { resolve } from 'node:path';

const claims = ['local-processing', 'site-runtime', 'csv-download'];

function runClaim(claim) {
  return new Promise((resolveExit, reject) => {
    const child = spawn(
      process.execPath,
      [
        resolve('scripts/test.mjs'),
        '--skip-rust',
        '--skip-lifecycle',
        '--grep',
        `@claim:${claim}`
      ],
      { cwd: process.cwd(), env: process.env, stdio: 'inherit' }
    );
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) reject(new Error(`${claim} stopped by ${signal}`));
      else resolveExit({ claim, code: code ?? 1 });
    });
  });
}

const fixedPortDecoy = createServer((_request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  response.end('<!doctype html><title>Wrong test server</title><p>Port 4173 must not be reused.</p>');
});

await new Promise((resolveListen, reject) => {
  fixedPortDecoy.once('error', reject);
  fixedPortDecoy.listen(4173, '127.0.0.1', resolveListen);
});

try {
  console.log('Running concurrent claim-server lifecycle regression with port 4173 reserved...');
  const results = await Promise.all(claims.map(runClaim));
  const failures = results.filter(result => result.code !== 0);
  if (failures.length > 0) {
    console.error(`Lifecycle regression failed: ${failures.map(result => result.claim).join(', ')}`);
    process.exitCode = 1;
  } else {
    console.log('Concurrent claim-server lifecycle regression passed.');
  }
} finally {
  await new Promise((resolveClose, reject) => {
    fixedPortDecoy.close(error => error ? reject(error) : resolveClose());
  });
}
