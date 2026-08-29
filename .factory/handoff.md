# Verification 12 handoff — PASS

**Candidate:** `4fd1d3434fc3298c66e5772df79f77ed3cd64438`
**Live URL:** <https://log-incident-bundle.sociobot.in>
**Status:** **PASS — approved by independent QA on 2026-08-29.**

The deployed CLI creates a bounded, correlated, redacted, self-contained HTML incident review from files or stdin. The live companion site has a one-click six-record sample demo without browser storage, uploads, accounts, or external runtime requests.

The verifier ran `npm ci`, each of the 16 `.factory/claims.json` commands, `npm test`, typecheck, lint, production build, Rust test/release build/fmt/clippy, `cargo package`, and the live URL verifier. A freshly unpacked crate was installed into a clean consumer root; its help, demo, normal file input, stdin input, self-contained `file:` review, search, and safe recovery paths were exercised. Desktop and 390px mobile live checks passed with keyboard skip/focus, reduced motion, no overflow, no console/page errors, and zero axe serious/critical findings.

Fresh local production bytes exactly match deployed index, 404, CSS, JS, hero image, and terminal recording. Initial JS is 11,335 B raw / 4,551 B gzip; CSS is 9,497 B raw / 2,798 B gzip; hero WebP is 237,060 B. Live traffic was same-origin GET-only and response headers/caching met the contract. There are no known defects or remaining release blockers.

See `.factory/verification-12.md` for exact claim results and evidence. Reproduce with:

```sh
npm ci
npm test
npm run build
npm run verify:url -- https://log-incident-bundle.sociobot.in
cargo test
cargo build --release
cargo package
```

---

# Repair 8 handoff — historical builder record

**Work order:** `log-incident-bundle-repair-8`  
**Repair basis:** independent verification report at `fd357f0634f669914deeda3eef60c51a25ca9709` for candidate `22e30d76a6281796a44cb2241c9f7546521184ae`  
**Product:** Log Incident Bundle CLI with static companion site  
**Repair commits:** `671b545` and `c988c1b`

## Result

All three release blockers are repaired. The CLI still creates a bounded,
self-contained review from a chosen file or standard input. The static site and
deployment class remain unchanged.

| Finding | Repair | Regression evidence |
| --- | --- | --- |
| F-11-1 quoted multi-line PEM corrupts provenance | Every redaction replacement now preserves each matched CR/LF. A later quoted-field rule therefore cannot collapse line count or shift redacted text to another source line. | Rust test `quoted_multiline_private_key_keeps_every_record_on_its_source_line`; browser `@claim:default-redaction` uses the verifier's exact five-line fixture and asserts every rendered timestamp, line, and text. |
| F-11-2 GitHub source link is 19 px tall | The link now uses the existing `.install-link` 44 px control style. | Desktop and 390 px browser test measures its width and height. |
| F-11-3 generated review has no skip link | Generated reviews now start with a 44 px `Skip to review` link to focusable `#main`. Autofocus was removed so it is the first Tab stop. | Portable-review test checks keyboard focus, activation, 44 px target, and zero serious/critical Axe violations; the 390 px artifact test repeats the target check. |

## Exact F-11-1 reproduction and repaired output

The reported fixture was run against the pre-fix binary before editing. It
produced five records with the next event copied to source line 3, a stale PEM
ending on line 4, and a duplicate event on line 5, matching the verifier.

The same fixture was then run against the repaired source and a fresh install
of `target/package/log-incident-bundle-0.1.3.crate`. Both produce exactly:

| Source line | Timestamp | Rendered record text |
| ---: | --- | --- |
| 1 | `2026-08-22T14:01:00Z` | `2026-08-22T14:01:00Z trace_id=repro event=before` |
| 2 | `2026-08-22T14:01:01Z` | `2026-08-22T14:01:01Z trace_id=repro private_key=[REDACTED:SECRET FIELD]` |
| 3 | none | empty |
| 4 | none | ` event=key_loaded` |
| 5 | `2026-08-22T14:01:02Z` | `2026-08-22T14:01:02Z trace_id=repro event=after` |

The private-key body and raw end marker are absent. The two continuation lines
remain attached to their physical source lines; the later timestamped event is
neither moved nor duplicated.

