# Repair handoff — verification 7 release blockers

**Work order:** `log-incident-bundle-repair-5`
**Report commit:** `c3312b2c9343d69eb82cfc96557b2b9eaa7e296a`
**Failed candidate:** `f8bf6f9142e58aee74b0b7038bf11009c4e2acf7`
**Repair commit:** `6653447a2ffb402ca20fcc3491771c48be26db32`
**Release:** `0.1.2`
**Live URL:** https://log-incident-bundle.sociobot.in

## Completed repair

- Reproduced the destructive alias exactly before editing. The candidate exited
  0, changed the source SHA-256 from
  `2c25ff4f5695ef4c133c100f266f1375a689b24580b78970c03b18138e235b4e`
  to `fa8167a01552b12cfcbac9313c7eb5d48d9395f01303ddbb9c88df298899c190`,
  and replaced the first line with `<!doctype html>`.
- Output paths now resolve against canonical parents and are compared with each
  input by resolved path and, on Unix, device/inode identity. Direct paths,
  symbolic links, hard links, and redaction-rule input aliases are rejected.
  Output creation uses `create_new`; every existing file or symlink is refused.
- Reproduced the fixed demo-path symlink overwrite before editing. The victim
  changed from SHA-256
  `7c0608f594b9ecbaa0727f406973b3e3bdf474a004da5009129e9538bf07003d`
  to `1ead0ddba95c41bb07fb92b876cd70a84d910f306c6d3c99f98747945c08bb0e`.
  The demo now atomically creates a unique mode-0700 temporary directory and a
  new `review.html`. It never opens the legacy shared path or follows its link.
- The conservative preset now covers canonical and prefix/suffix forms for
  passwords, secrets, OAuth/access/refresh/ID tokens, API/private keys,
  authorization, credentials, sessions, and cookies. The reported seven raw
  values are absent from both serialized HTML and rendered evidence.
- Generated-artifact and website CSV writers prefix cells beginning with `=`,
  `+`, `-`, `@`, tab, or carriage return with an apostrophe before quoting.
- Demo-banner focus uses pale paper against signal red. The measured ratio is
  above 3:1. The mobile sample-review and exposed skip links are at least 44px
  high. The visual-system document records the contextual focus treatment.
- Exact regressions cover direct, hard-link, and symbolic-link output aliases;
  existing-output refusal; the legacy demo symlink victim; consecutive unique
  demo paths and directory permissions; every reported secret; four formula
  prefixes; focus contrast; and 390px touch sizes.

## Verification evidence

Clean and complete local checks:

```text
npm ci                                                    PASS — 22 packages, 0 vulnerabilities
npm test                                                  PASS — 5 Rust tests, 32 Playwright tests
all 14 exact .factory/claims.json commands                PASS
npm run typecheck                                         PASS
npm run lint                                              PASS
npm run build                                             PASS — dist/site
cargo fmt --check                                         PASS
cargo clippy --all-targets --all-features -- -D warnings PASS
cargo build --release                                     PASS
cargo package --allow-dirty                               PASS
./verify-url.sh http://127.0.0.1:4173                     PASS — 5 routes at 1280px and 390px
```

The production build contains 9,798 bytes of JavaScript (4.02 KB gzip) and
7,781 bytes of CSS (2.51 KB gzip). Both remain below the product budgets.

The final nine-file `0.1.2` crate is 14.7 KiB compressed. It was unpacked and
installed with `cargo install --path ... --root ... --locked` in fresh
temporary consumer directories. The installed binary passed `--version`,
`--help`, `--demo --json`, and a bounded correlated file workflow.

Browser checks cover desktop and 390px mobile, keyboard-only routes, focus,
touch targets, reduced motion, route focus announcements, no overflow, empty
and error states, CSV downloads, generated-file search/provenance, script
boundary attacks, and formula-leading CSV input. Axe reported zero serious or
critical findings on every site route. Generated artifacts made no network
requests and logged no browser errors.

Privacy tests recorded only same-origin GET requests across home, demo,
privacy, and terms. Local storage, session storage, IndexedDB, and OPFS stayed
empty. This site has no service worker or offline/update claim; the CLI and its
generated `file:` artifact are the offline product surface and worked with no
network requests. There is no backend, account, sign-in, billing, or AI path,
so those checks are not applicable.

Lighthouse 13 mobile results:

| Target | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Local home | 98 | 100 | 100 | 100 | 2.405 s | 0 | 0 ms |
| Local demo | 100 | 100 | 100 | 100 | 0.935 s | 0 | 1 ms |
| Live home | 99 | 100 | 100 | 100 | 1.953 s | 0 | 31 ms |
| Live demo | 100 | 100 | 100 | 100 | 0.800 s | 0 | 21 ms |

Reports and screenshots are in `.factory/evidence/` with the `repair-5`
prefix.

## Deployment and live identity

The static artifact was deployed with:

```sh
/opt/fleet/lib/deploy-static.sh log-incident-bundle dist/site
```

Azure Static Web Apps deployment
`cd184413-70a6-422e-bc62-ab9645ab21df` succeeded. After deployment:

```text
./verify-url.sh https://log-incident-bundle.sociobot.in   PASS — real 404, both viewports
PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npx playwright test
                                                           PASS — 32 tests
```

Every public file matches `dist/site` byte-for-byte. Representative SHA-256:

```text
index.html                    df4755f115e2910510f2945d5bbb1db3edaf8e87784eb9e07e3d631e744cc8a0
assets/index-DXoUVGA3.js      c25e07f1f364b9ee10badc9082e3d8d934b79fb09aba6ac1a41c5ab9f294e40b
assets/index-CU2Lx6ko.css     217b39d8b05c8ad1d73d25eb911a49a6d49203a87c597ed97898c2d6d689d08d
```

Live HTML uses 30-second revalidation. Hashed JS/CSS use
`max-age=31536000, immutable`. Responses include HSTS, `nosniff`, `DENY`
framing, strict-origin referrer policy, and the self-only CSP with
`frame-ancestors 'none'`. Unknown paths return the styled page with HTTP 404.

## Known gaps / next steps

No release-blocking gaps are known. Redaction remains intentionally
pattern-based, so the CLI and artifact continue to instruct users to review the
copy before sharing. Registry publication remains a factory release action; no
package was published from this worker.
