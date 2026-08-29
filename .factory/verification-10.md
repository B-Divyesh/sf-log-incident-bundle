# Independent verification 10 — PASS

**Candidate:** `b8452adb2a1d7382ece1464441da7bc8c4850723` (`main`)

**Verified:** 2026-08-29

**Live URL:** https://log-incident-bundle.sociobot.in

**Verdict:** **PASS — the candidate performs the brief's local incident-review job end to end, every declared claim passes, and the live deployment matches the candidate.**

## First read

The cold live page passes at desktop and 390 px without scrolling. It says:

- what it does: **“Create a redacted log excerpt”**;
- who it is for: **“For teams who need answers without granting raw production-log access”**;
- what to do first: **“Try it with sample data”**, beside **“See a redacted incident review first.”**

The action is visible in the first viewport and opens the working six-record
review in one keyboard or pointer action. The three first-screen facts state
the input, self-contained output, and MIT/no-account status.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

No release-blocking or advisory product defect was reproduced.

## Claims gate

`.factory/claims.json` exists and contains 15 claims. I first invoked every
declared command before any other product test, as requested. That pre-install
probe could not load `vite` because a clean clone has no `node_modules`.
After the documented `npm ci` prerequisite, I invoked every exact command
again, individually, against the shipped demo/sample entry points. All 15
passed:

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
| `csv-download` | `npm test -- --grep @claim:csv-download` | PASS |
| `demo-cli` | `npm test -- --grep @claim:demo-cli` | PASS |
| `terminal-recording` | `npm test -- --grep @claim:terminal-recording` | PASS |
| `finite-review` | `npm test -- --grep @claim:finite-review` | PASS |
| `mit-license` | `npm test -- --grep @claim:mit-license` | PASS |
| `delivery-policy` | `npm test -- --grep @claim:delivery-policy` | PASS |

The landing page, legal pages, demo documentation, and README were
cross-checked against the manifest. Each observable product promise maps to a
declared claim; no unlisted claim was found.

## Clean local gates

```text
npm ci                                                    PASS — 22 packages, 0 vulnerabilities
npm test                                                  PASS — 6 Rust, 33 Playwright, 3 concurrent lifecycle tests
npm run typecheck                                         PASS
npm run lint                                              PASS
npm run build                                             PASS — exact production build in dist/site
cargo test --locked                                       PASS — 6 tests
cargo fmt --check                                         PASS
cargo clippy --all-targets --all-features --locked -- -D warnings
                                                          PASS
cargo build --release --locked                            PASS
cargo package --locked                                    PASS — 9 files, 47.7 KiB / 15.9 KiB compressed
```

The local `verify-url.sh` audit passed home, demo, privacy, terms, and the
designed missing route at both 1280 px and 390 px, with one title, one `h1`,
one main landmark, valid image alternatives, no page overflow, no browser
errors, and no serious or critical axe result.

## Packaged CLI and job-to-be-done

I unpacked the generated `.crate` into a new temporary consumer, installed it
with `cargo install --path … --root … --locked`, and exercised only that
installed `log-incident-bundle 0.1.3` binary.

- `--help`, `--version`, and non-interactive `--json` output are useful and stable.
- Two `--demo --json` runs each produced six records in different private mode-0700 directories.
- A two-second file window plus `trace_id` correlation produced the expected six linked records and excluded the unrelated health check.
- Standard input with equal inclusive `--from` and `--to` bounds produced one record.
- Two input files produced 12 correlated records and two provenance entries.
- Empty input produced a valid zero-record review whose visible recovery text tells the user to widen or remove the bounds.
- Unicode log text rendered intact.
- The source SHA-256 in the artifact exactly matched the original sample: `2c25ff4f5695ef4c133c100f266f1375a689b24580b78970c03b18138e235b4e`.
- Basic authorization, both cookie values, a trailing credential, and a multiline PEM body were absent from HTML bytes and the rendered view.
- A literal `</script><script>…</script>` payload remained inert and visible as evidence. It did not create a global or page error.
- Missing input, invalid RFC 3339, inverted bounds, an existing output, and an unknown option exited nonzero (`1`, `1`, `1`, `1`, and `2`). Errors explain what happened. Existing output bytes remained unchanged, and corrected input then generated a valid review.

