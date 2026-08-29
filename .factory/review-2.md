# Adversarial first-read review 2 — FAIL

**Reviewed:** 2026-08-29 UTC

**Live URL:** https://log-incident-bundle.sociobot.in

**Repository candidate:** `a28faa12129d8d671061a07034723f27344f7958`

## Verdict

**FAIL.** The cold first screen is clear, the browser and CLI demos work, and
all 15 declared claim tests pass from a clean clone. However, the live site
provides no path to install or obtain the actual CLI. The demo's required
**Start for real** action only returns to the same landing page. The claims
registry also omits two published claim locations, reopening an earlier
claims-completeness finding. One README term remains unnecessarily vague. A
PASS requires zero findings.

## Findings

### F-2-1 — BLOCKING — “Start for real” leads to no real-use path

**Exact quote/location:** live `/?demo=1`, demo banner: **“Start for real”**.
In `src/site.ts`, that link targets `/`. The resulting landing page contains
no install command, download, package link, repository link, or install
section. Its only links are Demo, How it works, Privacy, Terms, and two routes
back into the sample.

**Observed result:** clicking **Start for real** changed the URL to `/`, removed
the demo banner, and showed **“Create a redacted log excerpt.”** Searching the
page for `install`, `cargo install`, or `clone` returned nothing. There are no
external links.

**Why this blocks a first-time visitor:** the sample proves the output, but the
visitor cannot obtain the CLI or begin the real job from the product site. The
action names a transition that does not happen.

**Concrete fix:** add an **Install the CLI** secondary action on the first
screen and a real `/#install` section with a copyable command that works from a
clean machine, plus a source/release link. Point **Start for real** to that
section. Add a browser test that follows both actions and confirms an install
command and usable destination are visible.

### F-2-2 — BLOCKING — Published claim locations are still incomplete

**Reopened earlier finding:** `verification-1 / verification-3 — unlisted
published claims` (listed as fixed in `.factory/polish-1.md`).

**Exact quotes/locations:** landing hero and facts:

- **“Create a redacted log excerpt”**
- **“See a redacted incident review first.”**
- **“No account or purchase.”**

The `default-redaction` entry lists only **“README redaction section”** in
`where`, despite the first two landing claims. The `site-log-privacy` entry
lists only **“privacy page”**, despite the landing's no-account claim.

**Why this blocks verification:** the behaviors do have passing tests, but the
registry does not identify every published location. A reviewer following
`claims.json` cannot find the landing promises from their declared entries.
This is the same claims-completeness class previously reported, so the history
rule makes the recurrence blocking.

**Concrete fix:** add `landing hero` and `landing action` to
`default-redaction.where`, and add `landing facts` to
`site-log-privacy.where`. Expand the no-account test to assert that the home
page has no sign-in, registration, or account affordance, not only no form or
file input.

### F-2-3 — MINOR — “ISO-like timestamps” is vague and inconsistent

**Exact quote/location:** README, Make a review copy: **“The CLI recognizes
ISO-like timestamps at the start of a line.”**

**Why this matters:** “ISO-like” does not name an accepted format. The CLI help
and `bounds-correlation` claim use the precise term **RFC 3339**, so the README
uses two terms for the same requirement.

**Concrete rewrite:** “The CLI reads RFC 3339 timestamps, such as
`2026-08-22T14:01:00Z`, at the start of each line.”

## Cold first read

Fresh Chromium contexts opened `/` at 390 × 844 and 1280 × 900. Nothing was
scrolled before recording the first viewport.

| Question | First-read answer |
| --- | --- |
| What does it do? | It creates a redacted excerpt from logs and writes an HTML review copy. |
| For whom? | Teams that need an incident answer without granting raw production-log access. |
| What should I click first? | **Try it with sample data**, which says it shows a redacted incident review. |

The exact first-screen text that supplied those answers was **“Create a
redacted log excerpt,” “For teams who need answers without granting raw
production-log access,”** and **“Try it with sample data — See a redacted
incident review first.”** The mobile first viewport also showed the three
plain facts. There is no cold-first-screen finding.

## Copy audit

Counts use whitespace-separated words; words inside inline commands count
separately. Shell blocks and the literal terminal transcript are executable
input/output rather than sentences and are excluded. Headings, labels, links,
buttons, alternate text, and the route announcement are included so their
clarity can also be checked.

### Landing page

