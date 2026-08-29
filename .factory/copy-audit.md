# Landing and README copy audit

Sentence counts use whitespace-separated words. Commands and literal terminal
output are excluded because visitors run them rather than read them as prose.
No audited sentence exceeds 22 words or uses a banned marketing word.

## Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Create a redacted log excerpt | 5 | Headline; `default-redaction`. |
| For teams who need answers without granting raw production-log access. | 10 | Audience and outcome. |
| Try it with sample data | 5 | Primary action. |
| Install the CLI | 3 | Real-use action; `install-cli`. |
| See a redacted incident review first. | 6 | `default-redaction`. |
| Reads a file or standard input you choose. | 8 | `cli-inputs`. |
| Writes one self-contained HTML review copy. | 6 | `portable-html`. |
| MIT licensed. | 2 | `mit-license`. |
| No account or purchase. | 4 | `site-log-privacy`, `mit-license`. |
| Install from the source repository with stable Rust and Cargo. | 10 | `install-cli`. |
| Copy install command | 3 | Action label. |
| Install command copied. | 3 | Action feedback. |
| Install command selected. Copy it with your browser command. | 9 | Clipboard fallback. |
| Read the source on GitHub (opens in a new tab) | 10 | `install-cli`; external destination named. |
| A print-style view of the generated review copy. | 8 | Image caption. |
| Search and export the review copy | 6 | Section heading. |
| Recorded from the packaged `log-incident-bundle --demo` command. | 6 | `terminal-recording`. |
| Read the terminal transcript | 4 | Disclosure label. |
| Open the working sample review | 5 | Demo action. |
| Make an incident review copy | 5 | Section heading. |
| Choose the time window. | 4 | `bounds-correlation`. |
| Read a file or standard input. | 6 | `cli-inputs`. |
| Follow a request or trace. | 5 | `bounds-correlation`. |
| Pull matching records into the excerpt. | 6 | `bounds-correlation`. |
| Check redactions and share. | 4 | Task step. |
| Send one searchable HTML file. | 5 | `portable-html`. |
| Use it for a finite review | 6 | Section heading. |
| The CLI creates a review copy. | 6 | `finite-review`. |
| It is not a live log service. | 7 | `finite-review`. |
| Redaction is pattern-based. | 3 | Limitation. |
| Review the final file before sharing it. | 7 | Safety instruction. |
| Bounded log excerpts for incident review. | 6 | Footer description. |

### Navigation, route, and demo labels

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Skip-link label. |
| LOG / INCIDENT BUNDLE | 4 | Product wordmark. |
| Demo | 1 | Navigation label. |
| Install | 1 | Navigation label. |
| How it works | 3 | Navigation label. |
| Privacy | 1 | Navigation and footer label. |
| Terms | 1 | Footer label. |
| Loaded Log Incident Bundle — Create a redacted log excerpt | 10 | Route announcement. |
| GET THE CLI | 3 | Install section label. |
| RECIPIENT VIEW · SAMPLE | 3 | Preview label. |
| THREE STEPS | 2 | Process label. |
| Demo — sample data, nothing is saved | 7 | `local-processing`. |
| Reset demo | 2 | Demo action. |
| Start for real | 3 | `install-cli` demo exit. |
| CHECKOUT TIMEOUT · 22 AUG 2026 · SAMPLE | 6 | Sample label. |
| Did the retry cause duplicate charges? | 6 | Demo heading. |
| Search the six redacted sample records. | 6 | `demo-search`. |
| Search records | 2 | Search label. |
| Download CSV | 2 | `csv-download`. |
| Sample markers show email and bearer-token redaction. | 6 | `demo-redaction-preview`. |
| The generated review lists each redaction rule. | 7 | `redaction-rule-provenance`. |
| Six correlated records from payment-api.log | 5 | Sample table caption. |
| What the records show | 4 | Demo conclusion heading. |
| The sample ledger record confirms one charge after the retry. | 10 | `demo-conclusion`. |
| The sample payment response reports `duplicate_charge=false`. | 6 | `demo-conclusion`. |
| Built by Param Factory · v0.1.3 | 6 | Required attribution. |

## README

