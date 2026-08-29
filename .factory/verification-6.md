# Independent verification 6 — FAIL

**Candidate:** `c15a7e416c35c228bfc0d20d1e231ac3c4084615`

**Live URL:** https://log-incident-bundle.sociobot.in

**Verified:** 2026-08-29 UTC from the clean candidate checkout

## Release decision

**FAIL — do not release.** The deployment matches this candidate, so this is
not a deployment-only failure. The conservative redaction behavior is unsafe
for ordinary credential shapes, and a custom rule with a capture group puts
the captured secret back into the artifact. Both defects contradict published
claims about the product's core safety job.

## Mandatory first checks

### First-read gate — PASS

A cold live page answers all three required questions on the first screen:

- What: **“Create a redacted log excerpt.”**
- For whom: **“For teams who need answers without granting raw production-log access.”**
- First action: **“Try it with sample data”**, beside **“See a redacted incident review first.”**

The action opens `/?demo=1` in one click. At 390×844, the headline ends at
292 px, the audience sentence at 359 px, and the action at 434 px. All three
are visible without scrolling. The demo immediately shows six realistic
records and the persistent “Demo — sample data, nothing is saved” banner.

### Claims registry and exact commands

`.factory/claims.json` exists and contains 13 entries. Each declared command
was invoked independently. On the untouched checkout the browser runner first
reported its not-yet-installed `@playwright/test` dependency. After the normal
clean-clone `npm ci`, all 13 exact commands passed:

| Claim ID | Exact command | Declared test |
| --- | --- | --- |
| `portable-html` | `npm test -- --grep @claim:portable-html` | PASS |
| `default-redaction` | `npm test -- --grep @claim:default-redaction` | PASS, but the claim fails broader observable input below |
| `cli-inputs` | `npm test -- --grep @claim:cli-inputs` | PASS |
| `bounds-correlation` | `npm test -- --grep @claim:bounds-correlation` | PASS |
| `custom-redaction` | `npm test -- --grep @claim:custom-redaction` | PASS, but the claim fails a normal regex below |
| `local-processing` | `npm test -- --grep @claim:local-processing` | PASS |
| `site-runtime` | `npm test -- --grep @claim:site-runtime` | PASS |
| `site-log-privacy` | `npm test -- --grep @claim:site-log-privacy` | PASS |
| `csv-download` | `npm test -- --grep @claim:csv-download` | PASS |
| `demo-cli` | `npm test -- --grep @claim:demo-cli` | PASS |
| `finite-review` | `npm test -- --grep @claim:finite-review` | PASS |
| `mit-license` | `npm test -- --grep @claim:mit-license` | PASS |
| `delivery-policy` | `npm test -- --grep @claim:delivery-policy` | PASS |

The exact fixtures are too narrow for the two redaction promises. Independent
consumer tests below show the published outcomes do not hold.

## Release-blocking defects

### High — default redaction exposes valid bearer and quoted secret values

The installed packaged binary received this record on standard input:

```text
2026-08-22T14:01:00Z authorization=Bearer short123 token="two word secret" password="correct horse battery staple" api_key=abc access_token=xy
```

Its generated artifact contains:

```text
authorization=Bearer short123
token="[REDACTED:SECRET FIELD] word secret"
password="[REDACTED:SECRET FIELD] horse battery staple"
```

`short123`, `word secret`, and `horse battery staple` remain readable in the
HTML data and rendered record. The bearer expression only matches values at
least 12 characters long. The secret-field expression stops at whitespace,
even inside a quoted value.

This contradicts the `default-redaction` claim that bearer tokens and common
secret fields are replaced. A bearer credential remains sensitive regardless
of length, and quoted passwords commonly contain spaces. The warning that
pattern-based redaction is not a guarantee does not make a named preset claim
true or make partial replacement safe.

### High — custom regex capture groups reinsert the secret

The rule file used a normal grouped regular expression:

```text
customer id=customer_id=([A-Za-z0-9_-]+)
```

For `customer_id=cust_private_73`, the packaged CLI wrote:

```text
cust_private_73[REDACTED:CUSTOMER ID]
```

The raw `cust_private_73` is present in the output. The replacement function
unconditionally preserves capture group 1 because two built-in rules use it
as a prefix. It applies that behavior to user rules too. Capture groups are a
standard regex feature and the documented `label=regular expression` format
does not prohibit them. This contradicts `custom-redaction` and can expose the
exact data the user intended to remove.

## Other defects

### Medium — “How it works” does not navigate to its section

From live `/`, clicking the header link produced this state after 300 ms:

```json
{"url":"https://log-incident-bundle.sociobot.in/","hash":"","y":0,"howTop":1251.828125}
```

The SPA click handler builds history from only `pathname + search` and drops
`target.hash`. It rerenders the landing page, focuses its h1, and remains at
the top. Directly opening `/#how` works and scrolls to the section, proving the
link target itself exists. This violates the routing/no-dead-link contract.

### Medium — a valid zero-match review has no recovery path