| Copy unit | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Pass: result-naming navigation. |
| LOG / INCIDENT BUNDLE | 4 | Pass: product wordmark. |
| Demo | 1 | Pass: clear navigation label. |
| How it works | 3 | Pass: contextual heading/navigation label. |
| Privacy | 1 | Pass. |
| Loaded Log Incident Bundle — Create a redacted log excerpt | 10 | Pass: useful route announcement. |
| A LOCAL CLI FOR INCIDENT REVIEW | 6 | Pass: names the product type and use. |
| Create a redacted log excerpt | 5 | Claims-location defect: F-2-2. |
| For teams who need answers without granting raw production-log access. | 10 | Pass. |
| Try it with sample data | 5 | Pass: verb names the result. |
| See a redacted incident review first. | 6 | Claims-location defect: F-2-2. |
| Reads a file or standard input you choose. | 8 | Pass: `cli-inputs`. |
| Writes one self-contained HTML review copy. | 6 | Pass: `portable-html`. |
| MIT licensed. | 2 | Pass: `mit-license`. |
| No account or purchase. | 4 | Claims-location defect for “No account”: F-2-2; purchase is covered by `mit-license`. |
| A halftone server rack behind a clipped incident sheet. | 9 | Pass: useful image alternative. |
| A print-style view of the generated review copy. | 8 | Pass: useful caption. |
| RECIPIENT VIEW · SAMPLE | 4 | Pass: identifies the preview. |
| Search and export the review copy | 6 | Pass: section heading names the capability. |
| Terminal recording of the packaged Log Incident Bundle demo creating a six-record review in a private temporary folder. | 18 | Pass: `terminal-recording` and `demo-cli`. |
| Recorded from the packaged `log-incident-bundle --demo` command. | 7 | Pass: `terminal-recording`. |
| Read the terminal transcript | 4 | Pass: result-naming disclosure control. |
| Open the working sample review | 5 | Pass: result-naming action. |
| THREE STEPS | 2 | Pass: useful process label. |
| Make an incident review copy | 5 | Pass: contextual section heading. |
| Choose the time window. | 4 | Pass: `bounds-correlation`. |
| Read a file or standard input. | 6 | Pass: `cli-inputs`. |
| Follow a request or trace. | 5 | Pass: `bounds-correlation`. |
| Pull matching records into the excerpt. | 6 | Pass: `bounds-correlation`. |
| Check redactions and share. | 4 | Pass. |
| Send one searchable HTML file. | 5 | Pass: `portable-html`. |
| Use it for a finite review | 6 | Pass: contextual scope heading. |
| The CLI creates a review copy. | 6 | Pass: `finite-review`. |
| It is not a live log service. | 7 | Pass: `finite-review`. |
| Redaction is pattern-based. | 3 | Pass: useful limitation. |
| Review the final file before sharing it. | 7 | Pass: concrete safety instruction. |
| Bounded log excerpts for incident review. | 6 | Pass: useful footer description. |
| Privacy | 1 | Pass. |
| Terms | 1 | Pass. |
| Built by Param Factory · v0.1.3 | 6 | Pass: attribution and version. |

No landing copy exceeds 22 words or uses a banned marketing adjective. Every
heading names its section. The landing actions use result-naming verbs.

### README

