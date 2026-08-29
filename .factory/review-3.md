# Adversarial first-read review 3 — FAIL

**Reviewed:** 2026-08-29 UTC

**Live URL:** <https://log-incident-bundle.sociobot.in>

**Repository candidate:** `7f4f067d7dc4f77d8beeabf2c81bd846ba53cb5d`

## Verdict

**FAIL.** The first screen is clear, both demos work, and all 16 registered
claim tests pass from a clean clone. Six findings remain: one keyboard-access
defect, two unlisted demo claims, one reduced-motion defect, and two headings
that do not name their content. There are no reopened blocking findings, but a
PASS requires zero findings and no untested claim.

## Findings

### F-3-1 — HIGH — The demo records region cannot receive keyboard focus

**Exact location:** live `/demo`, `.table-wrap` around **“Six correlated
records from payment-api.log.”**

**Evidence:** standalone axe-core 4.10.3 reports
`scrollable-region-focusable` on `.table-wrap`. At 721 px the region has a
675 px client width and 720 px scroll width, but `tabIndex` is `-1`. From
**Download CSV**, Tab moves directly to the footer. A keyboard user cannot
focus the region to reach columns that overflow at tablet widths.

**Why this matters:** the incident records are the product being demonstrated.
A keyboard visitor must be able to inspect all of them.

**Concrete fix:** make the region keyboard-focusable with `tabindex="0"`, give
it an accessible name such as `aria-label="Incident records; scroll
horizontally"`, retain the visible focus ring, and add an axe plus keyboard
scroll test at a width where `scrollWidth > clientWidth`.

### F-3-2 — HIGH — Demo search is a published but unlisted claim

**Exact quote/location:** live `/demo`: **“Search the redacted excerpt.”** and
the **“Search records”** control.

**Evidence:** search works, and an untagged browser test happens to exercise
it. However, `.factory/claims.json` has no browser-demo search claim. The
`portable-html` entry covers search in the generated CLI artifact, not this
in-memory browser demo, and its `where` field does not include `/demo`.

**Why this matters:** the registry does not tell a verifier to prove a visible
demo capability. A future break could leave all registered demo claims green.

**Concrete fix:** add a `demo-search` claim with `where: "/demo search"` and a
tagged test that enters a term, confirms the expected filtered row count, then
clears it and confirms all six rows return.

### F-3-3 — HIGH — The CLI rule-provenance sentence is unlisted and untested

**Exact quote/location:** live `/demo`, note below the toolbar: **“Review rules
are listed in the CLI output.”**

**Evidence:** no `.factory/claims.json` entry states this behavior. The
`custom-redaction` test confirms replacement, but it does not assert that the
generated review lists default or custom rule labels.

**Why this matters:** rule provenance is material when a recipient decides
whether the redaction is safe enough to share.

**Concrete fix:** add a `redaction-rule-provenance` claim and tagged test that
opens a generated review and verifies the default and supplied custom labels,
or remove the sentence.

### F-3-4 — MINOR — Reduced-motion mode still enables smooth scrolling

**Exact location:** `src/site.css`, `html { scroll-behavior: smooth; }`.

**Evidence:** in a live Chromium context with `reducedMotion: "reduce"`, the
hero animation correctly computes to `none`, but the root element still
computes to `scroll-behavior: smooth`. The skip link therefore retains smooth
anchor movement.

**Why this matters:** reduced-motion support is incomplete even though the
signature animation is guarded.

**Concrete fix:** add
`@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }`
and assert the computed value in a reduced-motion browser test.

### F-3-5 — MINOR — “Review cue” does not name the demo section

**Exact quote/location:** live `/demo`, h2: **“Review cue.”**

**Why this matters:** heard alone in a heading list, it does not say that the
section contains the conclusion drawn from the sample records.

**Concrete rewrite:** **“What the records show.”**

### F-3-6 — MINOR — “Scope” does not name the README section

**Exact quote/location:** `README.md`, heading: **“Scope.”**

**Why this matters:** heard out of context, it does not identify the actual
limit explained below it.

**Concrete rewrite:** **“What the CLI does not do.”**

## Cold first read

Fresh Chromium contexts opened `/` at 390 × 844 and 1440 × 900. Nothing was
scrolled before recording the first viewport.