A future `--from` bound correctly generates a review with zero records. In the
rendered file, the only empty state is `Evidence (0 records)` followed by an
empty table and an enabled header-only CSV download. It does not tell the user
to widen/remove the bounds or regenerate the review. The definition of done
requires empty states to include a next step.

## Passing product behavior

### Clean build and packaged consumer

These commands passed:

```text
npm ci                         # 0 vulnerabilities
npm test                       # 4 Rust + 27 Playwright tests
npm run typecheck
npm run lint
npm run build                  # dist/site
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package --allow-dirty
```

The crate was installed from `target/package/log-incident-bundle-0.1.1` into a
fresh install root. The installed binary's `--version`, `--help`, normal file,
stdin, two-file correlation, `--demo --json`, and `--json` paths worked.

- A two-second bounded sample plus `trace_id` correlation produced six rows
  and excluded the unrelated health check.
- Two input files produced two correlated rows, two source entries, and two
  64-character SHA-256 values.
- The generated `file:` artifact rendered, searched `ledger` to one row,
  downloaded a seven-line CSV, and made no network request.
- Email, long bearer, common one-word secret fields, AKIA/ASIA IDs, and a
  capture-free custom rule were redacted.
- A `</script><script>window.__qa_xss=1</script>` record remained inert;
  `window.__qa_xss` stayed unset and the row rendered.
- Invalid RFC 3339, inverted bounds, a missing source, invalid regex, unknown
  option, and missing output directory all failed non-zero. None created the
  requested output.
- The generated artifact has one h1, one main, `lang=en`, visible 3 px focus,
  no serious/critical axe issue, and no page-level overflow at 390 px.

### Live demo, privacy, accessibility, and performance

- `./verify-url.sh https://log-incident-bundle.sociobot.in` passed `/`,
  `/demo`, `/privacy`, `/terms`, and a real HTTP 404 at 1280 px and 390 px.
- `PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npx playwright test`
  passed all 27 tests.
- Independent demo flow: six initial rows; a non-match explains how to recover;
  clearing restores six; CSV has its header and six rows; reset restores six;
  exit removes the demo marker.
- During the full demo flow, every network request was a same-origin GET.
  localStorage, sessionStorage, IndexedDB, and OPFS were empty from a fresh
  context. The generated CLI artifact made only its `file:` document request.
- No console or page errors were observed. Axe found zero serious/critical
  findings. Keyboard focus has a 3 px moss outline with 4 px offset. Tested
  live mobile controls are at least 44×44 CSS pixels. The demo has no 390 px
  document overflow. Reduced-motion mode disables the entrance animation.
- Fresh Lighthouse 13.0.1 mobile on `/?demo=1`: Performance **100**,
  Accessibility **100**, Best Practices **100**, SEO **100**, LCP **1.04 s**,
  CLS **0**, TBT **0 ms**.
- Production build sizes: JavaScript 9,371 B raw / 3,942 B gzip; CSS 7,601 B
  raw / 2,492 B gzip; hero WebP 237,060 B. All are within budget.

### Headers, caching, and deployment identity

HTML uses 30-second revalidation. Hashed JS/CSS and WebP assets use
`public, max-age=31536000, immutable`. Tested responses include HSTS,
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict-origin
referrer policy, and a self-only CSP with `frame-ancestors 'none'`.

Fresh local and live bytes match exactly:

| File | SHA-256 |
| --- | --- |
| `index.html` | `cddae2841a111d00a8999607692e597145864bed342ec7fb967e5371bab0e4f7` |
| `assets/index-HHTf3UXu.js` | `3357abd28bde8d889e24a24b517b6042f7bee71d7c8f8324d7d20cff71f8646c` |
| `assets/index-zD8wX4FC.css` | `b29d0312f60009baa3e7f135974dff60693a1816ac112ee84f34b68162e97127` |
| `incident-press.webp` | `adcdaf7b4a6e2ea81a53df559af4c775bffe77ba0bba842ce7cd73d1cbfc6180` |
| `incident-press-og.webp` | `41265d5e78a2e30904d47586dea39a399a71243cf942dfa7464220bc38f9b700` |
| `404.html` | `174fc0336e44a9abbf372d575a00a19cce0d55c6198371b456b77af01f2d7fed` |

There is no product backend, account, sign-in, service worker/PWA, paid unlock,
or runtime AI call. API allowance/429, Entra authority, service-worker update,
and live AI gateway checks are therefore not applicable.

## Required remediation

1. Redact all bearer credential values after the scheme, regardless of short
   length, and consume complete quoted secret-field values including spaces.
   Add observable fixtures for both cases to `@claim:default-redaction`.
2. Do not preserve user-rule capture groups. Keep prefix preservation internal
   to built-in rules or use noncapturing look/structure. Add a capturing-group
   case to `@claim:custom-redaction`.
3. Preserve and navigate to `target.hash` for same-page links; add a browser
   assertion that “How it works” changes the URL and reaches `#how`.
4. Give zero-record CLI artifacts a plain recovery action or instruction.
