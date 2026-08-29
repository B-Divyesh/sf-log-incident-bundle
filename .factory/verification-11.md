# Independent verification 11 — FAIL

**Candidate:** `22e30d76a6281796a44cb2241c9f7546521184ae`

**Verified:** 2026-08-29

**Live URL:** https://log-incident-bundle.sociobot.in

**Verdict:** **FAIL — the live deployment matches the candidate and the declared tests pass, but a supported quoted multi-line private-key value corrupts record text and source-line provenance in the generated review copy.**

## Defects by severity

### High — F-11-1: quoted multi-line private keys corrupt the review evidence

The packaged CLI removes the private-key body, but its next redaction pass
collapses the retained line breaks when the PEM is a quoted field value. The
artifact then maps redacted text back to the original line numbers incorrectly.
This duplicates the following event, associates it with the wrong line, and
leaves a stray `-----END PRIVATE KEY-----` continuation in the evidence.

Independent reproduction with the clean packaged binary:

```text
2026-08-22T14:01:00Z trace_id=repro event=before
2026-08-22T14:01:01Z trace_id=repro private_key="-----BEGIN PRIVATE KEY-----
SENSITIVE_PRIVATE_KEY_BODY
-----END PRIVATE KEY-----" event=key_loaded
2026-08-22T14:01:02Z trace_id=repro event=after
```

```sh
log-incident-bundle quoted-pem.log --output review.html --json
```

The command succeeds and reports five records. The rendered rows are:

```text
line 1  event=before
line 2  private_key=[REDACTED:SECRET FIELD] event=key_loaded
line 3  2026-08-22T14:01:02Z ... event=after       # wrong text and no timestamp column
line 4  -----END PRIVATE KEY-----" event=key_loaded # stale continuation
line 5  2026-08-22T14:01:02Z ... event=after       # duplicated
```

The private-key body was absent, so this reproduction is an evidence-integrity
failure rather than a demonstrated secret leak. It still blocks the core job:
the recipient cannot trust that a displayed record came from the shown source
line. It also contradicts the README statement that complete multi-line PEM
blocks are removed.

The implementation explains the failure: the quoted branch of the secret-field
regular expression can span newlines, so it removes the line breaks preserved
by the earlier PEM rule. `redact_selected_records` then indexes the shortened
redacted text by line number and applies it to the original records. The
declared `default-redaction` test covers an unquoted PEM but not this quoted
form.

Required repair: prevent later rules from changing record line count, preserve
source-line mapping for every multi-line replacement, add this exact quoted-PEM
fixture to the claim test, and assert every rendered row's line number, text,
and timestamp rather than only record count and secret absence.

### Medium — F-11-2: the source-install link is a 19 px touch target

At both 1440 px and 390 px, **Read the source on GitHub** has a rendered box
height of 19 px. The attached accessibility and design contracts require every
touch target to be at least 44 by 44 CSS pixels. This is also the public-source
handoff used to obtain the CLI. Other tested links and controls meet the size
requirement.

### Medium — F-11-3: generated review copies have no skip link

The self-contained HTML artifact has one `main` landmark and keyboard-operable
search/download controls, but it contains no link that skips to `main` or the
evidence section. The website and 404 have one. The attached accessibility
baseline requires a skip link, including in the actual generated deliverable.
Axe does not detect this omission and reported no automated violation.

## First read

The cold live first screen passes at desktop and 390 px without scrolling:

- what it does: **Create a redacted log excerpt**;
- who it is for: **For teams who need answers without granting raw production-log access**;
- what to do first: **Try it with sample data**;
- what happens next: **See a redacted incident review first**.

The one-click action opened the six-record checkout review. The first screen
also states the chosen input, self-contained output, and MIT/no-account facts.
Evidence:
`.factory/evidence/verification-11-live-home-mobile.png` and
`.factory/evidence/verification-11-live-demo-mobile.png`.

## Claims gate

