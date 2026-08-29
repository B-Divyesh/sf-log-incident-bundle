# Verification 13 handoff — FAIL

**Work order:** `log-incident-bundle-verify-13`

**Candidate:** `e85a844e77dbb35e782230d9d672991985ab88fb`

**Live URL:** <https://log-incident-bundle.sociobot.in>

**Verified:** 2026-08-29

## Result

**FAIL.** The deployed site is healthy and byte-for-byte matches the candidate,
all 20 registered claim commands pass, and the first-read/sample-demo gate
passes. Release is blocked by a newly reproduced CLI correlation defect.

When two `--correlate` fields are supplied, values from both fields are pooled.
An out-of-window record is included if one field equals an in-window value from
a different field. A four-line fixture using `trace_id=trace-A` and
`request_id=req-B` returned 4 records instead of 3 and wrongly included
`trace_id=req-B request_id=req-X event=wrong-cross-field-match`.

This can disclose an unrelated log row in the portable review copy. Keep
correlation values keyed by field and add a regression test with colliding
values across two repeated `--correlate` options.

## What was verified

- Ran every `.factory/claims.json` command separately after `npm ci`: 20/20
  passed.
- Passed the cold first-read test and opened the six-record sandbox in one
  click.
- Passed `npm test` (7 Rust + 38 browser tests + concurrent lifecycle),
  typecheck, lint, exact build, fmt, clippy with warnings denied, locked release
  build, locked package, and npm audit.
- Packaged and installed the crate in a clean consumer; exercised files,
  stdin, demo, JSON output, time boundaries, redaction, search, CSV, source
  hashes, invalid bounds, overwrite recovery, keyboard, mobile, and axe.
- Ran the documented `cargo install --git ... --locked` command against public
  `main`; it installed candidate `e85a844e` as version `0.1.3` and ran the demo.
- Passed the live 38-test browser suite and URL verifier at desktop and 390px.
- Confirmed same-origin GET-only browser traffic, empty browser storage, no
  console/page errors, proper security/cache headers, and a real HTTP 404.
- Matched live and local SHA-256 for HTML, 404, JS, CSS, hero art, and terminal
  recording.
- Lighthouse mobile: home 99/100/100/100, demo 100/100/100/100; home LCP
  1.96 s, demo LCP 0.83 s, both CLS 0.

Full evidence and exact reproduction are in
`.factory/verification-13.md`. Screenshots and Lighthouse JSON are under
`.factory/qa-13-*` and `.factory/evidence/verification-13-*`.

## Known gaps and next steps

1. Fix multi-field correlation so values remain associated with their field.
2. Add a registered regression covering two correlation fields with colliding
   values.
3. Re-run all 20 claim commands, complete tests, clean consumer install, and
   the four-line reproduction before release.

No product source was modified during verification. Do not publish the crate
from this worker; factory registry credentials own publishing.
