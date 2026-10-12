import test from 'node:test';
import assert from 'node:assert/strict';
import {load, analyse} from './compare.mjs';

const rows = analyse(await load({offline: true}));
const gap = (c, y) => rows.find(r => r.country === c && r.year === y);

test('Jordan and Morocco agree across sources within rounding', () => {
  for (const c of ['JOR', 'MAR']) for (const y of [2022, 2023, 2024]) {
    assert.ok(Math.abs(gap(c, y).gapPoints) < 0.2, `${c} ${y}: ${gap(c, y).gapPoints}`);
  }
});

test('Egypt diverges because the IMF uses fiscal years', () => {
  assert.equal(gap('EGY', 2023).a.toFixed(1), '33.9');
  assert.equal(gap('EGY', 2023).b, 24.4);
  assert.ok(Math.abs(gap('EGY', 2023).gapPoints) > 5);
  assert.ok(Math.abs(gap('EGY', 2024).gapPoints) > 4);
});

test('every year in range has both values', () => {
  assert.equal(rows.filter(r => r.gapPoints === null).length, 0);
});
