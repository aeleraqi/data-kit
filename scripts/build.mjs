import {mkdir, cp, copyFile, readFile, writeFile, rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {readWorldBankPage} from '../lib/observations.mjs';

await rm('dist', {recursive: true, force: true});
await mkdir('dist', {recursive: true});
await cp('site', 'dist', {recursive: true});
await cp('examples', 'dist/examples', {recursive: true, filter: p => !p.replaceAll('\\', '/').split('/').includes('downloads')});
for (const f of ['catalogue.json', 'verified-example.json', 'repeatable-examples.json']) await copyFile('data/' + f, 'dist/' + f);
await copyFile('lib/observations.mjs', 'dist/observations.mjs');
for (const f of ['SKILL.md', 'LICENSE', 'NOTICE.md']) await copyFile(f, 'dist/' + f);

const ex = JSON.parse(await readFile('data/verified-example.json', 'utf8'));
const q = v => '"' + String(v ?? '').replaceAll('"', '""') + '"';
const csv = [['country', 'iso3', 'year', 'inflation_pct', 'source_url', 'source_last_updated', 'retrieved_at'],
  ...readWorldBankPage(ex.response, ex.indicator).map(r => [r.name, r.country, r.year, r.value, ex.sourceUrl, ex.sourceLastUpdated, ex.retrievedAt])]
  .map(row => row.map(q).join(',')).join('\r\n');
await writeFile('dist/inflation-egy-jor-mar-2020-2025.csv', csv);

const sum = createHash('sha256').update(await readFile('SKILL.md')).digest('hex');
await writeFile('dist/SHA256SUMS.txt', sum + '  SKILL.md\n');
console.log('Built dist/ with an identical copy of SKILL.md (sha256 ' + sum.slice(0, 12) + '…).');