The generated artifact was opened directly from `file:` at desktop and 390 px.
It rendered six rows, filtered to one matching row, explained a no-match state,
recovered after clearing search, and downloaded a seven-line CSV by keyboard.
It showed source provenance, made no network request, had no horizontal page
overflow or browser error, exposed a 44 px control height and 3 px focus ring,
and had zero serious/critical axe findings.

## Live deployment, accessibility, and privacy

`PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npm test` passed
all 33 browser tests. `./verify-url.sh` passed all five routes at desktop and
390 px; the missing route returned a real HTTP 404.

- Fresh desktop and mobile demo flows made only same-origin `GET` requests. There were no analytics, external scripts/fonts, mutations, failed requests, console errors, or page errors.
- After search, reset, and CSV download, localStorage and sessionStorage were empty, IndexedDB and OPFS had no entries, and no service worker was registered.
- The six-row CSV contained the expected header and `duplicate_charge=false` record.
- The skip link is the first Tab stop, is 44 px high, and has a 3 px designed focus outline. Demo entry works with Enter; Reset and CSV work with Space. Route navigation moves focus to the new `h1`, and no keyboard trap appeared.
- Every visible link, button, and input measured at least 44 px high at 390 px. The page and demo had zero horizontal page overflow.
- Reduced-motion mode reported zero running animations. States use text as well as color. Measured focus contrast was 4.82:1 on the demo banner and 6.03:1 on paper; body and button text measured 14.48:1 and 5.45:1.
- Axe found zero serious or critical findings on every live route. Fresh Lighthouse accessibility scored 100 on home and demo.
- All discovered internal links and fragments resolved successfully. Titles, canonical URLs, metadata, sitemap, robots file, and the styled 404 behaved as documented.

The browser response log showed the self-only CSP with
`frame-ancestors 'none'`, HSTS, `nosniff`, `DENY` framing, and
`strict-origin-when-cross-origin`. HTML uses 30-second revalidation. Hashed
JS/CSS and image/SVG assets use one-year immutable caching. A conditional HTML
request returned 304.

There is no backend, runtime API, product-unlock request, sign-in, payment,
account, upload, or service worker. Therefore server concurrency/persistence,
429 allowance, Entra authority, and PWA update/offline-shell checks are not
applicable. The generated review itself works offline from `file:`. The local,
deterministic workflow does not have a credible missing AI step.

## Performance and build identity

Fresh Lighthouse 13 mobile runs against the live deployment:

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 93 | 100 | 100 | 100 | 2.053 s | 0 | 293 ms |
| Demo | 100 | 100 | 100 | 100 | 0.992 s | 0 | 56 ms |

No field INP value was available in the lab run; keyboard, search, reset, route,
and download interactions responded immediately in direct browser checks.
Initial JavaScript is 9,948 bytes (4,107 gzip), CSS is 8,033 bytes (2,553
gzip), there are no font files, and the hero is 237,060 bytes. All supplied
budgets are met.

The fresh candidate build and live bytes match exactly for every principal
artifact checked:

```text
index.html                    a12e0b4246329f3cd55085e63c7da380ff966b00db44a174eb2cbd6a4da6352c
assets/index-DBdvqkQN.js      211f91264e18a852435616730a9703e2fa736a425ac56e04c2de528e4d12acd8
assets/index-ByEJ-F_u.css     65ed091d8444bb276a203bf0fab5b1f8f8e9268087d9bc78ccf0851585586f2e
incident-press.webp           adcdaf7b4a6e2ea81a53df559af4c775bffe77ba0bba842ce7cd73d1cbfc6180
terminal-recording.svg        f1a022baf020fd81d20a49d501ffcb90f266ef2d6fae6b264daa10646d37b8b2
404.html                      ca15c6430d4ba33b0478d3d55e9f5b308296d96f1e51c8e119b6aa5ce7abbab5
robots.txt                    ce771fb5144175f3028a2110724772cccbb089ce38deb98c94eab1a6f3c380ef
sitemap.xml                   d649f7af6a78984e043fb5ddc6fcd6203d78c8d1137e904b7d0e0e98d099bf03
```

## Release decision

**PASS.** Candidate `b8452adb2a1d7382ece1464441da7bc8c4850723` is suitable for release under the supplied acceptance contract.
