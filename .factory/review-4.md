# Adversarial first-read review 4 — PASS

**Reviewed:** 2026-08-29 UTC
**Live URL:** <https://log-incident-bundle.sociobot.in>
**Repository candidate:** `dc1a96a99499992dc3bf826c34bd8960f7164a98` (fresh clean clone)

## Verdict

**PASS.** This review found zero findings. The live first screen is clear at 390 px and desktop, the one-click demo is immediate and isolated, every registered claim command passes from a clean clone, and earlier findings remain fixed in the deployed site and source.

## Cold first read

Fresh Chromium contexts opened `/` at 390 × 844 and 1280 × 800 without scrolling.

| Question | First-read answer | Exact supporting text |
| --- | --- | --- |
| What does this do? | It creates a redacted log excerpt / HTML review copy. | “Create a redacted log excerpt” and “Writes one self-contained HTML review copy.” |
| For whom? | Teams investigating an incident without handing over raw production logs. | “For teams who need answers without granting raw production-log access.” |
| What should I click first? | Try the sample review. | “Try it with sample data” beside “See a redacted incident review first.” |

At 390 px, the first viewport also shows the input, output, licence, and no-account facts. The warm paper, halftone evidence sheet, stamped controls, and serif/mono typography are distinct to this incident-review product rather than a generic SaaS layout.

## Copy audit

Counts use whitespace-separated words. Commands, literal terminal output, and example log data are executable input or output rather than prose. All sentences are at or below 22 words. No banned marketing adjective, vague mood heading, inconsistent product term, or non-result-naming action was found.

### Landing-page sentences

| Text | Words | Check |
| --- | ---: | --- |
| For teams who need answers without granting raw production-log access. | 10 | Clear audience and change. |
| See a redacted incident review first. | 6 | States the result of the primary action. |
| Reads a file or standard input you choose. | 8 | `cli-inputs`. |
| Writes one self-contained HTML review copy. | 6 | `portable-html`. |
| MIT licensed. | 2 | `mit-license`. |
| No account or purchase. | 4 | `site-log-privacy`, `mit-license`. |
| A halftone server rack behind a clipped incident sheet. | 9 | Useful image alternative. |
| A print-style view of the generated review copy. | 8 | Useful caption. |
| Install from the source repository with stable Rust and Cargo. | 10 | `install-cli`. |
| Terminal recording of the packaged Log Incident Bundle demo creating a six-record review in a private temporary folder. | 18 | `terminal-recording`, `demo-cli`. |
| Recorded from the packaged `log-incident-bundle --demo` command. | 7 | `terminal-recording`. |
| Choose the time window. | 4 | Clear step. |
| Read a file or standard input. | 6 | `cli-inputs`. |
| Follow a request or trace. | 5 | Clear step. |
| Pull matching records into the excerpt. | 6 | `bounds-correlation`. |
| Check redactions and share. | 4 | Clear step. |
| Send one searchable HTML file. | 5 | `portable-html`. |
| The CLI creates a review copy. | 6 | `finite-review`. |
| It is not a live log service. | 7 | `finite-review`. |
| Redaction is pattern-based. | 3 | Plain limitation, supported by rule claims. |
| Review the final file before sharing it. | 7 | Concrete safety instruction. |
| Bounded log excerpts for incident review. | 6 | Clear footer description. |

### Landing headings, labels, and actions

| Text | Words | Check |
| --- | ---: | --- |
| Create a redacted log excerpt | 5 | Plain, job-focused h1. |
| A LOCAL CLI FOR INCIDENT REVIEW | 5 | Names product type and use. |
| Try it with sample data | 5 | Primary result-naming action. |
| Install the CLI | 3 | Result-naming action and section heading. |
| Copy install command | 3 | Result-naming button. |
| Read the source on GitHub (opens in a new tab) | 10 | Destination and behaviour named. |
| Search and export the review copy | 6 | Clear section heading. |
| Read the terminal transcript | 4 | Result-naming disclosure. |
| Open the working sample review | 5 | Result-naming action. |
| Make an incident review copy | 5 | Clear section heading. |
| Use it for a finite review | 6 | Clear limitation heading. |
| Demo, Install, How it works, Privacy, Terms | 1–3 | Clear navigation labels. |

Dynamic landing status labels are also plain and short: **“Loaded Log Incident Bundle — Create a redacted log excerpt”** (10 words), **“Install command copied.”** (3), **“Install command selected.”** (3), and **“Copy it with your browser command.”** (6). The section labels **GET THE CLI**, **RECIPIENT VIEW · SAMPLE**, and **THREE STEPS** name their content or process length. No flag applies.

