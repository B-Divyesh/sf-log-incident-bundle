# Repair 7 handoff — verification 9 blockers resolved

**Work order:** `log-incident-bundle-repair-7`

**Verifier report:** `1c89a76b2cc1d2ea714882a5075b29230cb3e51c`

**Failed candidate:** `d47de7d9feb912384ea35c44de815f4f6bd4594b`

**Repair commit:** this `main` repair commit

**Release version:** `0.1.3`

**Artifact class:** CLI with a static companion site at
`https://log-incident-bundle.sociobot.in`

## Release-blocking repairs

- Default redaction now processes complete source text before a selected record
  is rendered. Time bounds and correlation still use the original record text.
  The rendered record receives source text redacted at the same source line.
- Unquoted secret fields conservatively remove the remainder of their line.
  This removes complete Basic and Digest authorization values, every cookie
  pair, and trailing credential values instead of only the first token.
- A multiline PEM rule removes complete `BEGIN … PRIVATE KEY` through `END …
  PRIVATE KEY` blocks while preserving source line positions. No PEM body can
  reach the generated HTML or its rendered review rows.
- `@claim:default-redaction` now includes the verifier's synthetic Basic
  authorization, second cookie, PEM body, and trailing credential examples.
  It asserts every raw value is absent from both the HTML bytes and browser
  text.
- The landing page now presents `public/terminal-recording.svg`, a self-hosted
  SVG terminal recording. `npm run record:demo` cargo-packages the crate,
  installs it into a temporary consumer root, executes `--demo`, verifies the
  six-record artifact, and creates the recording. Its claim test regenerates
  that SVG and compares it byte-for-byte with the shipped asset.

## Verification evidence

Fresh dependency install and final source checks passed:

```text
npm ci                                                    PASS — 22 packages, 0 vulnerabilities
npm test                                                  PASS — 6 Rust, 33 Playwright, 3 concurrent lifecycle claims
npm run typecheck                                         PASS
npm run lint                                              PASS
cargo fmt --check                                         PASS
cargo clippy --all-targets --all-features -- -D warnings PASS
cargo build --release --locked                            PASS
cargo package --allow-dirty --locked                      PASS — v0.1.3 crate
npm run build                                             PASS — dist/site
```

All 15 exact commands declared in `.factory/claims.json` passed individually
after the final `npm ci`, including `default-redaction` and the new
`terminal-recording` claim.

The fresh `0.1.3` crate was unpacked into a temporary consumer directory,
installed with `cargo install --path … --root … --locked`, and ran `--help` and
`--demo --json`. The installed demo created a private mode-0700 directory and
a six-record review with the expected bearer-token redaction.

`./verify-url.sh http://127.0.0.1:4173` passed home, demo, privacy, terms, and
the designed missing route at both 1280 px and 390 px. It found one title, one
main landmark, one h1, no missing image alt text, no horizontal overflow, no
browser errors, and no serious or critical axe violations on every route.
The complete browser suite also verifies keyboard demo entry, search, reset,
CSV download, route-focus movement, skip-link first focus, touch targets,
reduced motion, no demo storage, same-origin runtime requests, offline
generated-artifact use, and the static delivery policy.

Fresh mobile Lighthouse evidence is checked in:

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| `/` | 98 | 100 | 100 | 100 | 2.407 s | 0 |
| `/demo` | 100 | 100 | 100 | 100 | 0.928 s | 0 |

See `.factory/evidence/repair-7-local-home.json` and
`.factory/evidence/repair-7-local-demo.json`.

## Deployment and scope

The static deployment source remains `dist/site` with the existing Static Web
Apps configuration, headers, cache rules, routes, and designed 404 response.
Pushing this commit to `main` is the factory deployment action. Post-deploy
live identity and browser evidence is recorded after the deployment completes.

There is no backend, account, payment, upload, runtime API, AI feature, or
service worker. Backend persistence/concurrency, 429, identity-provider, and
service-worker update checks are not applicable. The browser demo remains
in-memory and local-only.

## Known gaps and next steps

None. Publish the prepared `0.1.3` crate only through the factory-owned
registry workflow; do not publish it from this repository.
