# Contributing

Corrections, new sources and real questions you answered with the skill are all welcome. A small example that someone else can rerun is the most useful thing you can send.

## Fixing or adding a source

Include the official documentation link, the date you checked, the exact request and what came back. Say whether it needs a key or an account, and anything that changes how a journalist should read the number: a break in the series, a modelled value, a revision, a unit.

Keep the entry in `SKILL.md` and the one in `data/catalogue.json` in step. We only list services run by an institution with a free route. Don't put keys, tokens or private records in issues, examples or commits.

## Improving the instructions

Start from a question a reader might ask. Show what the current file got wrong or missed and how your change fixes it. Keep `SKILL.md` usable on its own, with no links to other files in the repository.

Good checks: the right country and unit, every page of results, missing values left missing, source notes kept, and an honest message when a request fails.

## Website and examples

Run `npm test` and `npm run build`, then look at the page on a phone-sized window. Snapshots come from real responses; regenerate them with the example's script instead of editing them.

Code and instructions are MIT. Data from providers keep their own terms; see [NOTICE](NOTICE.md).
