# Independent verification 5 — PASS

**Candidate:** `485c1074239cef3ee8e81e99791b9c1df7c0a464`  
**Live URL:** https://log-incident-bundle.sociobot.in  
**Verified:** 2026-08-29 UTC  
**Checkout:** detached at the candidate and clean before verification.

## Release decision

**PASS.** The CLI produces the promised bounded, redacted, self-contained review artifact, and the companion site provides a one-click isolated sample review. Every required claim command passed from the clean candidate checkout. The live JavaScript and CSS are byte-for-byte identical to the candidate build.

## First-read test

A cold live visit says this is **a local CLI that creates a redacted log excerpt** for **teams needing answers without granting raw production-log access**. Its first-screen primary action is **“Try it with sample data”**, with “See a redacted incident review first” beside it. One click opens `/demo`. Three facts say it reads a chosen file/stdin, writes one self-contained HTML review copy, and is MIT licensed with no account or purchase.

## Mandatory claim tests

After `npm ci`, every exact command declared in `.factory/claims.json` passed via `npm test -- --grep @claim:<id>`. Each ran the four Rust unit tests too.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `portable-html` | PASS | Generated `file:` bundle rendered six records, searched, downloaded a seven-line CSV, showed SHA-256 provenance, and made no network request. |
| `default-redaction` | PASS | Exact email, bearer, secret-field, `AKIA`, and `ASIA` fixtures were absent from HTML and rendered output. |
| `cli-inputs` | PASS | File and stdin each produced a one-record artifact with the correct source. |
| `bounds-correlation` | PASS | The two-second selected window plus `trace_id` yielded six linked records and excluded the health check. |
| `custom-redaction` | PASS | A temporary `label=regex` rule emitted `[REDACTED:CUSTOMER ID]`. |
| `local-processing` | PASS | `/demo` search/reset left localStorage, sessionStorage, IndexedDB, and OPFS empty; only same-origin requests occurred. |
| `site-runtime` | PASS | Home, demo, privacy, and terms loaded runtime resources only from the product origin. |
| `site-log-privacy` | PASS | No form or file input; all observed website requests were GET. |
| `csv-download` | PASS | Demo downloaded `checkout-timeout-sample.csv`, header plus six records. |
| `demo-cli` | PASS | `--demo --json` reported six records and its artifact rendered six rows. |
| `finite-review` | PASS | Demo finished within 30 seconds; help exposes no serve/listen/watch/tail switch. |
| `mit-license` | PASS | MIT `LICENSE`; home and terms contain no checkout or purchase flow. |
| `delivery-policy` | PASS | Config contains framing/CSP headers, immutable assets, route rewrites, and `/404.html` override. |

## Local build and CLI checks

All passed:

```text
npm ci
npm test                         # 4 Rust tests + 24 Playwright tests
npm run typecheck
npm run lint
npm run build                    # dist/site
cargo build --release
cargo package --allow-dirty
```

Independent consumer exercise: `cargo install --path . --root <fresh-temp>` installed successfully. Its installed binary generated the six-record `--demo --json` bundle and read stdin into a one-record artifact. A malformed `--from bad-time` returned exit 1 with the RFC 3339 instruction and created no output. Existing integration coverage also confirms inverted bounds are rejected before output, custom redaction works, and a `</script>` payload remains inert.

## Live deployment, privacy, headers, and performance

- Cold live page: no console/page errors; requests were only `/`, hashed JS/CSS, and the self-hosted illustration.
- Deployment match: local/live `assets/index-3DnHfvAM.js` SHA-256 is `3f0b17ebb4259db6f83aaec6b5f7f3c83b7cb6521348530179ddcd544ba390d4`; local/live `assets/index-zD8wX4FC.css` SHA-256 is `b29d0312f60009baa3e7f135974dff60693a1816ac112ee84f34b68162e97127`.
- Live demo at desktop and 390×844: six initial rows, one `timeout` result, reset restored six rows, CSV had seven lines, no horizontal document overflow, no storage writes, no errors, and only the product origin was requested.
- Headers on `/`, `/demo`, `/privacy`, `/terms`, `/404.html`, JS, and CSS include CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and strict-origin referrer policy. HTML uses 30-second revalidation; hashed JS/CSS are immutable for one year.
- Initial JS is 8,733 bytes and CSS is 7,601 bytes; the initial illustration is 237,060 bytes. All are within stated budgets.
- `./verify-url.sh http://127.0.0.1:4173/` passed all five routes at 1280px and 390px. The product's Playwright axe checks and independent live `/demo` checks found zero serious/critical findings. Standalone `@axe-core/cli` could not start because this container has no Selenium Chrome binary; Playwright's preinstalled Chromium was used instead.
- Reduced-motion was exercised with a reduced-motion browser context. The sole animation is guarded by `prefers-reduced-motion: no-preference`.

There are no product server-side endpoints, sign-in, service worker/PWA, paid unlock, or rate-limited API path. Rate-limit and Entra checks are not applicable.

## Keyboard and accessibility

Keyboard-only operation works: Enter on the sample link opens `/demo`; the search field filters records; download and reset work; tested controls have a visible 3px moss focus outline with 4px offset. No serious/critical axe issue exists.

### Low, non-blocking observation

On an initial load, `route()` programmatically focuses the `<h1>`. Forward Tab therefore starts with page controls; the hidden skip link is reached only after focus wraps. The link works, but it is not the first normal Tab stop. Restrict the heading focus move to client-side route changes for conventional skip-link behavior.
