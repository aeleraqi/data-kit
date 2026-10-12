import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';

const base = new URL('../evals/2026-10-11/', import.meta.url);
const runs = JSON.parse(await readFile(new URL('results.json', base), 'utf8'));
const grades = JSON.parse(await readFile(new URL('grades.json', base), 'utf8'));
const oracle = JSON.parse(await readFile(new URL('oracle.json', base), 'utf8'));

test('every saved answer matches its recorded hash', async () => {
  assert.equal(runs.runs.length, 18);
  for (const r of runs.runs) {
    const text = (await readFile(new URL(r.answerFile, base), 'utf8')).trim();
    assert.equal(createHash('sha256').update(text).digest('hex'), r.answerSha256, r.answerFile);
  }
});

test('every grade has all assertions, a valid score and a quote found in the answer', async () => {
  for (const [kase, answers] of Object.entries(grades.cases)) {
    const ids = oracle.cases[kase].map(a => a.id);
    assert.equal(Object.keys(answers).length, 6);
    for (const a of Object.values(answers)) {
      assert.deepEqual(a.scores.map(s => s.id), ids);
      const text = await readFile(new URL(`results/${a.arm}/${kase}-r${a.repeat}.md`, base), 'utf8');
      for (const s of a.scores) {
        assert.ok([0, 1, 2].includes(s.score));
        for (const e of s.excerpts) assert.ok(text.includes(e), `${kase} ${a.arm} r${a.repeat} ${s.id}`);
      }
      assert.equal(a.total, a.scores.reduce((t, s) => t + s.score, 0));
    }
  }
});

test('reported totals: 139 without the skill, 140 with it', () => {
  const sum = arm => Object.values(grades.cases).flatMap(c => Object.values(c)).filter(a => a.arm === arm).reduce((t, a) => t + a.total, 0);
  assert.equal(sum('baseline'), 139);
  assert.equal(sum('with-skill'), 140);
});
