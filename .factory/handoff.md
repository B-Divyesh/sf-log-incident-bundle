# Polish 2 handoff — accepted

**Work order:** `log-incident-bundle-polish-2`
**Repair commit:** `22e30d76a6281796a44cb2241c9f7546521184ae`
**Live URL:** https://log-incident-bundle.sociobot.in
**Deployment:** Azure Static Web Apps deployment `866764c8-9d42-4310-8017-4fd053331bd3`

## Completed

- Added a real, first-screen installation path. **Install the CLI** and demo
  **Start for real** both lead to `/#install`, with a copyable locked Cargo
  command and a clearly labelled public-source link.
- Restored complete claim locations, added the tested `install-cli` claim, and
  strengthened no-account verification.
- Rewrote the README timestamp description to name RFC 3339 and show an exact
  accepted example.
- Preserved every earlier repair: isolated `?demo=1`, reset/banner behavior,
  titles and routing, initial skip-link focus, styled HTTP 404, legal links,
  mobile controls, redaction and portable artifact safety.
- Updated the catalog description, demo documentation, copy audit, and
  cumulative finding map in `.factory/polish-2.md`.

## Verification

Fresh clone `/tmp/log-incident-bundle-clean-final-BjzP8d` at `22e30d7`:

- `npm ci` passed with 0 vulnerabilities.
- Every exact claim command in `.factory/claims.json` passed: 16/16.
- `npm test` passed: 6 Rust unit tests, 34 Playwright tests, and 3 concurrent
  test-server lifecycle checks.
- `npm run build`, `npm run typecheck`, `npm run lint`, `cargo build --release
  --locked`, `cargo fmt --check`, `cargo clippy --all-targets --all-features
  --locked -- -D warnings`, `cargo package --locked`, and `npm audit
  --audit-level=high` all passed.
- Local Lighthouse on `/?demo=1`: Performance 100, Accessibility 100, Best
  Practices 100, SEO 100. Initial JS is 4.52 KB gzip; CSS is 2.80 KB gzip.

After deployment:

- `PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npm test`
  passed: 6 Rust tests and 34 browser tests.
- `./verify-url.sh https://log-incident-bundle.sociobot.in` passed all 10
  route/viewport checks. It confirmed titles, language, main landmark, alt
  text, no overflow, zero serious/critical axe findings, no console errors,
  and an HTTP 404 at `/missing`.
- Cold live `/?demo=1` was checked: banner, six records, Reset demo, Start for
  real, the install command, and the source link all work. The deployed asset
  is `assets/index-CL8JLeTG.js`.

Evidence: `.factory/evidence/polish-2-live-install.png`,
`.factory/evidence/polish-2-live-demo-mobile.png`,
`.factory/evidence/polish-2-local-install.png`,
`.factory/evidence/polish-2-local-demo-mobile.png`, and
`.factory/evidence/lighthouse-polish-2-local-demo.json`.

## Known gaps

None.

## Release / maintenance

Run `cargo package --locked` to prepare the crate for factory publishing. Do
not publish from this repository; the factory owns registry credentials.
