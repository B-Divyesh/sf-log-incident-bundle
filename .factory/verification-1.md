# Independent verification 1 — FAIL

**Candidate:** `9574bf674fe14f7838197925436a04b0b6b01fd7`  
**Live URL:** https://log-incident-bundle.sociobot.in  
**Verified:** 2026-08-28 UTC from a fresh clone at the exact candidate  
**Result:** **FAIL — do not release**

This fresh verification confirms that the deployment is the candidate, not a
deployment-only failure. The shipped CLI's main output is unusable in a real
browser, unsafe log text can execute as script, and common JSON secrets remain
visible. Repository formatting and lint gates also fail.

## Mandatory acceptance gates

### First-read test: pass

The cold live first screen answers all three questions without scrolling at
both desktop and 390 px:

- What: **“Share a safe log excerpt.”**
- For whom: **“For teams who need answers without granting raw production-log access.”**
- First action: **“Try it with sample data”**, alongside **“See a redacted incident review first.”**

The action opens `/demo` in one click with six realistic records and the
required demo banner. Evidence: `evidence/first-read-live.png` and
`evidence/first-read-live-mobile-390.png`.

### Declared claim commands: all pass, but two claims fail in real use

Every command in `.factory/claims.json` was run before broader QA, then rerun
after `npm ci` in the exact candidate clone.

| Claim | Exact command | Command result | Observable verification |
| --- | --- | --- | --- |
| `portable-html` | `cargo test output_contains_self_contained_search` | Pass | **Fail in substance.** The test checks only that the output string contains `Download CSV`. The generated file renders zero records and neither search nor CSV works. |
| `default-redaction` | `cargo test redacts_default_secrets` | Pass | **Fail in substance.** Quoted JSON `apiKey`, `password`, and `access_token` values remain visible. The fixture also omits the AWS-style key named by the claim. |
| `local-processing` | `npm test -- --grep @claim:local-processing` | Pass | Pass for the browser demo; only the product origin was requested. |
| `csv-download` | `npm test -- --grep @claim:csv-download` | Pass | Pass for the browser demo: seven CSV lines, including all six sample records. |

The two Rust claim tests are not tagged `@claim:<id>` as required. Material
visitor promises also lack claim entries: CLI no-upload behavior, bounded and
correlated selection, search/CSV in the CLI-produced file, source-hash
provenance, no analytics or third-party runtime scripts, and paid saved rule
profiles.

## Release-blocking defects

### Critical — the CLI-generated artifact does not perform its core job

The crate was packed, installed into a new consumer directory, and exercised
through that installed binary. `log-incident-bundle --demo --json` reported
seven records, but Chromium showed:

- zero rendered evidence rows;
- a blank record count;
- no rendered provenance source or SHA-256;
- no change after entering a search term;
- no CSV download after activating **Download CSV**; and
- page error `search is not defined`.

The generated markup contains IDs such as `\"rows\"` and `\"search\"`, so
selectors for `#rows` and `#search` find nothing. This prevents the smallest
useful product—one searchable, redacted, provenance-bearing HTML file—from
working. Evidence: `evidence/cli-demo-candidate.png`.

### Critical — log text can execute as script in the recipient's browser

A one-line record containing an HTML script terminator followed by a script
that sets `window.__qa_script_boundary` was processed by the installed CLI.
Opening the result set that marker to `1`. The file then reported an invalid
script token and rendered no records. Bundle data is placed directly inside an
inline script without safe script-element serialization, and the artifact has
no CSP. Log text must remain inert data.

### High — conservative default redaction misses common structured secrets

For a JSON-shaped record, these values remained verbatim in the artifact:

- `"apiKey":"json-key-value"`
- `"password":"json-password-value"`
- `"access_token":"json-token-value"`

In the same record, email, bearer-token, and AWS-style access-key values were
redacted. The secret-field expression accepts unquoted keys but not the quoted
keys common in structured logs. This contradicts the default-redaction claim.

### High — claim coverage does not prove material published promises

The generated-artifact claim test asserts the presence of button text, not a
working artifact. The redaction fixture does not cover the full claimed
preset. Several claims in the live site, privacy page, README, and changelog
have no `.factory/claims.json` entry. Under the claims contract, these omissions
are independently release-blocking.

## Other defects

### Medium — invalid time ranges silently succeed

- `--from not-a-timestamp` exited 0 and reported zero records.
- `--from 2026-08-22T14:02:00Z --to 2026-08-22T14:01:00Z` exited 0 and
  reported zero records.

The CLI describes RFC 3339 inputs but performs string comparisons without
validation. It should return a non-zero status and a corrective message.

Valid behavior was also checked: an exact inclusive boundary returned one
record, and a bounded `trace_id` correlation returned six records without the
unrelated health-check record.

### Medium — demo isolation and reset semantics are incorrect

On live `/demo`:

- **Reset demo** removes and immediately recreates
  `demo:log-incident-bundle:active`, leaving it as `"1"`.
- **Start for real** returns home but leaves that marker as `"1"`.
- Instrumented storage access showed demo startup reads the real
  `sb_license:log-incident-bundle` key before returning from the saved-license
  check.

This contradicts `.factory/demo.md` and the separate-namespace contract. The
browser sample is also a hard-coded UI rather than a recording or execution of
the real CLI; consequently, its passing search/CSV tests do not detect the
failed CLI artifact.

### Medium — mobile touch targets and route focus miss the baseline

At 390 CSS pixels, **Reset demo** measured `94 × 23 px`; **Start for real**
measured `109 × 15 px`; primary navigation links were 14 px high. These are
below the required 44 px touch height. No horizontal overflow was present.