`.factory/claims.json` exists and contains 16 entries. Before other product
inspection, I invoked all 16 exact commands. In the untouched checkout they
stopped before product execution because `node_modules` did not exist and Node
could not import Vite. After the required clean-clone `npm ci`, I invoked every
exact command again, individually, against the shipped demo/sample entry
points. All 16 product tests passed. The complete installed-run output was
captured during verification at
`/tmp/log-incident-claims-installed-22e30d7.log`.

| Claim | Exact declared command | Result |
| --- | --- | --- |
| `portable-html` | `npm test -- --grep @claim:portable-html` | PASS |
| `default-redaction` | `npm test -- --grep @claim:default-redaction` | PASS |
| `output-safety` | `npm test -- --grep @claim:output-safety` | PASS |
| `cli-inputs` | `npm test -- --grep @claim:cli-inputs` | PASS |
| `bounds-correlation` | `npm test -- --grep @claim:bounds-correlation` | PASS |
| `custom-redaction` | `npm test -- --grep @claim:custom-redaction` | PASS |
| `local-processing` | `npm test -- --grep @claim:local-processing` | PASS |
| `site-runtime` | `npm test -- --grep @claim:site-runtime` | PASS |
| `site-log-privacy` | `npm test -- --grep @claim:site-log-privacy` | PASS |
| `install-cli` | `npm test -- --grep @claim:install-cli` | PASS |
| `csv-download` | `npm test -- --grep @claim:csv-download` | PASS |
| `demo-cli` | `npm test -- --grep @claim:demo-cli` | PASS |
| `terminal-recording` | `npm test -- --grep @claim:terminal-recording` | PASS |
| `finite-review` | `npm test -- --grep @claim:finite-review` | PASS |
| `mit-license` | `npm test -- --grep @claim:mit-license` | PASS |
| `delivery-policy` | `npm test -- --grep @claim:delivery-policy` | PASS |

The landing page, legal pages, demo documentation, README, and copy audit were
cross-checked against the manifest. Visitor-facing promises have manifest
entries. F-11-1 is a coverage gap inside `default-redaction`, not a missing
manifest row.

## Clean local gates

```text
npm ci                                                    PASS — 22 packages, 0 vulnerabilities
npm test                                                  PASS — 6 Rust, 34 Playwright, 3 concurrent lifecycle tests
npm run typecheck                                         PASS
npm run lint                                              PASS
npm run build                                             PASS — exact production build in dist/site
cargo test --locked                                       PASS — 6 tests
cargo fmt --check                                         PASS
cargo clippy --all-targets --all-features --locked -- -D warnings
                                                          PASS
cargo build --release --locked                            PASS
cargo package --locked                                    PASS — 9 files, 47.8 KiB / 15.9 KiB compressed
```

`./verify-url.sh https://log-incident-bundle.sociobot.in` passed all ten
desktop/mobile route checks for home, demo, privacy, terms, and a real HTTP
404. `PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npm test`
passed 6 Rust and 34 live browser tests.

## Packaged CLI and job-to-be-done

I unpacked `target/package/log-incident-bundle-0.1.3.crate` into a new consumer
directory and installed it to a separate Cargo root with `--locked`. I also ran
the exact landing-page source command from a clean root; it installed public
commit `ffddd58e` and its demo produced six records. That commit contains the
same CLI code as the candidate.

The installed candidate binary independently passed these flows:

- `--help`, `--version`, and machine-readable `--json` output;
- two `--demo --json` runs created different private mode-0700 directories;
- a two-second file window plus `trace_id` correlation selected six linked
  records and excluded the health check;
- standard input with equal inclusive bounds selected one record;
- two input files produced 12 records and two provenance entries;
- empty input produced a valid zero-record artifact with recovery guidance;
- source SHA-256 matched the sample bytes:
  `2c25ff4f5695ef4c133c100f266f1375a689b24580b78970c03b18138e235b4e`;
- missing input, invalid RFC 3339, inverted bounds, an existing output, and an
  unknown option returned nonzero (`1`, `1`, `1`, `1`, and `2`); the existing
  output remained byte-empty;
- a script-boundary payload remained inert;
- normal generated HTML opened from `file:`, showed six rows, downloaded a
  seven-line CSV by keyboard, made no network request, had no overflow or
  browser errors, and had zero serious/critical axe findings.

