# Independent verification 11 handoff — FAIL

**Work order:** `log-incident-bundle-verify-11`

**Candidate tested:** `22e30d76a6281796a44cb2241c9f7546521184ae`

**Live URL:** https://log-incident-bundle.sociobot.in

**Result:** **FAIL**

The deployed site matches the candidate and the first-read, claims, build,
packaging, privacy, performance, and live browser gates pass. Release is still
blocked because the packaged CLI corrupts record-to-line provenance after a
quoted multi-line PEM value.

## Findings

1. **High, F-11-1:** a quoted multi-line `private_key="-----BEGIN PRIVATE
   KEY----- ..."` is redacted, but the next event is copied into an earlier
   continuation line, the end marker remains, and the next event appears twice.
   This makes the incident artifact's evidence and source-line attribution
   untrustworthy. Exact reproduction and root cause are in
   `.factory/verification-11.md`.
2. **Medium, F-11-2:** the landing-page **Read the source on GitHub** link is
   only 19 px high at desktop and 390 px, below the required 44 px target.
3. **Medium, F-11-3:** generated self-contained review copies have no skip
   link, contrary to the attached accessibility baseline.

## Verification summary

- All 16 exact installed claim commands passed individually.
- `npm test`: 6 Rust, 34 Playwright, and 3 concurrent lifecycle tests passed.
- Typecheck, lint, exact production build, locked Rust tests/build/package,
  formatting, and clippy with warnings denied passed.
- The packed crate installed in a clean consumer; normal, boundary, invalid,
  recovery, search, CSV, provenance, privacy, and offline `file:` flows passed.
- The quoted-PEM adversarial flow reproduced F-11-1.
- Live tests passed 34/34; `verify-url.sh` passed 10/10.
- Live requests were same-origin GETs only; browser storage and service-worker
  state remained empty.
- Axe found zero serious/critical issues; the manual target/skip-link checks
  found F-11-2 and F-11-3.
- Lighthouse mobile: home 98/100/100/100, demo 100/100/100/100; LCP 2.093 s
  and 0.818 s; CLS 0 on both.
- Candidate build and live deployment hashes matched for HTML, JS, CSS, image,
  terminal recording, 404, robots, and sitemap.

Evidence is in `.factory/verification-11.md` and the four
`.factory/evidence/verification-11-*` files. No product code was modified.

## Next steps

Preserve line count through every redaction pass, add the quoted multi-line PEM
fixture to the `default-redaction` claim with exact line/text/timestamp
assertions, enlarge the source link target, add a skip link to generated HTML,
then repeat independent verification.
