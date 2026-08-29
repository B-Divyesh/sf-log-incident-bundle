# Independent verification 9 — FAIL

**Candidate:** `d47de7d9feb912384ea35c44de815f4f6bd4594b` (`main`)

**Verified:** 2026-08-29

**Live URL:** https://log-incident-bundle.sociobot.in
**Verdict:** **FAIL — the default redaction can leave authentication credentials, cookie values, and private-key material in the artifact.**

## First read

The cold live page passes the first-read gate at desktop and 390 px. The first
screen says **“Create a redacted log excerpt”**, names **“teams who need answers
without granting raw production-log access”**, and presents the one-click
**“Try it with sample data”** action beside **“See a redacted incident review
first.”** The three facts explain the input, self-contained output, and
MIT/no-account status. The action opens a useful six-record incident review.

## Release-blocking finding

### Critical — common secret formats survive default redaction

The installed release package was given representative, synthetic forms of
the categories promised by the `default-redaction` claim. It produced these
records in the shareable HTML:

```text
Authorization: [REDACTED:SECRET FIELD] ZmFjdG9yeXVzZXI6U3VwZXJTZWNyZXQ=
Cookie: [REDACTED:SECRET FIELD] csrf=cookie_secret_two
private_key=[REDACTED:SECRET FIELD] PRIVATE KEY-----
MIIE_private_key_body_should_not_survive
-----END PRIVATE KEY-----
credentials=[REDACTED:SECRET FIELD] credential_password_should_not_survive
```

The raw Basic credential, second cookie, PEM body, and trailing credential all
remain in the generated file. This violates the explicit claim that default
rules replace authorization, credentials, cookies, and private keys, as well
as the brief's requirement for conservative redaction. A recipient could be
given live credentials in an artifact presented as redacted.

The cause is the line-local default secret-field expression in `src/main.rs`:
an unquoted value ends at the first whitespace. It cannot consume the second
token in a Basic/Digest authorization value, later cookie pairs, or following
PEM lines. The warning that redaction is not a guarantee is appropriate, but
it does not make the narrower category claim true.

The exact declared `@claim:default-redaction` test still passes because it uses
single-token values or quotes the complete Basic value. Its sandbox therefore
does not prove the advertised behavior for ordinary header and PEM formats.

### Medium — the CLI landing page lacks the required terminal recording

The CLI demo command and browser sample both work, but the landing page's
terminal area is static HTML assembled by `terminal()` in `src/site.ts`. There
is no self-hosted terminal recording of the real binary, as required by the
CLI section of the supplied demo-sandbox contract. This does not diminish the
working one-click sample, but it remains an acceptance-contract gap.

## Claims execution

`.factory/claims.json` exists and lists 14 claims. I invoked every exact command
individually after a clean `npm ci`; all declared tests passed:

| Claim | Declared test | Independent result |
| --- | --- | --- |
| `portable-html` | PASS | PASS |
| `default-redaction` | PASS | **FAIL — critical formats above leak** |
| `output-safety` | PASS | PASS |
| `cli-inputs` | PASS | PASS |
| `bounds-correlation` | PASS | PASS |
| `custom-redaction` | PASS | PASS |
| `local-processing` | PASS | PASS |
| `site-runtime` | PASS | PASS |
| `site-log-privacy` | PASS | PASS |
| `csv-download` | PASS | PASS |
| `demo-cli` | PASS | PASS |
| `finite-review` | PASS | PASS |
| `mit-license` | PASS | PASS |
| `delivery-policy` | PASS | PASS |

For audit completeness, I first invoked the commands before installing this
clean clone's dependencies, exactly in the requested ordering. They could not
start because `vite` was not installed. After the documented `npm ci`
precondition, the authoritative clean-checkout run above passed 14/14.

## Repository gates

```text
npm ci                                                   PASS — 22 packages, 0 vulnerabilities
npm test                                                 PASS — 5 Rust, 32 Playwright, 3 concurrent lifecycle tests
npm run typecheck                                        PASS
npm run lint                                             PASS
cargo fmt --check                                        PASS
cargo clippy --all-targets --all-features -- -D warnings PASS
cargo build --release --locked                           PASS
npm run build                                            PASS — dist/site
cargo package --locked                                   PASS — 9 files, 14.8 KiB compressed
```

