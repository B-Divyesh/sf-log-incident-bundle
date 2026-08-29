# Independent verification 4 — FAIL

**Requested candidate:** `485c107423a27d09a9e8278593d364787f83bc29`  
**Live URL:** <https://log-incident-bundle.sociobot.in>  
**Verified:** 2026-08-29  
**Verifier checkout actually available:** `485c1074239cef3ee8e81e99791b9c1df7c0a464`

## Verdict

**FAIL — release-blocking candidate identity mismatch.** The requested
40-character candidate is not a Git object in this clean checkout or in the
refreshed `origin` remote. `git cat-file -e
485c107423a27d09a9e8278593d364787f83bc29^{commit}` fails with “Not a valid
object name”. It would be inaccurate to approve that named candidate.

The available `main` commit is a different object,
`485c1074239cef3ee8e81e99791b9c1df7c0a464`. That checkout, its production
build, and the live deployment all pass the functional and quality checks
below. No product-code defect was found in the verifiable checkout. Supply the
intended reachable commit hash (or correct the work order to the available
one), then rerun/accept this evidence against that exact object.

## Mandatory first checks

### Cold first read — PASS for the live site

A fresh Chromium context opened the live home page before product testing. The
first screen says it will **“Create a redacted log excerpt”**, says it is **for
teams who need answers without granting raw production-log access**, and makes
**“Try it with sample data”** the primary action, with “See a redacted incident
review first” beside it. The action reaches `/demo` in one click. This meets
the plain-words and one-click-demo gate.

### Claims registry and every declared test — PASS

`.factory/claims.json` exists and lists 13 claims. From the clean checkout, I
ran `npm ci`, then every exact declared command independently:

| Claim IDs | Command | Result |
| --- | --- | --- |
| `portable-html` | `npm test -- --grep @claim:portable-html` | Pass |
| `default-redaction` | `npm test -- --grep @claim:default-redaction` | Pass |
| `cli-inputs` | `npm test -- --grep @claim:cli-inputs` | Pass |
| `bounds-correlation` | `npm test -- --grep @claim:bounds-correlation` | Pass |
| `custom-redaction` | `npm test -- --grep @claim:custom-redaction` | Pass |
| `local-processing` | `npm test -- --grep @claim:local-processing` | Pass |
| `site-runtime` | `npm test -- --grep @claim:site-runtime` | Pass |
| `site-log-privacy` | `npm test -- --grep @claim:site-log-privacy` | Pass |
| `csv-download` | `npm test -- --grep @claim:csv-download` | Pass |
| `demo-cli` | `npm test -- --grep @claim:demo-cli` | Pass |
| `finite-review` | `npm test -- --grep @claim:finite-review` | Pass |
| `mit-license` | `npm test -- --grep @claim:mit-license` | Pass |
| `delivery-policy` | `npm test -- --grep @claim:delivery-policy` | Pass |

Each command starts with `cargo test` and then runs its tagged browser test
through the shipped demo entry point. The complete test command subsequently
reported 4 Rust tests and 24 Playwright tests passing.

## Local build, package, and CLI evidence — PASS

The following all passed:

```sh
npm test
npm run typecheck
npm run lint
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package
npm audit --audit-level=high
```

`npm audit` found zero vulnerabilities. The production site build created
`dist/site`. Its initial JavaScript is 8,733 bytes (3,703 bytes gzip), CSS is
7,601 bytes (2,492 bytes gzip), and the 237,060-byte hero WebP is within the
300 KB image budget.

`cargo package` produced the 0.1.1 crate. I unpacked it into a fresh temporary
consumer and ran `cargo install --path ... --root ...`. The installed public
binary reported `log-incident-bundle 0.1.1`; `--help`, `--demo --json`, a
bounded/correlated named-file review, a stdin review, and invalid RFC 3339
input were exercised. The demo returned `{"records":6}`, the two valid
artifacts were nonempty, the correlated review omitted `healthcheck=ok`, and
the invalid bound failed without creating output.

This covers the brief's normal finite excerpt workflow, correlation outside a
window, custom/default redaction, standard input, no-result/recovery, and
invalid-bound boundary behavior. There is no server, sign-in flow, PWA, or
product endpoint, so backend allowance/429, Entra tenant, and service-worker
checks are not applicable.

## Live product QA — PASS for the available checkout/deployment

### Product and privacy flow

In a fresh live browser context I visited `/`, `/demo`, `/privacy`, and
`/terms`, then exercised the demo. It loaded six rows; searching `ledger`
returned one row; a non-match showed “Clear the search to see all six records”;
CSV downloaded as `checkout-timeout-sample.csv`; reset restored six rows; and
Start for real left both localStorage and sessionStorage empty. IndexedDB was
empty. The full request log contained only same-origin GETs to the document,
site JS/CSS, and hero image. There were no console or page errors.

### Accessibility, keyboard, responsive, and motion

`./verify-url.sh https://log-incident-bundle.sociobot.in` passed `/`, `/demo`,
`/privacy`, `/terms`, and `/missing` at both 1280px and 390px. It verifies
titles, `lang=en`, exactly one `h1`, exactly one `main`, image alt text, no
overflow, console/page errors, and axe serious/critical issues. The live full
Playwright suite also passed against this URL (24 tests), including the
keyboard path, route-focus behavior, 390px touch targets, reset/exit behavior,
and generated-artifact mobile view. A direct 390px reduced-motion check found
no running animations, no horizontal overflow (390 = 390), and a visible
`3px` solid focus outline.

### Headers, caching, and deployment match

Live HTML has short revalidation caching and live hashed JS/CSS/WebP send
`Cache-Control: public, max-age=31536000, immutable`. Responses include HSTS,
`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict-origin
referrer policy, and a CSP restricted to self with `frame-ancestors 'none'`.
`/missing` returns the designed 404 with HTTP 404.

The fresh local build exactly matches deployed bytes:

| File | SHA-256 |
| --- | --- |
| `index.html` | `da2541e350ecf983c24354496c5282986d826b2b2d1f780930398a149b9a21d7` |
| `assets/index-3DnHfvAM.js` | `3f0b17ebb4259db6f83aaec6b5f7f3c83b7cb6521348530179ddcd544ba390d4` |
| `assets/index-zD8wX4FC.css` | `b29d0312f60009baa3e7f135974dff60693a1816ac112ee84f34b68162e97127` |
| `incident-press.webp` | `adcdaf7b4a6e2ea81a53df559af4c775bffe77ba0bba842ce7cd73d1cbfc6180` |

Mobile Lighthouse 13.4.1 on live `/demo` scored Performance 100,
Accessibility 100, Best Practices 100, and SEO 100; LCP was 1.0 s, CLS 0,
and TBT 80 ms.

## Defects by severity

### Release-blocking — candidate identity (not product behavior)

The requested SHA cannot be resolved locally or after `git fetch --all
--prune`. The deployed site instead matches the different reachable SHA shown
at the top of this report. Correct this traceability error before release
approval.

### Product defects

None observed in the verifiable checkout and live deployment.
