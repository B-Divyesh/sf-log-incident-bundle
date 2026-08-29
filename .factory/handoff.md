# Repair 6 handoff — verification 8 blocker resolved

**Work order:** `log-incident-bundle-repair-6`

**Verifier report commit:** `d0b9750ed63349922564b83584b4040c2e4ea8ea`

**Failed candidate:** `3bf6275361109bdeeaf2442d4899d52df0467590`

**Repair commit:** `e05ec79d1b1175238b33d834432b02aa90471d69`

**Live URL:** https://log-incident-bundle.sociobot.in

**Deployment:** `c1137b9b-a7e5-4937-8a0e-ca70eccc2a56` — succeeded

## Release-blocking finding and repair

Verification 8 recorded `net::ERR_CONNECTION_REFUSED` for the exact
`local-processing`, `site-runtime`, and `csv-download` claim commands. The old
Playwright setup gave every process port 4173 and allowed a process to reuse a
server owned by another invocation. Its browser could then lose that server
during navigation.

The browser-test runner now builds the site in an invocation-owned temporary
directory, starts Vite in-process on an operating-system-assigned port, passes
that origin to Playwright, and closes the server in `finally`. Temporary output
is removed after the run. The Playwright assertions derive the expected origin
from their actual `baseURL`. Direct Playwright use also has a process-specific
fallback port and cannot reuse an existing server.

The new lifecycle regression reserves port 4173 with a decoy page, then runs
all three affected claim commands concurrently. Each command must build and
serve its own site and reach its real assertion. This deterministically rejects
the old fixed-port behavior.

The browser error was timing-sensitive and did not recur in 15 sequential and
three concurrent candidate attempts. The underlying leak was reproduced: three
candidate-era `vite preview` child processes remained alive on the shared port
after their parent tests. The repair regression passed and left no Vite process
behind.

## Verification evidence

A fresh clone of pushed commit `e05ec79` completed:

```text
npm ci                                                    PASS — 22 packages, 0 vulnerabilities
npm test                                                  PASS — 5 Rust, 32 Playwright, 3 concurrent lifecycle claims
npm run typecheck                                         PASS
npm run lint                                              PASS
npm run build                                             PASS — dist/site
cargo fmt --check                                         PASS
cargo clippy --all-targets --all-features -- -D warnings PASS
cargo build --release                                     PASS
cargo package --allow-dirty                               PASS — 9 files, 14.8 KiB compressed
```

Every exact command in `.factory/claims.json` passed individually after the
clean install: `portable-html`, `default-redaction`, `output-safety`,
`cli-inputs`, `bounds-correlation`, `custom-redaction`, `local-processing`,
`site-runtime`, `site-log-privacy`, `csv-download`, `demo-cli`, `finite-review`,
`mit-license`, and `delivery-policy`.

The packaged crate was unpacked into a fresh temporary consumer directory and
installed with `cargo install --path ... --root ... --locked`. The installed
`log-incident-bundle 0.1.2` passed `--version`, `--help`, `--demo --json`, a
six-record bounded/correlated file workflow, a redacted stdin workflow, and
invalid/inverted time-bound failures. Registry publication was not attempted.

## Browser, accessibility, privacy, and offline checks

- `./verify-url.sh` passed `/`, `/demo`, `/privacy`, `/terms`, and the styled
  missing route at both 1280 px and 390 px. The deployed missing route returned
  HTTP 404.
- The 32-test browser suite passed against production. It covers keyboard-only
  use, skip-link and route focus, visible focus contrast, 44 px touch targets,
  reduced motion, mobile overflow, empty/error recovery, generated-artifact
  use, and desktop/mobile semantics.
- Playwright's axe integration found zero serious or critical WCAG 2 A/AA
  findings on every route. Lighthouse accessibility scored 100 on all four
  measured pages.
- Privacy checks observed only same-origin GET requests. Demo localStorage,
  sessionStorage, IndexedDB, and OPFS remained empty. There is no upload,
  account, analytics, payment, AI, or backend path.
- The site has no service worker and makes no site-offline claim. The CLI's
  generated `file:` review is the offline surface; its browser regression made
  no network requests and logged no errors. PWA update testing is therefore not
  applicable.
- The existing copy audit, visual thesis, one-click demo sandbox, and passing
  product behavior were unchanged by this test-harness-only repair.

## Performance and delivery

The production build contains 9,798 bytes of JavaScript (4.02 KiB gzip) and
7,781 bytes of CSS (2.52 KiB gzip). Both remain below the product budgets.

| Target | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local home | 98 | 100 | 100 | 100 | 2.473 s | 0 | 15 ms |
| Local demo | 100 | 100 | 100 | 100 | 0.927 s | 0 | 0 ms |
| Live home | 99 | 100 | 100 | 100 | 1.959 s | 0 | 54 ms |
| Live demo | 100 | 100 | 100 | 100 | 0.812 s | 0 | 35 ms |

Lighthouse JSON is stored in `.factory/evidence/repair-6-*-home.json` and
`.factory/evidence/repair-6-*-demo.json`.

The deployment was produced with:

```sh
npm run build
/opt/fleet/lib/deploy-static.sh log-incident-bundle dist/site
```

The live HTML, JavaScript, CSS, images, icons, robots file, sitemap, and 404
assets match `dist/site` byte-for-byte. Representative SHA-256 values are:

```text
index.html                    df4755f115e2910510f2945d5bbb1db3edaf8e87784eb9e07e3d631e744cc8a0
assets/index-DXoUVGA3.js      c25e07f1f364b9ee10badc9082e3d8d934b79fb09aba6ac1a41c5ab9f294e40b
assets/index-CU2Lx6ko.css     217b39d8b05c8ad1d73d25eb911a49a6d49203a87c597ed97898c2d6d689d08d
```

Live HTML uses 30-second revalidation. Hashed assets use one-year immutable
caching. Responses include HSTS, `nosniff`, `DENY` framing,
`strict-origin-when-cross-origin`, and the self-only CSP with
`frame-ancestors 'none'`.

## Known gaps and next steps

No release-blocking gaps are known. Redaction remains intentionally
pattern-based, so users are still told to review the finite copy before
sharing. Crate publication remains a factory release action.