| Question | First-read answer |
| --- | --- |
| What does it do? | A local CLI creates a redacted log excerpt as a self-contained HTML review copy. |
| For whom? | Incident teams that need answers without giving someone raw production-log access. |
| What should I click first? | **Try it with sample data**, which says it will show a redacted incident review. |

The exact text supplying those answers is **“Create a redacted log excerpt,”**
**“For teams who need answers without granting raw production-log access,”**
and **“Try it with sample data”** beside **“See a redacted incident review
first.”** The mobile first screen also shows the input, output, and
license/account facts. There is no first-read blocker.

## Copy audit

Counts use whitespace-separated words. Hyphenated terms, paths, and inline
commands count as one word. Shell blocks and literal terminal output are
excluded because they are executable input/output, not prose. No sentence
exceeds 22 words and no banned marketing adjective appears.

### Landing-page sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| For teams who need answers without granting raw production-log access. | 10 | Clear audience and situation. |
| See a redacted incident review first. | 6 | Clear action result. |
| Reads a file or standard input you choose. | 8 | `cli-inputs`. |
| Writes one self-contained HTML review copy. | 6 | `portable-html`. |
| MIT licensed. | 2 | `mit-license`. |
| No account or purchase. | 4 | `site-log-privacy`, `mit-license`. |
| A halftone server rack behind a clipped incident sheet. | 9 | Useful image alternative. |
| A print-style view of the generated review copy. | 8 | Useful caption. |
| Install from the source repository with stable Rust and Cargo. | 10 | `install-cli`. |
| Install command copied. | 3 | Clear dynamic status. |
| Install command selected. | 3 | Clear fallback status. |
| Copy it with your browser command. | 6 | Clear fallback instruction. |
| Terminal recording of the packaged Log Incident Bundle demo creating a six-record review in a private temporary folder. | 18 | `terminal-recording`, `demo-cli`. |
| Recorded from the packaged `log-incident-bundle --demo` command. | 6 | `terminal-recording`. |
| Choose the time window. | 4 | `bounds-correlation`. |
| Read a file or standard input. | 6 | `cli-inputs`. |
| Follow a request or trace. | 5 | `bounds-correlation`. |
| Pull matching records into the excerpt. | 6 | `bounds-correlation`. |
| Check redactions and share. | 4 | Clear instruction. |
| Send one searchable HTML file. | 5 | `portable-html`. |
| The CLI creates a review copy. | 6 | `finite-review`. |
| It is not a live log service. | 7 | `finite-review`. |
| Redaction is pattern-based. | 3 | Useful limitation. |
| Review the final file before sharing it. | 7 | Clear safety instruction. |
| Bounded log excerpts for incident review. | 6 | Clear footer description. |

### Landing headings, labels, and actions

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to content | 3 | Clear navigation action. |
| LOG / INCIDENT BUNDLE | 4 | Product wordmark. |
| Demo | 1 | Clear navigation label. |
| Install | 1 | Clear navigation label. |
| How it works | 3 | Clear navigation label. |
| Privacy | 1 | Clear navigation label. |
| Loaded Log Incident Bundle — Create a redacted log excerpt | 10 | Useful route announcement. |
| A LOCAL CLI FOR INCIDENT REVIEW | 6 | Names product type and use. |
| Create a redacted log excerpt | 5 | Clear h1. |
| Try it with sample data | 5 | Result-naming action. |
| Install the CLI | 3 | Result-naming action and h2. |
| GET THE CLI | 3 | Names the install section. |
| Copy install command | 3 | Result-naming button. |
| Read the source on GitHub (opens in a new tab) | 10 | Destination and behavior are explicit. |
| RECIPIENT VIEW · SAMPLE | 3 | Identifies the preview. |
| Search and export the review copy | 6 | Clear h2. |
| Read the terminal transcript | 4 | Result-naming disclosure. |
| Open the working sample review | 5 | Result-naming link. |
| THREE STEPS | 2 | Gives the process length. |
| Make an incident review copy | 5 | Clear h2. |
| Use it for a finite review | 6 | Clear scope h2. |
| Terms | 1 | Clear footer label. |
| Built by Param Factory · v0.1.3 | 6 | Attribution and build identity. |

