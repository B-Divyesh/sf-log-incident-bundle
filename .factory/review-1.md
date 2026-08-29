# Adversarial first-read review 1 — FAIL

**Reviewed:** 2026-08-29 UTC  
**Live URL:** https://log-incident-bundle.sociobot.in  
**Repository candidate:** 4d512dae3b613b270fa4d57d2210374bf74d383f (fresh local clone)

## Verdict

**FAIL.** The core CLI and one-click sample are genuinely usable, and every
declared claim test passes. However, two structure/accessibility requirements
remain unmet, including a previously recorded initial-focus defect. Two copy
and claims-registry defects also remain. A PASS requires zero findings.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1280 × 900 opened the live home page
before any navigation or scrolling. On both, the first screen answered the
three required questions:

| Question | What a first-time visitor can answer |
| --- | --- |
| What does it do? | It creates a redacted log excerpt / HTML review copy. |
| For whom? | “For teams who need answers without granting raw production-log access.” |
| What should I click first? | “Try it with sample data,” which says it will show a redacted incident review. |

The mobile first viewport also contains the three plain facts. There is no
first-read blocker.

## Findings

### F-1-1 — BLOCKING — Initial load skips the skip link

**Location:** live /; src/site.ts, route().

**Evidence:** a fresh page load programmatically focused h1 with tabindex -1.
Pressing Tab then focused **“Try it with sample data”**, not the first DOM
control, **“Skip to content.”** This is the same unresolved issue recorded as
the “Low, non-blocking observation” in verification-5.md and the prior
handoff. The work order requires every earlier finding to be fixed, not merely
classified as low.

**Why this fails first use:** a keyboard visitor cannot use the expected first
Tab stop to skip repeated navigation. Focus starts partway through the page.

**Concrete fix:** do not move focus to the heading on the initial document
load. Move it only after an in-app History API route transition or back/forward
navigation. Add a test that a fresh load followed by Tab focuses the visible
“Skip to content” link, while an in-app navigation focuses the destination h1.

### F-1-2 — HIGH — The HTTP 404 is not the product’s standard page shell

**Location:** live /missing (HTTP 404) and public/404.html.

**Evidence:** the actual 404 has one main, one h1, and a home link, but it has
**no header, footer, skip link, meta description, canonical link, favicon, or
Open Graph tags**. The normal /, /demo, /privacy, and /terms routes have all of
these. The missing page is served from a separate minimal document rather than
the required consistent skeleton.

**Why this fails first use:** a visitor who follows a stale link lands outside
the recognizable product navigation and loses the Privacy/Terms routes. The
document is also incomplete for sharing and indexing checks.

**Concrete fix:** make /404.html a complete product page in the same visual
system: skip link, wordmark/header/nav, main, footer with Privacy and Terms,
favicon, description, canonical/robots policy, and appropriate OG metadata.
Preserve the real HTTP 404 response. Add a live/local 404 test for that shell
and metadata, not only title/h1/main.

### F-1-3 — MINOR — A quantified landing-preview claim is absent from its declared location

**Location:** landing preview, **“Wrote checkout-review.html with 6 records
from 1 source.”**

**Evidence:** this is a visitor-relevant quantitative claim. It is exercised
by the demo-cli claim test and related tests, but claims.json lists that
claim’s where as “README demo section, /demo”, not the landing preview. The
claims registry therefore does not identify every live location using the
claim.

**Concrete fix:** add “landing preview” to demo-cli.where (the existing test
already asserts the six-record demo), or remove the precise result from the
preview.

### F-1-4 — MINOR — README deployment copy exceeds the 22-word cap

**Location:** README, Deploy: **“Build it with npm run build:site; the
checked-in staticwebapp.config.json sets the security headers, route rewrites,
real 404 response, and immutable cache policy for hashed assets.”**

**Evidence:** 26 words. It also combines the build action and four deployment
properties in one sentence.

**Concrete rewrite:** “Run npm run build:site to create dist/site. The
deployment config adds security headers, route rewrites, a 404 page, and cache
rules for hashed assets.”

## Copy audit

This audit lists all visitor-facing prose and user-facing text on the landing
page and all README prose. Code blocks, shell commands, and literal example
data are excluded because they are inputs rather than sentences. Counts treat
hyphenated terms and file names as one word.

### Landing page

