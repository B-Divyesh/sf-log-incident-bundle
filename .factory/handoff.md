# Review 2 handoff

**Work order:** `log-incident-bundle-review-2`

**Candidate reviewed:** `a28faa12129d8d671061a07034723f27344f7958`

**Live URL:** https://log-incident-bundle.sociobot.in

**Result:** **FAIL**

## What was done

- Performed cold first-read checks at 390 × 844 and 1280 × 900.
- Audited every landing-page and README copy unit with a word count.
- Exercised the one-click browser demo, search, reset, exit, CSV, storage
  isolation, request origins, and a seeded non-demo storage key.
- Ran all 15 exact commands from `.factory/claims.json` in a fresh clone.
- Ran the CLI demo under a new temporary root and confirmed six records and a
  new private mode-0700 directory.
- Rechecked every finding in `.factory/review-1.md` and
  `.factory/polish-1.md` against both deployed behavior and current code.
- Audited route metadata, headings, deep links, back/focus behavior, the real
  HTTP 404, all live links, security headers, assets, responsive behavior,
  accessibility, console errors, and deployment identity.
- Reviewed missed leverage. No AI or sync feature is warranted for this
  local, finite incident-review workflow.
- Wrote the complete result to `.factory/review-2.md`.

No product code was modified.

## Findings left

1. **F-2-1, blocking:** **Start for real** exits the demo to a landing page
   with no install command, source/release link, or other path to obtain and
   use the CLI.
2. **F-2-2, blocking:** the earlier published-claims completeness finding is
   reopened because `claims.json` omits the landing locations for redaction
   and no-account claims.
3. **F-2-3, minor:** README says “ISO-like timestamps” while the CLI and claim
   registry use the precise term RFC 3339.

## Verification

```text
15 exact clean-clone claim commands                    PASS (15/15)
npm test                                              PASS (6 Rust, 33 browser, 3 lifecycle)
PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npm test
                                                      PASS (6 Rust, 33 live browser)
npm run build                                         PASS (dist/site)
npm run typecheck                                     PASS
npm run lint                                          PASS
cargo package --locked                                PASS (15.9 KiB)
cargo fmt --check                                     PASS
cargo clippy --all-targets --all-features --locked -- -D warnings
                                                      PASS
./verify-url.sh https://log-incident-bundle.sociobot.in
                                                      PASS (10/10)
Live axe WCAG 2 A/AA, five routes                     PASS (0 violations)
Live link/asset crawl                                 PASS
```

Fresh-build and deployed SHA-256 hashes matched for `index.html`, the hashed
JS and CSS, `404.html`, and `terminal-recording.svg`.

## Next steps

Implement the concrete fixes in `.factory/review-2.md`, add the install-path
regression test, update the two claim locations and no-account assertion, then
repeat the complete adversarial review. Do not mark the product accepted while
any finding remains.
