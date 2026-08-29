# Polish 1 — acceptance repair

**Base reviewed:** `4d512dae3b613b270fa4d57d2210374bf74d383f`
**Repair commit:** `d23b946fd713e2d6c8e3506a6be59b63f10fa231`
**Deployed URL:** https://log-incident-bundle.sociobot.in/?demo=1

Every finding in the available review and verification history was rechecked.
The earlier reports do not assign stable IDs, so their report plus heading is
used as the finding ID below.

| Finding ID | Change made | Evidence |
| --- | --- | --- |
| F-1-1 / verification-5 skip-link observation | Initial `route()` no longer focuses the h1. Heading focus is now limited to History API and back/forward transitions. | `fresh loads start keyboard navigation at the skip link`; `route navigation moves focus to the new page heading`; live full suite pass. |
| F-1-2 HTTP 404 shell | Rebuilt `404.html` as a complete incident-printout page with skip link, header/nav, footer/legal links, favicon, canonical, description, OG/Twitter tags, and `noindex`. | `standalone 404 has the standard shell, metadata, and legal links`; `evidence/polish-1-live-404.png`; live `/missing` HTTP 404. |
| F-1-3 landing-preview claim location | Added `landing preview` to the `demo-cli` claim location. | `.factory/claims.json`; `npm test -- --grep @claim:demo-cli` from clean clone. |
| F-1-4 README deployment sentence | Rewrote the deployment copy as short, single-purpose sentences and updated the copy audit. | `.factory/copy-audit.md`; README recheck. |
| verification.md / verification-1 / verification-2: malformed artifact | Preserved the repaired script-safe artifact renderer and observable browser artifact test. | `npm test -- --grep @claim:portable-html` from clean clone; full suite pass. |
| verification.md / verification-1 / verification-2: script-boundary XSS | Preserved safe JSON script data and restrictive artifact behavior. | `generated bundle keeps script-boundary content inert`; Rust `output_uses_safe_json_script_data`. |
| verification.md / verification-1: quoted JSON secret fields | Preserved JSON-key redaction for secret fields. | `npm test -- --grep @claim:default-redaction` from clean clone. |
| verification-3: AWS temporary key and `token=` redaction | Preserved `ASIA` and token fixture coverage. | `npm test -- --grep @claim:default-redaction` from clean clone. |
| verification.md / verification-1 / verification-2: invalid or reversed bounds | Preserved RFC 3339 validation before output. | `CLI rejects invalid and inverted time bounds before creating output`; Rust `rejects_invalid_and_inverted_time_bounds`. |
| verification.md / verification-1 / verification-2: CLI demo had seven records | Preserved the bounded, correlated six-record `--demo` workflow. | `npm test -- --grep @claim:demo-cli` from clean clone. |
| verification.md / verification-1 / verification-2: demo reset/exit isolation | The browser sample stays in memory; reset and exit clear the historical demo key. First-screen links now enter the isolated `?demo=1` entry directly. | `query demo entry is isolated and uses demo metadata`; `demo reset and exit discard the demo namespace`; `evidence/polish-1-live-demo-query-mobile.png`. |
| verification.md / verification-1 / verification-2: mobile touch targets | Preserved 44px controls and rechecked responsive demo layout. | `390px demo has no overflow and all primary controls meet touch size`; live 390px verifier pass. |
| verification-3: generated-artifact mobile overflow | Preserved artifact mobile width behavior. | `390px generated CLI artifact has no page-level overflow`. |
| verification-1: route focus | Retained heading focus after in-app navigation while correcting initial-load focus. | `route navigation moves focus to the new page heading`. |
| verification-1: returned license behavior | The product has no paid tier, checkout, license storage, or license endpoint; the obsolete paid UI remains absent. | `npm test -- --grep @claim:mit-license` from clean clone. |
| verification-1: development dependency audit | Current dependency audit is clean. | `npm audit --audit-level=high` → 0 vulnerabilities. |
| verification.md / verification-1 / verification-2: cache policy | Preserved immutable hashed-asset policy. | `npm test -- --grep @claim:delivery-policy`; live JS header `Cache-Control: public, max-age=31536000, immutable`. |
| verification-1 / verification-2: real HTTP 404, OG image, delivery details | Preserved Static Web Apps 404 override, immutable routes, and product OG image; completed 404 metadata shell. | `npm test -- --grep @claim:delivery-policy`; live `/missing` 404; 404 screenshot. |
| verification-3: missing framing protection | Preserved CSP `frame-ancestors 'none'` and `X-Frame-Options: DENY`. | delivery-policy claim test; live response-header check. |
| verification-3: missing `verify-url.sh` | Preserved repository verifier and ran it locally and live. | `./verify-url.sh http://127.0.0.1:4173`; `./verify-url.sh https://log-incident-bundle.sociobot.in`. |
| verification-1 / verification.md: rustfmt and Clippy | Preserved formatted, warning-free CLI source. | `cargo fmt --check`; `cargo clippy --all-targets --all-features -- -D warnings`. |
| verification-1 / verification-3: unlisted published claims | Claims registry covers current visitor-relevant promises; F-1-3 adds the last omitted location. | all 13 exact `claims.json` commands pass from a clean clone. |
| verification-4: candidate identity | The repaired source is committed and the deployed JS/CSS hashes match this repair build. | `d23b946`; live JS SHA-256 `3357abd28bde8d889e24a24b517b6042f7bee71d7c8f8324d7d20cff71f8646c`; CSS SHA-256 `b29d0312f60009baa3e7f135974dff60693a1816ac112ee84f34b68162e97127`. |

## Live recheck

- Cold direct demo: `/?demo=1` shows the persistent banner, six records,
  Reset demo, and Start for real without storage writes.
- Cold 404: `/missing` returns HTTP 404 with the product shell and legal links.
- `PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npx playwright test`
  passed all 27 checks.
- Lighthouse mobile on the deployed demo: Performance 100, Accessibility 100,
  Best Practices 100, SEO 100; LCP 0.8s, CLS 0, TBT 20ms. Report:
  `evidence/lighthouse-polish-1-live-demo.json`.
