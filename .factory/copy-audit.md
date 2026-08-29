# Landing and README copy audit

Sentence counts use whitespace-separated words. No landing sentence exceeds
22 words. No landing sentence uses a banned word.

| Copy | Words | Result |
| --- | ---: | --- |
| Create a redacted log excerpt | 5 | pass |
| For teams who need answers without granting raw production-log access. | 10 | pass |
| Try it with sample data | 5 | pass |
| See a redacted incident review first. | 6 | pass |
| Install the CLI | 3 | pass |
| Copy a command for a machine with Rust. | 8 | pass |
| Reads a file or standard input you choose. | 8 | pass |
| Writes one self-contained HTML review copy. | 6 | pass |
| MIT licensed. | 2 | pass |
| No account or purchase. | 4 | pass |
| A print-style view of the generated review copy. | 8 | pass |
| Search and export the review copy | 6 | pass |
| Recorded from the packaged `log-incident-bundle --demo` command. | 6 | pass |
| Read the terminal transcript | 4 | pass |
| Open the working sample review | 5 | pass |
| Install the CLI | 3 | pass |
| Run this on a machine with Rust. | 8 | pass |
| It installs the current source from GitHub. | 7 | pass |
| Copy install command | 3 | pass |
| Read the source on GitHub | 6 | pass |
| Make an incident review copy | 5 | pass |
| Choose the time window. | 4 | pass |
| Read a file or standard input. | 6 | pass |
| Follow a request or trace. | 5 | pass |
| Pull matching records into the excerpt. | 6 | pass |
| Check redactions and share. | 4 | pass |
| Send one searchable HTML file. | 5 | pass |
| Use it for a finite review | 6 | pass |
| The CLI creates a review copy. | 6 | pass |
| It is not a live log service. | 7 | pass |
| Redaction is pattern-based. | 3 | pass |
| Review the final file before sharing it. | 7 | pass |
| Bounded log excerpts for incident review. | 6 | pass |

## README deployment copy

| Copy | Words | Result |
| --- | ---: | --- |
| The factory deploys the static companion site from `dist/site`. | 9 | pass |
| Run `npm run build:site` to create it. | 6 | pass |
| The deployment config adds security headers, route rewrites, a 404 page, and cache rules for hashed assets. | 16 | pass |
| Push an approved commit to `main` for the factory deployment. | 10 | pass |
| The landing page includes a self-hosted terminal recording from the packaged `--demo` command. | 13 | pass |
| Refresh it after changing the demo with: | 8 | pass |
| The CLI reads RFC 3339 timestamps, such as `2026-08-22T14:01:00Z`, at the start of each line. | 14 | pass |
| For unquoted secret fields, it removes the rest of that line. | 11 | pass |
| It also removes complete PEM private-key blocks across multiple lines. | 10 | pass |

All other README prose was rechecked against the review-1 audit. No sentence
exceeds 22 words or uses a banned marketing word.

## Terminology

| Concept | One term |
| --- | --- |
| Portable output | review copy |
| Input material | logs |
| Sensitive-text replacement | redaction |
| Joined records | excerpt |
| Sample environment | demo |

Catalog description: **Create a redacted incident review copy from selected logs.** (9 words)
