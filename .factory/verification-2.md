# Independent verification 2 — FAIL

**Candidate:** `9574bf674fe14f7838197925436a04b0b6b01fd7` (`docs: add verification handoff`)

**Live URL:** https://log-incident-bundle.sociobot.in

**Verified:** 2026-08-28, from a clean detached checkout of the candidate.

## Decision

**FAIL.** The deploy is the candidate (the built JS and CSS SHA-256 values
match the live assets exactly), but the actual CLI artifact does not perform
its core job and can execute JavaScript supplied in an input log.

## Required first checks

All commands in `.factory/claims.json` were run before the broader QA suite:

| Claim | Command | Result |
| --- | --- | --- |
| portable-html | `cargo test output_contains_self_contained_search` | Pass (1 test) |
| default-redaction | `cargo test redacts_default_secrets` | Pass (1 test) |
| local-processing | `npm test -- --grep @claim:local-processing` | Pass (1 Playwright test) |
| csv-download | `npm test -- --grep @claim:csv-download` | Pass (1 Playwright test) |

The claim suite passing is not sufficient: the `portable-html` test only checks
that the HTML source contains the words `Download CSV`. It does not open the
artifact or prove searching/CSV work, and those observable behaviours fail.

Cold first read of the live landing screen passed: it says “Share a safe log
excerpt,” names teams avoiding broad production-log access, and provides a
visible one-click “Try it with sample data” action with an explanation of what
will open.

## Release-blocking defects

### Critical — generated review copies render no evidence and have no working CSV

Reproduction:

```sh
./target/release/log-incident-bundle examples/payment-api.log \
  --from 2026-08-22T14:01:34Z --to 2026-08-22T14:01:35Z \
  --correlate trace_id --output /tmp/cli-normal.html --json
```

The CLI reports `{"records":6,"sources":1}`, but opening
`file:///tmp/cli-normal.html` in Chromium produces `pageerror: search is not
defined`; it renders **0** table rows, search cannot filter, and the CSV click
handler is never installed. The HTML generator emits attributes such as
`id=\"search\"` and `lang=\"en\"` literally. Chromium therefore sees the
HTML language as `\"en\"` and there is no `#search` element. This breaks the
smallest useful product: a recipient cannot review the excerpt produced by the
CLI.

### Critical — crafted log content executes JavaScript in a recipient’s review copy

Reproduction input (piped to the CLI):

```text
2026-08-22T14:01:34Z trace_id=x payload=</script><script>document.title='PWNED'</script>
```

Opening the produced `/tmp/cli-xss.html` in Chromium changes the document title
to `PWNED`. Raw JSON is interpolated into an inline `<script>` without making
`</script>` safe. Logs are untrusted incident evidence, so this can run
attacker-controlled script in the recipient’s browser. Do not ship generated
artifacts until script-safe serialization and regression coverage are added.

### High — invalid time bounds silently create a misleading empty artifact

`--from not-a-timestamp` is documented as an RFC 3339 timestamp, but exits 0
and writes an artifact with 0 records:

```text
Wrote /tmp/cli-invalid-time.html with 0 records from 1 source(s).
```

It must validate both bounds and return a clear non-zero error before writing
the output. By contrast, a missing input file and malformed redaction rule
correctly return non-zero errors with useful messages.

### High — the CLI demo is not the stated correlated incident example

`log-incident-bundle --demo --json` produces 7 records. It includes the
unrelated `14:05 trace_id=tr_other healthcheck=ok` line rather than the six
correlated records advertised by `/demo`, `.factory/demo.md`, and the landing
terminal recording. The required one-command CLI demo should run the same
bounded/correlated job and provide a working generated artifact.

## Other defects

### Medium — demo reset does not reset the documented namespace

On `/demo`, `Reset demo` leaves
`demo:log-incident-bundle:active = 1` in localStorage. The handler removes it
and immediately calls `demo()`, which writes it again. This contradicts
`.factory/demo.md` and means the documented reset action has no observable
effect.

### Medium — interactive touch targets are below 44 px