The quoted-PEM flow then reproduced F-11-1 in this clean packaged consumer.

## Live deployment, privacy, and accessibility

- Home, demo, privacy, terms, and 404 were checked at 1440 by 900 and 390 by
  844. Each has `lang=en`, one `h1`, one `main`, valid image alternatives,
  zero horizontal overflow, and zero serious/critical axe findings.
- Normal pages produced no console or page errors. The intentional missing URL
  produced the browser's expected failed-document 404 console message.
- Fresh demo flow made only same-origin `GET` requests. Search, reset, CSV, and
  exit created no localStorage/sessionStorage keys, IndexedDB databases, cache
  entries, OPFS entries, or service-worker registrations.
- The demo started with six rows, filtered `timeout` to one row, reset to six,
  and downloaded a seven-line CSV containing `duplicate_charge=false`.
- The first Tab stop is the 44 px skip link with a 3 px designed outline.
  Demo entry worked with Enter; reset and CSV worked with Space; route changes
  focused the new `h1`; no keyboard trap appeared.
- Reduced-motion contexts reported zero running animations. Axe reported zero
  WCAG 2 A/AA violations on all audited live routes.
- All internal routes, metadata assets, robots, sitemap, and the public GitHub
  source link returned 200. A missing route returned 404 with the styled shell.
- F-11-2 and F-11-3 remain despite the passing automated accessibility checks.

Response logs showed a self-only CSP with `frame-ancestors 'none'`, HSTS,
`nosniff`, `DENY` framing, and `strict-origin-when-cross-origin`. HTML uses
30-second revalidation; JS, CSS, WebP, and SVG assets use one-year immutable
caching. An `If-None-Match` HTML request returned 304.

There is no runtime backend, API, product-unlock call, sign-in, account,
payment, upload, or service worker. Server concurrency/persistence, request
allowance/429, Entra authority, and PWA update/offline-shell checks are not
applicable. The generated `file:` review is offline by construction. No AI
step is justified for this deterministic local redaction and packaging job.

## Performance and deployment identity

Fresh Lighthouse 13.4.1 mobile results:

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 98 | 100 | 100 | 100 | 2.093 s | 0 | 93 ms |
| Demo | 100 | 100 | 100 | 100 | 0.818 s | 0 | 50 ms |

Evidence:
`.factory/evidence/verification-11-lighthouse-home.json` and
`.factory/evidence/verification-11-lighthouse-demo.json`.

The exact build contains 11,314 bytes of JavaScript (4.52 KiB gzip), 9,497
bytes of CSS (2.80 KiB gzip), no font files, and a 237,060-byte hero image.
All stated budgets are met.

Fresh candidate-build and live bytes matched exactly:

```text
index.html                    d91b1f25038f411d1b283d939aba5e25dc00697d7360071dd360358da9752383
assets/index-CL8JLeTG.js      4680b4a2ce2fe5a1eec1f98986c0efba2de2a81f55de9faf260fa5fe26090937
assets/index-7pnV-XJS.css     a2e5e09248d25d7b5e12121ced101070862d79c7ef3aafc320f4fb0b633a0cfc
incident-press.webp           adcdaf7b4a6e2ea81a53df559af4c775bffe77ba0bba842ce7cd73d1cbfc6180
terminal-recording.svg        f1a022baf020fd81d20a49d501ffcb90f266ef2d6fae6b264daa10646d37b8b2
404.html                      d81bc3ed7811775a961f041b460806a67b2005eb35f63454abbd468b68f1fe41
robots.txt                    ce771fb5144175f3028a2110724772cccbb089ce38deb98c94eab1a6f3c380ef
sitemap.xml                   d649f7af6a78984e043fb5ddc6fcd6203d78c8d1137e904b7d0e0e98d099bf03
```

## Release decision

**FAIL.** Do not release candidate
`22e30d76a6281796a44cb2241c9f7546521184ae` until F-11-1 is repaired and a
new independent verification passes. F-11-2 and F-11-3 should be closed in the
same repair because both violate the supplied accessibility contract.
