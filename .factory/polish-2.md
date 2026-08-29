# Polish 2 — cumulative acceptance repair

**Base reviewed:** `fa7b8c7356405f55158e50c737220b61023128af`  
**Repair commit:** pending  
**Deployed URL:** https://log-incident-bundle.sociobot.in

All findings in `review-1.md`, `review-2.md`, every available verification
report, and `polish-1.md` were treated as acceptance work. The earlier repair
remains covered by the full regression suite; this round implements the three
remaining/reopened findings below.

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| F-2-1 — Start for real had no real-use path | Added a first-screen **Install the CLI** action; added a styled `#install` section with a copyable `cargo install --git` command and public-source link; **Start for real** now exits demo to `/#install`. | `@claim:install-cli`; full `npm test`; local browser check at `/?demo=1`; post-deploy check pending. |
| F-2-2 — incomplete published claim locations | Registered landing redaction and no-account locations; strengthened the account/privacy claim test to reject sign-in, registration, and account controls. | `.factory/claims.json`; `@claim:site-log-privacy`; all exact claim commands pending clean-clone run. |
| F-2-3 — vague ISO-like timestamp wording | Replaced the README wording with RFC 3339 and a concrete timestamp. | README copy audit; `@claim:bounds-correlation`. |
| F-1-1 — fresh focus skipped skip link | Retained the prior initial-load focus fix and its regression test. | `fresh loads start keyboard navigation at the skip link`. |
| F-1-2 — incomplete HTTP 404 shell | Retained the full standalone 404 and shell/metadata regression test. | `standalone 404 has the standard shell, metadata, and legal links`; `verify-url.sh`. |
| F-1-3 — landing preview claim location | Retained the `landing preview` registry location. | `@claim:demo-cli`. |
| F-1-4 — overlong deployment sentence | Retained concise README deployment copy and audit. | `.factory/copy-audit.md`. |
| verification.md / verification-1 / verification-2 — generated artifact, XSS, redaction, and invalid bounds | Retained safe rendering, artifact, redaction, and bounds behavior. | `@claim:portable-html`, `@claim:default-redaction`, Rust unit tests. |
| verification.md / verification-1 / verification-2 — CLI demo count and isolation | Retained six-record, unique-temp-dir CLI demo and isolated browser `?demo=1` path with banner/reset. | `@claim:demo-cli`, `@claim:local-processing`, `query demo entry is isolated and uses demo metadata`. |
| verification-3 — AWS/token redaction, artifact mobile, framing | Retained coverage and delivery policy. | `@claim:default-redaction`, `390px generated CLI artifact has no page-level overflow`, `@claim:delivery-policy`. |
| verification-1 / verification-2 — routing, legal pages, 404, cache, license, and dependency issues | Retained route titles, legal links, real 404, cache/security policy, no paid flow, and clean dependencies. | `verify-url.sh`; `@claim:mit-license`; `@claim:delivery-policy`; `npm audit --audit-level=high`. |
| verification-4 — candidate/deployment identity | Fresh build and deployed hashes will be recorded after the pushed static deployment is rechecked. | pending post-deploy evidence. |

## Verification and live recheck

The final commit, full clean-clone claim run, local suite, deployed URL checks,
and screenshots are recorded in `.factory/handoff.md` after deployment.