### README sentences

| Text | Words | Check |
| --- | ---: | --- |
| Create a bounded, redacted incident log review copy for a teammate. | 11 | Clear purpose. |
| It is for small teams that need an answer from production logs without giving someone broad production-log access. | 18 | Clear audience and situation. |
| The CLI reads a chosen file or standard input and writes one self-contained HTML review copy. | 16 | `cli-inputs`, `portable-html`. |
| Build from a checkout with stable Rust. | 7 | Clear installation instruction. |
| Or build without installing. | 4 | Clear alternative. |
| Choose a time range, follow matching trace records, and name the output file. | 13 | `bounds-correlation`. |
| Open `checkout-review.html` in a browser. | 5 | Clear next step. |
| The recipient can search records and download a CSV without needing the source logs. | 14 | `portable-html`. |
| The CLI never overwrites an existing output file. | 8 | `output-safety`. |
| It also rejects an output path that resolves to an input file. | 12 | `output-safety`. |
| Choose a new `--output` path if either check fails. | 9 | Concrete recovery. |
| Use standard input when a file is not needed. | 9 | `cli-inputs`. |
| The CLI reads RFC 3339 timestamps, such as `2026-08-22T14:01:00Z`, at the start of each line. | 15 | Exact accepted format. |
| `--from` and `--to` include records in that time window. | 9 | `bounds-correlation`. |
| Each `--correlate FIELD` finds values for that field inside the window, then adds other matching records. | 16 | `bounds-correlation`. |
| The default rules replace email addresses, bearer tokens, and common secret fields. | 12 | `default-redaction`. |
| This includes OAuth tokens, authorization, credentials, sessions, cookies, private keys, and AWS access-key IDs beginning with `AKIA` or `ASIA`. | 19 | `default-redaction`. |
| For unquoted secret fields, it removes the rest of that line. | 11 | `default-redaction`. |
| It also removes complete PEM private-key blocks across multiple lines. | 10 | `default-redaction`. |
| Add reviewable local rules with a plain text file. | 9 | `custom-redaction`. |
| Redaction is pattern-based and not a guarantee. | 7 | Necessary limitation. |
| Inspect the finished review copy before sharing it. | 8 | Concrete safety instruction. |
| Run the shipped example without providing a file. | 8 | `demo-cli`. |
| It creates a private, unique temporary directory and prints the path to a review copy built from `examples/payment-api.log`. | 18 | `demo-cli`. |
| The browser version is at `/?demo=1` or `/demo`. | 8 | Direct demo entry. |
| It uses six fixed sample records in memory and writes no demo data to browser storage. | 16 | `local-processing`. |
| The landing page includes a self-hosted terminal recording from the packaged `--demo` command. | 13 | `terminal-recording`. |
| Refresh it after changing the demo with: | 7 | Clear maintenance instruction. |
| `npm test` runs the local CLI tests, browser checks, and concurrent test-server lifecycle regression. | 14 | Confirmed in this review. |
| Each browser-test process owns a temporary build and an ephemeral local port. | 12 | Confirmed in this review. |
| Site pages load runtime files only from the product website. | 10 | `site-runtime`. |
| To prepare the Rust crate for publishing, run: | 8 | Clear maintainer instruction. |
| Do not publish from this repository. | 6 | Clear publishing constraint. |
| The factory owns registry credentials. | 5 | Explains the constraint. |
| The factory deploys the static companion site from `dist/site`. | 9 | `delivery-policy`. |
| Run `npm run build:site` to create it. | 7 | Clear deployment instruction. |
| The deployment config adds security headers, route rewrites, a 404 page, and cache rules for hashed assets. | 17 | `delivery-policy`. |
| Push an approved commit to `main` for the factory deployment. | 10 | Clear workflow instruction. |
| The CLI creates a finite review copy. | 7 | `finite-review`. |
| It is not a live log service. | 7 | `finite-review`. |
| The CLI and companion site are available under the MIT License. | 11 | `mit-license`. |
| There is no paid tier or purchase flow. | 8 | `mit-license`. |

README headings — **Install**, **Make a review copy**, **Redaction**, **Demo**, **Develop and verify**, **Deploy**, **What the CLI does not do**, and **License** — each name their section. Technical terms are appropriate to a CLI audience and are accompanied by an example or command. No claim-like landing or README sentence lacks a matching claim entry, documented limitation, or direct local verification instruction.

## Demo and sandbox

