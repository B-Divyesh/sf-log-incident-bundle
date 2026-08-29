import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = process.cwd();
const outputFlag = process.argv.indexOf('--output');
const output = resolve(outputFlag === -1 ? 'public/terminal-recording.svg' : process.argv[outputFlag + 1]);
if (outputFlag !== -1 && !process.argv[outputFlag + 1]) {
  throw new Error('--output needs a file path');
}

const cargoToml = await readFile(resolve('Cargo.toml'), 'utf8');
const packageName = cargoToml.match(/^name\s*=\s*"([^"]+)"/m)?.[1];
const version = cargoToml.match(/^version\s*=\s*"([^"]+)"/m)?.[1];
if (!packageName || !version) throw new Error('Could not read the package name and version from Cargo.toml');

const escapeXml = value => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function renderSvg(transcript) {
  const lines = transcript.split('\n');
  const text = lines.map((line, index) => {
    const isCommand = index === 0;
    return `<text x="64" y="${126 + index * 54}" class="${isCommand ? 'command' : 'output'}">${escapeXml(line)}</text>`;
  }).join('\n  ');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 250" width="1120" height="250" role="img" aria-labelledby="title description" data-recording-source="packaged-cli-demo" data-cli-version="${escapeXml(version)}">
  <title id="title">Terminal recording of the packaged Log Incident Bundle demo</title>
  <desc id="description">A self-hosted terminal recording generated from the cargo-packaged and installed CLI demo command.</desc>
  <style>.shell{fill:#132329}.bar{fill:#1e373a}.label{fill:#f6d083;font:700 14px ui-monospace,monospace;letter-spacing:1.4px}.command{fill:#f7f2e5;font:18px ui-monospace,monospace}.output{fill:#8fd0ac;font:16px ui-monospace,monospace}</style>
  <rect class="shell" width="1120" height="250" rx="0"/>
  <rect class="bar" width="1120" height="48"/>
  <circle cx="28" cy="24" r="7" fill="#b7432e"/><circle cx="52" cy="24" r="7" fill="#f6d083"/><circle cx="76" cy="24" r="7" fill="#8fd0ac"/>
  <text x="108" y="29" class="label">PACKAGED CLI DEMO · RECORDED OUTPUT</text>
  ${text}
</svg>
`;
}

const workspace = await mkdtemp(join(tmpdir(), 'log-incident-bundle-recording-'));
try {
  execFileSync('cargo', ['package', '--allow-dirty', '--locked', '--no-verify'], { cwd: root, stdio: 'pipe' });
  const crate = resolve('target/package', `${packageName}-${version}.crate`);
  if (!existsSync(crate)) throw new Error(`Cargo package did not create ${crate}`);

  execFileSync('tar', ['-xzf', crate, '-C', workspace], { stdio: 'pipe' });
  const packagedSource = join(workspace, `${packageName}-${version}`);
  const installRoot = join(workspace, 'install');
  const demoTemp = join(workspace, 'tmp');
  const installEnvironment = { ...process.env, CARGO_TARGET_DIR: resolve('target/recording-package') };
  await mkdir(demoTemp);
  execFileSync('cargo', ['install', '--path', packagedSource, '--root', installRoot, '--locked'], {
    stdio: 'pipe',
    env: installEnvironment
  });

  const binary = join(installRoot, 'bin', packageName);
  const recorded = execFileSync(binary, ['--demo'], {
    encoding: 'utf8',
    env: { ...process.env, TMPDIR: demoTemp },
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim();
  const artifact = recorded.match(/^Demo bundle written to (.+)$/m)?.[1];
  if (!artifact || !existsSync(artifact)) throw new Error('Packaged CLI demo did not report a usable review artifact');
  const review = await readFile(artifact, 'utf8');
  const bundleData = review.match(/<script id="bundle-data" type="application\/json">(.*?)<\/script>/s)?.[1];
  if (!bundleData || JSON.parse(bundleData).records?.length !== 6) {
    throw new Error('Packaged CLI demo did not create the expected six-record review');
  }

  const transcript = `$ ${packageName} --demo\nDemo bundle written to $TMPDIR/${packageName}-demo-<unique>/review.html`;
  await mkdir(resolve(output, '..'), { recursive: true });
  await writeFile(output, renderSvg(transcript));
  console.log(`Recorded packaged ${packageName} --demo output to ${output}`);
} finally {
  await rm(workspace, { recursive: true, force: true });
}
