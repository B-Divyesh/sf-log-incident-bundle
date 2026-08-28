# Independent verification — FAIL

**Candidate:** `9574bf674fe14f7838197925436a04b0b6b01fd7`  
**Live URL:** https://log-incident-bundle.sociobot.in  
**Verified:** 2026-08-28, fresh checkout at the candidate commit

## Verdict

**FAIL.** The CLI does not produce a usable searchable HTML bundle, which is
the product's core job. It also lets a log record execute arbitrary JavaScript
when the recipient opens the generated artifact, and fails to redact common
JSON secret fields while claiming it does.

## Release-blocking defects

### Critical — generated HTML has malformed IDs and its script crashes

`render_html` writes literal backslashes before every quoted HTML attribute
(for example, `<tbody id=\"rows\">`). The browser consequently creates IDs
such as `\"rows\"`, not `rows`. The embedded script then throws
`search is not defined`; it cannot populate records, search, download CSV, or
show provenance.

Reproduced from the packaged clean-consumer binary with:

```sh
log-incident-bundle --demo --json
# then open /tmp/log-incident-bundle-demo.html
```

Browser evidence: `document.querySelector('#rows') === false`, IDs include
`\"search\"`, `\"csv\"`, and `\"rows\"`, the visible evidence count is
blank, and the page error is `search is not defined`. The demo reports seven
input records, but renders none. This invalidates the `portable-html` claim
despite its current string-presence unit test passing.

### Critical — log content can execute arbitrary JavaScript in the artifact

Log content is serialized directly into an inline `<script>` without escaping
the HTML-script terminator. A record containing
`</script><script>window.__log_bundle_xss=1</script>` closes the data script
and runs. Opening the generated artifact in Chromium produced
`window.__log_bundle_xss === true` and zero rendered records. The portable
artifact has no CSP, so this is also a practical breach of the local-only
privacy promise: attacker-controlled log text can run in the recipient's
browser and exfiltrate artifact contents.

### High — default redaction misses normal JSON secret fields

The stated default-redaction claim includes common secret fields. A single
JSON log record containing `"apiKey":"json-secret-value"`,
`"password":"json-password"`, and
`"access_token":"json-token"` left all three secret values in the generated
artifact. In the same record, email, bearer token, and the AWS-style key were
redacted. The redaction regex only accepts unquoted field names, which is not
safe for the common structured-log format.

## Other findings

### Medium — invalid or reversed time bounds silently produce an empty bundle

`--from not-a-timestamp` exits 0, writes an artifact, and reports
`{"records":0,"sources":1}`. A reversed valid range behaves the same. The
documented RFC-3339 bounds need validation and a useful non-zero error rather
than a misleading successful empty review.

### Medium — demo reset and exit do not clear the documented demo namespace

On live `/demo`, `Reset demo` removes the marker and immediately recreates it;
after clicking `Start for real`,
`localStorage['demo:log-incident-bundle:active']` is still `"1"`. This
contradicts `.factory/demo.md` and the sandbox requirement that leaving/resetting
demo discard its data.

### Medium — mobile reset control is below the required touch target size

At 390 px, live `Reset demo` measured **94.3 × 23 px**. The required minimum
is 44 × 44 px. `Download CSV` measured 366 × 50.3 px.

### Low — checks and caching

- `cargo fmt --check` fails (the committed `src/main.rs` is not rustfmt
  formatted).
- `cargo clippy -- -D warnings` fails on `clippy::type_complexity` in
  `read_sources`.
- Hashed production assets are served with `Cache-Control: public,
  must-revalidate, max-age=30`, not long-lived immutable caching.

## Claim tests

The four required commands were attempted before other QA. In the pristine
clone the first browser command could not start because `node_modules` did not
exist (`ERR_MODULE_NOT_FOUND: @playwright/test`). After the normal clean-clone
`npm ci`, all declared commands passed:

| Claim | Exact command | Result |
| --- | --- | --- |
| portable-html | `cargo test output_contains_self_contained_search` | Passes, but inadequate: it only checks for the text `Download CSV`; the real artifact is broken (Critical finding above). |
| default-redaction | `cargo test redacts_default_secrets` | Passes its narrow fixture, but real JSON secret fields leak (High finding above). |
| local-processing | `npm test -- --grep @claim:local-processing` | Pass (fresh `/demo` requested only `http://127.0.0.1:4173`). |
| csv-download | `npm test -- --grep @claim:csv-download` | Pass (seven CSV lines including header and six sample records). |

The claim contract therefore is not met in substance: the tests are not
observable end-to-end proof of the two most important CLI claims.

## Completed checks and evidence

- `npm ci` completed; `npm test` passed: 3 Rust tests and 6 Playwright tests.
- `npm run build` completed. Output: JS 11,990 B (4.82 KB gzip), CSS 7,149 B
  (2.39 KB gzip), hero WebP 237,060 B. These are within the stated budgets.
- `cargo test`, `cargo build --release`, and `cargo package` passed.
- `cargo package` was unpacked into a fresh temporary consumer and installed
  with `cargo install --path ... --root ...`. Its `--version`, `--help`,
  `--demo --json`, and normal bounded/correlated file workflow ran; this is
  how the broken artifact was found.
- Normal bounded/correlated sample output contains the expected redactions and
  `duplicate_charge=false`; `--demo` includes all seven bundled input lines.
- Live cold-read gate passes: “Share a safe log excerpt” says what it does;
  “For teams who need answers without granting raw production-log access” says
  for whom; the first screen provides “Try it with sample data” and says it
  opens a redacted review.
- Live deployment matches candidate build exactly: SHA-256 matched for
  `index-XSVqlMcx.js`, `index-eJjaFZtz.css`, and `incident-press.webp`.
- Live `/demo` at 390 px: no horizontal overflow, one `h1`, `lang=en`, one
  `main`, no console/page errors, same-origin-only demo requests, visible
  3 px keyboard focus, and reduced-motion mode has no animation. Desktop
  keyboard traversal also reached all tested actions with visible focus.
- Live axe-core scan found **0 serious/critical** violations. There is no
  repository `verify-url.sh`; equivalent live title/lang/main/alt/console
  checks were run in Playwright.
- Lighthouse 13.4.1 mobile live `/demo`: Performance **100**,
  Accessibility **100**, LCP **0.9 s**, CLS **0**, TBT **60 ms**.
- Live response headers include HSTS, `nosniff`, strict-origin referrer policy,
  and a restrictive CSP. `/`, `/demo`, `/privacy`, `/terms`, robots, sitemap,
  404, and an SPA unknown path returned as expected.
- Optional license verify endpoint rate-limit check: 40 rapid invalid-token
  requests produced 29 × 200 and 11 × 429. First observed 429 was around the
  27th submitted request (parallel burst); `Retry-After` was 2–3 seconds.
  No sign-in flow is present or required.

## Required remediation before retest

1. Render valid HTML attributes (do not emit backslashes), then add a browser
   test that opens an actual generated CLI file and proves rows, search, CSV,
   and provenance work.
2. Serialize artifact data safely for a script element (or avoid inline
   executable JSON entirely), escape `</script>`, and give generated files a
   CSP that prevents arbitrary outbound execution where compatible.
3. Make default redaction handle quoted JSON keys/values and add fixtures for
   JSON `apiKey`, `password`, and `access_token` before calling the preset
   conservative.
4. Validate time inputs and reversed ranges with non-zero, actionable errors.
5. Correct demo reset/exit cleanup, make the reset button 44 px high, format
   the Rust source, resolve clippy, and configure immutable caching for hashed
   assets.