At 390 px, the primary navigation targets measure 29×14, 87×14, and 51×14 px;
the wordmark is 118×34 px; footer Privacy and Terms links are 43×15 and 35×15
px. This fails the required 44 px touch-target baseline, although keyboard
focus is visible and the tab sequence is usable.

### Medium — hashed static assets are not cached immutably

The live JS, CSS, image, HTML, and route responses all use
`Cache-Control: public, must-revalidate, max-age=30`. Hashed assets should be
long-lived immutable per the performance contract; the deployed caching policy
does not meet that requirement.

### Low — direct unknown route is HTTP 200

`https://log-incident-bundle.sociobot.in/missing` returns status 200 and the
SPA draws its 404 screen. A styled screen exists, but this is not a real HTTP
404 response as required by the site-structure contract.

## Passed checks and evidence

- Fresh install: `npm ci` completed. `npm audit --omit=dev --audit-level=high`
  found 0 production vulnerabilities.
- Full suite: `npm test` passed (3 Rust tests and 6 Playwright tests).
  No lint or type-check script is defined in `package.json`.
- Exact build: `npm run build` passed; output is JS 11.99 kB (4.82 kB gzip)
  and CSS 7.15 kB (2.39 kB gzip). The 232 kB WebP meets the hero asset budget.
  `cargo build --release`, `cargo package`, and its package verification passed.
- Clean consumer: installed `target/package/log-incident-bundle-0.1.0` into
  `/tmp/log-incident-bundle-consumer`; `--version` and `--demo --json` ran.
  The demo artifact remains blocked by the critical generated-artifact defect.
- Normal CLI processing: file and stdin inputs worked; time-bound correlation
  returned six trace records; the default rules replaced email, bearer token,
  secret field, and AWS-style key fixtures; source SHA-256 provenance appeared
  in the output.
- Live deployment identity: local/live JS SHA-256
  `72b582a1ae8995294c0a52c12e7dda85fdb71f1f92bf0a39ac21172be1b2bc89` and
  local/live CSS SHA-256
  `fef7e46c7be84c753ef9732181700379901fd5d67d969bff1f0bf568a36f1611` match.
- Live desktop and 390 px mobile: no horizontal overflow. The demo showed six
  redacted records, no-match recovery text, and one `timeout` result.
- Live privacy: Playwright recorded only
  `https://log-incident-bundle.sociobot.in` requests throughout the demo flow;
  no data went to another origin. Demo localStorage contained only the scoped
  `demo:` marker. The page made no console or page errors.
- Live accessibility: axe-core found 0 serious/critical issues on `/demo`.
  Keyboard Tab/Enter reached the demo, search, and controls; the designed
  3 px focus indicator was visible. `prefers-reduced-motion: reduce` removed
  the entrance animation.
- Headers: landing/demo/privacy/terms have CSP, HSTS, `nosniff`, and a strict
  referrer policy. Titles, language, main landmark, one h1, legal routes,
  robots, sitemap, and self-hosted assets were present.
- Product-unlock endpoint: an invalid-license request returns HTTP 200 with
  `{valid:false,reason:"invalid"}`. A burst of 120 requests from this client
  observed 31 HTTP 200 then 89 HTTP 429 responses; 429 included
  `Retry-After: 2` and `x-ratelimit-after: 2`. It recovered to 200 after three
  seconds. The observed allowance was about 31 requests per burst (after the
  earlier verification requests); enforcement is present.

## Required repair verification

1. Open a generated bundle in Chromium and assert initial rows, search,
   CSV download, valid `lang`, no console/page errors, and no network request.
2. Add a regression fixture containing `</script>` in every user-controlled
   title/question/log/source field and assert it remains displayed text and
   cannot execute.
3. Reject invalid and inverted time bounds before output creation.
4. Make `--demo` execute the same six-record bounded/correlated case advertised
   on the site, then make Reset demo actually remove its marker or remove the
   marker entirely.
5. Re-run every claim command, full suite, build/package/consumer install, and
   live deployment/hash checks after redeploy.