| Copy unit | Words | Result |
| --- | ---: | --- |
| Log Incident Bundle | 3 | Pass: product name. |
| Create a bounded, redacted incident log review copy for a teammate. | 11 | Pass. |
| It is for small teams that need an answer from production logs without giving someone broad production-log access. | 18 | Pass. |
| The CLI reads a chosen file or standard input and writes one self-contained HTML review copy. | 16 | Pass: `cli-inputs`, `portable-html`. |
| Try the sample review | 4 | Pass: result-naming link. |
| Privacy | 1 | Pass. |
| Terms | 1 | Pass. |
| Install | 1 | Pass: contextual heading. |
| Build from a checkout with stable Rust: | 7 | Pass: direct setup instruction. |
| Or build without installing: | 4 | Pass: direct setup instruction. |
| Make a review copy | 4 | Pass: contextual heading. |
| Choose a time range, follow matching trace records, and name the output file. | 13 | Pass: `bounds-correlation`. |
| Open `checkout-review.html` in a browser. | 5 | Pass. |
| The recipient can search records and download a CSV without needing the source logs. | 14 | Pass: `portable-html`. |
| The CLI never overwrites an existing output file. | 8 | Pass: `output-safety`. |
| It also rejects an output path that resolves to an input file. | 12 | Pass: `output-safety`. |
| Choose a new `--output` path if either check fails. | 9 | Pass: recovery instruction. |
| Use standard input when a file is not needed: | 9 | Pass: `cli-inputs`. |
| The CLI recognizes ISO-like timestamps at the start of a line. | 11 | Flag: F-2-3. |
| `--from` and `--to` include records in that time window. | 9 | Pass: `bounds-correlation`. |
| Each `--correlate FIELD` finds values for that field inside the window, then adds other matching records. | 16 | Pass: `bounds-correlation`. |
| Redaction | 1 | Pass: contextual heading. |
| The default rules replace email addresses, bearer tokens, and common secret fields. | 12 | Pass: `default-redaction`. |
| This includes OAuth tokens, authorization, credentials, sessions, cookies, private keys, and AWS access-key IDs beginning with `AKIA` or `ASIA`. | 19 | Pass: `default-redaction`. |
| For unquoted secret fields, it removes the rest of that line. | 11 | Pass: `default-redaction`. |
| It also removes complete PEM private-key blocks across multiple lines. | 10 | Pass: `default-redaction`. |
| Add reviewable local rules with a plain text file: | 9 | Pass: `custom-redaction`. |
| Redaction is pattern-based and not a guarantee. | 7 | Pass: useful limitation. |
| Inspect the finished review copy before sharing it. | 8 | Pass: concrete safety instruction. |
| Demo | 1 | Pass: contextual heading. |
| Run the shipped example without providing a file: | 8 | Pass: `demo-cli`. |
| It creates a private, unique temporary directory and prints the path to a review copy built from `examples/payment-api.log`. | 18 | Pass: `demo-cli`. |
| The browser version is at `/?demo=1` or `/demo`. | 8 | Pass: direct routes verified. |
| It uses six fixed sample records in memory and writes no demo data to browser storage. | 16 | Pass: `local-processing`. |
| The landing page includes a self-hosted terminal recording from the packaged `--demo` command. | 13 | Pass: `terminal-recording`. |
| Refresh it after changing the demo with: | 7 | Pass: direct maintenance instruction. |
| Develop and verify | 3 | Pass: contextual heading. |
| `npm test` runs the local CLI tests, browser checks, and concurrent test-server lifecycle regression. | 14 | Pass: verified directly. |
| Each browser-test process owns a temporary build and an ephemeral local port. | 12 | Pass: relevant maintainer detail. |
| Site pages load runtime files only from the product website. | 10 | Pass: `site-runtime`. |
| To prepare the Rust crate for publishing, run: | 8 | Pass: direct maintenance instruction. |
| Do not publish from this repository. | 6 | Pass: concrete constraint. |
| The factory owns registry credentials. | 5 | Pass: explains the constraint. |
| Deploy | 1 | Pass: contextual heading. |
| The factory deploys the static companion site from `dist/site`. | 9 | Pass: `delivery-policy`. |
| Run `npm run build:site` to create it. | 7 | Pass: direct build instruction. |
| The deployment config adds security headers, route rewrites, a 404 page, and cache rules for hashed assets. | 17 | Pass: `delivery-policy`. |
| Push an approved commit to `main` for the factory deployment. | 10 | Pass: direct workflow instruction. |
| Scope | 1 | Pass: contextual heading. |
| The CLI creates a finite review copy. | 7 | Pass: `finite-review`. |
| It is not a live log service. | 7 | Pass: `finite-review`. |
| License | 1 | Pass: contextual heading. |
| The CLI and companion site are available under the MIT License. | 11 | Pass: `mit-license`. |
| There is no paid tier or purchase flow. | 8 | Pass: `mit-license`. |

No README unit exceeds 22 words or uses a banned marketing adjective. Apart
from F-2-3, technical terms are either standard for the CLI's developer
audience or explained by an adjacent command. Output terminology is
consistent: **logs** are inputs, **records** are parsed entries, an **excerpt**
is the selected set, and a **review copy** is the HTML output.

## Demo and sandbox behavior

- The landing action reaches `/?demo=1` in one click. The first 390 px screen
  already shows the demo banner, incident question, search, CSV action,
  redaction note, six-record caption, and sample rows.
- The sample contains a checkout, bearer-token redaction, timeout, retry,
  ledger charge, and final `duplicate_charge=false` response. It is realistic,
  not placeholder text.
- Searching `ledger` reduced the table to one record. **Reset demo** cleared
  the search and restored all six records.
