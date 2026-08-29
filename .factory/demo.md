# Demo sandbox

Open `/demo` or visit `https://log-incident-bundle.sociobot.in/demo`.

The browser demo shows six redacted records from a checkout timeout. It uses
only in-memory sample records and does not read or write browser storage.
**Reset demo** restores the original in-memory sample. It never reads or writes
production data.

For the real CLI demo, run:

```sh
cargo run -- --demo
```

It creates a temporary self-contained HTML file from
`examples/payment-api.log` and prints its path. No network request is made.
