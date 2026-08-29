# Landing and README copy audit

Sentence counts use whitespace-separated words. No landing sentence exceeds
22 words. No landing sentence uses a banned word.

| Copy | Words | Result |
| --- | ---: | --- |
| Create a redacted log excerpt | 5 | pass |
| For teams who need answers without granting raw production-log access. | 10 | pass |
| Try it with sample data | 5 | pass |
| See a redacted incident review first. | 6 | pass |
| Reads a file or standard input you choose. | 8 | pass |
| Writes one self-contained HTML review copy. | 6 | pass |
| MIT licensed. | 2 | pass |
| No account or purchase. | 4 | pass |
| A print-style view of the generated review copy. | 8 | pass |
| Search and export the review copy | 6 | pass |
| Open the working sample review | 5 | pass |
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

Catalog description: **Create a redacted incident log review copy for a teammate.** (10 words)
