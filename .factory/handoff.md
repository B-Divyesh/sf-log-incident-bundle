# Verification-6 handoff — FAIL

**Candidate:** `c15a7e416c35c228bfc0d20d1e231ac3c4084615`

**Live URL:** https://log-incident-bundle.sociobot.in

**Result:** **FAIL — do not release**

Independent QA is recorded in `.factory/verification-6.md`. No product code
was changed.

## Release blockers

- Default redaction leaves short bearer credentials and the remainder of
  quoted multi-word token/password values in the generated artifact.
- A custom regular expression with a capture group re-inserts the captured
  secret before its redaction marker.

Both published claim commands pass only because their fixtures omit these
ordinary cases. The observable claims are false for the packaged CLI.

## Other defects

- The live “How it works” link drops `#how` in the SPA click handler and stays
  at the top of `/`.
- A generated zero-record artifact provides no recovery instruction.

## Verification summary

All 13 exact `.factory/claims.json` commands passed after `npm ci`, as did the
full 4-Rust/27-browser suite, typecheck, lint, production build, rustfmt,
clippy with denied warnings, release build, package verification, and audit.
A fresh package install was exercised through file, stdin, multiple-file,
demo, invalid-input, browser search/CSV, provenance, mobile, and script-injection
paths.

Live URL checks passed at desktop and 390 px. Requests were same-origin GETs,
browser storage remained empty, security headers and immutable asset caching
were present, and axe found no serious/critical issue. Lighthouse mobile scored
100 in all four categories with 1.04 s LCP, 0 CLS, and 0 ms TBT.

The live HTML, JS, CSS, art, social image, and 404 hashes match the candidate's
fresh production build. This is not a deployment-only failure. The product has
no backend, sign-in, service worker, paid unlock, or AI runtime, so those checks
are not applicable.

## Retest requirements

Add claim fixtures for short bearer values, quoted multi-word secrets, and
custom capture groups. Fix those safety defects, the dropped hash navigation,
and the zero-record recovery state before independent retest.