- The first-screen action opens `/?demo=1` in one click. At 390 px, the first demo viewport already shows the sample question, banner, search, CSV action, redaction note, table caption, and two realistic redacted log records.
- The persistent banner reads **“Demo — sample data, nothing is saved”** and contains **Reset demo** and **Start for real**. Searching `ledger` reduced six records to one; Reset restored all six.
- A fresh-context request log recorded only same-origin GET requests. Fresh `localStorage` and `sessionStorage` were empty. The registered `local-processing` test also confirms empty IndexedDB and OPFS.
- A separately seeded `real:review4-sentinel` value remained `keep` after demo entry, search, reset, and **Start for real**. Demo actions did not add a demo key or alter the real sentinel.
- In a temporary directory, `cargo run -- --demo --json` produced a six-record `review.html` in a unique, mode-0700 directory.

## Claims and clean-clone verification

A fresh clone at `/tmp/log-incident-bundle-review-4-R8S035` ran `npm ci` without vulnerabilities. Each of the 20 exact `test` commands in `.factory/claims.json` was run independently; all passed. The full suite also passed: 8 Rust tests, 38 browser tests, and the concurrent test-server lifecycle regression.

| Claim IDs | Result |
| --- | --- |
| portable-html, default-redaction, output-safety, cli-inputs, bounds-correlation | PASS |
| custom-redaction, redaction-rule-provenance, local-processing, site-runtime, site-log-privacy | PASS |
| install-cli, csv-download, demo-search, demo-redaction-preview, demo-conclusion | PASS |
| demo-cli, terminal-recording, finite-review, mit-license, delivery-policy | PASS |

Also passed from that clean clone: `npm run build`, `npm run typecheck`, `cargo fmt --check`, strict Clippy, and release build. The production build is 11.42 kB JavaScript raw / 4.56 kB gzip.

## Earlier-finding recheck

Every earlier `review-*.md`, `polish-*.md`, and handoff was read. The following were rechecked against deployed behavior and current source.

| Earlier ID or group | Current confirmation |
| --- | --- |
| F-1-1 | Fresh `/` then Tab focuses **Skip to content**. In-app route changes focus the destination h1. |
| F-1-2 | `/missing` returns HTTP 404 with product shell, metadata, header, footer, legal links, and home action. |
| F-1-3 | `demo-cli.where` includes the landing preview; its exact test passes. |
| F-1-4 | README deployment copy is split; its longest sentence is 17 words. |
| F-2-1 | **Start for real** opens `/#install` with the locked install command and source link. |
| F-2-2 | Landing, demo, catalog, and README claim locations are registered; no published claim omission was found. |
| F-2-3 | README names RFC 3339 and supplies a concrete timestamp. |
| F-3-1 | The overflowing records region is focusable, named, axe-clean, and scrolls with ArrowRight at 721 px. |
| F-3-2 | `demo-search` registers and tests browser-demo filtering and restoration. |
| F-3-3 | `redaction-rule-provenance` registers and tests default plus local-rule labels. |
| F-3-4 | Reduced-motion mode computes `scroll-behavior: auto`. |
| F-3-5 | The demo heading is **What the records show**. |
| F-3-6 | The README heading is **What the CLI does not do**. |
| Prior redaction, output-safety, XSS, bounds, demo-isolation, mobile-overflow, cache/header, terminal-recording, and generated-review skip-link defects | Dedicated clean-clone claim and regression tests pass. |

## Structure, accessibility, links, and leverage

- The live verifier passed `/`, `/demo`, `/privacy`, `/terms`, and `/missing` at 1280 px and 390 px: route-specific titles, `lang=en`, one h1, one main, alt text, no serious/critical axe issue, and no overflow. The missing route is a real HTTP 404.
- Home, demo, privacy, and terms use title/description/canonical/OG/Twitter metadata and favicon. `robots.txt`, `sitemap.xml`, social image, icons, and all navigational links resolve. The self-referential skip anchor on the real 404 remains an in-page link on that 404 document.
- Deep links, back/forward navigation, heading focus, and live route announcements are covered by the browser suite. Header/footer and Privacy/Terms links are consistent on all routes.
- No missed AI feature is warranted. The core job is deterministic local selection, correlation, redaction, and finite export; sending incident logs to a model would weaken the privacy boundary. File/stdin import and self-contained HTML/CSV export cover the obvious adjacent needs. No provider key or decorative AI feature exists.

## What would make this perfect

No corrective product work is required by this review. Maintain the existing claim tests when copy or behavior changes, and repeat this full cold/live and clean-clone review before a future release.
