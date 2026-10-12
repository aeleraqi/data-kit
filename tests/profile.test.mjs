import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readWorldBankLatest, staleness} from '../lib/observations.mjs';

const p = JSON.parse(await readFile(new URL('../data/profile-egy.json', import.meta.url), 'utf8'));
const rows = readWorldBankLatest(p.worldBankLatest.response);

test('one latest value per indicator, each with its own year', () => {
  assert.equal(rows.length, 12);
  assert.equal(rows.find(r => r.id === 'SP.POP.TOTL').value, 118365995);
  assert.equal(rows.find(r => r.id === 'SE.ADT.LITR.ZS').year, 2022);
});

test('old values are flagged instead of shown as current', () => {
  const debt = rows.find(r => r.id === 'GC.DOD.TOTL.GD.ZS');
  assert.equal(debt.year, 2007);
  assert.equal(staleness(debt.year, 2026), 'stale');
  assert.equal(staleness(2024, 2026), 'current');
  assert.equal(staleness(undefined, 2026), 'missing');
});

test('UNHCR internal code differs from ISO, so read the _iso fields', () => {
  assert.equal(p.unhcr.hosted.coa, 'ARE');
  assert.equal(p.unhcr.hosted.coa_iso, 'EGY');
});

test('youth unemployment differs between modeled and survey series', () => {
  const modeled = rows.find(r => r.id === 'SL.UEM.1524.ZS');
  const survey = p.ilostat.rows.find(r => r.time === 2024);
  assert.equal(survey.obs_status, 'B');
  assert.ok(modeled.value - survey.obs_value > 2);
});