| Text | Words | Result |
| --- | ---: | --- |
| A LOCAL CLI FOR INCIDENT REVIEW | 5 | Clear type label. |
| Create a redacted log excerpt | 5 | Clear headline. |
| For teams who need answers without granting raw production-log access. | 10 | Clear audience/change. |
| Try it with sample data | 5 | Result-naming action. |
| See a redacted incident review first. | 6 | Explains the action. |
| Reads a file or standard input you choose. | 8 | Listed claim: cli-inputs. |
| Writes one self-contained HTML review copy. | 6 | Listed claim: portable-html. |
| MIT licensed. | 2 | Listed claim: mit-license. |
| No account or purchase. | 4 | Listed claim: mit-license. |
| A print-style view of the generated review copy. | 7 | Useful image caption. |
| RECIPIENT VIEW · SAMPLE | 3 | Useful preview label. |
| Search and export the review copy | 6 | Clear section heading. |
| Wrote checkout-review.html with 6 records from 1 source. | 7 | Flagged in F-1-3. |
| Open the working sample review | 5 | Clear link text. |
| THREE STEPS | 2 | Useful process label. |
| Make an incident review copy | 5 | Clear section heading. |
| Choose the time window. | 4 | Clear step. |
| Read a file or standard input. | 6 | Clear step; listed claim. |
| Follow a request or trace. | 5 | Clear step. |
| Pull matching records into the excerpt. | 6 | Clear step; listed claim: bounds-correlation. |
| Check redactions and share. | 4 | Clear step. |
| Send one searchable HTML file. | 5 | Clear outcome; listed claim: portable-html. |
| Use it for a finite review | 6 | Clear scope heading. |
| The CLI creates a review copy. | 6 | Listed claim: finite-review. |
| It is not a live log service. | 7 | Listed claim: finite-review. |
| Redaction is pattern-based. | 3 | Plain, useful limitation. |
| Review the final file before sharing it. | 7 | Plain, useful instruction. |
| Bounded log excerpts for incident review. | 6 | Useful footer description. |
| Built by Param Factory | 4 | Required attribution. |

No landing sentence exceeds 22 words, uses a banned marketing adjective, or
uses a non-result-naming button. The terminal command is intentionally
technical because this is a CLI; its displayed output is audited above.

### README

| Text | Words | Result |
| --- | ---: | --- |
| Log Incident Bundle | 3 | Clear product name. |
| Create a bounded, redacted incident log review copy for a teammate. | 11 | Clear purpose. |
| It is for small teams that need an answer from production logs without giving someone broad production-log access. | 18 | Clear audience/change. |
| The CLI reads a chosen file or standard input and writes one self-contained HTML review copy. | 16 | Listed claims: cli-inputs, portable-html. |
| Build from a checkout with stable Rust. | 7 | Clear instruction. |
| Or build without installing. | 4 | Clear instruction. |
| Choose a time range, follow matching trace records, and name the output file. | 13 | Clear instruction. |
| Open checkout-review.html in a browser. | 5 | Clear instruction. |
| The recipient can search records and download a CSV without needing the source logs. | 14 | Listed claim: portable-html. |
| Use standard input when a file is not needed. | 9 | Clear instruction. |
| The CLI recognizes ISO-like timestamps at the start of a line. | 11 | Useful format rule. |
| --from and --to include records in that time window. | 9 | Useful option rule. |
| Each --correlate FIELD finds values for that field inside the window, then adds other matching records. | 16 | Listed claim: bounds-correlation. |
| The default rules replace email addresses, bearer tokens, common secret fields including token, and AKIA or ASIA AWS access-key IDs. | 20 | Listed claim: default-redaction. |
| Add reviewable local rules with a plain text file. | 9 | Listed claim: custom-redaction. |
| Redaction is pattern-based and not a guarantee. | 7 | Useful limitation. |
| Inspect the finished review copy before sharing it. | 8 | Clear instruction. |
| Run the shipped example without providing a file. | 8 | Clear instruction. |
| It prints the path to a temporary review copy built from examples/payment-api.log. | 12 | Listed claim: demo-cli. |
| The browser version is at /demo. | 6 | Clear route. |
| It uses six fixed sample records in memory and writes no demo data to browser storage. | 16 | Listed claim: local-processing. |
| npm test runs the local CLI tests and browser checks. | 9 | Useful verification instruction. |
| Site pages load runtime files only from the product website. | 10 | Listed claim: site-runtime. |
| To prepare the Rust crate for publishing, run cargo package. | 10 | Clear instruction. |
| Do not publish from this repository. | 6 | Clear constraint. |
| The factory owns registry credentials. | 5 | Useful explanation. |
| The factory deploys the static companion site from dist/site. | 9 | Clear deployment fact. |
| Build it with npm run build:site; the checked-in staticwebapp.config.json sets the security headers, route rewrites, real 404 response, and immutable cache policy for hashed assets. | 26 | Flagged in F-1-4. |
| Push an approved commit to main for the factory deployment. | 10 | Clear instruction. |
| The CLI creates a finite review copy. | 6 | Listed claim: finite-review. |
| It is not a live log service. | 7 | Listed claim: finite-review. |
| The CLI and companion site are available under the MIT License. | 11 | Listed claim: mit-license. |
| There is no paid tier or purchase flow. | 8 | Listed claim: mit-license. |

There are no banned marketing adjectives, empty mood headings, inconsistent
terms, or vague button labels in this audit. “Redacted,” “excerpt,” and
“review copy” are used consistently for their respective concepts.

## Demo, privacy, and CLI checks

- Clicking the landing action opened /demo in one client-side navigation. The
  first product screen already contained six realistic checkout-timeout
  records, search, CSV download, and the review conclusion.
