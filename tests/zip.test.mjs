import test from 'node:test';
import assert from 'node:assert/strict';
import {zip, crc32} from '../lib/zip.mjs';

test('crc32 matches the standard check value', () => {
  assert.equal(crc32(Buffer.from('123456789')), 0xCBF43926);
});

test('zip keeps the skill inside a folder named after the skill', () => {
  const z = zip([{name: 'data-kit/SKILL.md', data: Buffer.from('---\nname: data-kit\n---\n')}]);
  assert.equal(z.readUInt32LE(0), 0x04034b50);
  assert.ok(z.includes(Buffer.from('data-kit/SKILL.md')));
  assert.equal(z.readUInt32LE(z.length - 22), 0x06054b50);
});
