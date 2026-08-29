# Polish 3 — cumulative acceptance repair

**Reviewed candidate:** `7f4f067d7dc4f77d8beeabf2c81bd846ba53cb5d`  
**Product repair:** `5cc9dc6c1c7ca13300c4630698f68946a2ac19a2`  
**Deployed URL:** <https://log-incident-bundle.sociobot.in/?demo=1>  
**Deployment:** `c788662d-3631-4486-8655-551620f2b593`

This round read `review-1.md`, `review-2.md`, `review-3.md`, `polish-1.md`,
and `polish-2.md`, then rechecked the referenced verification history. Every
numbered finding is mapped below. There are no deferred minor findings.

## Review findings

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept initial document load out of route-focus handling; only in-app history transitions focus the new h1. | `fresh loads start keyboard navigation at the skip link`; live 38-browser-test run; <https://log-incident-bundle.sociobot.in/>. |
| F-1-2 | Kept the complete printout-style standalone `404.html` with metadata, skip link, header, footer, and legal links. | `standalone 404 has the standard shell, metadata, and legal links`; `npm run verify:url`; live `https://log-incident-bundle.sociobot.in/missing` is HTTP 404. |
| F-1-3 | Kept `landing preview` in the `demo-cli` claim location. | `@claim:demo-cli`; all 20 clean-clone claim commands; live demo screenshot [cold desktop](evidence/polish-3-live-demo-cold.png). |
| F-1-4 | Kept the concise README deployment sentences and audited them. | `.factory/copy-audit.md`; `@claim:delivery-policy`; live home check. |
| F-2-1 | Kept the first-screen install action and made **Start for real** leave demo at `/#install`. | `@claim:install-cli`; [live cold demo](evidence/polish-3-live-demo-cold.png); live browser suite. |
| F-2-2 | Kept all prior landing locations in `claims.json`, and added the newly audited demo and catalog locations. | all 20 exact claim commands from a clean clone; `@claim:site-log-privacy`; live home/demo suite. |
| F-2-3 | Kept the README’s exact RFC 3339 wording and example. | `@claim:bounds-correlation`; README copy audit; live deploy source matches the repair build. |
| F-3-1 | Made the overflowing incident-records region tabbable, named it “Incident records; scroll horizontally,” and styled its focus ring. The test proves arrow-key horizontal scrolling at 721 px and fails on any axe violation. | `demo has no accessibility violations and its overflowing records are keyboard-scrollable`; [live focused 721 px](evidence/polish-3-live-demo-keyboard-721.png); live `/demo` suite. |
| F-3-2 | Added the `demo-search` claim and tagged clean-state test; the demo copy now says exactly what is searchable. | `@claim:demo-search`; [live mobile demo](evidence/polish-3-live-demo-mobile.png); live `/?demo=1` suite. |
| F-3-3 | Added the `redaction-rule-provenance` claim and a generated-artifact test covering all five defaults plus a local custom label. The demo note now names the generated review accurately. | `@claim:redaction-rule-provenance`; [live cold demo](evidence/polish-3-live-demo-cold.png); live browser suite. |
| F-3-4 | Added a reduced-motion media rule that changes root smooth scrolling to `auto`. | `reduced-motion mode disables smooth scrolling`; live browser suite against `/`. |
| F-3-5 | Replaced **Review cue** with the out-of-context heading **What the records show**. | `@claim:demo-conclusion`; [live mobile demo](evidence/polish-3-live-demo-mobile.png); live `/?demo=1` check. |
| F-3-6 | Replaced README **Scope** with **What the CLI does not do** and recorded it in the copy audit. | `.factory/copy-audit.md`; `@claim:finite-review`; live deploy source matches the repair build. |

## Earlier findings retained and reverified

The earlier reviews also grouped several fixed defects without stable F IDs.
They remain covered by the following current evidence; no historical repair was
removed or weakened.

