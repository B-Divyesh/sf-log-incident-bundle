# Demo sandbox

Open `/?demo=1` for the direct isolated demo entry, or use `/demo`.
The catalog and first-screen action use `https://log-incident-bundle.sociobot.in/?demo=1`.

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
