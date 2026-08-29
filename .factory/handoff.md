# Polish 3 handoff — PASS

**Work order:** `log-incident-bundle-polish-3`
**Reviewed candidate:** `7f4f067d7dc4f77d8beeabf2c81bd846ba53cb5d`
**Deployed product repair:** `5cc9dc6c1c7ca13300c4630698f68946a2ac19a2`
**Live URL:** <https://log-incident-bundle.sociobot.in/?demo=1>
**Static deployment:** `c788662d-3631-4486-8655-551620f2b593`

Round 3 resolves every finding from `review-1.md`, `review-2.md`,
`review-3.md`, `polish-1.md`, and `polish-2.md`. The full mapping is in
`.factory/polish-3.md`. The CLI remains a Rust single binary and the companion
site remains a static Vite deployment.

## What changed

- The `?demo=1` and `/demo` sample path remains isolated and now has a named,
  keyboard-focusable horizontal records region. At an overflow width, arrow
  keys scroll it horizontally and the designed moss focus ring is visible.
- Added four concrete demo claims and tests: search/reset, visible sample
  redaction markers, the sample conclusion, and generated redaction-rule
  provenance. The claim registry now contains 20 independently runnable tests.
- Reduced-motion users receive `scroll-behavior: auto`.
- Rewrote the demo lead/note to match tested behavior. **What the records
  show** replaces **Review cue**; README **What the CLI does not do** replaces
  **Scope**. The catalog description is now: “Create a redacted incident review
  from logs.”

## Exact verification evidence

From a fresh clone at `/tmp/log-incident-bundle-clean-round3-Gs4FYR`, this
sequence completed successfully:

```sh
npm ci
jq -r '.[].test' .factory/claims.json | while IFS= read -r test; do eval "$test"; done
```

It ran all 20 exact registered commands, including the four new commands:

```sh
npm test -- --grep @claim:demo-search
npm test -- --grep @claim:demo-redaction-preview
npm test -- --grep @claim:demo-conclusion
npm test -- --grep @claim:redaction-rule-provenance
```

The complete local checks passed:

```sh
npm test                         # 7 Rust tests, 38 browser tests, lifecycle checks
npm run build                    # writes dist/site
npm run typecheck
npm run lint
cargo fmt --check
cargo clippy --all-targets --all-features --locked -- -D warnings
cargo build --release --locked
cargo package --locked
npm audit --audit-level=high     # 0 vulnerabilities
npm run verify:url -- http://127.0.0.1:4173
```

A freshly unpacked `target/package/log-incident-bundle-0.1.3.crate` was
installed into a separate temporary Cargo root. Its `--help` and six-record
`--demo --json` run passed.

Lighthouse 13.4.1 mobile results:

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Local home | 98 | 100 | 100 | 100 | 2.406 s | 0 |
| Local demo | 100 | 100 | 100 | 100 | 0.904 s | 0 |
| Live home | 99 | 100 | 100 | 100 | 1.956 s | 0 |
| Live demo | 100 | 100 | 100 | 100 | 0.810 s | 0 |

Reports and visual evidence:

- `evidence/lighthouse-polish-3-local-home.json`
- `evidence/lighthouse-polish-3-local-demo.json`
- `evidence/lighthouse-polish-3-live-home.json`
- `evidence/lighthouse-polish-3-live-demo.json`
- `evidence/polish-3-live-demo-cold.png`
- `evidence/polish-3-live-demo-keyboard-721.png`
- `evidence/polish-3-live-demo-mobile.png`

## Deployment and cold live recheck

The product repair was pushed to `main`, built with `npm run build:site`, and
deployed with `/opt/fleet/lib/deploy-static.sh log-incident-bundle dist/site`.
Cold live checks then passed:

```sh
npm run verify:url -- https://log-incident-bundle.sociobot.in
PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npm test -- --skip-rust --skip-lifecycle
```

The URL verifier passed home, demo, privacy, terms, and real HTTP 404 routes at
1280 px and 390 px. The live browser suite passed all 38 tests, including full
axe coverage for the 721 px keyboard-scrollable records region. Fresh live
JS and `404.html` SHA-256 values match the local build:

```text
29e94791a01782c66bd4f54bf518e6401e757db4d30e6c9100a8bd9c3c56d4c4  assets/index-TSchd1I1.js
d81bc3ed7811775a961f041b460806a67b2005eb35f63454abbd468b68f1fe41  404.html
```

Initial JS is 11,424 B raw / 4,557 B gzip; CSS is 9,633 B raw / 2,814 B gzip;
the original hero asset is 237,060 B. No runtime third-party request,
analytics, account, upload, payment, or AI feature is present.

## Known gaps and next steps

None. Do not publish the crate from this worker; the factory owns registry
credentials. The release package is ready for the factory to publish with
`cargo package` and registry credentials.
