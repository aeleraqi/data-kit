# Data Kit: paired test, 11 October 2026

We ran 18 fresh answers: three saved-data questions, each answered three times without the skill and three times with it. A separate grader scored every answer blind against a rubric written before the runs.

**The skill made no measurable difference on these tasks.** Without it, the answers scored 139 of 144 points; with it, 140. That gap is one point across 18 answers. The model already handled the three traps well on its own. This small test does not show that the skill improves accuracy.

## Results

Eight assertions per case, scored 0, 1 or 2. Sixteen points per answer, 48 per case per arm.

| Case | Without skill (3 runs) | With skill (3 runs) |
| --- | ---: | ---: |
| Inflation: World Bank vs IMF for Egypt, Jordan, Morocco | 16, 14, 16 = **46** | 16, 16, 15 = **47** |
| Poverty: a 2025 figure from a 2021 survey | 15, 15, 15 = **45** | 16, 15, 16 = **47** |
| Night lights: can we publish "Gaza lost 80% of its lights"? | 16, 16, 16 = **48** | 16, 15, 15 = **46** |
| **Total** | **139 / 144** | **140 / 144** |

### What the scores hide

- **All 18 answers found the main trap.** Every answer explained Egypt's IMF gap as a fiscal-year difference, gave Egypt's poverty figure as 2021 rather than 2025, and refused the 80% headline.
- **How they stated it differed.** Without the skill, all three inflation answers called the fiscal-year explanation an inference from outside the evidence and said to check it in the IMF's country notes. With the skill, all three stated it as fact, because the skill says so. That is right only as long as the skill is right. We haven't yet quoted the IMF note that confirms it (see the example's README).
- **One critical error, in a with-skill answer.** Inflation run 1 opened by saying Egypt's rate was "more than ten times" the other two countries' in both years. In 2023 it was about 5.6 times Morocco's. Nothing in the skill caused or prevented this; it's an arithmetic slip in the lead.
- **Points lost without the skill:** not saying the poverty surveys are years apart (B7, all three runs); one inflation answer that didn't tell the reader to name the year type and didn't mention the trimmed IMF snapshot (A5, A8).
- **Points lost with the skill:** the trimmed IMF snapshot (A8, one run), survey spacing (B7, one run), not stating the two map requests differ only by date (C8, one run), and not saying the night-light layer lacks moonlight correction (C3, one run).
- **Practical detail.** With the skill, answers more often included working notes a reporter can reuse: the `%3B` encoding for the World Bank request, filtering the IMF response by hand, CORS limits, and the latitude-first box order. The rubric didn't score these.

We did not change the skill after the test. No failure pointed to a gap in its instructions.

## Method

- **Model.** Every answer and grade came from `claude-opus-5-5` subagents in a Claude Cowork session, read from the run transcripts. No other model was tested. Claude Code and Codex were not tested.
- **Fresh agents.** Each of the 18 answers came from a new agent with no shared context. Every agent got the same task file and evidence. The with-skill agents were also told to read the frozen `SKILL.md` first; the baseline agents were not given it.
- **Tools.** Agents could only read their case files (and the skill file, for treatment). The transcripts show 57 tool calls in total. All were reads of permitted files: no web, shell or memory use.
- **Rubric first.** [oracle.json](../evals/2026-10-11/oracle.json) was written before any run.
- **Blind grading.** Answers were copied to labels A–F in random order per case. One grader per case scored the six answers with the labels hidden and quoted each answer to support every score. Every quote was then checked by script against the answer file; all matched. The label key was applied afterwards.
- **Who graded.** Grading is model judgement, not human review. The graders were the same model as the answerers.

## Limits

- Three cases, three runs per arm, one model. That's a smoke test, not a benchmark. One point out of 144 is noise.
- The tasks test reading supplied data. They don't test fetching live data, choosing a source, recovering from a failed request, or automatic skill activation. Those are where the skill's 28 source guides should matter most, and they're untested.
- The cases come from the repository's own examples, and the skill describes two of the three traps. A model that already knows these traps gains little; a harder or less familiar set of cases might show a different result.
- One with-skill answer quoted "the kit's guide" by name, so blinding wasn't perfect for that answer.

## Inspect or repeat

- [Protocol](../evals/2026-10-11/README.md)
- [Rubric](../evals/2026-10-11/oracle.json)
- [Input packs](../evals/2026-10-11/inputs/)
- [All 18 answers, unchanged](../evals/2026-10-11/results/)
- [Run records: model, tool calls, answer hashes](../evals/2026-10-11/results.json)
- [Grades with quotes](../evals/2026-10-11/grades.json) and the [blinding key](../evals/2026-10-11/blind-key.json)

Tested SKILL.md SHA-256: `aba2bc963180f1ff1a12e1265b32f0f0eebfc68aa56ba4b285ed008bcc3686df`