The landing page has no overlong sentence, banned term, inconsistent product
term, metaphor heading, or non-result-naming button. Demo copy is audited in
F-3-2, F-3-3, and F-3-5.

### README sentences

| Sentence | Words | Result |
| --- | ---: | --- |
| Create a bounded, redacted incident log review copy for a teammate. | 11 | Clear purpose. |
| It is for small teams that need an answer from production logs without giving someone broad production-log access. | 18 | Clear audience and situation. |
| The CLI reads a chosen file or standard input and writes one self-contained HTML review copy. | 16 | `cli-inputs`, `portable-html`. |
| Build from a checkout with stable Rust. | 7 | Clear install instruction. |
| Or build without installing. | 4 | Clear alternative. |
| Choose a time range, follow matching trace records, and name the output file. | 13 | `bounds-correlation`. |
| Open `checkout-review.html` in a browser. | 5 | Clear next step. |
| The recipient can search records and download a CSV without needing the source logs. | 14 | `portable-html`. |
| The CLI never overwrites an existing output file. | 8 | `output-safety`. |
| It also rejects an output path that resolves to an input file. | 12 | `output-safety`. |
| Choose a new `--output` path if either check fails. | 9 | Clear recovery. |
| Use standard input when a file is not needed. | 9 | `cli-inputs`. |
| The CLI reads RFC 3339 timestamps, such as `2026-08-22T14:01:00Z`, at the start of each line. | 15 | Exact technical format. |
| `--from` and `--to` include records in that time window. | 9 | `bounds-correlation`. |
| Each `--correlate FIELD` finds values for that field inside the window, then adds other matching records. | 16 | `bounds-correlation`. |
| The default rules replace email addresses, bearer tokens, and common secret fields. | 12 | `default-redaction`. |
| This includes OAuth tokens, authorization, credentials, sessions, cookies, private keys, and AWS access-key IDs beginning with `AKIA` or `ASIA`. | 19 | `default-redaction`. |
| For unquoted secret fields, it removes the rest of that line. | 11 | `default-redaction`. |
| It also removes complete PEM private-key blocks across multiple lines. | 10 | `default-redaction`. |
| Add reviewable local rules with a plain text file. | 9 | `custom-redaction`. |
| Redaction is pattern-based and not a guarantee. | 7 | Useful limitation. |
| Inspect the finished review copy before sharing it. | 8 | Clear safety instruction. |
| Run the shipped example without providing a file. | 8 | `demo-cli`. |
| It creates a private, unique temporary directory and prints the path to a review copy built from `examples/payment-api.log`. | 18 | `demo-cli`. |
| The browser version is at `/?demo=1` or `/demo`. | 8 | Exact demo routes. |
| It uses six fixed sample records in memory and writes no demo data to browser storage. | 16 | `local-processing`. |
| The landing page includes a self-hosted terminal recording from the packaged `--demo` command. | 13 | `terminal-recording`. |
| Refresh it after changing the demo with. | 7 | Clear maintainer instruction. |
| `npm test` runs the local CLI tests, browser checks, and concurrent test-server lifecycle regression. | 14 | Verified directly. |
| Each browser-test process owns a temporary build and an ephemeral local port. | 12 | Concrete maintainer detail. |
| Site pages load runtime files only from the product website. | 10 | `site-runtime`. |
| To prepare the Rust crate for publishing, run. | 8 | Clear maintainer instruction. |
| Do not publish from this repository. | 6 | Clear constraint. |
| The factory owns registry credentials. | 5 | Explains the constraint. |
| The factory deploys the static companion site from `dist/site`. | 9 | `delivery-policy`. |
| Run `npm run build:site` to create it. | 7 | Clear build instruction. |
| The deployment config adds security headers, route rewrites, a 404 page, and cache rules for hashed assets. | 17 | `delivery-policy`. |
| Push an approved commit to `main` for the factory deployment. | 10 | Clear workflow instruction. |
| The CLI creates a finite review copy. | 7 | `finite-review`. |
| It is not a live log service. | 7 | `finite-review`. |
| The CLI and companion site are available under the MIT License. | 11 | `mit-license`. |
| There is no paid tier or purchase flow. | 8 | `mit-license`. |