| Earlier finding group | Current evidence |
| --- | --- |
| Malformed generated rows, search, CSV, SHA-256 provenance, and script-boundary injection | `@claim:portable-html`; `generated bundle keeps script-boundary content inert`; packaged CLI check; live browser suite. |
| Quoted JSON, token, AKIA/ASIA, Basic authorization, cookie, and PEM redaction | `@claim:default-redaction`; Rust `quoted_multiline_private_key_keeps_every_record_on_its_source_line`; live suite. |
| Invalid/reversed bounds and correlation behavior | `@claim:bounds-correlation`; `CLI rejects invalid and inverted time bounds before creating output`; live suite. |
| Six-record CLI demo, unique private temporary output, and hostile-symlink safety | `@claim:demo-cli`; clean packaged-install `--demo --json` check; live demo screenshot [cold desktop](evidence/polish-3-live-demo-cold.png). |
| Browser demo isolation, reset/exit, no storage, no external runtime traffic, and CSV export | `@claim:local-processing`, `@claim:csv-download`, `demo reset and exit discard the demo namespace`; live `/?demo=1` browser suite. |
| Mobile targets, no artifact overflow, route focus/back behavior, and generated-review skip link | `390px demo has no overflow and all primary controls meet touch size`; `390px generated CLI artifact has no page-level overflow`; `route navigation moves focus to the new page heading`; live mobile verifier. |
| F-11-1 — quoted multiline PEM provenance | Rust `quoted_multiline_private_key_keeps_every_record_on_its_source_line`; `@claim:default-redaction`; packaged CLI check. |
| F-11-2 — undersized GitHub link | `landing source link and skip link meet touch size at desktop and 390px`; live mobile verifier. |
| F-11-3 — missing generated-review skip link | `@claim:portable-html`; live generated-artifact browser coverage. |
| Paid-license regression, missing legal routes/titles/metadata/404, cache/framing policy, and dependency audit | `@claim:mit-license`, `@claim:delivery-policy`, `legal routes set page titles`, `standalone 404 has the standard shell, metadata, and legal links`; `npm audit --audit-level=high`; live URL verifier. |
| Missing URL verifier, rustfmt/Clippy, terminal recording, and deployment identity | `npm run verify:url`, `cargo fmt --check`, strict Clippy, `@claim:terminal-recording`; local/live JS SHA-256 `29e94791a01782c66bd4f54bf518e6401e757db4d30e6c9100a8bd9c3c56d4c4`. |

## Verification and live recheck

- A fresh clone at `/tmp/log-incident-bundle-clean-round3-Gs4FYR` ran `npm ci`
  and every one of the 20 exact `claims.json` commands independently.
- Local: `npm test` (7 Rust tests, 38 browser tests, and lifecycle checks),
  `npm run build`, typecheck, lint, `cargo fmt --check`, strict Clippy,
  release build, `cargo package --locked`, and `npm audit --audit-level=high`
  all passed. A fresh unpacked crate was installed into a temporary consumer
  root; its help and six-record `--demo --json` flow passed.
- The local URL verifier passed home, demo, privacy, terms, and missing routes
  at 1280 px and 390 px. The focused 721 px and mobile evidence are
  [local keyboard](evidence/polish-3-local-demo-keyboard-721.png) and
  [local mobile](evidence/polish-3-local-demo-mobile.png).
- Cold live recheck: `npm run verify:url -- https://log-incident-bundle.sociobot.in`
  passed all ten route/viewport checks, including real HTTP 404. The deployed
  38-test browser run also passed. Direct `?demo=1` retains the banner, reset,
  start-for-real handoff, six records, keyboard table focus, and zero storage.
- Lighthouse 13.4.1 mobile: local home **98/100/100/100** and demo
  **100/100/100/100**; live home **99/100/100/100** and demo
  **100/100/100/100** (performance/accessibility/best-practices/SEO).
  Reports are in `evidence/lighthouse-polish-3-*.json`.
