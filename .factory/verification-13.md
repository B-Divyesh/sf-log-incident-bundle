# Independent verification 13 — FAIL

**Candidate:** `e85a844e77dbb35e782230d9d672991985ab88fb`

**Live URL:** <https://log-incident-bundle.sociobot.in>

**Verified:** 2026-08-29

**Scope:** fresh independent release QA against the supplied researched brief,
factory contract, and verifier work order. Product code was not changed.

## Verdict

**FAIL.** The deployment is healthy and byte-for-byte matches the candidate,
all 20 registered claim commands pass, and the normal single-field workflow is
usable. However, the CLI incorrectly correlates records when more than one
`--correlate` field is supplied. It can include an unrelated out-of-window log
record in the review copy. That violates the bounded correlation job and
creates an avoidable disclosure risk in the artifact being shared.

## Release-blocking defect

### Major — values cross-match between different correlation fields

The public help says `--correlate <FIELD>` may be repeated for more fields. The
README says each field finds its own in-window values and adds matching
records. The implementation instead pools values from every requested field
and compares each later field against that shared pool.

Fresh reproduction using the packaged, clean-consumer-installed binary:

```text
2026-08-22T14:01:00Z trace_id=trace-A request_id=req-B event=in-window
2026-08-22T14:05:00Z trace_id=req-B request_id=req-X event=wrong-cross-field-match
2026-08-22T14:06:00Z trace_id=trace-A request_id=req-Y event=correct-trace-match
2026-08-22T14:07:00Z trace_id=trace-Z request_id=req-B event=correct-request-match
```

Command arguments:

```text
--from 2026-08-22T14:01:00Z
--to 2026-08-22T14:01:00Z
--correlate trace_id
--correlate request_id
```

Expected: 3 records. The second row matches neither the in-window `trace_id`
nor the in-window `request_id`.

Actual: JSON reports `"records":4`, and the artifact contains
`event=wrong-cross-field-match`.

This is release-blocking because an unrelated record outside the requested
time window can be placed into a portable artifact intended for limited
sharing. Values must remain associated with the field from which they were
collected. A regression test should cover colliding values across two repeated
`--correlate` options.

## Mandatory first-read and claims gate

The live home page passes the cold first-read gate:

- **What:** “Create a redacted log excerpt.”
- **For whom:** “For teams who need answers without granting raw
  production-log access.”
- **What first:** **Try it with sample data**, followed by “See a redacted
  incident review first.”

The action opened `/?demo=1` in one click and immediately displayed six sample
records plus the persistent “Demo — sample data, nothing is saved” banner.
Evidence: `qa-13-first-read-desktop.png` and
`qa-13-demo-after-one-click.png`.

`.factory/claims.json` is present. After `npm ci`, every exact listed command
was run separately before the rest of QA. All 20 exited 0:

| Claim | Result |
| --- | --- |
| `portable-html` | PASS |
| `default-redaction` | PASS |
| `output-safety` | PASS |
| `cli-inputs` | PASS |
| `bounds-correlation` | PASS |
| `custom-redaction` | PASS |
| `redaction-rule-provenance` | PASS |
| `local-processing` | PASS |
| `site-runtime` | PASS |
| `site-log-privacy` | PASS |
| `install-cli` | PASS |
| `csv-download` | PASS |
| `demo-search` | PASS |
| `demo-redaction-preview` | PASS |
| `demo-conclusion` | PASS |
| `demo-cli` | PASS |
| `terminal-recording` | PASS |
| `finite-review` | PASS |
| `mit-license` | PASS |
| `delivery-policy` | PASS |

The multi-field collision above is not exercised by the current
`bounds-correlation` test, which uses only `trace_id`.

## Clean-checkout quality gates

All repository gates passed:

```text
npm ci
npm test
  7 Rust tests passed
  38 Playwright tests passed
  concurrent claim-server lifecycle regression passed
npm run typecheck
npm run lint
npm run build
cargo test --locked
cargo fmt --check
cargo clippy --all-targets --all-features --locked -- -D warnings
cargo build --release --locked
cargo package --locked
npm audit --audit-level=high
```

The exact production build created `dist/site`. The crate packaged 9 files and
produced `target/package/log-incident-bundle-0.1.3.crate` at 16,836 bytes. The
npm audit found 0 vulnerabilities.

## CLI and clean-consumer checks

The packaged crate was installed into a fresh temporary Cargo root. The
installed binary reported version `0.1.3`, had useful help and `--json`, and
passed these independent cases:

- `--demo --json` created six records in a unique mode-700 directory.
- A bounded `payment-api.log` run produced six correlated records and source
  provenance.
