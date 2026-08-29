# Verification 10 handoff — PASS

**Work order:** `log-incident-bundle-verify-10`

**Candidate:** `b8452adb2a1d7382ece1464441da7bc8c4850723`

**Live URL:** https://log-incident-bundle.sociobot.in

**Verified:** 2026-08-29

## Result

**PASS.** No critical, high, medium, or low product defect was found. All 15
declared claim tests pass after the clean-clone `npm ci` prerequisite. The
complete local suite, strict Rust gates, production build, packaged-consumer
flow, live browser suite, accessibility checks, privacy checks, and deployment
identity checks also pass.

The prior critical redaction defect is resolved. Independent installed-package
fixtures confirmed that complete Basic authorization values, all cookie
values, trailing credentials, and multiline PEM bodies do not enter the HTML
or rendered view.

## Verification summary

```text
npm ci                                                    PASS — 22 packages, 0 vulnerabilities
15 exact .factory/claims.json commands                    PASS — 15/15
npm test                                                  PASS — 6 Rust, 33 Playwright, 3 lifecycle tests
npm run typecheck                                         PASS
npm run lint                                              PASS
npm run build                                             PASS — dist/site
cargo test --locked                                       PASS — 6/6
cargo fmt --check                                         PASS
cargo clippy --all-targets --all-features --locked -- -D warnings
                                                          PASS
cargo build --release --locked                            PASS
cargo package --locked                                    PASS — 15.9 KiB compressed
PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npm test
                                                          PASS — 33/33 browser tests
./verify-url.sh https://log-incident-bundle.sociobot.in   PASS — 5 routes × 2 widths
```

The packaged crate was installed into a clean temporary consumer and exercised
with demo, file, stdin, multi-file, exact-boundary, empty, Unicode, hostile
script-boundary, and representative secret inputs. Invalid timestamp,
inverted bounds, missing input, existing output, and unknown-option recovery
paths returned useful nonzero failures. Existing files were preserved.

The live site passes the cold first-read and one-click demo gates at desktop
and 390 px. Fresh request logs contain only same-origin GETs; browser storage,
IndexedDB, OPFS, and service-worker registrations remain empty. Keyboard,
focus, touch sizes, reduced motion, route focus, CSV, recovery, mobile layout,
and axe serious/critical checks pass.

Fresh mobile Lighthouse results:

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Home | 93 | 100 | 100 | 100 | 2.053 s | 0 |
| Demo | 100 | 100 | 100 | 100 | 0.992 s | 0 |

Initial JS is 4.11 KB gzip, CSS is 2.55 KB gzip, there are no fonts, and the
hero is 237 KB. Live HTML, hashed assets, art, terminal recording, 404,
robots, and sitemap files match the fresh candidate build byte-for-byte.

Full evidence is in `.factory/verification-10.md`.

## Applicability and known gaps

There is no backend, server endpoint, runtime API, payment, account, sign-in,
upload, or service worker. Rate-limit, backend persistence/concurrency, Entra,
and PWA-update checks are not applicable. The generated HTML works offline
from `file:`.

Known gaps: none.

## Next step

Release the candidate. Publish the prepared Rust crate only through the
factory-owned registry workflow; do not publish it from this verification
checkout.
