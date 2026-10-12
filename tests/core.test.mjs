import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readWorldBankPage, compareSources, carriedForward, moonIllumination, differsOnlyInTime} from '../lib/observations.mjs';

const example = JSON.parse(await readFile(new URL('../data/verified-example.json', import.meta.url), 'utf8'));
const skill = await readFile(new URL('../SKILL.md', import.meta.url), 'utf8');
const {sources} = JSON.parse(await readFile(new URL('../data/catalogue.json', import.meta.url), 'utf8'));

test('saved World Bank response keeps every observation', () => {
  const rows = readWorldBankPage(example.response, 'FP.CPI.TOTL.ZG');
  assert.equal(rows.length, 18);
  assert.equal(rows.find(r => r.country === 'EGY' && r.year === 2023).value.toFixed(1), '33.9');
  assert.equal(example.response[0].lastupdated, example.sourceLastUpdated);
});

test('a truncated, duplicated or wrong response cannot become a table', () => {
  const partial = structuredClone(example.response); partial[0].pages = 2;
  assert.throws(() => readWorldBankPage(partial), /Incomplete/);
  const dup = structuredClone(example.response); dup[1][1] = dup[1][0];
  assert.throws(() => readWorldBankPage(dup), /Duplicate/);
  assert.throws(() => readWorldBankPage(example.response, 'NY.GDP.PCAP.CD'), /indicator/);
  assert.throws(() => readWorldBankPage([{message: [{value: 'Invalid value'}]}]), /World Bank error/);
});

test('missing values stay missing', () => {
  const missing = structuredClone(example.response); missing[1][0].value = null;
  const rows = readWorldBankPage(missing);
  const r = compareSources(rows, rows, [2025]).find(x => x.country === 'EGY');
  assert.equal(r.gapPoints, null);
});

test('carried-forward detection ignores rows without an original year', () => {
  assert.deepEqual(carriedForward([{year: 2025, original_year: 2025}, {year: 2025}]), []);
  assert.equal(carriedForward([{year: 2025, original_year: 2021}])[0].yearsCarried, 4);
});

test('moon and request helpers', () => {
  assert.ok(moonIllumination('2023-11-13') < 0.05);
  assert.ok(moonIllumination('2023-11-27') > 0.95);
  assert.equal(differsOnlyInTime('https://x.org/a?A=1&TIME=1', 'https://x.org/a?A=1&TIME=2'), true);
  assert.equal(differsOnlyInTime('https://x.org/a?A=1&TIME=1', 'https://x.org/a?A=2&TIME=2'), false);
});

test('catalogue and SKILL.md agree', () => {
  assert.equal(sources.length, 28);
  assert.equal(new Set(sources.map(s => s.id)).size, 28);
  for (const s of sources) {
    assert.ok(skill.includes(s.documentationUrl), s.id + ' documentation link missing from SKILL.md');
    assert.ok(s.operator, s.id);
    assert.ok(['open', 'key', 'account', 'manual'].includes(s.access), s.id);
  }
  assert.match(skill, /^---\r?\nname: data-kit\r?\n/);
  assert.equal([...skill.matchAll(/\]\((?!https:\/\/|#)([^)]+)\)/g)].length, 0, 'SKILL.md must not link to repository files');
});
