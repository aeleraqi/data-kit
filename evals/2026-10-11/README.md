# Saved-evidence paired test

Eighteen answers: three cases, two arms, three runs each. Results are in the [report](../../docs/EVALUATION.md).

## Repeat it

1. Freeze the `SKILL.md` you want to test and record its SHA-256 and the model.
2. For each case and arm, start a fresh agent. Give it only `inputs/<case>/prompt.txt` and `inputs/<case>/evidence.json` (and the two JPEGs for `night-lights`). Don't give it this README, the rubric, the examples or other answers. The with-skill arm also gets the frozen `SKILL.md`; the task prompt stays the same.
3. Tell agents not to fetch new data or use any other files. Save each answer unchanged under `results/<arm>/<case>-r<n>.md`.
4. After every answer is in, copy each case's six answers to random labels A–F, grade them blind with `oracle.json`, and keep the key separately until grading is done. Save a quote from the answer for every score and check the quotes against the files.
5. Report per-assertion differences, not only totals. With three runs per arm, don't claim a gain from a one- or two-point difference. Change the skill only for a failure you can trace to its instructions, and test a revision with fresh runs.

## What the inputs contain

- **inflation:** the full World Bank response for EGY, JOR, MAR 2020–2025 and the IMF DataMapper response trimmed to the same three countries from 2018. The trimming is stated in the file.
- **poverty:** the Our World in Data filtered row for Egypt (2025, `original_year` 2021) with the full column names, and the PIP rows for Egypt, trimmed to seven fields. No Morocco row was returned, and the file says so.
- **night-lights:** the two GIBS request URLs and frame metadata, plus the two greyscale JPEGs used on the project page.

These packs test how an assistant reads and reports supplied data. They don't test live retrieval.