Keyboard traversal reaches the controls and shows a designed 3 px focus ring.
However, an in-app navigation from home to Privacy leaves focus on `<body>`
instead of the new `<h1>`. The live-region announcement does update.

### Medium — returned-license verification is duplicated and lacks notice

Opening `/?license=<invalid-token>` correctly stores the token and removes it
from the URL, but it made two simultaneous verification requests before the
first verdict was cached. The resulting invalid verdict hid paid features but
did not show the required quiet “license no longer active” notice. The buy link
uses the required Sociobot endpoint, restore UI exists, and no direct payment
provider is embedded.

### Medium — development dependency audit is not clean

`npm ci` reported one high and one critical advisory in direct development
tools (`vite 6.3.5` and `vitest 3.2.4`). `npm audit --omit=dev` found zero
runtime advisories, so the deployed static runtime is not affected by these
specific findings.

### Low — repository checks and web delivery details

- `cargo fmt --check` fails across `src/main.rs`.
- `cargo clippy --all-targets --all-features -- -D warnings` fails on
  `clippy::type_complexity` in `read_sources`.
- Hashed JS/CSS use `Cache-Control: public, must-revalidate, max-age=30`
  instead of long-lived immutable caching.
- An unknown path renders the designed not-found screen but returns HTTP 200.
- The Open Graph image is 1200×800, not the required 1200×630.

## Clean-clone build and consumer results

Fresh clone: `/tmp/log-incident-bundle-qa.ILmDdO`, detached at the candidate;
it was clean before installation.

| Check | Result |
| --- | --- |
| `npm ci` | Pass; 59 packages installed; dev advisories noted above |
| `npm test` | Pass; 3 Rust tests and 6 Playwright tests |
| explicit TypeScript `tsc --noEmit` | Pass |
| `npm run build` | Pass; exact production build written to `dist/site` |
| `cargo build --release` | Pass |
| `cargo package` | Pass; 354.5 KiB unpacked / 271.9 KiB compressed |
| clean-consumer `cargo install --path target/package/...` | Pass |
| installed `--version`, `--help`, `--demo --json` | Commands run; emitted artifact fails in Chromium |
| missing file / unknown option / invalid UTF-8 / missing output parent | Correct non-zero status and useful error |
| valid custom redaction file | Pass |
| invalid regular expression file | Correct non-zero status and location |
| `cargo fmt --check` | **Fail** |
| clippy with warnings denied | **Fail** |

The production site bundle is within size budgets: JS 11,990 B (4.82 KiB
gzip), CSS 7,149 B (2.39 KiB gzip), no fonts, and hero WebP 237,060 B.

## Live deployment, accessibility, privacy, and performance

- Candidate and live SHA-256 values match byte-for-byte for `index.html`, the
  hashed JS, hashed CSS, and `incident-press.webp`.
- `/`, `/demo`, `/privacy`, and `/terms` each have `lang=en`, one `<h1>`, one
  `<main>`, header/nav/footer landmarks, ordered headings, and no missing image
  alt text.
- Axe found zero serious or critical findings on all four routes and the
  designed not-found screen. No live console or page errors occurred.
- The demo search handles no-match and recovery states; live CSV contains a
  header plus all six records.
- Live demo requests were same-origin only. The normal CLI artifact load made
  only its local `file:` request. There is no analytics or third-party runtime
  script in the candidate.
- Reduced-motion mode reports no animation. At 390 px there is no horizontal
  overflow, body text is 17 px, and a 200% root text-size check retained all
  visible controls without page-level overflow.
- Headers include HSTS, `nosniff`, strict-origin referrer policy, and a
  restrictive CSP permitting only self plus the Sociobot API for connections.
- Lighthouse mobile, live `/`: Performance 95, Accessibility 100, Best
  Practices 100, SEO 100; FCP 0.78 s, LCP 1.96 s, CLS 0, TBT 242 ms, total
  bytes 245,864.
- Lighthouse mobile, live `/demo`: Performance 99, Accessibility 100, Best
  Practices 100, SEO 92; FCP 0.86 s, LCP 0.89 s, CLS 0, TBT 106 ms, total
  bytes 8,601.
- A 40-request simultaneous license-verification check produced 30 × 200 and
  10 × 429. Every 429 included `Retry-After: 4`; the observed concurrent
  allowance was 30 requests.
- There is no sign-in requirement. Entra authority validation is not
  applicable. This is not a PWA or product backend, so service-worker,
  offline-reload, persistence-concurrency, and health/build-identity checks
  are not applicable.

Raw Lighthouse reports and the desktop, mobile, and CLI screenshots are stored
under `.factory/evidence/`.

## Required remediation before retest

1. Emit valid attributes and add an end-to-end browser test over an actual
   CLI-generated file proving rows, search, CSV, provenance, and source hashes.
2. Serialize log data so it remains inert inside the document, and add a
   script-boundary regression fixture plus a restrictive artifact policy.
3. Redact quoted structured secret keys and expand the claim fixture to every
   named preset category.
4. Validate RFC 3339 bounds and reject reversed ranges.
5. Make claim entries cover all material site/README promises and test the
   packaged CLI rather than only the hard-coded web sample.
6. Correct demo storage cleanup/isolation, mobile targets, route focus, and
   duplicate license checks with an inactive-license notice.
7. Pass rustfmt and clippy, update vulnerable dev tools, use immutable asset
   caching, return a real 404 status, and provide a 1200×630 social image.
