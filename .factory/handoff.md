# Handoff — Log Incident Bundle v0.1.0

## What shipped

- Rust `clap` CLI that reads files or standard input and writes a single,
  searchable HTML incident review copy.
- RFC-3339-style time bounds, repeated `--correlate FIELD` matching, source
  SHA-256 provenance, and reviewable default or local regex redaction rules.
- `--demo` creates a temporary artifact from `examples/payment-api.log`.
- Static Vite site in `dist/site`, including `/demo`, `/privacy`, `/terms`, a
  designed 404 page, SEO metadata, CSP, and a local-only sample review.
- One-time $19 Sociobot license path with checkout, return-token storage,
  daily verification, restore field, and a locally saved/downloadable rule
  profile. Free exports and redaction stay available without a license.
- Original 232 KB WebP halftone asset. Prompt, provenance, palette, and motion
  policy are documented in `.factory/design.md`.

## Run and verify

```sh
npm install
npm test
npm run build:site  # dist/site
cargo test
cargo build --release
cargo package
```

Run the shipped CLI sample:

```sh
cargo run -- --demo
```

Claim commands pass:

```sh
npm test -- --grep @claim:local-processing
npm test -- --grep @claim:csv-download
```

Verified on 2026-08-28:

- `npm test`: 3 Rust tests and 6 Playwright tests passed.
- `npm run build`: succeeded; generated JS is 12.0 KB and CSS 7.2 KB before
  gzip; hero WebP is 232 KB.
- `cargo package --allow-dirty`: verified its packaged crate builds.
- Manual CLI smoke test generated `/tmp/review.html` with six time-bounded,
  correlated records and replaced the sample email and bearer token.
- Playwright axe check: no serious or critical violations. The suite also checks
  title, keyboard route/filter flow, CSV output, and no browser console errors.
- Lighthouse 13.4.1, mobile `/demo`: Performance 100, Accessibility 100, LCP
  1.0 s, CLS 0.

## Known gaps / next steps

- Redaction remains pattern-based. The generated artifact warns reviewers to
  inspect it before sharing; it cannot guarantee sensitive data is absent.
- Release deployment should register the Sociobot product before the public
  checkout link is used. No product ID is hardcoded beyond the product slug.
- The CLI has no hosted ingestion, tailing, alerting, or retention by design.
