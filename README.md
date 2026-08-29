# Log Incident Bundle

Create a bounded, redacted incident log review copy for a teammate.

It is for small teams that need an answer from production logs without giving
someone broad production-log access. The CLI reads a chosen file or standard
input and writes one self-contained HTML review copy.

[Try the sample review](https://log-incident-bundle.sociobot.in/demo) ·
[Privacy](https://log-incident-bundle.sociobot.in/privacy) ·
[Terms](https://log-incident-bundle.sociobot.in/terms)

## Install

Build from a checkout with stable Rust:

```sh
cargo install --path .
```

Or build without installing:

```sh
cargo build --release
./target/release/log-incident-bundle --help
```

## Make a review copy

Choose a time range, follow matching trace records, and name the output file.

```sh
log-incident-bundle api.log worker.log \
  --from 2026-08-22T14:01:00Z \
  --to 2026-08-22T14:02:00Z \
  --correlate trace_id \
  --question "Did the retry create a second charge?" \
  --output checkout-review.html
```

Open `checkout-review.html` in a browser. The recipient can search records and
download a CSV without needing the source logs.

Use standard input when a file is not needed:

```sh
journalctl -u payments --since '10 minutes ago' | \
  log-incident-bundle --output payment-review.html
```

The CLI recognizes ISO-like timestamps at the start of a line. `--from` and
`--to` include records in that time window. Each `--correlate FIELD` finds
values for that field inside the window, then adds other matching records.

## Redaction

The default rules replace email addresses, bearer tokens, common secret fields
including `token`, and `AKIA` or `ASIA` AWS access-key IDs. Add reviewable local
rules with a plain text file:

```text
# rules.txt
customer id=customer_id=[A-Za-z0-9_-]+
session cookie=session=[^ ]+
```

```sh
log-incident-bundle api.log --redact-file rules.txt --output review.html
```

Redaction is pattern-based and not a guarantee. Inspect the finished review
copy before sharing it.

## Demo

Run the shipped example without providing a file:

```sh
log-incident-bundle --demo
```

It prints the path to a temporary review copy built from
[`examples/payment-api.log`](examples/payment-api.log). The browser version is
at `/demo`. It uses six fixed sample records in memory and writes no demo data
to browser storage.

## Develop and verify

```sh
npm ci
npm test
npm run build:site  # writes the static site to dist/site
npm run typecheck
npm run lint
cargo test
cargo build --release
```

`npm test` runs the local CLI tests and browser checks. Site pages load runtime
files only from the product website.

To prepare the Rust crate for publishing, run:

```sh
cargo package
```

Do not publish from this repository. The factory owns registry credentials.

## Deploy

The factory deploys the static companion site from `dist/site`. Build it with
`npm run build:site`; the checked-in `staticwebapp.config.json` sets the
security headers, route rewrites, real 404 response, and immutable cache policy
for hashed assets. Push an approved commit to `main` for the factory deployment.

## Scope

The CLI creates a finite review copy. It is not a live log service.

## License

The CLI and companion site are available under the [MIT License](LICENSE).
There is no paid tier or purchase flow.