- The banner remains visible and reads **“Demo — sample data, nothing is
  saved.”** It contains **Reset demo** and **Start for real**. The latter fails
  the real-use handoff as F-2-1.
- A seeded non-demo `real:user-note` localStorage key remained byte-for-byte
  unchanged through entry, reset, and exit. The demo added no localStorage or
  sessionStorage entries and created no IndexedDB database, OPFS entry, or
  service worker.
- The landing-to-demo flow issued only same-origin GET requests and produced
  no console or page errors.
- In a clean clone, `cargo run --locked -- --demo --json` created a six-record
  `review.html` below a new mode-0700 temporary directory. The generated file
  opened from `file:` without external requests.

There is no browser-offline claim. The portable HTML artifact's offline
behavior is covered by `portable-html` and was exercised from `file:`.

## Claims verification

The repository was cloned to a new temporary directory, followed by `npm ci`.
Every exact `test` command in `.factory/claims.json` ran separately:

| Claim ID | Exact command | Result |
| --- | --- | --- |
| `portable-html` | `npm test -- --grep @claim:portable-html` | PASS |
| `default-redaction` | `npm test -- --grep @claim:default-redaction` | PASS |
| `output-safety` | `npm test -- --grep @claim:output-safety` | PASS |
| `cli-inputs` | `npm test -- --grep @claim:cli-inputs` | PASS |
| `bounds-correlation` | `npm test -- --grep @claim:bounds-correlation` | PASS |
| `custom-redaction` | `npm test -- --grep @claim:custom-redaction` | PASS |
| `local-processing` | `npm test -- --grep @claim:local-processing` | PASS |
| `site-runtime` | `npm test -- --grep @claim:site-runtime` | PASS |
| `site-log-privacy` | `npm test -- --grep @claim:site-log-privacy` | PASS |
| `csv-download` | `npm test -- --grep @claim:csv-download` | PASS |
| `demo-cli` | `npm test -- --grep @claim:demo-cli` | PASS |
| `terminal-recording` | `npm test -- --grep @claim:terminal-recording` | PASS |
| `finite-review` | `npm test -- --grep @claim:finite-review` | PASS |
| `mit-license` | `npm test -- --grep @claim:mit-license` | PASS |
| `delivery-policy` | `npm test -- --grep @claim:delivery-policy` | PASS |

No declared claim is untested or failing. The current product promises map to
these tested behaviors, but the two inaccurate `where` fields are the
registry defect in F-2-2.

## Earlier-finding recheck

The deployed HTML, JS, CSS, standalone 404, and terminal recording match the
fresh local build byte-for-byte. This ties the live observations below to the
reviewed code rather than to report assertions.

| Earlier finding | Live and code confirmation |
| --- | --- |
| F-1-1 — initial load skipped the skip link | Fixed. Fresh `/` + Tab focuses **Skip to content**. `route()` defaults `moveFocus` to false; in-app and popstate navigation pass `true`. |
| F-1-2 — incomplete HTTP 404 shell | Fixed. `/missing` returns HTTP 404 with skip link, header, footer, legal links, title, description, canonical, OG image, and favicon. `public/404.html` contains the same shell. |
| F-1-3 — landing-preview claim location omitted | Fixed. `demo-cli.where` includes `landing preview`; its exact test passes. |
| F-1-4 — 26-word README deployment sentence | Fixed. The replacement sentences are 7 and 17 words under this audit's counting rule. |
| verification.md/1/2 — malformed generated rows, search, CSV, provenance | Fixed. `portable-html` opens the generated file, asserts six rows, search, CSV, SHA-256 provenance, and no errors. |
| verification.md/1/2 — script-boundary XSS | Fixed. The full suite keeps the hostile script boundary inert in source and rendered output. |
| verification.md/1 — quoted JSON secret fields | Fixed. `default-redaction` checks the raw HTML and browser view. |
| verification-3 — ASIA/AWS and token redaction | Fixed. `default-redaction` covers AKIA, ASIA, token, and named JSON fields. |
| verification.md/1/2 — invalid/inverted bounds | Fixed. Full-suite negative cases fail before output is created. |
| verification.md/1/2 — seven-record CLI demo | Fixed. Clean-clone CLI demo and `demo-cli` return six records and omit the health check. |
| verification.md/1/2 — demo reset/exit isolation | Fixed for isolation. Reset restores six rows and both reset and exit clear only the demo marker. F-2-1 is a separate destination defect. |
| verification.md/1/2 — mobile touch targets | Fixed. Live 390 px checks pass for header, banner, download, footer, and sample actions. |
| verification-3 — generated-artifact mobile overflow | Fixed. The full suite reports a 390 px viewport and 390 px document width. |
| verification-1 — route focus | Fixed. In-app Privacy navigation and back navigation focus the destination h1; the initial page does not. |
| verification-1 — returned paid-license behavior | Fixed. No checkout, license storage, paid tier, or purchase flow exists. |
| verification-1 — dependency audit | Fixed. `npm ci` reports zero vulnerabilities. |
| verification.md/1/2 — immutable-cache policy | Fixed. The live hashed JS returns `Cache-Control: public, max-age=31536000, immutable`; the policy test passes. |
| verification-1/2 — real 404 and OG art | Fixed. The live missing route is a real 404 and the product-specific 1200×630 OG asset resolves. |
| verification-3 — framing protection | Fixed. Live headers include CSP `frame-ancestors 'none'` and `X-Frame-Options: DENY`. |
| verification-3 — missing URL verifier | Fixed. `./verify-url.sh` passes five routes at both 1280 px and 390 px. |
| verification-1 / verification.md — rustfmt and Clippy | Fixed. `cargo fmt --check` and strict Clippy both pass. |
| verification-1/3 — unlisted published claims | **Half-fixed/reopened as F-2-2:** tests exist, but two landing locations remain absent from the registry. |
| verification-4 — candidate/deployment identity | Fixed. Fresh-build and live hashes match for HTML, JS, CSS, 404, and terminal recording. |

