# Repair 8 handoff — ready for deployment

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

The repair commits are ready to push to `main`, which is the repository's
static deployment workflow. After the push, this handoff will be updated with
the deployed revision and live URL evidence.

## Known gaps and next steps

No known product gap remains from verification 11. This is a deterministic,
local CLI; no account, payment, upload, backend, AI call, PWA update flow, or
runtime external service is present. The static site has no service worker, so
there is no service-worker update path to test.
