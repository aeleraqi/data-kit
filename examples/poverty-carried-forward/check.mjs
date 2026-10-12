// Find poverty figures shown for a recent year but measured in an older survey.
// Usage: node examples/poverty-carried-forward/check.mjs [--offline]
import {readFile} from 'node:fs/promises';
import {carriedForward} from '../../lib/observations.mjs';

const OWID = 'https://ourworldindata.org/grapher/share-of-population-in-extreme-poverty.csv?country=EGY~MAR&csvType=filtered&useColumnShortNames=true';
const PIP = 'https://api.worldbank.org/pip/v1/pip?country=EGY&year=all&povline=3&ppp_version=2021&format=json';
const here = new URL('.', import.meta.url);

function parseOwid(csv) {
  const [head, ...lines] = csv.trim().split('\n');
  const cols = head.split(',');
  const valueCol = cols.findIndex(c => c.startsWith('headcount_ratio') && !c.endsWith('original_year'));
  const yearCol = cols.findIndex(c => c.endsWith('original_year'));
  if (valueCol < 0 || yearCol < 0) throw new Error('Expected headcount and original_year columns');
  return lines.map(l => l.split(',')).filter(c => ['EGY', 'MAR'].includes(c[1]))
    .map(c => ({entity: c[0], code: c[1], year: Number(c[2]), value: Number(c[valueCol]), original_year: Number(c[yearCol])}));
}

export async function load({offline = false} = {}) {
  if (offline) return JSON.parse(await readFile(new URL('snapshot.json', here), 'utf8'));
  const [csv, pip] = await Promise.all([fetch(OWID).then(r => r.text()), fetch(PIP).then(r => r.json())]);
  return {retrievedAt: new Date().toISOString().slice(0, 10), owid: {url: OWID, rows: parseOwid(csv)}, pip: {url: PIP, rows: pip}};
}

export function analyse(snap) {
  return carriedForward(snap.owid.rows).map(r => {
    const survey = snap.pip.rows.find(p => p.country_code === r.code && p.reporting_year === r.original_year);
    return {...r, pipHeadcountPercent: survey ? survey.headcount * 100 : null, welfareType: survey?.welfare_type ?? null};
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const snap = await load({offline: process.argv.includes('--offline')});
  for (const r of analyse(snap)) {
    console.log(`${r.entity}: ${r.value.toFixed(2)}% shown for ${r.year}, measured in ${r.original_year} (${r.yearsCarried} years carried). PIP ${r.original_year}: ${r.pipHeadcountPercent?.toFixed(2)}% (${r.welfareType}).`);
  }
}