The production build contains 9,798 bytes of JavaScript (4.02 KiB gzip) and
7,781 bytes of CSS (2.51 KiB gzip). The hero is 237,060 bytes and there are no
font files. These are within the supplied budgets.

## Packaged CLI and end-to-end behavior

The `.crate` was unpacked into a new temporary consumer and installed with
`cargo install --path ... --root ... --locked`. The installed
`log-incident-bundle 0.1.2` passed:

- `--help`, `--version`, and non-interactive `--json` output;
- `--demo --json`, producing six records in a unique mode-0700 directory;
- a bounded and trace-correlated file flow with six records, source SHA-256,
  searchable HTML, and seven-line CSV;
- standard input and an exact inclusive one-second boundary;
- missing-file, invalid-RFC-3339, inverted-bound, and existing-output failures;
- recovery with corrected input and byte-identical preservation of an existing
  output.

An empty stdin stream produces a valid zero-record review with recovery copy.
The generated review also passed an offline `file:` load at 390 px: one `h1`,
one `main`, no overflow, no network request, no browser error, no serious or
critical axe result, working search/recovery, and keyboard CSV download.

## Live browser, accessibility, and privacy

`PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npm test` passed
all 32 browser tests. `./verify-url.sh` passed `/`, `/demo`, `/privacy`,
`/terms`, and a true HTTP 404 at both 1280 px and 390 px.
The earlier claim-server/deployment concern did not recur: every individual
claim command and the three-way concurrent lifecycle regression passed.

- Fresh desktop and mobile contexts logged only same-origin `GET` requests for
  the document, hashed JS/CSS, and the product image. There were no console,
  page, or request errors.
- Demo localStorage, sessionStorage, IndexedDB, and OPFS stayed empty. No
  service worker was registered.
- The skip link is first in the tab order, is 44 px high, and has a visible
  3 px focus ring. All demo controls are keyboard reachable; Space activates
  Reset and CSV download. There is no trap.
- The no-results state says how to recover, Reset restores all six rows, and
  the download contains the header plus all six records.
- Reduced-motion mode reports no active animations. Both widths have zero
  horizontal overflow.
- Axe found zero serious or critical findings on every live route and on the
  generated artifact. Lighthouse accessibility scored 100.
- Every intended internal link returns 200 and its fragment exists. The
  deliberately missing route returns the styled 404.

There is no upload, account, analytics, payment, AI, runtime API, backend, or
sign-in flow. Therefore service-worker update, backend concurrency/persistence,
429 allowance, and Entra-authority checks are not applicable. No useful AI step
is missing from this local deterministic redaction workflow.

## Performance and delivery

Fresh mobile Lighthouse measurements:

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Live home | 91 | 100 | 100 | 100 | 2.105 s | 0 | 364 ms |
| Live demo | 100 | 100 | 100 | 100 | 0.853 s | 0 | 22 ms |

No field INP data was available; direct keyboard and pointer interactions had
immediate observable results. LCP and CLS satisfy the supplied budgets.

The live HTML, JS, CSS, images, icons, robots file, sitemap, and 404 assets
match the candidate's fresh `dist/site` files byte-for-byte. Representative
SHA-256 values are:

```text
index.html                    df4755f115e2910510f2945d5bbb1db3edaf8e87784eb9e07e3d631e744cc8a0
assets/index-DXoUVGA3.js      c25e07f1f364b9ee10badc9082e3d8d934b79fb09aba6ac1a41c5ab9f294e40b
assets/index-CU2Lx6ko.css     217b39d8b05c8ad1d73d25eb911a49a6d49203a87c597ed97898c2d6d689d08d
```

HTML uses 30-second revalidation. Hashed assets and images use one-year
immutable caching, Brotli transfer is enabled, and an ETag revalidation
returned 304. Responses include HSTS, `nosniff`, `DENY` framing,
`strict-origin-when-cross-origin`, and the self-only CSP with
`frame-ancestors 'none'`.

## Required repair

1. Redact complete authorization and credential values, all cookie pairs, and
   complete private-key blocks conservatively, including multiline PEM input.
2. Extend `@claim:default-redaction` with the exact representative formats in
   this report and assert that raw values are absent from both file bytes and
   the rendered review.
3. Add the required self-hosted terminal recording generated from the real
   packaged CLI demo.
4. Rerun every exact claim command, full clean build, packaged-consumer flow,
   and live verification before release.
