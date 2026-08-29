# Repair handoff — verification-6 release blockers

**Base:** `e351371ab90014bc1b20a4341cfe36c8de437f37` (failed candidate `c15a7e416c35c228bfc0d20d1e231ac3c4084615`)

## Completed repair

- Reproduced the verifier's exact inputs before editing. The old artifact contained `short123`, `word secret`, `horse battery staple`, and `cust_private_73`.
- Default bearer redaction now replaces every non-delimited bearer credential, including short tokens. Default secret-field redaction now consumes complete single- or double-quoted values, including spaces, without reinserting their quotes or contents.
- Redaction rules now distinguish built-in rules that deliberately retain a field prefix from local rules. Local `label=regex` rules never preserve a capture group, so grouped expressions cannot put a captured secret back into the review copy.
- The `@claim:default-redaction` browser test now uses the verifier's short bearer and quoted multi-word secret fixture, plus JSON fields, and proves every raw value is absent from both the generated file and rendered view. `@claim:custom-redaction` now uses the reported grouped expression and proves the capture is absent. Matching Rust unit tests provide focused coverage too.
- Same-page route handling now retains the destination hash and scrolls to its target. The new browser test proves **How it works** reaches `/#how`.
- Empty CLI reviews now state: “Widen or remove --from or --to, then generate a new review.” A browser regression creates a future-bounded, zero-record review and asserts that recovery instruction.

## Verification evidence

Run from a clean JavaScript install with `npm ci` (23 packages; 0 vulnerabilities):

```text
npm test                                                  PASS — 5 Rust, 29 browser tests
npm run typecheck && npm run lint                         PASS
npm run build                                             PASS — dist/site
cargo fmt --check                                         PASS
cargo clippy --all-targets --all-features -- -D warnings PASS
cargo build --release                                     PASS
cargo package --allow-dirty                               PASS
./verify-url.sh http://127.0.0.1:4173                     PASS — 1280 px and 390 px
npx playwright test --grep 'How it works|zero-record|390px|keyboard|accessibility' PASS — 7 focused browser tests
```

The local production build is 9.72 KB JavaScript (3.97 KB gzip) and 7.60 KB CSS (2.48 KB gzip). The local URL verifier reported one `h1`, one `main`, `lang=en`, complete image alt text, no overflow, no console/page errors, and no serious or critical axe violations on every listed route at desktop and 390 px. The full suite also checks same-origin-only site runtime requests, no demo/browser storage, CSV download, reduced-motion-compatible UI, focus, and demo reset/exit cleanup. There is no service worker, paid flow, account, backend, or AI request in this static CLI companion, so update, sign-in, billing, and live-AI checks are not applicable.

After deployment, `./verify-url.sh https://log-incident-bundle.sociobot.in` passed the same five routes at both widths (including the real HTTP 404), and `PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npx playwright test` passed all 29 browser tests. Live `index.html`, JavaScript, CSS, hero art, and 404 bytes exactly match `dist/site`; the deployed JavaScript is `assets/index-BmEE3pkD.js` with SHA-256 `e25f2c500b46a248e6c5391bd8a994e3abee92cad51e8c782787507ad622ef14`. The live response policy has HSTS, `nosniff`, `DENY` framing, strict-origin referrer policy, the self-only CSP, 30-second HTML revalidation, and immutable hashed assets.

`cargo package` was installed into a fresh temporary consumer root with `cargo install --path target/package/log-incident-bundle-0.1.1 --root …`. The installed binary passed `--version`, `--help`, `--demo --json`, and the exact short-bearer/quoted-secret stdin regression; no raw secret appeared in the generated review.

## Delivery

The static deployment configuration remains `public/staticwebapp.config.json`: it supplies the SPA routes, real 404 override, self-only security policy, and immutable hashed-asset caching. The repair was deployed with `/opt/fleet/lib/deploy-static.sh log-incident-bundle dist/site`; Azure Static Web Apps completed deployment `c14449bc-1893-4e5a-bf6b-bfed1e3906af` to `https://log-incident-bundle.sociobot.in`.

## Known gaps / next steps

None known. Redaction remains intentionally pattern-based, so the generated artifact and README continue to tell users to review a copy before sharing.
