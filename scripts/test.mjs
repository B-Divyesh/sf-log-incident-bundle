import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { build, preview } from 'vite';

const rawArguments = process.argv.slice(2);
const skipRust = rawArguments.includes('--skip-rust');
const skipLifecycle = rawArguments.includes('--skip-lifecycle');
const playwrightArguments = rawArguments.filter(argument =>
  argument !== '--skip-rust' && argument !== '--skip-lifecycle'
);
const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;
const shouldCheckLifecycle = !skipLifecycle && !externalBaseURL && playwrightArguments.length === 0;

function run(command, arguments_, environment = process.env) {
  return new Promise((resolveExit, reject) => {
    const child = spawn(command, arguments_, { cwd: process.cwd(), env: environment, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code, signal) => {
      if (signal) reject(new Error(`${command} stopped by ${signal}`));
      else resolveExit(code ?? 1);
    });
  });
}

async function requireSuccess(command, arguments_, environment) {
  const code = await run(command, arguments_, environment);
  if (code !== 0) {
    const error = new Error(`${command} exited with status ${code}`);
    error.exitCode = code;
    throw error;
  }
}

async function main() {
  if (!skipRust) await requireSuccess('cargo', ['test']);

  let previewServer;
  let testBuildDirectory;

  try {
    let baseURL = externalBaseURL;
    if (!baseURL) {
      testBuildDirectory = await mkdtemp(join(tmpdir(), 'log-incident-bundle-site-'));
      await build({ build: { outDir: testBuildDirectory, emptyOutDir: true }, logLevel: 'warn' });
      previewServer = await preview({
        build: { outDir: testBuildDirectory },
        logLevel: 'warn',
        preview: { host: '127.0.0.1', port: 0, strictPort: true }
      });
      baseURL = previewServer.resolvedUrls?.local[0];
      if (!baseURL) throw new Error('Vite preview did not report a local URL');
    }

    await requireSuccess(
      process.execPath,
      [resolve('node_modules/@playwright/test/cli.js'), 'test', ...playwrightArguments],
      { ...process.env, PLAYWRIGHT_BASE_URL: baseURL }
    );
  } finally {
    if (previewServer) await previewServer.close();
    if (testBuildDirectory) await rm(testBuildDirectory, { recursive: true, force: true });
  }

  if (shouldCheckLifecycle) {
    await requireSuccess(process.execPath, [resolve('scripts/test-lifecycle.mjs')]);
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = error.exitCode ?? 1;
});