## Structure, accessibility, and links

- `/`, `/demo`, `/privacy`, and `/terms` return 200. Each has `lang=en`, one
  h1, one main, a route-specific title, description, canonical, OG title,
  description and product image, Twitter large-card metadata, SVG favicon,
  apple-touch icon, and the shared header/footer.
- `/missing` returns HTTP 404 with the designed incident-printout shell and a
  working route home.
- The live crawl found no dead links. `robots.txt`, `sitemap.xml`, favicons,
  and OG art return 200. The sitemap lists all four public routes.
- Fresh-load Tab order starts at the skip link. In-app navigation and browser
  back focus the new h1. Deep links and the `#how` anchor work.
- Axe WCAG 2 A/AA checks found zero violations on home, demo, privacy, terms,
  and the HTTP 404. The full tests also pass keyboard, focus contrast, 44 px
  touch targets, mobile overflow, and console-error checks.
- The initial JavaScript is 4.08 KB gzip. The stylesheet is 2.54 KB gzip.
  Motion is confined to a 180 ms settling animation inside
  `prefers-reduced-motion: no-preference`.
- The warm paper, halftone server-room art, serif/mono pairing, stamped
  controls, offset rules, and dark evidence table implement `design.md` and
  are visually distinct from a generic centered SaaS/card template.

## Missed leverage

No AI step is justified. Selection, correlation, redaction, and a finite
shareable artifact are deterministic tasks, and sending incident logs to a
model would weaken the local-first privacy boundary. File/stdin import and CSV
export cover the obvious exchange paths. Sync would conflict with the finite,
no-account scope. The missing install/adoption path is the practical leverage
gap and is already blocking as F-2-1.

## Verification summary

| Check | Result |
| --- | --- |
| 15 exact clean-clone claim commands | PASS, 15/15 |
| `npm test` | PASS, 6 Rust + 33 Playwright + 3 lifecycle processes |
| `PLAYWRIGHT_BASE_URL=https://log-incident-bundle.sociobot.in npm test` | PASS, 6 Rust + 33 live Playwright |
| `npm run build` | PASS, `dist/site` created |
| `npm run typecheck` / `npm run lint` | PASS / PASS |
| `cargo package --locked` | PASS, 15.9 KiB crate |
| `cargo fmt --check` | PASS |
| `cargo clippy --all-targets --all-features --locked -- -D warnings` | PASS |
| `./verify-url.sh https://log-incident-bundle.sociobot.in` | PASS, 10/10 route/viewport checks |
| Live route crawl and auxiliary assets | PASS, no dead link |
| Axe WCAG 2 A/AA on five live routes | PASS, zero violations |

## What would make this perfect

1. Provide an install/source path on the live site and make **Start for real**
   lead to it.
2. Record every landing claim location in `claims.json` and strengthen the
   no-account assertion.
3. Replace “ISO-like timestamps” with the exact RFC 3339 format and example.
4. Re-run the complete review and reach zero findings.
