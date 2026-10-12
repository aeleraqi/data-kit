import test from 'node:test';
import assert from 'node:assert/strict';
import {load, analyse} from './check.mjs';

const [egypt] = analyse(await load({offline: true}));

test('Egypt 2025 figure comes from the 2021 survey', () => {
  assert.equal(egypt.year, 2025);
  assert.equal(egypt.original_year, 2021);
  assert.equal(egypt.yearsCarried, 4);
});

test('the carried value matches PIP for the survey year', () => {
  assert.ok(Math.abs(egypt.value - egypt.pipHeadcountPercent) < 0.01);
  assert.equal(egypt.welfareType, 'consumption');
});