| Copy | Words | Result |
| --- | ---: | --- |
| Create a bounded, redacted incident log review copy for a teammate. | 11 | Purpose. |
| It is for small teams that need an answer from production logs without giving someone broad production-log access. | 18 | Audience and outcome. |
| The CLI reads a chosen file or standard input and writes one self-contained HTML review copy. | 16 | `cli-inputs`, `portable-html`. |
| Try the sample review | 4 | Link label. |
| Build from a checkout with stable Rust. | 7 | Install instruction. |
| Or build without installing. | 4 | Install instruction. |
| Choose a time range, follow matching trace records, and name the output file. | 13 | `bounds-correlation`. |
| Open `checkout-review.html` in a browser. | 5 | Usage instruction. |
| The recipient can search records and download a CSV without needing the source logs. | 14 | `portable-html`. |
| The CLI never overwrites an existing output file. | 8 | `output-safety`. |
| It also rejects an output path that resolves to an input file. | 12 | `output-safety`. |
| Choose a new `--output` path if either check fails. | 9 | Recovery instruction. |
| Use standard input when a file is not needed. | 9 | `cli-inputs`. |
| The CLI reads RFC 3339 timestamps, such as `2026-08-22T14:01:00Z`, at the start of each line. | 15 | Exact accepted format; `bounds-correlation`. |
| `--from` and `--to` include records in that time window. | 9 | `bounds-correlation`. |
| Each `--correlate FIELD` finds values for that field inside the window, then adds other matching records. | 16 | `bounds-correlation`. |
| The default rules replace email addresses, bearer tokens, and common secret fields. | 12 | `default-redaction`. |
| This includes OAuth tokens, authorization, credentials, sessions, cookies, private keys, and AWS access-key IDs beginning with `AKIA` or `ASIA`. | 19 | `default-redaction`. |
| For unquoted secret fields, it removes the rest of that line. | 11 | `default-redaction`. |
| It also removes complete PEM private-key blocks across multiple lines. | 10 | `default-redaction`. |
| Add reviewable local rules with a plain text file. | 9 | `custom-redaction`. |
| Redaction is pattern-based and not a guarantee. | 7 | Limitation. |
| Inspect the finished review copy before sharing it. | 8 | Safety instruction. |
| Run the shipped example without providing a file. | 8 | Demo instruction. |
| It creates a private, unique temporary directory and prints the path to a review copy built from `examples/payment-api.log`. | 18 | `demo-cli`. |
| The browser version is at `/?demo=1` or `/demo`. | 8 | Demo route. |
| It uses six fixed sample records in memory and writes no demo data to browser storage. | 16 | `local-processing`. |
| The deployment config adds security headers, route rewrites, a 404 page, and cache rules for hashed assets. | 16 | `delivery-policy`. |
| The landing page includes a self-hosted terminal recording from the packaged `--demo` command. | 13 | `terminal-recording`. |
| Refresh it after changing the demo with. | 7 | Maintenance instruction. |
| `npm test` runs the local CLI tests, browser checks, and concurrent test-server lifecycle regression. | 14 | Verification instruction. |
| Each browser-test process owns a temporary build and an ephemeral local port. | 12 | Maintainer detail. |
| Site pages load runtime files only from the product website. | 10 | `site-runtime`. |
| To prepare the Rust crate for publishing, run. | 8 | Publishing instruction. |
| Do not publish from this repository. | 6 | Publishing constraint. |
| The factory owns registry credentials. | 5 | Publishing explanation. |
| The factory deploys the static companion site from `dist/site`. | 9 | `delivery-policy`. |
| Run `npm run build:site` to create it. | 7 | Deployment instruction. |
| Push an approved commit to `main` for the factory deployment. | 10 | Deployment instruction. |
| The CLI creates a finite review copy. | 7 | `finite-review`. |
| It is not a live log service. | 7 | `finite-review`. |
| The CLI and companion site are available under the MIT License. | 11 | `mit-license`. |
| There is no paid tier or purchase flow. | 8 | `mit-license`. |

Commands, headings, and literal rule examples are intentional labels or input,
not sentences. Every visitor-facing README sentence appears in this table.

The README heading **What the CLI does not do** names the finite-review limit
out of context. It replaces the vague heading **Scope**.

| Concept | One term |
| --- | --- |
| Portable output | review copy |
| Input material | logs |
| Sensitive-text replacement | redaction |
| Joined records | excerpt |
| Sample environment | demo |
| Time format | RFC 3339 timestamp |

Catalog description: **Create a redacted incident review from logs.** (7 words)