README headings and actions are **Log Incident Bundle** (3), **Try the sample
review** (4), **Privacy** (1), **Terms** (1), **Install** (1), **Make a review
copy** (4), **Redaction** (1), **Demo** (1), **Develop and verify** (3),
**Deploy** (1), **Scope** (1), and **License** (1). Only **Scope** fails the
out-of-context heading test; see F-3-6. Technical terms such as RFC 3339,
Cargo, PEM, OAuth, AWS, and standard input are exact terms for the developer
audience and are paired with examples or commands. Terminology is consistent:
logs are input, records are parsed entries, an excerpt is the selected set,
and a review copy is the HTML output.

## Demo and sandbox behavior

- The first-screen action reaches `/?demo=1` in one click. At 390 px the first
  demo viewport already shows the banner, incident question, search, CSV
  action, redaction note, caption, and realistic log rows.
- The banner reads **“Demo — sample data, nothing is saved”** and keeps
  **Reset demo** and **Start for real** visible. Searching `ledger` produced
  one row; Reset cleared the query and restored six rows.
- A seeded `real:review3-sentinel` localStorage value remained unchanged
  through demo entry, reset, CSV download, and exit. The demo created no
  localStorage/sessionStorage demo entry, IndexedDB database, or cache. The
  registered test additionally checks OPFS.
- The CSV contained its header and six data rows. **Start for real** removed
  demo mode, opened `/#install`, and preserved the non-demo sentinel.
- The request log contained only same-origin GETs. There were no analytics,
  third-party runtime calls, console errors, or page errors.
- From an unrelated temporary working directory, `--demo --json` created a
  six-record `review.html` in a unique mode-0700 temporary directory and
  printed its path. No browser-offline claim is published; the self-contained
  artifact was independently opened from `file:` with no network request.

## Claims verification

A clean clone was created at
`/tmp/log-incident-bundle-review3.6DYlUd`, followed by `npm ci`. Every exact
`test` value in `.factory/claims.json` ran separately:

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
| `install-cli` | `npm test -- --grep @claim:install-cli` | PASS |
| `csv-download` | `npm test -- --grep @claim:csv-download` | PASS |
| `demo-cli` | `npm test -- --grep @claim:demo-cli` | PASS |
| `terminal-recording` | `npm test -- --grep @claim:terminal-recording` | PASS |
| `finite-review` | `npm test -- --grep @claim:finite-review` | PASS |
| `mit-license` | `npm test -- --grep @claim:mit-license` | PASS |
| `delivery-policy` | `npm test -- --grep @claim:delivery-policy` | PASS |

No registered claim test fails. F-3-2 and F-3-3 are unlisted claims, so the
registry is still incomplete.

## Earlier-finding recheck

Every earlier `review-*.md`, `polish-*.md`, and the handoff was read. The live
HTML, JavaScript, CSS, and 404 bytes match the fresh local production build,
so the live checks below apply to the current code.

