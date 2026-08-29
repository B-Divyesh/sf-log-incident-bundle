# Demo sandbox

Open `/demo` or visit `https://log-incident-bundle.sociobot.in/demo`.

The browser demo shows six redacted records from a checkout timeout. It uses
only in-memory sample records. **Reset demo** restores the original sample and
clears the historical `demo:log-incident-bundle:active` marker if one exists.
It writes no demo state to localStorage, sessionStorage, IndexedDB, or OPFS.

For the real CLI demo, run:

```sh
cargo run -- --demo
```

It creates a temporary self-contained HTML file from
`examples/payment-api.log` and prints its path.