- The persistent banner reads **“Demo — sample data, nothing is saved”** and
  includes **Reset demo** and **Start for real**. Search reduced the six rows
  to one; Reset restored six rows. Fresh-context localStorage and sessionStorage
  remained empty. The declared claim test additionally checks IndexedDB and OPFS.
- A fresh temporary checkout ran cargo run -- --demo --json, returning a
  temporary HTML path and {"records":6}. The demo-cli browser test opened that
  artifact and checked six rows.
- Fresh-context request logging for the landing-to-demo flow recorded only
  same-origin GETs for the document, self-hosted JS/CSS, and the self-hosted
  illustration. The product has no file input, account form, analytics, or
  third-party runtime request.
- The brief does not require an AI action. Adding one would be decorative: the
  valuable workflow is bounded selection, redaction, and a portable review.
  File/stdin input and CSV export already provide the implied import/export
  leverage.

## Claims and clean-clone verification

From a new clone of this exact repository state, npm ci completed cleanly.
Each exact command in .factory/claims.json passed:

| Claim IDs | Command | Result |
| --- | --- | --- |
| portable-html | npm test -- --grep @claim:portable-html | PASS |
| default-redaction | npm test -- --grep @claim:default-redaction | PASS |
| cli-inputs | npm test -- --grep @claim:cli-inputs | PASS |
| bounds-correlation | npm test -- --grep @claim:bounds-correlation | PASS |
| custom-redaction | npm test -- --grep @claim:custom-redaction | PASS |
| local-processing | npm test -- --grep @claim:local-processing | PASS |
| site-runtime | npm test -- --grep @claim:site-runtime | PASS |
| site-log-privacy | npm test -- --grep @claim:site-log-privacy | PASS |
| csv-download | npm test -- --grep @claim:csv-download | PASS |
| demo-cli | npm test -- --grep @claim:demo-cli | PASS |
| finite-review | npm test -- --grep @claim:finite-review | PASS |
| mit-license | npm test -- --grep @claim:mit-license | PASS |
| delivery-policy | npm test -- --grep @claim:delivery-policy | PASS |

npm test passed all 24 Playwright tests and four Rust unit tests. npm run build,
npm run typecheck, npm run lint, cargo build --release, cargo fmt --check, and
cargo clippy --all-targets --all-features -- -D warnings also passed.

## History recheck

All available earlier verification files and the prior handoff were read;
there are no earlier review-*.md or polish-*.md files. The old failures were
checked again in the current live deployment and current code, not accepted
merely because a later report marked them fixed.

| Earlier finding group | Current confirmation |
| --- | --- |
| Broken generated rows/search/CSV/provenance | Fixed: the file artifact has six rows, working search/CSV, SHA-256 provenance, and no console errors in portable-html. |
| Script-boundary XSS | Fixed: the regression test opens a payload containing a script boundary and finds it inert. |
| Quoted JSON, token, AKIA, and ASIA redaction gaps | Fixed: default-redaction proves the named raw values are absent from source and rendered artifact. |
| Invalid/inverted bounds; seven-record CLI demo | Fixed: invalid bounds fail before output; --demo --json returned six records and demo-cli opens six rows. |
| Demo storage/reset/exit; sub-44px controls; mobile artifact overflow | Fixed: storage claims pass, reset restores six rows, and mobile touch-target/artifact tests pass. |
| Missing immutable cache, framing protection, real HTTP 404, OG art, verify script, formatting/Clippy/audit | Fixed: config/tests cover immutable assets, response headers include frame-ancestors none, /missing returns HTTP 404, verify-url.sh exists, and format/Clippy checks pass. |
| Unlisted earlier material claims and removed paid-license behavior | Fixed for current copy: 13 claims cover the remaining product promises; the product is now MIT/no-purchase and the prior license UI is absent. F-1-3 is the remaining location omission. |
| Initial-load focus/skip-link observation in verification-5 | **Unfixed:** re-confirmed as F-1-1. |

## Structure, links, and visual identity

- /, /demo, /privacy, and /terms have their route titles, one h1, one main,
  description, canonical, favicon, OG data, consistent header/footer, and the
  expected live deep-link behavior. Back/forward route focus is covered by the
  shipped test. /missing is a real HTTP 404 but fails F-1-2.
- robots.txt and sitemap.xml are present and list the four public routes. All
  navigational links crawled from each page resolve, are client-side where
  appropriate, or are valid anchors. No dead link was observed.
- The dithered incident-printout direction is distinct from a generic SaaS
  template: the warm paper, stamped controls, dark evidence strip, serif/mono
  pairing, and original halftone server-rack asset match design.md. Motion is
  limited and guarded by reduced-motion media queries.

## What would make this perfect

1. Fix the initial focus order and add the direct keyboard regression test.
2. Ship a complete, branded, metadata-complete real 404 document.
3. Register the landing-preview result in claims.json and split the one long
   README deployment sentence.
4. Re-run this entire review with no findings remaining.