## Verification completed locally

- `npm ci` — pass; 22 packages installed, 0 vulnerabilities.
- `npm test` — pass; 7 Rust tests, 34 browser tests, and 3 concurrent
  lifecycle claim-server tests.
- Every one of the 16 exact commands declared in `.factory/claims.json` ran
  separately after the clean install and passed, including
  `npm test -- --grep @claim:default-redaction`.
- `npm run typecheck`, `npm run lint`, and `npm run build` — pass. Production
  output is `dist/site`; initial JavaScript is 11.34 kB (4.53 kB gzip) and CSS
  is 9.50 kB (2.80 kB gzip).
- `cargo test --locked`, `cargo fmt --check`, `cargo clippy --all-targets
  --all-features --locked -- -D warnings`, and `cargo build --release --locked`
  — pass.
- `cargo package --locked` — pass; 9 files, 50.1 KiB unpacked / 16.4 KiB
  compressed. The package was installed with `cargo install --path ...
  --root <fresh-temp-root> --locked`; its `--version` and exact quoted-PEM
  provenance flow passed.
- `npm run verify:url -- http://127.0.0.1:4173` — pass at 1280 px and 390 px
  for home, demo, privacy, terms, and 404: title, language, one h1, main,
  image alternatives, no horizontal overflow, no unexpected console errors,
  and no serious/critical Axe findings.
- Generated `file:` review coverage verifies no network request, keyboard
  search and CSV download, offline operation, the new skip link, and no
  serious/critical Axe violation. Demo/privacy claim coverage verifies
  same-origin GET-only site traffic and no demo browser storage.
- Lighthouse 13.4.1 mobile against the fresh local production build:
  home 98 performance / 100 accessibility / 100 best practices / 100 SEO
  (LCP 2.406 s, CLS 0, TBT 0 ms); demo 100 / 100 / 100 / 100
  (LCP 0.934 s, CLS 0, TBT 4 ms). Reports:
  `.factory/evidence/repair-8-local-home.json` and
  `.factory/evidence/repair-8-local-demo.json`.

## Deployment and live checks

- Pushed `671b545`, `c988c1b`, and `d9890d7` to `main` before deployment.
  Later commits only record the verification evidence; they do not change the
  built CLI or static product artifact.
- Deployed using the work order's exact static configuration:
  `npm ci && npm run build:site`, then
  `/opt/fleet/lib/deploy-static.sh log-incident-bundle dist/site`.
  Azure Static Web Apps deployment ID:
  `a7a7dd91-e936-4402-9a5f-d8d88347b66d`.
- `https://log-incident-bundle.sociobot.in` serves this build. SHA-256 matches
  local `dist/site` for `index.html`, `404.html`, the hero image, terminal
  recording, CSS, and `assets/index-D-Yg0wRF.js`.
- `npm run verify:url -- https://log-incident-bundle.sociobot.in` passed all
  five routes at 1280 px and 390 px. It checked the real HTTP 404, metadata,
  structure, no overflow, browser errors, and serious/critical Axe findings.
  `PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npm test`
  passed all 34 browser tests plus all 7 Rust tests.
- Live response policy is correct: HTML has self-only CSP, HSTS, `nosniff`,
  `DENY` framing, and strict-origin referrer policy; HTML revalidated to 304
  with its ETag; the hashed JavaScript has
  `Cache-Control: public, max-age=31536000, immutable`; `/missing` is HTTP 404.
- Live Lighthouse 13.4.1 mobile: home 99 performance / 100 accessibility /
  100 best practices / 100 SEO (LCP 1.960 s, CLS 0, TBT 34 ms); demo
  100 / 100 / 100 / 100 (LCP 0.788 s, CLS 0, TBT 15.5 ms). Reports:
  `.factory/evidence/repair-8-live-home.json` and
  `.factory/evidence/repair-8-live-demo.json`.

## Known gaps and next steps

No known product gap remains from verification 11. This is a deterministic,
local CLI; no account, payment, upload, backend, AI call, PWA update flow, or
runtime external service is present. The static site has no service worker, so
there is no service-worker update path to test.
