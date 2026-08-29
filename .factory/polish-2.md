# Polish 2 — cumulative acceptance repair

**Base reviewed:** `fa7b8c7356405f55158e50c737220b61023128af`  
**Repair commits:** `e8a1e87da8108ffa0a62f81fae82d46bae8d8a83`, `22e30d76a6281796a44cb2241c9f7546521184ae`
**Deployed URL:** https://log-incident-bundle.sociobot.in

All findings in `review-1.md`, `review-2.md`, every available verification
report, and `polish-1.md` were treated as acceptance work. The earlier repair
remains covered by the full regression suite; this round implements the three
remaining/reopened findings below.

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| F-2-1 — Start for real had no real-use path | Added a first-screen **Install the CLI** action and styled `#install` section with a copyable locked Cargo source-install command and public-source link. **Start for real** exits demo to `/#install`. | `@claim:install-cli`; [live install screenshot](evidence/polish-2-live-install.png); live `/?demo=1` check. |
| F-2-2 — incomplete published claim locations | Registered landing redaction/no-account locations and the install claim. Strengthened the privacy test to reject upload, sign-in, registration, and account affordances. | `.factory/claims.json`; `@claim:site-log-privacy`; all 16 exact clean-clone claim commands pass. |
| F-2-3 — vague ISO-like timestamp wording | Replaced the README wording with RFC 3339 and a concrete timestamp. | `.factory/copy-audit.md`; `@claim:bounds-correlation`. |
| F-1-1 — fresh focus skipped skip link | Retained the prior initial-load focus fix and its regression test. | `fresh loads start keyboard navigation at the skip link`. |
| F-1-2 — incomplete HTTP 404 shell | Retained the full standalone 404 and shell/metadata regression test. | `standalone 404 has the standard shell, metadata, and legal links`; `verify-url.sh`. |
| F-1-3 — landing preview claim location | Retained the `landing preview` registry location. | `@claim:demo-cli`. |
| F-1-4 — overlong deployment sentence | Retained concise README deployment copy and audit. | `.factory/copy-audit.md`. |
| verification.md / verification-1 / verification-2 — generated artifact, XSS, redaction, and invalid bounds | Retained safe rendering, artifact, redaction, and bounds behavior. | `@claim:portable-html`, `@claim:default-redaction`, Rust unit tests. |
| verification.md / verification-1 / verification-2 — CLI demo count and isolation | Retained six-record, unique-temp-dir CLI demo and isolated browser `?demo=1` path with banner/reset. | `@claim:demo-cli`, `@claim:local-processing`, `query demo entry is isolated and uses demo metadata`. |
| verification-3 — AWS/token redaction, artifact mobile, framing | Retained coverage and delivery policy. | `@claim:default-redaction`, `390px generated CLI artifact has no page-level overflow`, `@claim:delivery-policy`. |
| verification-1 / verification-2 — routing, legal pages, 404, cache, license, and dependency issues | Retained route titles, legal links, real 404, cache/security policy, no paid flow, and clean dependencies. | `verify-url.sh`; `@claim:mit-license`; `@claim:delivery-policy`; `npm audit --audit-level=high`. |
| verification-4 — candidate/deployment identity | Built and deployed `22e30d7`; live HTML references `assets/index-CL8JLeTG.js`, the current local build asset. | Azure deployment `866764c8-9d42-4310-8017-4fd053331bd3`; live suite pass. |

## Verification and live recheck

- Fresh clone `/tmp/log-incident-bundle-clean-final-BjzP8d`: `npm ci` plus all
  16 exact commands in `.factory/claims.json` passed.
- Local: `npm test` passed 6 Rust tests, 34 browser tests, and 3 concurrent
  lifecycle checks. `npm run build`, typecheck, lint, strict Clippy, rustfmt,
  `cargo package --locked`, and audit passed.
- Live: `PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npm test`
  passed 6 Rust and 34 browser tests. `./verify-url.sh` passed all five routes
  at 1280 px and 390 px, including the real HTTP 404 and axe checks.
- Evidence: [local install](evidence/polish-2-local-install.png), [local demo
  mobile](evidence/polish-2-local-demo-mobile.png), [live install](evidence/polish-2-live-install.png),
  [live demo mobile](evidence/polish-2-live-demo-mobile.png), and
  [Lighthouse JSON](evidence/lighthouse-polish-2-local-demo.json).