- Two chosen input files produced 12 records and two source entries.
- An exact equal `--from`/`--to` boundary included the one matching record.
- Stdin produced one record and removed both an email and authorization token.
- Malformed RFC 3339 input exited 1 with an actionable example.
- Inverted bounds exited 1 and explained the required ordering.
- An existing output exited 1 and told the user to choose a new path.
- The generated `file:` artifact searched six rows to one, downloaded seven
  CSV lines, exposed source hashes, had no non-file request or browser error,
  had no serious/critical axe finding, and had no 390px page overflow.

The site’s documented source-install command was also run into a second fresh
root. It fetched Git commit `e85a844e`, installed version `0.1.3`, and its demo
returned six records. Origin `main` resolved to the candidate commit.

## Live browser, privacy, and accessibility evidence

`npm run verify:url -- https://log-incident-bundle.sociobot.in` passed `/`,
`/demo`, `/privacy`, `/terms`, and a real 404 at 1280px and 390px. Running the
complete 38-test Playwright suite against the live URL also passed.

Independent Playwright checks found:

- Desktop and 390px mobile pages had no horizontal page overflow.
- The first Tab focused the visible, 44px-high skip link with a designed 3px
  moss outline; Enter moved focus to the h1.
- Demo search, clear, Reset demo, and CSV download worked from the keyboard.
- The CSV contained its header, six records, and `duplicate_charge=false`.
- Axe 4.10.3 reported zero serious/critical findings on the live demo; the URL
  verifier also checked every route at both widths.
- Reduced-motion emulation yielded `scroll-behavior: auto` and zero running
  animations.
- `localStorage`, `sessionStorage`, IndexedDB, and OPFS were all empty after
  demo search, export, and reset.
- The entire recorded live flow made eight requests: only same-origin GETs for
  the two documents and their site-owned JS, CSS, and images. There were no
  analytics, uploads, API calls, console errors, or page errors.
- Every regular-site link returned 200, including the public GitHub source.
  The deliberate missing route returned the designed HTTP 404.

Screenshots: `qa-13-live-home-mobile-390.png`,
`qa-13-live-demo-mobile-390.png`, and `qa-13-cli-artifact-mobile.png`.

## Deployment identity, headers, caching, and budgets

Fresh local and live SHA-256 values matched exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `57abac6d6f3c5990be66437cb3c72cd55cb4362b990f7eae2b4d8a2917c0b079` |
| `404.html` | `d81bc3ed7811775a961f041b460806a67b2005eb35f63454abbd468b68f1fe41` |
| `assets/index-TSchd1I1.js` | `29e94791a01782c66bd4f54bf518e6401e757db4d30e6c9100a8bd9c3c56d4c4` |
| `assets/index-Da6OpOqP.css` | `b87950f9e63e6f167cc33b2f50df666bfda88157d50945a05aed91b557cb6ed1` |
| `incident-press.webp` | `adcdaf7b4a6e2ea81a53df559af4c775bffe77ba0bba842ce7cd73d1cbfc6180` |
| `terminal-recording.svg` | `f1a022baf020fd81d20a49d501ffcb90f266ef2d6fae6b264daa10646d37b8b2` |

This resolves the earlier deployment concern with fresh evidence: live is the
candidate build. HTML uses `public, must-revalidate, max-age=30`; hashed JS,
CSS, WebP, and SVG assets use `public, max-age=31536000, immutable`. Live
responses include HSTS, `nosniff`, `DENY`, strict-origin referrer policy, and a
self-only CSP with `frame-ancestors 'none'`.

| Asset | Raw | gzip |
| --- | ---: | ---: |
| Initial JS | 11,424 B | 4,580 B |
| CSS | 9,633 B | 2,819 B |
| Hero WebP | 237,060 B | already compressed |
| Font files | 0 B | 0 B |

Fresh Lighthouse 13.4.1 mobile results:

| Page | Perf. | A11y | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 99 | 100 | 100 | 100 | 1.96 s | 0 | 78 ms |
| Demo | 100 | 100 | 100 | 100 | 0.83 s | 0 | 54.5 ms |

Reports: `evidence/verification-13-lighthouse-home.json` and
`evidence/verification-13-lighthouse-demo.json`. Lighthouse lab data does not
provide a field INP value; TBT is reported as the available responsiveness
proxy.

## Applicability

This is a static companion site plus local CLI, not a PWA or backend. It has no
service worker, server endpoint, persistence service, account, sign-in,
Sociobot unlock call, payment flow, or AI feature. Offline service-worker,
backend concurrency/persistence, 429 allowance, Entra authority, unlock, and
AI gateway checks are therefore not applicable. The generated artifact itself
works directly from `file:` with no network request.

## Defects by severity

- **Major / release-blocking:** repeated correlation fields cross-match values
  between different field names and can include unrelated out-of-window logs.
- **Minor:** none found.