| Earlier finding | Current live and code confirmation |
| --- | --- |
| F-1-1 — initial load skipped the skip link | Fixed. Fresh `/` + Tab focuses **Skip to content**; in-app route changes focus the destination h1. |
| F-1-2 — incomplete HTTP 404 shell | Fixed. A missing URL returns HTTP 404 with the product header, footer, legal links, metadata, and home action. |
| F-1-3 — landing-preview claim location omitted | Fixed. `demo-cli.where` includes `landing preview`; its exact test passes. |
| F-1-4 — overlong README deployment sentence | Fixed. The replacement sentences contain 7 and 17 words. |
| F-2-1 — Start for real had no install path | Fixed. It opens `/#install`; the locked Cargo command and live GitHub source link are visible. |
| F-2-2 — named landing claim locations missing | Fixed for the exact earlier quotes. `default-redaction` names the landing hero/action and `site-log-privacy` names landing facts. F-3-2 and F-3-3 are new omissions. |
| F-2-3 — “ISO-like timestamps” | Fixed. README now names RFC 3339 and gives an example. |
| F-11-1 — quoted multiline PEM corrupted provenance | Fixed. Rust and browser regressions preserve five physical source lines and remove the key body/end marker. |
| F-11-2 — GitHub source link was 19 px tall | Fixed. Desktop and 390 px tests measure at least 44 px. |
| F-11-3 — generated review lacked a skip link | Fixed. The generated file starts with **Skip to review**, moves focus to `#main`, and passes the shipped serious/critical axe check. |
| Malformed generated rows/search/CSV/provenance | Fixed. `portable-html` verifies six rows, search, CSV, SHA-256 provenance, and no external request. |
| Script-boundary injection | Fixed. The hostile `</script>` fixture remains inert. |
| Quoted JSON, token, AKIA, and ASIA redaction gaps | Fixed. `default-redaction` checks raw output and rendered text for every named secret. |
| Invalid or reversed time bounds | Fixed. Negative tests reject both before creating output. |
| Seven-record CLI demo | Fixed. The CLI demo returns six correlated rows and omits the health check. |
| Demo reset/exit isolation | Fixed. Reset restores six rows; reset and exit remove only the historical demo key. |
| Mobile touch targets | Fixed for the previously named controls. The 390 px tests pass. |
| Generated-artifact mobile overflow | Fixed. The generated document width equals the 390 px viewport. |
| Route focus and back navigation | Fixed. Navigation and back focus the new h1; back restores the prior landing scroll position. |
| Returned paid-license behavior | Fixed. No checkout, license storage, paid tier, or purchase flow exists. |
| Dependency audit | Fixed. `npm ci` reports zero vulnerabilities. |
| Immutable cache policy | Fixed. Hashed JS returns `public, max-age=31536000, immutable`. |
| Real 404, OG art, and delivery policy | Fixed. The 404 is real and designed; the 1200×630 product OG asset resolves. |
| Framing protection | Fixed. Live headers send CSP `frame-ancestors 'none'` and `X-Frame-Options: DENY`. |
| Missing URL verifier | Fixed. `npm run verify:url -- <live URL>` passes ten route/viewport checks. |
| rustfmt and Clippy failures | Fixed. `cargo fmt --check` and strict Clippy pass. |
| Candidate/deployment identity | Fixed. SHA-256 matches for live/local index, 404, JS, and CSS. |

No earlier finding is unfixed, half-fixed, or regressed, so none is reopened as
a blocking finding.

## Structure, accessibility, links, and visual identity

- `/`, `/demo`, `/privacy`, and `/terms` return 200. A missing path returns a
  designed 404. Every route has `lang=en`, one h1, one main, route-specific
  title, description, canonical, OG metadata, Twitter card, favicon, shared
  header/footer, Privacy, and Terms.
- Deep `/#install` opens the install section at the top. Fresh Tab order starts
  at the skip link. History navigation restores route, scroll, and h1 focus.
- Every same-origin link crawled successfully; the only external link, the
  GitHub source repository, returns 200. `robots.txt`, `sitemap.xml`, icons,
  and social art resolve. The sitemap lists all four public routes.
- `npm run verify:url -- https://log-incident-bundle.sociobot.in` passes at
  1280 px and 390 px. Standalone axe reports zero violations on home, privacy,
  terms, and 404, and the one demo violation recorded as F-3-1.
- Initial JavaScript is 11.34 kB raw / 4.53 kB gzip. The full local suite,
  all 34 live browser tests, build, typecheck, lint, rustfmt, and strict Clippy
  pass. F-3-1 is missed because the shipped axe assertion filters out moderate
  findings.
- The warm paper, halftone server-room art, serif/mono type, stamped controls,
  offset rules, and dark evidence table match `.factory/design.md`. This is a
  distinct incident-printout identity, not a generic SaaS template.

## Missed leverage

No additional AI, sync, import, or export feature is justified. Selection,
correlation, redaction, and generation are deterministic; sending incident
logs to a model would weaken the local privacy boundary. File and standard
input cover import, while the self-contained HTML and CSV cover export. Sync
would conflict with the finite, no-account scope. `.factory/brief.json` is not
present, so this check used the repository contract, README, and design file.

## What would make this perfect

1. Make the demo records region focusable and verify keyboard scrolling at an
   actually overflowing width.
2. Register and tag tests for browser-demo search and CLI rule provenance.
3. Disable smooth scrolling when reduced motion is requested.
4. Rename **Review cue** and **Scope** with the proposed concrete headings.
5. Re-run the full review and reach zero findings.
