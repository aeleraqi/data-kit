import test from 'node:test';
import assert from 'node:assert/strict';
import {check, snapshot} from './fetch.mjs';
import {moonIllumination} from '../../lib/observations.mjs';

test('the two frames differ only in date', () => {
  assert.equal(check().comparable, true);
});

test('both nights are near new moon', () => {
  for (const m of check().moon) assert.ok(m.illumination < 0.05, `${m.date}: ${m.illumination}`);
});

test('a full-moon night would be flagged', () => {
  assert.ok(moonIllumination('2023-09-29') > 0.95);
});

test('bounding box is south,west,north,east for WMS 1.3.0', () => {
  for (const f of snapshot.frames) assert.equal(new URL(f.url).searchParams.get('BBOX'), '30.9,33.9,32.3,35.3');
});
